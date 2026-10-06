import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  signInAnonymously,
  onAuthStateChanged,
  doc,
  setDoc,
  collection,
  onSnapshot,
  type FirebaseUser
} from '@shared/lib/firebase';
import {
  BloodUnit,
  BloodType,
  HospitalRequest,
  StaffAccount,
  DonorProfile,
  SystemIssue,
  UserRole,
  DonorVerificationTier
} from '@shared/types/bloodchain';
import {
  INITIAL_UNITS,
  INITIAL_STAFF_ACCOUNTS,
  INITIAL_DONORS,
  INITIAL_HOSPITAL_REQUESTS,
  INITIAL_SYSTEM_ISSUES
} from '@shared/data/seedData';

export interface DeficitGroupStat {
  group: BloodType;
  count: number;
  dailyBurn: number;
  daysOfSupply: number;
  isCritical: boolean;
  isUniversal: boolean;
}

interface RubricContextType {
  currentUser: FirebaseUser | null;
  currentOperator: StaffAccount | null;
  isAuthenticated: boolean;
  units: BloodUnit[];
  requests: HospitalRequest[];
  staffList: StaffAccount[];
  donorsList: DonorProfile[];
  issuesList: SystemIssue[];
  deficitMatrix: DeficitGroupStat[];
  criticalDeficitCount: number;

  // Authentication
  loginOperator: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  quickDemoOperatorLogin: () => void;
  logoutOperator: () => Promise<void>;

  // Operations
  fulfillRequest: (requestId: string, unitDins: string[]) => Promise<void>;
  provisionStaff: (data: {
    fullName: string;
    email: string;
    role: UserRole;
    facility: string;
    badgeNumber: string;
    customTempPassword?: string;
  }) => Promise<StaffAccount>;
  toggleStaffStatus: (id: string, status: 'ACTIVE' | 'SUSPENDED') => Promise<void>;
  resetStaffPassword: (id: string) => Promise<string>;
  reviewDonorDocument: (donorId: string, docId: string, status: 'APPROVED' | 'REJECTED', notes: string) => Promise<void>;
  updateDonorTier: (donorId: string, tier: DonorVerificationTier) => Promise<void>;
  resolveIssue: (issueId: string, notes: string) => Promise<void>;
  publishEmergencyAppeal: (data: {
    title: string;
    description: string;
    facility: string;
    targetBloodType: BloodType;
  }) => Promise<void>;
}

const RubricContext = createContext<RubricContextType | null>(null);

