import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  db,
  uploadFileToStorage,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  signInAnonymously,
  onAuthStateChanged,
  doc,
  setDoc,
  collection,
  onSnapshot,
  query,
  where,
  type FirebaseUser
} from '@shared/lib/firebase';
import { 
  DonorProfile, 
  BloodUnit, 
  BloodType, 
  DonorDocument, 
  DonorVerificationTier, 
  SystemIssue 
} from '@shared/types/bloodchain';
import { INITIAL_DONOR, INITIAL_DONORS } from '@shared/data/seedData';
import { sha256 } from '@shared/lib/crypto';

export interface DonationCenter {
  id: string;
  name: string;
  district: string;
  address: string;
  phone: string;
  hours: string;
  urgentNeeds: BloodType[];
  lat: number;
  lng: number;
}

export const BOTSWANA_CENTERS: DonationCenter[] = [
  {
    id: 'CTR-GAB-001',
    name: 'Princess Marina Hospital Blood Bank',
    district: 'Gaborone',
    address: 'Hospital Way, Extension 9, Gaborone',
    phone: '+267 362 1400',
    hours: 'Mon - Fri: 07:30 - 17:00 | Sat: 08:00 - 13:00',
    urgentNeeds: ['O-', 'O+', 'B-'],
    lat: -24.6541,
    lng: 25.9087
  },
  {
    id: 'CTR-FRW-001',
    name: 'Nyangabgwe Referral Hospital Center',
    district: 'Francistown',
    address: 'Gerald Estate Road, Francistown',
    phone: '+267 241 1000',
    hours: 'Mon - Fri: 08:00 - 16:30',
    urgentNeeds: ['O-', 'A-', 'AB-'],
    lat: -21.1685,
    lng: 27.5118
  },
  {
    id: 'CTR-MOL-001',
    name: 'Sekgoma Memorial Hospital Depository',
    district: 'Molepolole',
    address: 'Kweneng Main Hospital Corridor',
    phone: '+267 592 0333',
    hours: 'Mon - Thu: 08:00 - 16:00',
    urgentNeeds: ['O-', 'A+'],
    lat: -24.4072,
    lng: 25.5042
  },
  {
    id: 'CTR-MAU-001',
    name: 'Maun General Transfusion Center',
    district: 'Ngamiland / Maun',
    address: 'Hospital Road, Central Maun',
    phone: '+267 686 0456',
    hours: 'Mon - Fri: 08:30 - 15:30',
    urgentNeeds: ['O-', 'B+'],
    lat: -19.9833,
    lng: 23.4167
  },
  {
    id: 'CTR-GAB-MOB',
    name: 'Gaborone Main Mall Sovereign Mobile Drive',
    district: 'Gaborone Central',
    address: 'Civic Centre Concourse, Main Mall',
    phone: '+267 71 894 102',
    hours: 'Tue, Thu, Sat: 09:00 - 16:00',
    urgentNeeds: ['O-', 'O+', 'A+'],
    lat: -24.6578,
    lng: 25.9189
  }
];

interface ScytherContextType {
  currentUser: FirebaseUser | null;
  donor: DonorProfile;
  donorsList: DonorProfile[];
  donorUnits: BloodUnit[];
  activeShortageAlerts: SystemIssue[];
  centers: DonationCenter[];
  isAuthenticated: boolean;
  isAuthLoading: boolean;

  // Authentication
  loginDonor: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  registerDonor: (data: {
    fullName: string;
    email: string;
    password?: string;
    nationalIdNumber: string;
    phone: string;
    bloodType: BloodType;
    cityDistrict: string;
  }) => Promise<{ success: boolean; error?: string }>;
  quickDemoLogin: (donorId: string) => void;
  logoutDonor: () => Promise<void>;

  // Actions
  uploadDocument: (docData: {
    name: string;
    type: DonorDocument['type'];
    fileBlob?: Blob;
    sizeKb: number;
  }) => Promise<{ success: boolean; error?: string }>;
  bookAppointment: (centerId: string, slotDate: string, slotTime: string) => Promise<boolean>;
  recordDonationIntake: (bloodType: BloodType, volumeMl: number) => Promise<string>;
  bookedAppointment: { centerName: string; date: string; time: string } | null;
}

