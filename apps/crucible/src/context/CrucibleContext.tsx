import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  doc,
  setDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  type FirebaseUser
} from '@shared/lib/firebase';
import {
  BloodUnit,
  BloodType,
  ComponentType,
  StaffAccount,
  SystemIssue,
  BlockchainBlock
} from '@shared/types/bloodchain';
import {
  INITIAL_UNITS,
  INITIAL_STAFF_ACCOUNTS,
  INITIAL_SYSTEM_ISSUES,
  INITIAL_BLOCKS
} from '@shared/data/seedData';
import { calculateBlockHash } from '@shared/lib/crypto';

interface CrucibleContextType {
  currentUser: FirebaseUser | null;
  currentScientist: StaffAccount | null;
  isAuthenticated: boolean;
  units: BloodUnit[];
  issuesList: SystemIssue[];
  blockchain: BlockchainBlock[];

  // Scientist Authentication
  loginScientist: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  quickDemoScientistLogin: () => void;
  logoutScientist: () => Promise<void>;

  // Lab Testing & QC Operations
  recordLabTests: (unitDIN: string, testUpdates: Partial<BloodUnit['labTests']>) => Promise<void>;
  fractionateUnit: (unitDIN: string, newComponent: ComponentType, volumeMl: number) => Promise<void>;
  authorizeLabRelease: (unitDIN: string, techName: string) => Promise<{ success: boolean; error?: string }>;
  quarantineUnitInLab: (unitDIN: string, techName: string, reason: string) => Promise<void>;
}

const CrucibleContext = createContext<CrucibleContextType | null>(null);