export const RubricProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  
  // Default to Director Neo Molefe for seamless situation room operations
  const defaultAdmin = INITIAL_STAFF_ACCOUNTS.find(s => s.role === 'NATIONAL_OPERATOR') || INITIAL_STAFF_ACCOUNTS[0];
  const [currentOperator, setCurrentOperator] = useState<StaffAccount | null>(() => {
    const saved = localStorage.getItem('rubric_active_operator');
    return saved ? JSON.parse(saved) : defaultAdmin;
  });

  const [units, setUnits] = useState<BloodUnit[]>(INITIAL_UNITS);
  const [requests, setRequests] = useState<HospitalRequest[]>(INITIAL_HOSPITAL_REQUESTS);
  const [staffList, setStaffList] = useState<StaffAccount[]>(INITIAL_STAFF_ACCOUNTS);
  const [donorsList, setDonorsList] = useState<DonorProfile[]>(INITIAL_DONORS);
  const [issuesList, setIssuesList] = useState<SystemIssue[]>(INITIAL_SYSTEM_ISSUES);

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore Subscriptions
  useEffect(() => {
    const unsubUnits = onSnapshot(collection(db, 'bloodUnits'), snap => {
      if (!snap.empty) setUnits(snap.docs.map(d => d.data() as BloodUnit));
    }, err => console.warn('Rubric units sync:', err.message));

    const unsubReqs = onSnapshot(collection(db, 'hospitalRequests'), snap => {
      if (!snap.empty) setRequests(snap.docs.map(d => d.data() as HospitalRequest));
    }, err => console.warn('Rubric requests sync:', err.message));

    const unsubStaff = onSnapshot(collection(db, 'staffAccounts'), snap => {
      if (!snap.empty) setStaffList(snap.docs.map(d => d.data() as StaffAccount));
    }, err => console.warn('Rubric staff sync:', err.message));

    const unsubDonors = onSnapshot(collection(db, 'donorProfiles'), snap => {
      if (!snap.empty) setDonorsList(snap.docs.map(d => d.data() as DonorProfile));
    }, err => console.warn('Rubric donors sync:', err.message));

    const unsubIssues = onSnapshot(collection(db, 'systemIssues'), snap => {
      if (!snap.empty) setIssuesList(snap.docs.map(d => d.data() as SystemIssue));
    }, err => console.warn('Rubric issues sync:', err.message));

    return () => {
      unsubUnits();
      unsubReqs();
      unsubStaff();
      unsubDonors();
      unsubIssues();
    };
  }, []);

  // Compute 8-Group National Deficit Matrix
  const bloodGroups: BloodType[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const deficitMatrix: DeficitGroupStat[] = bloodGroups.map(grp => {
    const available = units.filter(u => u.bloodType === grp && ['RELEASED', 'DELIVERED_TO_HOSPITAL'].includes(u.status));
    const count = available.length;
    const dailyBurn = grp === 'O-' ? 1.5 : grp === 'O+' ? 2.5 : 1.0;
    const daysOfSupply = Number((count / dailyBurn).toFixed(1));
    const isCritical = daysOfSupply < 3.0;

    return {
      group: grp,
      count,
      dailyBurn,
      daysOfSupply,
      isCritical,
      isUniversal: grp === 'O-'
    };
  });

  const criticalDeficitCount = deficitMatrix.filter(d => d.isCritical).length;

  // Authentication
  const loginOperator = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const account = staffList.find(s => s.email.toLowerCase() === cleanEmail);
    if (!account) {
      return { success: false, error: 'Operator account not registered in National Directory.' };
    }
    if (account.role !== 'NATIONAL_OPERATOR') {
      return { success: false, error: 'Access restricted to Ministry Health Directors and National Operators.' };
    }
    if (account.status === 'SUSPENDED') {
      return { success: false, error: 'Account has been suspended.' };
    }

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
    } catch {
      await signInAnonymously(auth);
    }

    const updated = { ...account, lastLoginAt: new Date().toISOString() };
    setCurrentOperator(updated);
    localStorage.setItem('rubric_active_operator', JSON.stringify(updated));
    return { success: true };
  };

  const quickDemoOperatorLogin = () => {
    setCurrentOperator(defaultAdmin);
    localStorage.setItem('rubric_active_operator', JSON.stringify(defaultAdmin));
  };

  const logoutOperator = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // Non-blocking
    }
    localStorage.removeItem('rubric_active_operator');
    setCurrentOperator(null);
  };

  // Requisition Fulfillment
  const fulfillRequest = async (requestId: string, unitDins: string[]): Promise<void> => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    const updatedReq: HospitalRequest = {
      ...req,
      status: 'DISPATCHED',
      fulfilledUnitDins: unitDins
    };

    setRequests(prev => prev.map(r => r.id === requestId ? updatedReq : r));
    try {
      await setDoc(doc(db, 'hospitalRequests', requestId), updatedReq, { merge: true });
    } catch (err: any) {
      console.warn('Firestore fulfill request sync:', err.message);
    }
  };

  // Staff Account Management
  const provisionStaff = async (data: {
    fullName: string;
    email: string;
    role: UserRole;
    facility: string;
    badgeNumber: string;
    customTempPassword?: string;
  }): Promise<StaffAccount> => {
    const prefix = data.role === 'CLINICAL_STAFF' ? 'DOC' : data.role === 'LAB_TECH' ? 'LAB' : data.role === 'LOGISTICS_COURIER' ? 'LOG' : data.role === 'AUDITOR' ? 'AUD' : 'ADM';
    const tempPass = data.customTempPassword?.trim() || `TEMP-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAccount: StaffAccount = {
      id: `STAFF-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      email: data.email.trim().toLowerCase(),
      fullName: data.fullName.trim(),
      role: data.role,
      facility: data.facility.trim(),
      badgeNumber: data.badgeNumber.trim().toUpperCase(),
      temporaryPassword: tempPass,
      passwordHash: tempPass,
      mustChangePassword: true,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      provisionedBy: currentOperator ? currentOperator.fullName : 'Director Neo Molefe'
    };

    setStaffList(prev => [newAccount, ...prev]);

    // Save to Firestore
    try {
      await setDoc(doc(db, 'staffAccounts', newAccount.id), newAccount, { merge: true });
    } catch (err: any) {
      console.warn('Firestore provision staff sync:', err.message);
    }

    return newAccount;
  };

  const toggleStaffStatus = async (id: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<void> => {
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    const target = staffList.find(s => s.id === id);
    if (target) {
      const updated = { ...target, status };
      try {
        await setDoc(doc(db, 'staffAccounts', id), updated, { merge: true });
      } catch (err: any) {
        console.warn('Firestore toggle staff sync:', err.message);
      }
    }
  };

  const resetStaffPassword = async (id: string): Promise<string> => {
    const target = staffList.find(s => s.id === id);
    const prefix = target ? (target.role === 'CLINICAL_STAFF' ? 'DOC' : target.role === 'LAB_TECH' ? 'LAB' : 'STAFF') : 'RESET';
    const newTemp = `TEMP-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (target) {
      const updated: StaffAccount = {
        ...target,
        temporaryPassword: newTemp,
        passwordHash: newTemp,
        mustChangePassword: true
      };
      setStaffList(prev => prev.map(s => s.id === id ? updated : s));
      try {
        await setDoc(doc(db, 'staffAccounts', id), updated, { merge: true });
      } catch (err: any) {
        console.warn('Firestore reset password sync:', err.message);
      }
    }
    return newTemp;
  };

  // Donor Verification
  const reviewDonorDocument = async (donorId: string, docId: string, status: 'APPROVED' | 'REJECTED', notes: string): Promise<void> => {
    const target = donorsList.find(d => d.id === donorId);
    if (!target) return;

    const updatedDocs = target.uploadedDocuments.map(item => {
      if (item.id === docId) {
        return {
          ...item,
          status,
          reviewNotes: notes,
          reviewedBy: currentOperator ? currentOperator.fullName : 'Director Neo Molefe'
        };
      }
      return item;
    });

    let newTier = target.tier;
    const hasApproved = updatedDocs.some(i => i.status === 'APPROVED');
    if (hasApproved) {
      newTier = (target.totalDonations >= 2 ? 4 : 3) as DonorVerificationTier;
    }

    const updatedDonor: DonorProfile = {
      ...target,
      tier: newTier,
      uploadedDocuments: updatedDocs,
      tierUpdatedAt: new Date().toISOString()
    };

    setDonorsList(prev => prev.map(d => d.id === donorId ? updatedDonor : d));
    try {
      await setDoc(doc(db, 'donorProfiles', donorId), updatedDonor, { merge: true });
    } catch (err: any) {
      console.warn('Firestore review document sync:', err.message);
    }
  };

  const updateDonorTier = async (donorId: string, tier: DonorVerificationTier): Promise<void> => {
    const target = donorsList.find(d => d.id === donorId);
    if (!target) return;

    const updated = { ...target, tier, tierUpdatedAt: new Date().toISOString() };
    setDonorsList(prev => prev.map(d => d.id === donorId ? updated : d));
    try {
      await setDoc(doc(db, 'donorProfiles', donorId), updated, { merge: true });
    } catch (err: any) {
      console.warn('Firestore update donor tier sync:', err.message);
    }
  };

  // Incident & Emergency Management
  const resolveIssue = async (issueId: string, notes: string): Promise<void> => {
    const target = issuesList.find(i => i.id === issueId);
    if (!target) return;

    const updated: SystemIssue = {
      ...target,
      status: 'RESOLVED',
      resolutionNotes: notes,
      resolvedBy: currentOperator ? currentOperator.fullName : 'Director Neo Molefe',
      resolvedAt: new Date().toISOString()
    };

    setIssuesList(prev => prev.map(i => i.id === issueId ? updated : i));
    try {
      await setDoc(doc(db, 'systemIssues', issueId), updated, { merge: true });
    } catch (err: any) {
      console.warn('Firestore resolve issue sync:', err.message);
    }
  };

  const publishEmergencyAppeal = async (data: {
    title: string;
    description: string;
    facility: string;
    targetBloodType: BloodType;
  }): Promise<void> => {
    const issueId = `APPEAL-${Date.now().toString(36).toUpperCase()}`;
    const newAppeal: SystemIssue = {
      id: issueId,
      title: data.title,
      description: data.description,
      facility: data.facility,
      category: 'SUPPLY_DEFICIT',
      severity: 'CRITICAL',
      affectedEntity: `Critical ${data.targetBloodType} Shortage`,
      status: 'OPEN',
      timestamp: new Date().toISOString()
    };

    setIssuesList(prev => [newAppeal, ...prev]);
    try {
      await setDoc(doc(db, 'systemIssues', issueId), newAppeal, { merge: true });
    } catch (err: any) {
      console.warn('Firestore emergency appeal save:', err.message);
    }
  };

  return (
    <RubricContext.Provider
      value={{
        currentUser,
        currentOperator,
        isAuthenticated: !!currentOperator,
        units,
        requests,
        staffList,
        donorsList,
        issuesList,
        deficitMatrix,
        criticalDeficitCount,
        loginOperator,
        quickDemoOperatorLogin,
        logoutOperator,
        fulfillRequest,
        provisionStaff,
        toggleStaffStatus,
        resetStaffPassword,
        reviewDonorDocument,
        updateDonorTier,
        resolveIssue,
        publishEmergencyAppeal
      }}
    >
      {children}
    </RubricContext.Provider>
  );
};

export const useRubric = () => {
  const context = useContext(RubricContext);
  if (!context) {
    throw new Error('useRubric must be used within a RubricProvider');
  }
  return context;
};