const ScytherContext = createContext<ScytherContextType | null>(null);

export const ScytherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [donor, setDonor] = useState<DonorProfile>(() => {
    const saved = localStorage.getItem('scyther_active_donor');
    return saved ? JSON.parse(saved) : INITIAL_DONOR;
  });
  const [donorsList, setDonorsList] = useState<DonorProfile[]>(INITIAL_DONORS);
  const [allUnits, setAllUnits] = useState<BloodUnit[]>([]);
  const [activeShortageAlerts, setActiveShortageAlerts] = useState<SystemIssue[]>([]);
  const [bookedAppointment, setBookedAppointment] = useState<{ centerName: string; date: string; time: string } | null>(() => {
    const saved = localStorage.getItem('scyther_booked_slot');
    return saved ? JSON.parse(saved) : null;
  });

  // 1. Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore sync for all Donors List
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'donorProfiles'), snapshot => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => d.data() as DonorProfile);
        setDonorsList(list);
      }
    }, err => console.warn('Scyther donorProfiles sync:', err.message));
    return () => unsub();
  }, []);

  // 3. Real-time Firestore sync for logged-in Donor profile
  useEffect(() => {
    if (!donor.id) return;
    const unsub = onSnapshot(doc(db, 'donorProfiles', donor.id), snapshot => {
      if (snapshot.exists()) {
        const updated = snapshot.data() as DonorProfile;
        setDonor(updated);
        localStorage.setItem('scyther_active_donor', JSON.stringify(updated));
      }
    }, err => console.warn('Scyther donor profile sync:', err.message));
    return () => unsub();
  }, [donor.id]);

  // 4. Real-time Firestore sync for Blood Units
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'bloodUnits'), snapshot => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => d.data() as BloodUnit);
        setAllUnits(list);
      }
    }, err => console.warn('Scyther bloodUnits sync:', err.message));
    return () => unsub();
  }, []);

  // 5. Real-time Shortage Alerts from System Issues
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'systemIssues'), snapshot => {
      if (!snapshot.empty) {
        const issues = snapshot.docs.map(d => d.data() as SystemIssue);
        const shortages = issues.filter(i => 
          i.category === 'SUPPLY_DEFICIT' && i.status === 'OPEN'
        );
        setActiveShortageAlerts(shortages);
      }
    }, err => console.warn('Scyther shortages sync:', err.message));
    return () => unsub();
  }, []);

  // Filter blood units belonging to this donor
  const donorUnits = allUnits.filter(u => 
    donor.linkedUnitDins?.includes(u.din) || u.donorAnonymizedId === donor.anonymizedHash
  );

  // Authentication Methods
  const loginDonor = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const found = donorsList.find(d => d.email.toLowerCase() === cleanEmail);
    if (!found) {
      return { success: false, error: 'No donor profile found with this email address. Please register.' };
    }

    if (password) {
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } catch (authErr: any) {
        // Auto-provision in Firebase Auth if first time with matching demo account
        if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, cleanEmail, password);
          } catch {
            await signInAnonymously(auth);
          }
        } else {
          return { success: false, error: 'Invalid password. Please check your credentials.' };
        }
      }
    } else {
      try {
        await signInAnonymously(auth);
      } catch {
        // Non-blocking
      }
    }

    setDonor(found);
    localStorage.setItem('scyther_active_donor', JSON.stringify(found));
    return { success: true };
  };

  const registerDonor = async (data: {
    fullName: string;
    email: string;
    password?: string;
    nationalIdNumber: string;
    phone: string;
    bloodType: BloodType;
    cityDistrict: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const existing = donorsList.find(d => d.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'A donor with this email address is already registered.' };
    }

    let uid = '';
    if (data.password) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
        uid = cred.user.uid;
      } catch (err: any) {
        return { success: false, error: err.message || 'Registration failed.' };
      }
    } else {
      try {
        const anon = await signInAnonymously(auth);
        uid = anon.user.uid;
      } catch {
        // Non-blocking
      }
    }

    const newId = `DONOR-BW-${Math.floor(10000 + Math.random() * 90000)}`;
    const randomHash = await sha256(`donor-${newId}-${Date.now()}`);
    const newDonor: DonorProfile = {
      id: newId,
      anonymizedHash: randomHash,
      fullName: data.fullName.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      nationalIdNumber: data.nationalIdNumber.trim().toUpperCase(),
      cityDistrict: data.cityDistrict,
      bloodType: data.bloodType,
      totalDonations: 0,
      lastDonationDate: '',
      eligibilityStatus: 'ELIGIBLE',
      nextEligibleDate: new Date().toISOString().split('T')[0],
      linkedUnitDins: [],
      tier: 1,
      uploadedDocuments: [],
      tierUpdatedAt: new Date().toISOString()
    };

    setDonor(newDonor);
    setDonorsList(prev => [newDonor, ...prev]);
    localStorage.setItem('scyther_active_donor', JSON.stringify(newDonor));

    // Save to Firestore
    try {
      await setDoc(doc(db, 'donorProfiles', newId), newDonor, { merge: true });
      if (uid) {
        await setDoc(doc(db, 'users', uid), {
          uid,
          email: cleanEmail,
          displayName: data.fullName,
          role: 'DONOR',
          donorId: newId,
          lastSeen: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err: any) {
      console.warn('Firestore donor profile registration save:', err.message);
    }

    return { success: true };
  };

  const quickDemoLogin = (donorId: string) => {
    const found = donorsList.find(d => d.id === donorId) || INITIAL_DONORS.find(d => d.id === donorId);
    if (found) {
      setDonor(found);
      localStorage.setItem('scyther_active_donor', JSON.stringify(found));
    }
  };

  const logoutDonor = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // Non-blocking
    }
    localStorage.removeItem('scyther_active_donor');
    setDonor(INITIAL_DONOR);
  };

  // Upload Document with Real Cloud Storage
  const uploadDocument = async (docData: {
    name: string;
    type: DonorDocument['type'];
    fileBlob?: Blob;
    sizeKb: number;
  }): Promise<{ success: boolean; error?: string }> => {
    let downloadUrl: string | undefined = undefined;

    if (docData.fileBlob) {
      try {
        const storagePath = `donors/${donor.id}/${Date.now()}-${docData.name}`;
        const res = await uploadFileToStorage(storagePath, docData.fileBlob);
        downloadUrl = res.downloadUrl;
      } catch (err: any) {
        console.warn('Cloud Storage upload notice:', err.message);
      }
    }

    const newDoc: DonorDocument = {
      id: `DOC-${Date.now().toString(36)}`,
      name: docData.name,
      type: docData.type,
      sizeKb: docData.sizeKb,
      uploadedAt: new Date().toISOString(),
      fileDataUrl: downloadUrl,
      status: 'PENDING',
      reviewNotes: 'Uploaded by citizen. Pending National Blood Registry review.'
    };

    const nextDocs = [...donor.uploadedDocuments, newDoc];
    const nextTier = (donor.tier === 1 ? 2 : donor.tier) as DonorVerificationTier;

    const updatedDonor: DonorProfile = {
      ...donor,
      tier: nextTier,
      uploadedDocuments: nextDocs,
      tierUpdatedAt: new Date().toISOString()
    };

    setDonor(updatedDonor);
    localStorage.setItem('scyther_active_donor', JSON.stringify(updatedDonor));

    try {
      await setDoc(doc(db, 'donorProfiles', donor.id), updatedDonor, { merge: true });
      // Create operational ticket in /systemIssues
      const issueId = `ISSUE-${Date.now().toString(36).toUpperCase()}`;
      await setDoc(doc(db, 'systemIssues', issueId), {
        id: issueId,
        title: `Donor Omang/Health Verification: ${donor.fullName}`,
        category: 'DONOR_APPEAL',
        severity: 'MEDIUM',
        facility: 'National Donor Registry Desk',
        affectedEntity: `Donor ID: ${donor.id}`,
        description: `Uploaded "${docData.name}". Review credentials to upgrade to Level 3.`,
        status: 'OPEN',
        timestamp: new Date().toISOString()
      }, { merge: true });
    } catch (err: any) {
      console.warn('Firestore doc upload update:', err.message);
    }

    return { success: true };
  };

  const bookAppointment = async (centerId: string, slotDate: string, slotTime: string): Promise<boolean> => {
    const center = BOTSWANA_CENTERS.find(c => c.id === centerId);
    if (!center) return false;

    const booking = {
      centerName: center.name,
      date: slotDate,
      time: slotTime
    };

    setBookedAppointment(booking);
    localStorage.setItem('scyther_booked_slot', JSON.stringify(booking));

    try {
      const bookingId = `BK-${Date.now().toString(36).toUpperCase()}`;
      await setDoc(doc(db, 'appointments', bookingId), {
        id: bookingId,
        donorId: donor.id,
        donorName: donor.fullName,
        bloodType: donor.bloodType,
        centerId,
        centerName: center.name,
        slotDate,
        slotTime,
        status: 'CONFIRMED',
        bookedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err: any) {
      console.warn('Appointment booking Firestore save:', err.message);
    }

    return true;
  };

  const recordDonationIntake = async (bloodType: BloodType, volumeMl: number): Promise<string> => {
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
      currentFacility: 'Princess Marina Hospital Blood Bank - Phlebotomy Bay 1',
      status: 'COLLECTED',
      labTests: {
        hiv: 'PENDING',
        hbv: 'PENDING',
        hcv: 'PENDING',
        syphilis: 'PENDING',
        westNile: 'PENDING',
        aboRhConfirmatory: 'PENDING',
        hemoglobinG_dL: 14.8
      },
      storageTempRange: { min: 1, max: 6 },
      telemetryLogs: [
        {
          timestamp: nowIso,
          temperatureCelsius: 4.1,
          locationName: 'Gaborone Collection Refrigerator A',
          lat: -24.6541,
          lng: 25.9087,
          batteryPct: 100,
          breachDetected: false
        }
      ]
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, 'bloodUnits', newDinNumber), newUnit, { merge: true });
    } catch (err: any) {
      console.warn('Firestore blood unit intake save:', err.message);
    }

    // Call Fabric API gateway
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
    }).catch(err => console.warn('Fabric API record dispatch:', err.message));

    const nextCount = donor.totalDonations + 1;
    const nextTier = (donor.tier === 3 && nextCount >= 2 ? 4 : donor.tier) as DonorVerificationTier;

    const updatedDonor: DonorProfile = {
      ...donor,
      totalDonations: nextCount,
      tier: nextTier,
      lastDonationDate: nowIso.split('T')[0],
      linkedUnitDins: [newDinNumber, ...donor.linkedUnitDins]
    };

    setDonor(updatedDonor);
    localStorage.setItem('scyther_active_donor', JSON.stringify(updatedDonor));

    try {
      await setDoc(doc(db, 'donorProfiles', donor.id), updatedDonor, { merge: true });
    } catch (err: any) {
      console.warn('Firestore donor stats update:', err.message);
    }

    return newDinNumber;
  };

  return (
    <ScytherContext.Provider
      value={{
        currentUser,
        donor,
        donorsList,
        donorUnits,
        activeShortageAlerts,
        centers: BOTSWANA_CENTERS,
        isAuthenticated: !!donor.id,
        isAuthLoading,
        loginDonor,
        registerDonor,
        quickDemoLogin,
        logoutDonor,
        uploadDocument,
        bookAppointment,
        recordDonationIntake,
        bookedAppointment
      }}
    >
      {children}
    </ScytherContext.Provider>
  );
};

export const useScyther = () => {
  const context = useContext(ScytherContext);
  if (!context) {
    throw new Error('useScyther must be used within a ScytherProvider');
  }
  return context;
};