export const CrucibleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Default to Dr. Sarah Lin (QC Lead)
  const defaultScientist = INITIAL_STAFF_ACCOUNTS.find(s => s.role === 'LAB_TECH') || {
    id: 'STF-LAB-409',
    fullName: 'Dr. Sarah Lin (QC-Lead-409)',
    email: 'sarah.lin@health.gov.bw',
    role: 'LAB_TECH' as const,
    facility: 'Botswana Central Serology Depository (Gaborone)',
    badgeNumber: 'BW-QC-409',
    status: 'ACTIVE' as const,
    mustChangePassword: false,
    createdAt: new Date().toISOString()
  };

  const [currentScientist, setCurrentScientist] = useState<StaffAccount | null>(() => {
    const saved = localStorage.getItem('crucible_active_scientist');
    return saved ? JSON.parse(saved) : defaultScientist;
  });

  const [units, setUnits] = useState<BloodUnit[]>(INITIAL_UNITS);
  const [issuesList, setIssuesList] = useState<SystemIssue[]>(INITIAL_SYSTEM_ISSUES);
  const [blockchain, setBlockchain] = useState<BlockchainBlock[]>(INITIAL_BLOCKS);

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
      if (!snap.empty) {
        setUnits(snap.docs.map(d => d.data() as BloodUnit));
      }
    }, err => console.warn('Crucible units sync:', err.message));

    const unsubIssues = onSnapshot(collection(db, 'systemIssues'), snap => {
      if (!snap.empty) {
        setIssuesList(snap.docs.map(d => d.data() as SystemIssue));
      }
    }, err => console.warn('Crucible issues sync:', err.message));

    const qBlocks = query(collection(db, 'blockchainBlocks'), orderBy('index', 'asc'));
    const unsubBlocks = onSnapshot(qBlocks, snap => {
      if (!snap.empty) {
        setBlockchain(snap.docs.map(d => d.data() as BlockchainBlock));
      }
    }, err => console.warn('Crucible blocks sync:', err.message));

    return () => {
      unsubUnits();
      unsubIssues();
      unsubBlocks();
    };
  }, []);

  // Firestore Persistence Helpers
  const persistUnit = async (u: BloodUnit) => {
    try {
      await setDoc(doc(db, 'bloodUnits', u.din), u, { merge: true });
    } catch (err: any) {
      console.warn('Firestore persistUnit sync:', err.message);
    }
  };

  const persistIssue = async (iss: SystemIssue) => {
    try {
      await setDoc(doc(db, 'systemIssues', iss.id), iss, { merge: true });
    } catch (err: any) {
      console.warn('Firestore persistIssue sync:', err.message);
    }
  };

  const appendBlock = async (
    unitDIN: string,
    eventType: BlockchainBlock['eventType'],
    actor: BlockchainBlock['actor'],
    payload: Record<string, any>
  ): Promise<BlockchainBlock> => {
    const nextIndex = blockchain.length;
    const prevHash = blockchain.length > 0 ? blockchain[blockchain.length - 1].hash : '0x0000000000000000000000000000000000000000000000000000000000000000';
    const timestamp = new Date().toISOString();

    const blockHash = await calculateBlockHash(
      nextIndex,
      timestamp,
      unitDIN,
      eventType,
      actor,
      payload,
      prevHash
    );

    const newBlock: BlockchainBlock = {
      index: nextIndex,
      timestamp,
      unitDIN,
      eventType,
      actor,
      payload,
      previousHash: prevHash,
      hash: blockHash
    };

    setBlockchain(prev => [...prev, newBlock]);

    try {
      await setDoc(doc(db, 'blockchainBlocks', `block-${newBlock.index}`), newBlock);
    } catch (err: any) {
      console.warn('Firestore block sync:', err.message);
    }

    try {
      await fetch('/donations/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          din: unitDIN,
          bloodType: payload.donorBloodType || 'O-',
          eventType,
          actor: actor.id,
          facility: actor.facility,
          payload
        })
      });
    } catch (err) {}

    return newBlock;
  };

  // ─── Authentication Handlers ──────────────────────────────────────────────

  const loginScientist = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      let user: FirebaseUser | null = null;
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, pass);
        user = userCred.user;
      } catch (authErr: any) {
        if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
          const newCred = await createUserWithEmailAndPassword(auth, email, pass);
          user = newCred.user;
        } else {
          throw authErr;
        }
      }

      setCurrentUser(user);

      const matchedStaff = INITIAL_STAFF_ACCOUNTS.find(s => s.email.toLowerCase() === email.toLowerCase()) || {
        id: `STF-LAB-${Date.now().toString(36).toUpperCase()}`,
        fullName: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        email,
        role: 'LAB_TECH' as const,
        facility: 'Botswana Central Serology Depository (Gaborone)',
        badgeNumber: 'BW-QC-9182',
        status: 'ACTIVE' as const,
        mustChangePassword: false,
        createdAt: new Date().toISOString()
      };

      setCurrentScientist(matchedStaff as StaffAccount);
      localStorage.setItem('crucible_active_scientist', JSON.stringify(matchedStaff));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lab authentication failed' };
    }
  };

  const quickDemoScientistLogin = () => {
    setCurrentScientist(defaultScientist as StaffAccount);
    localStorage.setItem('crucible_active_scientist', JSON.stringify(defaultScientist));
  };

  const logoutScientist = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {}
    setCurrentScientist(null);
    setCurrentUser(null);
    localStorage.removeItem('crucible_active_scientist');
  };

  // ─── Laboratory Testing & QC Operations ───────────────────────────────────

  const recordLabTests = async (unitDIN: string, testUpdates: Partial<BloodUnit['labTests']>) => {
    const unit = units.find(u => u.din === unitDIN);
    if (!unit) return;

    const updatedUnit: BloodUnit = {
      ...unit,
      labTests: {
        ...unit.labTests,
        ...testUpdates
      }
    };

    setUnits(prev => prev.map(u => u.din === unitDIN ? updatedUnit : u));
    await persistUnit(updatedUnit);
  };

  const fractionateUnit = async (unitDIN: string, newComponent: ComponentType, volumeMl: number) => {
    const unit = units.find(u => u.din === unitDIN);
    if (!unit) return;

    const updatedUnit: BloodUnit = {
      ...unit,
      componentType: newComponent,
      volumeMl
    };

    setUnits(prev => prev.map(u => u.din === unitDIN ? updatedUnit : u));
    await persistUnit(updatedUnit);
  };

  const authorizeLabRelease = async (
    unitDIN: string,
    techName: string
  ): Promise<{ success: boolean; error?: string }> => {
    const unit = units.find(u => u.din === unitDIN);
    if (!unit) return { success: false, error: 'Unit not found in registry.' };

    const { hiv, hbv, hcv, syphilis, westNile, aboRhConfirmatory } = unit.labTests;
    const allNegative = hiv === 'NEGATIVE' && hbv === 'NEGATIVE' && hcv === 'NEGATIVE' && syphilis === 'NEGATIVE' && westNile === 'NEGATIVE';

    if (!allNegative) {
      return {
        success: false,
        error: 'RELEASE REJECTED: All 5 mandatory infectious disease panels (HIV, HBV, HCV, Syphilis, West Nile) must be confirmed Non-Reactive (-).'
      };
    }

    if (aboRhConfirmatory === 'PENDING') {
      return {
        success: false,
        error: 'RELEASE REJECTED: Confirmatory ABO/RhD serology typing cannot be PENDING.'
      };
    }

    const nowIso = new Date().toISOString();
    const updatedUnit: BloodUnit = {
      ...unit,
      status: 'RELEASED',
      bloodType: (aboRhConfirmatory as any) !== 'PENDING' ? (aboRhConfirmatory as BloodType) : unit.bloodType
    };

    setUnits(prev => prev.map(u => u.din === unitDIN ? updatedUnit : u));
    await persistUnit(updatedUnit);

    const sig = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
    await appendBlock(
      unitDIN,
      'TESTS_PASSED_AND_RELEASED',
      {
        id: techName,
        role: 'LAB_TECH',
        facility: currentScientist?.facility || unit.currentFacility,
        signature: sig
      },
      {
        donorBloodType: updatedUnit.bloodType,
        hivResult: hiv,
        hbvResult: hbv,
        hcvResult: hcv,
        syphilisResult: syphilis,
        westNileResult: westNile,
        aboRhConfirmed: aboRhConfirmatory,
        authorizedAt: nowIso
      }
    );

    return { success: true };
  };

  const quarantineUnitInLab = async (
    unitDIN: string,
    techName: string,
    reason: string
  ): Promise<void> => {
    const unit = units.find(u => u.din === unitDIN);
    if (!unit) return;

    const nowIso = new Date().toISOString();
    const updatedUnit: BloodUnit = {
      ...unit,
      status: 'QUARANTINED'
    };

    setUnits(prev => prev.map(u => u.din === unitDIN ? updatedUnit : u));
    await persistUnit(updatedUnit);

    const sig = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
    await appendBlock(
      unitDIN,
      'TESTS_FAILED_QUARANTINED',
      {
        id: techName,
        role: 'LAB_TECH',
        facility: currentScientist?.facility || unit.currentFacility,
        signature: sig
      },
      {
        quarantineReason: reason,
        quarantinedAt: nowIso
      }
    );

    // Create incident issue in Firestore that automatically appears in Rubric!
    const incidentId = `INC-LAB-${Date.now().toString(36).toUpperCase()}`;
    const newIssue: SystemIssue = {
      id: incidentId,
      title: `Biohazard Lab Quarantine: Reactive Serology on DIN ${unitDIN}`,
      category: 'LAB_QUARANTINE',
      severity: 'CRITICAL',
      status: 'OPEN',
      facility: currentScientist?.facility || unit.currentFacility,
      affectedEntity: `Unit DIN: ${unitDIN}`,
      description: `Serology screening detected positive/reactive pathogen marker. Unit isolated to biohazard vault. Reason: ${reason}. Certified by ${techName}.`,
      timestamp: nowIso
    };

    await persistIssue(newIssue);
  };

  return (
    <CrucibleContext.Provider
      value={{
        currentUser,
        currentScientist,
        isAuthenticated: !!currentScientist,
        units,
        issuesList,
        blockchain,
        loginScientist,
        quickDemoScientistLogin,
        logoutScientist,
        recordLabTests,
        fractionateUnit,
        authorizeLabRelease,
        quarantineUnitInLab
      }}
    >
      {children}
    </CrucibleContext.Provider>
  );
};

export const useCrucible = () => {
  const context = useContext(CrucibleContext);
  if (!context) {
    throw new Error('useCrucible must be used within a CrucibleProvider');
  }
  return context;
};
