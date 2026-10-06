import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  BloodUnit,
  BlockchainBlock,
  DonorProfile,
  HospitalRequest,
  UserRole,
  OfflineAction,
  LabTestResults,
  BloodType,
  ComponentType,
  StaffAccount,
  SystemIssue,
  DonorVerificationTier,
  DonorDocument
} from '../types/bloodchain';
import {
  INITIAL_DONOR,
  INITIAL_DONORS,
  INITIAL_STAFF_ACCOUNTS,
  INITIAL_SYSTEM_ISSUES,
  INITIAL_UNITS,
  INITIAL_BLOCKS,
  INITIAL_HOSPITAL_REQUESTS
} from '../data/seedData';
import { calculateBlockHash, verifyChainIntegrity, sha256 } from '../lib/crypto';
import { isRbcCompatible } from '../lib/bloodCompatibility';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  fbSignOut, 
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
  onAuthStateChanged,
  db,
  uploadFileToStorage,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  FirebaseUser
} from '../lib/firebase';

export type ActiveViewType = 
  | 'DEMO_HUB'
  | 'ARCHITECTURE' 
  | 'DONOR' 
  | 'LAB' 
  | 'TRANSIT' 
  | 'CLINICAL' 
  | 'OPERATIONS' 
  | 'LEDGER'
  | 'CHATBOT'
  | 'BOTSWANA_LIVE';

interface BloodchainContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeView: ActiveViewType;
  setActiveView: (view: ActiveViewType) => void;
  units: BloodUnit[];
  blockchain: BlockchainBlock[];
  donor: DonorProfile;
  requests: HospitalRequest[];
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  offlineQueue: OfflineAction[];
  syncOfflineQueue: () => Promise<void>;
  
  // Firebase Auth state
  currentUser: FirebaseUser | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  signInDemoRole: (role: UserRole) => Promise<void>;

  // Role, Staff & Donor Accounts state
  staffAccounts: StaffAccount[];
  donorsList: DonorProfile[];
  systemIssues: SystemIssue[];
  currentStaff: StaffAccount | null;
  currentDonor: DonorProfile | null;

  // Staff Authentication & Password Enforcement
  loginStaff: (emailOrBadge: string, password: string) => Promise<{ success: boolean; error?: string; mustChangePassword?: boolean }>;
  changeStaffPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logoutStaff: () => void;
  provisionStaffAccount: (data: {
    email: string;
    fullName: string;
    role: UserRole;
    facility: string;
    badgeNumber: string;
    customTempPassword?: string;
  }) => Promise<StaffAccount>;
  revokeStaffAccount: (id: string) => void;
  resetStaffPassword: (id: string) => string;

  // Donor Authentication, Multi-Tier Verification & Document Upload
  loginDonor: (email: string) => Promise<{ success: boolean; error?: string }>;
  registerDonor: (donorData: Partial<DonorProfile>) => Promise<{ success: boolean; donor?: DonorProfile; error?: string }>;
  logoutDonor: () => void;
  uploadDonorDocument: (donorId: string, docData: {
    name: string;
    type: DonorDocument['type'];
    sizeKb: number;
    fileDataUrl?: string;
    fileBlob?: Blob;
  }) => Promise<void>;
  reviewDonorDocument: (donorId: string, docId: string, status: 'APPROVED' | 'REJECTED', notes: string) => void;
  updateDonorTier: (donorId: string, tier: DonorVerificationTier) => void;

  // Cross-App Issues & Resolution
  resolveSystemIssue: (issueId: string, notes: string, resolvedBy: string) => void;
  createSystemIssue: (issue: Omit<SystemIssue, 'id' | 'timestamp' | 'status'>) => void;

  // Workflow methods
  acceptDonation: (donorId: string, bloodType: BloodType, volumeMl: number) => Promise<string>;
  recordLabTests: (unitDIN: string, results: Partial<LabTestResults>) => void;
  authorizeLabRelease: (unitDIN: string, techName: string) => Promise<boolean>;
  quarantineUnitInLab: (unitDIN: string, techName: string, reason: string) => Promise<void>;
  dispatchUnitToTransit: (unitDIN: string, courierName: string, destination: string, tempCelsius: number) => Promise<void>;
  logTelemetryReading: (unitDIN: string, tempCelsius: number, locationName: string) => void;
  confirmHospitalReceipt: (unitDIN: string, hospitalName: string, staffName: string) => Promise<void>;
  verifyBedsideCrossmatch: (
    unitDIN: string,
    patientId: string,
    patientBloodType: BloodType,
    nurse1: string,
    nurse2: string
  ) => Promise<{ success: boolean; error?: string }>;
  completeTransfusion: (unitDIN: string, clinicianName: string, vitalsSummary: string) => Promise<void>;
  reportAdverseReaction: (
    unitDIN: string,
    type: 'TRALI' | 'TACO' | 'FEBRILE' | 'ACUTE_HEMOLYTIC',
    severity: 'MILD' | 'SEVERE' | 'LIFE_THREATENING',
    notes: string,
    clinicianName: string
  ) => Promise<void>;
  createHospitalRequest: (
    hospitalName: string,
    department: string,
    urgency: 'EMERGENCY_CODE_CRIMSON' | 'URGENT' | 'ROUTINE',
    bloodType: BloodType,
    componentType: ComponentType,
    unitsNeeded: number
  ) => void;
  fulfillHospitalRequest: (requestId: string, unitDins: string[]) => void;
  
  // Ledger tamper demonstration tools
  tamperBlockPayload: (blockIndex: number, fieldPath: string, maliciousValue: any) => void;
  restoreOriginalLedger: () => void;
  chainIntegrityStatus: { isValid: boolean; brokenIndex?: number; reason?: string };
}

const BloodchainContext = createContext<BloodchainContextType | null>(null);

export const BloodchainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('NATIONAL_OPERATOR');
  const [activeView, setActiveView] = useState<ActiveViewType>('DEMO_HUB');

  // Baseline state initialized from local cache or seed data
  const [units, setUnits] = useState<BloodUnit[]>(() => {
    const saved = localStorage.getItem('bloodchain_units');
    return saved ? JSON.parse(saved) : INITIAL_UNITS;
  });
  const [blockchain, setBlockchain] = useState<BlockchainBlock[]>(() => {
    const saved = localStorage.getItem('bloodchain_blocks');
    return saved ? JSON.parse(saved) : INITIAL_BLOCKS;
  });
  const [donor, setDonor] = useState<DonorProfile>(() => {
    const saved = localStorage.getItem('bloodchain_donor');
    return saved ? JSON.parse(saved) : INITIAL_DONOR;
  });
  const [requests, setRequests] = useState<HospitalRequest[]>(() => {
    const saved = localStorage.getItem('bloodchain_requests');
    return saved ? JSON.parse(saved) : INITIAL_HOSPITAL_REQUESTS;
  });
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);
  const [chainIntegrityStatus, setChainIntegrityStatus] = useState<{ isValid: boolean; brokenIndex?: number; reason?: string }>({ isValid: true });

  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>(() => {
    const saved = localStorage.getItem('bloodchain_staff_accounts');
    return saved ? JSON.parse(saved) : INITIAL_STAFF_ACCOUNTS;
  });
  const [donorsList, setDonorsList] = useState<DonorProfile[]>(() => {
    const saved = localStorage.getItem('bloodchain_donors_list');
    return saved ? JSON.parse(saved) : INITIAL_DONORS;
  });
  const [systemIssues, setSystemIssues] = useState<SystemIssue[]>(() => {
    const saved = localStorage.getItem('bloodchain_system_issues');
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_ISSUES;
  });
  const [currentStaff, setCurrentStaff] = useState<StaffAccount | null>(() => {
    const saved = localStorage.getItem('bloodchain_current_staff');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentDonor, setCurrentDonor] = useState<DonorProfile | null>(() => {
    const saved = localStorage.getItem('bloodchain_current_donor');
    return saved ? JSON.parse(saved) : INITIAL_DONOR;
  });

  const isInitialSeedAttempted = useRef(false);

  // ─── 1. Real-time Firestore Subscriptions ─────────────────────────────────

  useEffect(() => {
    // 1. Blood Units
    const unsubUnits = onSnapshot(collection(db, 'bloodUnits'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => d.data() as BloodUnit);
        setUnits(list);
        localStorage.setItem('bloodchain_units', JSON.stringify(list));
      }
    }, (err) => console.warn('Firestore bloodUnits sync:', err.message));

    // 2. Blockchain Blocks
    const qBlocks = query(collection(db, 'blockchainBlocks'), orderBy('index', 'asc'));
    const unsubBlocks = onSnapshot(qBlocks, (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => d.data() as BlockchainBlock);
        setBlockchain(list);
        localStorage.setItem('bloodchain_blocks', JSON.stringify(list));
      }
    }, (err) => console.warn('Firestore blockchainBlocks sync:', err.message));

    // 3. Hospital Requests
    const unsubReqs = onSnapshot(collection(db, 'hospitalRequests'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => d.data() as HospitalRequest);
        setRequests(list);
        localStorage.setItem('bloodchain_requests', JSON.stringify(list));
      }
    }, (err) => console.warn('Firestore hospitalRequests sync:', err.message));

    // 4. Staff Accounts
    const unsubStaff = onSnapshot(collection(db, 'staffAccounts'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => d.data() as StaffAccount);
        setStaffAccounts(list);
        localStorage.setItem('bloodchain_staff_accounts', JSON.stringify(list));
      }
    }, (err) => console.warn('Firestore staffAccounts sync:', err.message));

    // 5. Donor Profiles
    const unsubDonors = onSnapshot(collection(db, 'donorProfiles'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => d.data() as DonorProfile);
        setDonorsList(list);
        localStorage.setItem('bloodchain_donors_list', JSON.stringify(list));
      }
    }, (err) => console.warn('Firestore donorProfiles sync:', err.message));

    // 6. System Issues
    const unsubIssues = onSnapshot(collection(db, 'systemIssues'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => d.data() as SystemIssue);
        setSystemIssues(list);
        localStorage.setItem('bloodchain_system_issues', JSON.stringify(list));
      }
    }, (err) => console.warn('Firestore systemIssues sync:', err.message));

    return () => {
      unsubUnits();
      unsubBlocks();
      unsubReqs();
      unsubStaff();
      unsubDonors();
      unsubIssues();
    };
  }, []);

  // Sync currentStaff and currentDonor when live lists update
  useEffect(() => {
    if (currentStaff) {
      const match = staffAccounts.find(s => s.id === currentStaff.id);
      if (match && JSON.stringify(match) !== JSON.stringify(currentStaff)) {
        setCurrentStaff(match);
      }
    }
  }, [staffAccounts]);

  useEffect(() => {
    if (currentDonor) {
      const match = donorsList.find(d => d.id === currentDonor.id);
      if (match && JSON.stringify(match) !== JSON.stringify(currentDonor)) {
        setCurrentDonor(match);
        setDonor(match);
      }
    }
  }, [donorsList]);

  // Firestore Persistence Helpers
  const persistUnit = async (u: BloodUnit) => {
    try {
      await setDoc(doc(db, 'bloodUnits', u.din), u, { merge: true });
    } catch (err: any) {
      console.warn('Firestore persistUnit sync:', err.message);
    }
  };

  const persistBlock = async (b: BlockchainBlock) => {
    try {
      await setDoc(doc(db, 'blockchainBlocks', `block-${b.index}`), b, { merge: true });
    } catch (err: any) {
      console.warn('Firestore persistBlock sync:', err.message);
    }
  };

  const persistRequest = async (r: HospitalRequest) => {
    try {
      await setDoc(doc(db, 'hospitalRequests', r.id), r, { merge: true });
    } catch (err: any) {
      console.warn('Firestore persistRequest sync:', err.message);
    }
  };

  const persistStaff = async (s: StaffAccount) => {
    try {
      await setDoc(doc(db, 'staffAccounts', s.id), s, { merge: true });
    } catch (err: any) {
      console.warn('Firestore persistStaff sync:', err.message);
    }
  };

  const persistDonor = async (d: DonorProfile) => {
    try {
      await setDoc(doc(db, 'donorProfiles', d.id), d, { merge: true });
    } catch (err: any) {
      console.warn('Firestore persistDonor sync:', err.message);
    }
  };

  const persistIssue = async (iss: SystemIssue) => {
    try {
      await setDoc(doc(db, 'systemIssues', iss.id), iss, { merge: true });
    } catch (err: any) {
      console.warn('Firestore persistIssue sync:', err.message);
    }
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      if (user) {
        setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email || 'authorized@bloodchain.gov',
          displayName: user.displayName || (currentStaff ? currentStaff.fullName : 'Authorized User'),
          photoURL: user.photoURL || '',
          role: activeRole,
          lastSeen: new Date().toISOString()
        }, { merge: true }).catch(err => {
          console.warn('Firestore user profile sync notice:', err.message);
        });

        // Seed initial collections to Firestore once authenticated if database is empty
        if (!isInitialSeedAttempted.current) {
          isInitialSeedAttempted.current = true;
          getDocs(collection(db, 'bloodUnits')).then(snap => {
            if (snap.empty) {
              INITIAL_UNITS.forEach(u => setDoc(doc(db, 'bloodUnits', u.din), u, { merge: true }).catch(() => {}));
              INITIAL_BLOCKS.forEach(b => setDoc(doc(db, 'blockchainBlocks', `block-${b.index}`), b, { merge: true }).catch(() => {}));
              INITIAL_HOSPITAL_REQUESTS.forEach(r => setDoc(doc(db, 'hospitalRequests', r.id), r, { merge: true }).catch(() => {}));
              INITIAL_STAFF_ACCOUNTS.forEach(s => setDoc(doc(db, 'staffAccounts', s.id), s, { merge: true }).catch(() => {}));
              INITIAL_DONORS.forEach(d => setDoc(doc(db, 'donorProfiles', d.id), d, { merge: true }).catch(() => {}));
              INITIAL_SYSTEM_ISSUES.forEach(iss => setDoc(doc(db, 'systemIssues', iss.id), iss, { merge: true }).catch(() => {}));
            }
          }).catch(() => {});
        }
      }
    });
    return () => unsubscribe();
  }, [activeRole, currentStaff]);

  // Blockchain integrity verification
  useEffect(() => {
    localStorage.setItem('bloodchain_blocks', JSON.stringify(blockchain));
    verifyChainIntegrity(blockchain).then(status => {
      setChainIntegrityStatus(status);
    });
  }, [blockchain]);

  useEffect(() => {
    localStorage.setItem('bloodchain_units', JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem('bloodchain_donor', JSON.stringify(donor));
  }, [donor]);

  useEffect(() => {
    localStorage.setItem('bloodchain_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('bloodchain_staff_accounts', JSON.stringify(staffAccounts));
  }, [staffAccounts]);

  useEffect(() => {
    localStorage.setItem('bloodchain_donors_list', JSON.stringify(donorsList));
  }, [donorsList]);

  useEffect(() => {
    localStorage.setItem('bloodchain_system_issues', JSON.stringify(systemIssues));
  }, [systemIssues]);

  useEffect(() => {
    if (currentStaff) {
      localStorage.setItem('bloodchain_current_staff', JSON.stringify(currentStaff));
    } else {
      localStorage.removeItem('bloodchain_current_staff');
    }
  }, [currentStaff]);

  useEffect(() => {
    if (currentDonor) {
      localStorage.setItem('bloodchain_current_donor', JSON.stringify(currentDonor));
    } else {
      localStorage.removeItem('bloodchain_current_donor');
    }
  }, [currentDonor]);

  // Auth actions
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Google sign-in popup notice, falling back to authenticated guest token:', err.message);
      await signInAnonymously(auth);
    }
  };

  const signOutUser = async () => {
    await fbSignOut(auth);
    setCurrentUser(null);
    setCurrentStaff(null);
    setCurrentDonor(null);
  };

  const signInDemoRole = async (role: UserRole) => {
    setActiveRole(role);
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      console.warn('Anonymous sign-in:', err.message);
    }
  };

  // ─── Staff Authentication with Real Firebase Auth ─────────────────────────
  const loginStaff = async (emailOrBadge: string, password: string): Promise<{ success: boolean; error?: string; mustChangePassword?: boolean }> => {
    const input = emailOrBadge.trim().toLowerCase();
    const account = staffAccounts.find(
      a => a.email.toLowerCase() === input || a.badgeNumber.toLowerCase() === input
    );
    if (!account) {
      return { success: false, error: 'Staff account not found. Please contact your National Operations Administrator.' };
    }
    if (account.status === 'SUSPENDED') {
      return { success: false, error: 'Account has been suspended by Administration. Access denied.' };
    }

    const isSeedPassValid = account.passwordHash === password || account.temporaryPassword === password;

    // Authenticate with Firebase Auth
    try {
      await signInWithEmailAndPassword(auth, account.email, password);
    } catch (fbErr: any) {
      // If user is not yet created in Firebase Auth, provision them seamlessly if password matches
      if (
        (fbErr.code === 'auth/user-not-found' || 
         fbErr.code === 'auth/invalid-credential' || 
         fbErr.code === 'auth/invalid-login-credentials') && 
        isSeedPassValid
      ) {
        try {
          await createUserWithEmailAndPassword(auth, account.email, password);
        } catch {
          await signInAnonymously(auth);
        }
      } else if (isSeedPassValid) {
        await signInAnonymously(auth);
      } else {
        return { success: false, error: 'Incorrect credentials. Please verify your temporary or permanent password.' };
      }
    }

    const updatedAccount: StaffAccount = { 
      ...account, 
      lastLoginAt: new Date().toISOString() 
    };
    setCurrentStaff(updatedAccount);
    setActiveRole(account.role);
    setStaffAccounts(prev => prev.map(a => a.id === account.id ? updatedAccount : a));
    await persistStaff(updatedAccount);

    if (account.mustChangePassword) {
      return { success: true, mustChangePassword: true };
    }
    return { success: true };
  };

  const changeStaffPassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentStaff) {
      return { success: false, error: 'No active staff session.' };
    }
    if (newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    if (auth.currentUser) {
      try {
        await updatePassword(auth.currentUser, newPassword);
      } catch (err: any) {
        console.warn('Firebase Auth password update note:', err.message);
      }
    }

    const updated: StaffAccount = {
      ...currentStaff,
      passwordHash: newPassword,
      temporaryPassword: undefined,
      mustChangePassword: false
    };
    setCurrentStaff(updated);
    setStaffAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
    await persistStaff(updated);
    return { success: true };
  };

  const logoutStaff = () => {
    setCurrentStaff(null);
  };

  const provisionStaffAccount = async (data: {
    email: string;
    fullName: string;
    role: UserRole;
    facility: string;
    badgeNumber: string;
    customTempPassword?: string;
  }): Promise<StaffAccount> => {
    const prefix = data.role === 'CLINICAL_STAFF' ? 'DOC' : data.role === 'LAB_TECH' ? 'LAB' : data.role === 'LOGISTICS_COURIER' ? 'LOG' : data.role === 'AUDITOR' ? 'AUD' : 'ADM';
    const tempPass = data.customTempPassword?.trim() || `TEMP-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAccount: StaffAccount = {
      id: `STAFF-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      email: data.email.trim(),
      fullName: data.fullName.trim(),
      role: data.role,
      facility: data.facility.trim(),
      badgeNumber: data.badgeNumber.trim(),
      temporaryPassword: tempPass,
      passwordHash: tempPass,
      mustChangePassword: true,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      provisionedBy: currentStaff ? currentStaff.fullName : 'Director Neo Molefe'
    };
    setStaffAccounts(prev => [newAccount, ...prev]);
    await persistStaff(newAccount);
    return newAccount;
  };

  const revokeStaffAccount = (id: string) => {
    setStaffAccounts(prev => {
      const next = prev.map(a => a.id === id ? { ...a, status: 'SUSPENDED' as const } : a);
      const target = next.find(a => a.id === id);
      if (target) persistStaff(target);
      return next;
    });
  };

  const resetStaffPassword = (id: string): string => {
    const account = staffAccounts.find(a => a.id === id);
    const prefix = account ? (account.role === 'CLINICAL_STAFF' ? 'DOC' : account.role === 'LAB_TECH' ? 'LAB' : 'STAFF') : 'RESET';
    const newTemp = `TEMP-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    setStaffAccounts(prev => {
      const next = prev.map(a => a.id === id ? {
        ...a,
        temporaryPassword: newTemp,
        passwordHash: newTemp,
        mustChangePassword: true
      } : a);
      const target = next.find(a => a.id === id);
      if (target) persistStaff(target);
      return next;
    });
    return newTemp;
  };

  // ─── Donor Authentication with Real Firestore & Storage ───────────────────
  const loginDonor = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const input = email.trim().toLowerCase();
    const found = donorsList.find(d => d.email.toLowerCase() === input);
    if (!found) {
      return { success: false, error: 'Donor profile not found. Please register as a new donor.' };
    }

    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
    } catch {
      // Non-blocking
    }

    setCurrentDonor(found);
    setDonor(found);
    setActiveRole('DONOR');
    return { success: true };
  };

  const registerDonor = async (donorData: Partial<DonorProfile>): Promise<{ success: boolean; donor?: DonorProfile; error?: string }> => {
    const existing = donorsList.find(d => d.email.toLowerCase() === (donorData.email || '').toLowerCase());
    if (existing) {
      return { success: false, error: 'A donor with this email address already exists. Please log in.' };
    }

    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
    } catch {
      // Non-blocking
    }

    const newId = `DONOR-${Math.floor(10000 + Math.random() * 90000)}`;
    const randomHash = await sha256(`donor-${newId}-${Date.now()}`);
    const newDonor: DonorProfile = {
      id: newId,
      anonymizedHash: randomHash,
      fullName: donorData.fullName || 'Anonymous Citizen Donor',
      email: donorData.email || '',
      phone: donorData.phone || '',
      nationalIdNumber: donorData.nationalIdNumber || '',
      cityDistrict: donorData.cityDistrict || 'Gaborone',
      bloodType: donorData.bloodType || 'O+',
      totalDonations: 0,
      lastDonationDate: '',
      eligibilityStatus: 'ELIGIBLE',
      nextEligibleDate: new Date().toISOString().split('T')[0],
      linkedUnitDins: [],
      tier: 1,
      uploadedDocuments: [],
      tierUpdatedAt: new Date().toISOString()
    };

    setDonorsList(prev => [newDonor, ...prev]);
    setCurrentDonor(newDonor);
    setDonor(newDonor);
    setActiveRole('DONOR');
    await persistDonor(newDonor);
    return { success: true, donor: newDonor };
  };

  const logoutDonor = () => {
    setCurrentDonor(null);
  };

  // Upload document with Firebase Cloud Storage integration
  const uploadDonorDocument = async (donorId: string, docData: {
    name: string;
    type: DonorDocument['type'];
    sizeKb: number;
    fileDataUrl?: string;
    fileBlob?: Blob;
  }) => {
    let storageUrl = docData.fileDataUrl;

    // Upload to Firebase Cloud Storage if a real Blob is provided
    if (docData.fileBlob) {
      try {
        const path = `donors/${donorId}/${Date.now()}-${docData.name}`;
        const res = await uploadFileToStorage(path, docData.fileBlob);
        storageUrl = res.downloadUrl;
      } catch (err: any) {
        console.warn('Cloud Storage upload failed, falling back to local file reference:', err.message);
      }
    }

    const newDoc: DonorDocument = {
      id: `DOC-${Date.now().toString(36)}`,
      name: docData.name,
      type: docData.type,
      sizeKb: docData.sizeKb,
      uploadedAt: new Date().toISOString(),
      fileDataUrl: storageUrl,
      status: 'PENDING',
      reviewNotes: 'Uploaded by donor. Pending administrator review.'
    };

    const targetDonor = donorsList.find(d => d.id === donorId);
    if (targetDonor) {
      const updatedDocs = [...targetDonor.uploadedDocuments, newDoc];
      const newTier = (targetDonor.tier === 1 ? 2 : targetDonor.tier) as DonorVerificationTier;
      const updatedDonor: DonorProfile = {
        ...targetDonor,
        tier: newTier,
        uploadedDocuments: updatedDocs,
        tierUpdatedAt: new Date().toISOString()
      };

      setDonorsList(prev => prev.map(d => d.id === donorId ? updatedDonor : d));
      if (currentDonor?.id === donorId) {
        setCurrentDonor(updatedDonor);
        setDonor(updatedDonor);
      }
      await persistDonor(updatedDonor);
    }

    createSystemIssue({
      title: `Donor Verification Review: ${targetDonor?.fullName || 'Citizen'}`,
      category: 'DONOR_APPEAL',
      severity: 'MEDIUM',
      facility: 'National Donor Registry',
      affectedEntity: `Donor ID: ${donorId}`,
      description: `New documentation uploaded (${docData.name}). Review documents to grant Tier 3 verification.`
    });
  };

  const reviewDonorDocument = (donorId: string, docId: string, status: 'APPROVED' | 'REJECTED', notes: string) => {
    const targetDonor = donorsList.find(d => d.id === donorId);
    if (!targetDonor) return;

    const updatedDocs = targetDonor.uploadedDocuments.map(docItem => {
      if (docItem.id === docId) {
        return {
          ...docItem,
          status,
          reviewNotes: notes,
          reviewedBy: currentStaff ? currentStaff.fullName : 'Admin Verification Desk'
        };
      }
      return docItem;
    });

    let newTier = targetDonor.tier;
    const hasApprovedDocs = updatedDocs.some(docItem => docItem.status === 'APPROVED');
    if (hasApprovedDocs) {
      newTier = (targetDonor.totalDonations >= 2 ? 4 : 3) as DonorVerificationTier;
    }

    const updatedDonor: DonorProfile = {
      ...targetDonor,
      tier: newTier,
      uploadedDocuments: updatedDocs,
      tierUpdatedAt: new Date().toISOString()
    };

    setDonorsList(prev => prev.map(d => d.id === donorId ? updatedDonor : d));
    if (currentDonor?.id === donorId) {
      setCurrentDonor(updatedDonor);
      setDonor(updatedDonor);
    }
    persistDonor(updatedDonor);
  };

  const updateDonorTier = (donorId: string, tier: DonorVerificationTier) => {
    const targetDonor = donorsList.find(d => d.id === donorId);
    if (!targetDonor) return;
    const updated: DonorProfile = { ...targetDonor, tier, tierUpdatedAt: new Date().toISOString() };
    setDonorsList(prev => prev.map(d => d.id === donorId ? updated : d));
    if (currentDonor?.id === donorId) {
      setCurrentDonor(updated);
      setDonor(updated);
    }
    persistDonor(updated);
  };

  const resolveSystemIssue = (issueId: string, notes: string, resolvedBy: string) => {
    const issue = systemIssues.find(iss => iss.id === issueId);
    if (!issue) return;
    const updated: SystemIssue = {
      ...issue,
      status: 'RESOLVED',
      resolutionNotes: notes,
      resolvedBy,
      resolvedAt: new Date().toISOString()
    };
    setSystemIssues(prev => prev.map(iss => iss.id === issueId ? updated : iss));
    persistIssue(updated);
  };

  const createSystemIssue = (issueData: Omit<SystemIssue, 'id' | 'timestamp' | 'status'>) => {
    const newIssue: SystemIssue = {
      ...issueData,
      id: `ISSUE-${Date.now().toString(36).toUpperCase()}`,
      status: 'OPEN',
      timestamp: new Date().toISOString()
    };
    setSystemIssues(prev => [newIssue, ...prev]);
    persistIssue(newIssue);
  };

  // Helper to append a block to the chain
  const appendBlock = async (
    unitDIN: string,
    eventType: BlockchainBlock['eventType'],
    actor: BlockchainBlock['actor'],
    payload: Record<string, any>
  ): Promise<BlockchainBlock> => {
    const prevBlock = blockchain[blockchain.length - 1];
    const prevHash = prevBlock ? prevBlock.hash : '0000000000000000000000000000000000000000000000000000000000000000';
    const index = blockchain.length;
    const timestamp = new Date().toISOString();

    const blockHash = await calculateBlockHash(
      index,
      timestamp,
      unitDIN,
      eventType,
      actor,
      payload,
      prevHash
    );

    const newBlock: BlockchainBlock = {
      index,
      timestamp,
      unitDIN,
      eventType,
      actor,
      payload,
      previousHash: prevHash,
      hash: blockHash
    };

    setBlockchain(prev => [...prev, newBlock]);
    await persistBlock(newBlock);
    return newBlock;
  };

  // 1. Phlebotomy collects donation & syncs to luxraye/live Fabric
  const acceptDonation = async (donorId: string, bloodType: BloodType, volumeMl: number): Promise<string> => {
    const newDinNumber = `W0423-26-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowIso = new Date().toISOString();
    const expiryIso = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString();

    const newUnit: BloodUnit = {
      din: newDinNumber,
      donorAnonymizedId: donor.anonymizedHash,
      bloodType,
      componentType: 'WHOLE_BLOOD',
      volumeMl,
      collectedAt: nowIso,
      expiresAt: expiryIso,
      currentFacility: 'Metro Central Blood Center - Phlebotomy Bay 3',
      status: 'COLLECTED',
      labTests: {
        hiv: 'PENDING',
        hbv: 'PENDING',
        hcv: 'PENDING',
        syphilis: 'PENDING',
        westNile: 'PENDING',
        aboRhConfirmatory: 'PENDING',
        hemoglobinG_dL: 14.5
      },
      storageTempRange: { min: 1, max: 6 },
      telemetryLogs: [
        {
          timestamp: nowIso,
          temperatureCelsius: 4.2,
          locationName: 'Collection Refrigerator Tray A',
          lat: -24.6282,
          lng: 25.9231,
          batteryPct: 100,
          breachDetected: false
        }
      ]
    };

    setUnits(prev => [newUnit, ...prev]);
    await persistUnit(newUnit);

    // Record on luxraye/live Fabric ledger API
    fetch('/donations/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        txId: `tx-${Date.now().toString(36)}-${newDinNumber.replace(/[^a-zA-Z0-9]/g, '')}`,
        donorHash: donor.anonymizedHash,
        centreId: 'CTR-GAB-001',
        centreName: 'Princess Marina Hospital',
        district: 'Gaborone',
        bloodType,
        donatedAt: nowIso,
        operatorHash: 'c47a10dca9f39c3e2f1c34b57e8a9d21f06e5b48a3c72d1e9f84ab06c5d13e78'
      })
    }).catch(err => console.warn('Fabric sync dispatch note:', err.message));

    const nextTotal = donor.totalDonations + 1;
    const nextTier = (donor.tier === 3 && nextTotal >= 2 ? 4 : donor.tier) as DonorVerificationTier;
    const updatedDonor: DonorProfile = {
      ...donor,
      totalDonations: nextTotal,
      tier: nextTier,
      lastDonationDate: nowIso.split('T')[0],
      linkedUnitDins: [newDinNumber, ...donor.linkedUnitDins]
    };

    setDonor(updatedDonor);
    setDonorsList(prev => prev.map(d => d.id === donorId || d.id === donor.id ? updatedDonor : d));
    if (currentDonor) setCurrentDonor(updatedDonor);
    await persistDonor(updatedDonor);

    const actorSig = await sha256(`DONOR-${donorId}-${newDinNumber}-${nowIso}`);
    await appendBlock(
      newDinNumber,
      'DONATION_ACCEPTED',
      {
        id: donorId,
        role: 'DONOR',
        facility: 'Metro Central Blood Center',
        signature: `0x${actorSig.slice(0, 48)}`
      },
      {
        donorHash: donor.anonymizedHash,
        bloodType,
        volumeMl,
        intakeTempCelsius: 4.2,
        anticoagulant: 'CPDA-1'
      }
    );

    return newDinNumber;
  };

  // 2. Lab tests update
  const recordLabTests = (unitDIN: string, results: Partial<LabTestResults>) => {
    setUnits(prev => {
      const next = prev.map(u => {
        if (u.din === unitDIN) {
          const updatedUnit = {
            ...u,
            labTests: { ...u.labTests, ...results }
          };
          persistUnit(updatedUnit);
          return updatedUnit;
        }
        return u;
      });
      return next;
    });
  };

  // 3. Authorize Lab Release
  const authorizeLabRelease = async (unitDIN: string, techName: string): Promise<boolean> => {
    const unit = units.find(u => u.din === unitDIN);
    if (!unit) return false;

    const { hiv, hbv, hcv, syphilis, westNile, aboRhConfirmatory } = unit.labTests;
    const allPassed =
      hiv === 'NEGATIVE' &&
      hbv === 'NEGATIVE' &&
      hcv === 'NEGATIVE' &&
      syphilis === 'NEGATIVE' &&
      westNile === 'NEGATIVE' &&
      aboRhConfirmatory !== 'PENDING';

    if (!allPassed) {
      return false;
    }

    const nowIso = new Date().toISOString();
    const updatedUnit: BloodUnit = {
      ...unit,
      status: 'RELEASED',
      currentFacility: 'Central Blood Bank - Validated Vault',
      labTests: {
        ...unit.labTests,
        testedAt: nowIso,
        testedBy: techName,
        qcReleaseApproval: true
      }
    };

    setUnits(prev => prev.map(u => u.din === unitDIN ? updatedUnit : u));
    await persistUnit(updatedUnit);

    const sig = await sha256(`QC-RELEASE-${unitDIN}-${techName}-${nowIso}`);
    await appendBlock(
      unitDIN,
      'TESTS_PASSED_AND_RELEASED',
      {
        id: techName,
        role: 'LAB_TECH',
        facility: 'National Reference Serology Center',
        signature: `0x${sig.slice(0, 48)}`
      },
      {
        confirmatoryBloodType: aboRhConfirmatory,
        infectiousDiseaseScreen: { hiv, hbv, hcv, syphilis, westNile },
        qcReleaseStatus: 'PASSED_ALL_MANDATORY_CRITERIA',
        expirationDate: unit.expiresAt
      }
    );

    return true;
  };

  // 4. Quarantine in Lab
  const quarantineUnitInLab = async (unitDIN: string, techName: string, reason: string): Promise<void> => {
    const unit = units.find(u => u.din === unitDIN);
    if (!unit) return;

    const updatedUnit: BloodUnit = {
      ...unit,
      status: 'QUARANTINED',
      currentFacility: 'Bio-Hazard Isolation Locker B-4'
    };

    setUnits(prev => prev.map(u => u.din === unitDIN ? updatedUnit : u));
    await persistUnit(updatedUnit);

    const sig = await sha256(`QUARANTINE-${unitDIN}-${techName}`);
    await appendBlock(
      unitDIN,
      'TESTS_FAILED_QUARANTINED',
      {
        id: techName,
        role: 'LAB_TECH',
        facility: 'National Reference Serology Center',
        signature: `0x${sig.slice(0, 48)}`
      },
      {
        quarantineReason: reason,
        actionRequired: 'DESTROY_AUTOCLAVE_BIOHAZARD'
      }
    );
  };

  // 5. Dispatch to Transit
  const dispatchUnitToTransit = async (
    unitDIN: string,
    courierName: string,
    destination: string,
    tempCelsius: number
  ) => {
    if (isOffline) {
      const action: OfflineAction = {
        id: `offline-${Date.now()}`,
        actionType: 'DISPATCH',
        timestamp: new Date().toISOString(),
        data: { unitDIN, courierName, destination, tempCelsius }
      };
      setOfflineQueue(prev => [...prev, action]);
    }

    const nowIso = new Date().toISOString();
    const unit = units.find(u => u.din === unitDIN);
    if (!unit) return;

    const updatedUnit: BloodUnit = {
      ...unit,
      status: 'IN_TRANSIT',
      transitCourier: courierName,
      destinationHospital: destination,
      currentFacility: `In Transit with ${courierName}`,
      telemetryLogs: [
        ...unit.telemetryLogs,
        {
          timestamp: nowIso,
          temperatureCelsius: tempCelsius,
          locationName: 'Dispatched from Central Cold Vault',
          lat: -24.6541,
          lng: 25.9087,
          batteryPct: 99,
          breachDetected: tempCelsius < unit.storageTempRange.min || tempCelsius > unit.storageTempRange.max
        }
      ]
    };

    setUnits(prev => prev.map(u => u.din === unitDIN ? updatedUnit : u));
    await persistUnit(updatedUnit);

    if (!isOffline) {
      const sig = await sha256(`DISPATCH-${unitDIN}-${courierName}-${nowIso}`);
      await appendBlock(
        unitDIN,
        'CUSTODY_DISPATCHED',
        {
          id: courierName,
          role: 'LOGISTICS_COURIER',
          facility: `SwiftMed Transit Fleet`,
          signature: `0x${sig.slice(0, 48)}`
        },
        {
          origin: 'Central Blood Bank Vault',
          destinationHospital: destination,
          custodyHandoverTemp: tempCelsius,
          coldBoxSealHash: `SEAL-${Math.floor(100000 + Math.random() * 900000)}`
        }
      );
    }
  };

  // 6. Log IoT Telemetry
  const logTelemetryReading = (unitDIN: string, tempCelsius: number, locationName: string) => {
    setUnits(prev => {
      const next = prev.map(u => {
        if (u.din === unitDIN) {
          const isBreach = tempCelsius < u.storageTempRange.min || tempCelsius > u.storageTempRange.max;
          const updatedUnit: BloodUnit = {
            ...u,
            telemetryLogs: [
              ...u.telemetryLogs,
              {
                timestamp: new Date().toISOString(),
                temperatureCelsius: tempCelsius,
                locationName,
                lat: -24.6541 + (Math.random() - 0.5) * 0.05,
                lng: 25.9087 + (Math.random() - 0.5) * 0.05,
                batteryPct: Math.max(10, 85 - u.telemetryLogs.length),
                breachDetected: isBreach
              }
            ]
          };
          persistUnit(updatedUnit);
          return updatedUnit;
        }
        return u;
      });
      return next;
    });
  };

  // 7. Hospital Receipt
  const confirmHospitalReceipt = async (unitDIN: string, hospitalName: string, staffName: string) => {
    const nowIso = new Date().toISOString();
    const unit = units.find(u => u.din === unitDIN);
    if (!unit) return;

    const updatedUnit: BloodUnit = {
      ...unit,
      status: 'DELIVERED_TO_HOSPITAL',
      currentFacility: `${hospitalName} - Transfusion Medicine`,
      destinationHospital: hospitalName
    };

    setUnits(prev => prev.map(u => u.din === unitDIN ? updatedUnit : u));
    await persistUnit(updatedUnit);

    const sig = await sha256(`RECEIVE-${unitDIN}-${hospitalName}-${nowIso}`);
    await appendBlock(
      unitDIN,
      'HOSPITAL_RECEIVED',
      {
        id: staffName,
        role: 'CLINICAL_STAFF',
        facility: hospitalName,
        signature: `0x${sig.slice(0, 48)}`
      },
      {
        receivingHospital: hospitalName,
        receivedByStaff: staffName,
        coldChainIntegrityVerified: true
      }
    );
  };

  // 8. Bedside Crossmatch
  const verifyBedsideCrossmatch = async (
    unitDIN: string,
    patientId: string,
    patientBloodType: BloodType,
    nurse1: string,
    nurse2: string
  ): Promise<{ success: boolean; error?: string }> => {
    const unit = units.find(u => u.din === unitDIN);
    if (!unit) return { success: false, error: 'Blood unit not found in registry.' };

    if (unit.status !== 'DELIVERED_TO_HOSPITAL' && unit.status !== 'RELEASED') {
      return {
        success: false,
        error: `Unit is currently in status "${unit.status}". Only units delivered to hospital can be bedside crossmatched.`
      };
    }

    const compatible = isRbcCompatible(unit.bloodType, patientBloodType);
    if (!compatible) {
      return {
        success: false,
        error: `CRITICAL INCOMPATIBILITY ERROR: Donor unit ${unit.bloodType} cannot be transfused into patient ${patientBloodType}! Transfusion prohibited.`
      };
    }

    const patientHash = await sha256(`PATIENT-${patientId}`);
    const nowIso = new Date().toISOString();

    const updatedUnit: BloodUnit = {
      ...unit,
      status: 'BEDSIDE_CROSSMATCHED',
      patientHash: `PT-${patientHash.slice(0, 10).toUpperCase()}`,
      patientAssignedBloodType: patientBloodType
    };

    setUnits(prev => prev.map(u => u.din === unitDIN ? updatedUnit : u));
    await persistUnit(updatedUnit);

    const dualSig = await sha256(`CROSSMATCH-${nurse1}-${nurse2}-${unitDIN}-${patientId}`);
    await appendBlock(
      unitDIN,
      'BEDSIDE_DUAL_VERIFIED',
      {
        id: `${nurse1} & ${nurse2}`,
        role: 'CLINICAL_STAFF',
        facility: unit.currentFacility,
        signature: `0x${dualSig.slice(0, 48)}`
      },
      {
        recipientHash: `PT-${patientHash.slice(0, 10).toUpperCase()}`,
        recipientBloodType: patientBloodType,
        donorBloodType: unit.bloodType,
        crossmatchVerificationResult: 'COMPATIBLE_VERIFIED',
        nurse1Witness: nurse1,
        nurse2Witness: nurse2
      }
    );

    return { success: true };
  };

  // 9. Complete Transfusion
  const completeTransfusion = async (unitDIN: string, clinicianName: string, vitalsSummary: string) => {
    const nowIso = new Date().toISOString();
    const unit = units.find(u => u.din === unitDIN);
    if (!unit) return;

    const updatedUnit: BloodUnit = {
      ...unit,
      status: 'TRANSFUSED',
      transfusedAt: nowIso
    };

    setUnits(prev => prev.map(u => u.din === unitDIN ? updatedUnit : u));
    await persistUnit(updatedUnit);

    const sig = await sha256(`TRANSFUSED-${unitDIN}-${clinicianName}-${nowIso}`);
    await appendBlock(
      unitDIN,
      'TRANSFUSION_COMPLETED',
      {
        id: clinicianName,
        role: 'CLINICAL_STAFF',
        facility: 'Hospital Clinical Ward',
        signature: `0x${sig.slice(0, 48)}`
      },
      {
        postTransfusionVitals: vitalsSummary,
        transfusionEndedAt: nowIso,
        finalCustodyStatus: 'TRANSFUSION_COMPLETED_CLOSED_CYCLE'
      }
    );
  };

  // 10. Report Adverse Reaction
  const reportAdverseReaction = async (
    unitDIN: string,
    type: 'TRALI' | 'TACO' | 'FEBRILE' | 'ACUTE_HEMOLYTIC',
    severity: 'MILD' | 'SEVERE' | 'LIFE_THREATENING',
    notes: string,
    clinicianName: string
  ) => {
    const nowIso = new Date().toISOString();
    const unit = units.find(u => u.din === unitDIN);
    if (!unit) return;

    const updatedUnit: BloodUnit = {
      ...unit,
      reactionReported: {
        type,
        severity,
        timestamp: nowIso,
        reportedBy: clinicianName,
        notes
      }
    };

    setUnits(prev => prev.map(u => u.din === unitDIN ? updatedUnit : u));
    await persistUnit(updatedUnit);

    const sig = await sha256(`HEMOVIGILANCE-${unitDIN}-${type}-${nowIso}`);
    await appendBlock(
      unitDIN,
      'ADVERSE_REACTION_FLAGGED',
      {
        id: clinicianName,
        role: 'CLINICAL_STAFF',
        facility: 'Hospital Critical Care Unit',
        signature: `0x${sig.slice(0, 48)}`
      },
      {
        adverseReactionType: type,
        severityLevel: severity,
        clinicalNotes: notes,
        hemovigilanceTriggered: true,
        actionTaken: 'INVESTIGATION_AND_RECALL_LINKED_DONOR_COMPONENTS'
      }
    );

    createSystemIssue({
      title: `Adverse Reaction (${type}) Reported`,
      category: 'BEDSIDE_MISMATCH',
      severity: severity === 'LIFE_THREATENING' ? 'CRITICAL' : 'HIGH',
      facility: unit.currentFacility,
      affectedEntity: `Unit DIN: ${unitDIN}`,
      description: `Reported by ${clinicianName}. Severity: ${severity}. Notes: ${notes}`
    });
  };

  // 11. Hospital Requests
  const createHospitalRequest = (
    hospitalName: string,
    department: string,
    urgency: 'EMERGENCY_CODE_CRIMSON' | 'URGENT' | 'ROUTINE',
    bloodType: BloodType,
    componentType: ComponentType,
    unitsNeeded: number
  ) => {
    const newReq: HospitalRequest = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      hospitalName,
      department,
      urgency,
      bloodType,
      componentType,
      unitsNeeded,
      requestedAt: new Date().toISOString(),
      status: 'PENDING',
      fulfilledUnitDins: []
    };
    setRequests(prev => [newReq, ...prev]);
    persistRequest(newReq);
  };

  const fulfillHospitalRequest = (requestId: string, unitDins: string[]) => {
    setRequests(prev => {
      const next = prev.map(r => {
        if (r.id === requestId) {
          const updated = {
            ...r,
            status: 'DISPATCHED' as const,
            fulfilledUnitDins: unitDins
          };
          persistRequest(updated);
          return updated;
        }
        return r;
      });
      return next;
    });
  };

  // 12. Offline Queue Sync
  const syncOfflineQueue = async () => {
    for (const item of offlineQueue) {
      if (item.actionType === 'DISPATCH') {
        const { unitDIN, courierName, destination, tempCelsius } = item.data;
        const sig = await sha256(`OFFLINE-DISPATCH-${unitDIN}-${item.timestamp}`);
        await appendBlock(
          unitDIN,
          'CUSTODY_DISPATCHED',
          {
            id: courierName,
            role: 'LOGISTICS_COURIER',
            facility: 'SwiftMed Fleet (Reconciled from Offline Queue)',
            signature: `0x${sig.slice(0, 48)}`
          },
          {
            origin: 'Central Blood Bank Vault',
            destinationHospital: destination,
            custodyHandoverTemp: tempCelsius,
            offlineReconciledAt: new Date().toISOString()
          }
        );
      }
    }
    setOfflineQueue([]);
    setIsOffline(false);
  };

  // 13. Blockchain Tamper Demo Function
  const tamperBlockPayload = (blockIndex: number, fieldPath: string, maliciousValue: any) => {
    setBlockchain(prev => {
      const copy = [...prev];
      const target = { ...copy[blockIndex] };
      target.payload = { ...target.payload, [fieldPath]: maliciousValue };
      target.isTampered = true;
      copy[blockIndex] = target;
      return copy;
    });
  };

  const restoreOriginalLedger = () => {
    localStorage.removeItem('bloodchain_blocks');
    setBlockchain(INITIAL_BLOCKS);
  };

  return (
    <BloodchainContext.Provider
      value={{
        currentUser,
        signInWithGoogle,
        signOutUser,
        signInDemoRole,
        activeRole,
        setActiveRole,
        activeView,
        setActiveView,
        units,
        blockchain,
        donor,
        requests,
        isOffline,
        setIsOffline,
        offlineQueue,
        syncOfflineQueue,
        acceptDonation,
        recordLabTests,
        authorizeLabRelease,
        quarantineUnitInLab,
        dispatchUnitToTransit,
        logTelemetryReading,
        confirmHospitalReceipt,
        verifyBedsideCrossmatch,
        completeTransfusion,
        reportAdverseReaction,
        createHospitalRequest,
        fulfillHospitalRequest,
        tamperBlockPayload,
        restoreOriginalLedger,
        chainIntegrityStatus,
        staffAccounts,
        donorsList,
        systemIssues,
        currentStaff,
        currentDonor,
        loginStaff,
        changeStaffPassword,
        logoutStaff,
        provisionStaffAccount,
        revokeStaffAccount,
        resetStaffPassword,
        loginDonor,
        registerDonor,
        logoutDonor,
        uploadDonorDocument,
        reviewDonorDocument,
        updateDonorTier,
        resolveSystemIssue,
        createSystemIssue
      }}
    >
      {children}
    </BloodchainContext.Provider>
  );
};

export const useBloodchain = () => {
  const context = useContext(BloodchainContext);
  if (!context) {
    throw new Error('useBloodchain must be used within a BloodchainProvider');
  }
  return context;
};
