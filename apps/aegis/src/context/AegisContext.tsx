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
  HospitalRequest,
  StaffAccount,
  SystemIssue,
  BlockchainBlock
} from '@shared/types/bloodchain';
import {
  INITIAL_UNITS,
  INITIAL_STAFF_ACCOUNTS,
  INITIAL_HOSPITAL_REQUESTS,
  INITIAL_SYSTEM_ISSUES,
  INITIAL_BLOCKS
} from '@shared/data/seedData';
import { isRbcCompatible } from '@shared/lib/bloodCompatibility';
import { sha256, calculateBlockHash } from '@shared/lib/crypto';

interface AegisContextType {
  currentUser: FirebaseUser | null;
  currentClinician: StaffAccount | null;
  isAuthenticated: boolean;
  units: BloodUnit[];
  requests: HospitalRequest[];
  issuesList: SystemIssue[];
  blockchain: BlockchainBlock[];

  // Clinician Authentication
  loginClinician: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  quickDemoClinicianLogin: (role?: 'DOCTOR' | 'NURSE') => void;
  logoutClinician: () => Promise<void>;

  // Clinical Operations
  verifyBedsideCrossmatch: (
    unitDIN: string,
    patientId: string,
    patientBloodType: BloodType,
    nurse1: string,
    nurse2: string
  ) => Promise<{ success: boolean; error?: string }>;

  completeTransfusion: (
    unitDIN: string,
    clinicianName: string,
    vitalsSummary: string
  ) => Promise<void>;

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
  ) => Promise<HospitalRequest>;
}

const AegisContext = createContext<AegisContextType | null>(null);

export const AegisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Default to trauma attending Dr. Marcus Vance or Nurse Specialist J. Doe
  const defaultClinician = INITIAL_STAFF_ACCOUNTS.find(s => s.role === 'CLINICAL_STAFF') || INITIAL_STAFF_ACCOUNTS[0];
  const [currentClinician, setCurrentClinician] = useState<StaffAccount | null>(() => {
    const saved = localStorage.getItem('aegis_active_clinician');
    return saved ? JSON.parse(saved) : defaultClinician;
  });

  const [units, setUnits] = useState<BloodUnit[]>(INITIAL_UNITS);
  const [requests, setRequests] = useState<HospitalRequest[]>(INITIAL_HOSPITAL_REQUESTS);
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
    }, err => console.warn('Aegis units sync:', err.message));

    const unsubReqs = onSnapshot(collection(db, 'hospitalRequests'), snap => {
      if (!snap.empty) {
        setRequests(snap.docs.map(d => d.data() as HospitalRequest));
      }
    }, err => console.warn('Aegis requests sync:', err.message));

    const unsubIssues = onSnapshot(collection(db, 'systemIssues'), snap => {
      if (!snap.empty) {
        setIssuesList(snap.docs.map(d => d.data() as SystemIssue));
      }
    }, err => console.warn('Aegis issues sync:', err.message));

    const qBlocks = query(collection(db, 'blockchainBlocks'), orderBy('index', 'asc'));
    const unsubBlocks = onSnapshot(qBlocks, snap => {
      if (!snap.empty) {
        setBlockchain(snap.docs.map(d => d.data() as BlockchainBlock));
      }
    }, err => console.warn('Aegis blocks sync:', err.message));

    return () => {
      unsubUnits();
      unsubReqs();
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

  const persistRequest = async (r: HospitalRequest) => {
    try {
      await setDoc(doc(db, 'hospitalRequests', r.id), r, { merge: true });
    } catch (err: any) {
      console.warn('Firestore persistRequest sync:', err.message);
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

    // Persist to Firestore
    try {
      await setDoc(doc(db, 'blockchainBlocks', `block-${newBlock.index}`), newBlock);
    } catch (err: any) {
      console.warn('Firestore block persistence:', err.message);
    }

    // Proxy to Hyperledger Fabric gateway
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
    } catch (err) {
      // Graceful fallback if external Fabric node is offline
    }

    return newBlock;
  };

  // ─── Authentication Handlers ──────────────────────────────────────────────

  const loginClinician = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      let user: FirebaseUser | null = null;
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, pass);
        user = userCred.user;
      } catch (authErr: any) {
        if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
          // Auto-provision clinician account in Firebase Auth
          const newCred = await createUserWithEmailAndPassword(auth, email, pass);
          user = newCred.user;
        } else {
          throw authErr;
        }
      }

      setCurrentUser(user);

      // Check if matches known staff account
      const matchedStaff = INITIAL_STAFF_ACCOUNTS.find(s => s.email.toLowerCase() === email.toLowerCase()) || {
        id: `STF-${Date.now().toString(36).toUpperCase()}`,
        fullName: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        email,
        role: 'CLINICAL_STAFF',
        facility: 'Princess Marina Hospital (Gaborone)',
        badgeNumber: 'BW-CLIN-9021',
        status: 'ACTIVE',
        mustChangePassword: false,
        createdAt: new Date().toISOString()
      };

      setCurrentClinician(matchedStaff as StaffAccount);
      localStorage.setItem('aegis_active_clinician', JSON.stringify(matchedStaff));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Clinician authentication failed' };
    }
  };

  const quickDemoClinicianLogin = (role: 'DOCTOR' | 'NURSE' = 'DOCTOR') => {
    const demoAccount: StaffAccount = role === 'DOCTOR'
      ? {
          id: 'STF-DOC-001',
          fullName: 'Dr. Marcus Vance (Trauma Attending)',
          email: 'marcus.vance@health.gov.bw',
          role: 'CLINICAL_STAFF',
          facility: 'Princess Marina Hospital Trauma Bay 1',
          badgeNumber: 'BW-MD-4029',
          status: 'ACTIVE',
          mustChangePassword: false,
          passwordHash: 'DEMO_HASH',
          provisionedBy: 'Ministry of Health',
          createdAt: new Date().toISOString()
        }
      : {
          id: 'STF-NURSE-002',
          fullName: 'Nurse Specialist J. Doe (RN-402)',
          email: 'j.doe@health.gov.bw',
          role: 'CLINICAL_STAFF',
          facility: 'Princess Marina Hospital Trauma Bay 1',
          badgeNumber: 'BW-RN-8812',
          status: 'ACTIVE',
          mustChangePassword: false,
          passwordHash: 'DEMO_HASH',
          provisionedBy: 'Ministry of Health',
          createdAt: new Date().toISOString()
        };

    setCurrentClinician(demoAccount);
    localStorage.setItem('aegis_active_clinician', JSON.stringify(demoAccount));
  };

  const logoutClinician = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {}
    setCurrentClinician(null);
    setCurrentUser(null);
    localStorage.removeItem('aegis_active_clinician');
  };

  // ─── Bedside Dual-Verification Scanner ────────────────────────────────────

  const verifyBedsideCrossmatch = async (
    unitDIN: string,
    patientId: string,
    patientBloodType: BloodType,
    nurse1: string,
    nurse2: string
  ): Promise<{ success: boolean; error?: string }> => {
    const unit = units.find(u => u.din === unitDIN);
    if (!unit) {
      return { success: false, error: `Blood unit ${unitDIN} not found in national registry.` };
    }

    if (unit.status !== 'DELIVERED_TO_HOSPITAL' && unit.status !== 'RELEASED' && unit.status !== 'BEDSIDE_CROSSMATCHED') {
      return {
        success: false,
        error: `Unit status is "${unit.status}". Only units delivered to hospital or released can undergo bedside crossmatch.`
      };
    }

    // Run RBC biological compatibility check
    const isCompatible = isRbcCompatible(unit.bloodType, patientBloodType);
    if (!isCompatible) {
      // Critical biological incompatibility: Log incident alert immediately to Rubric
      const incidentId = `INC-${Date.now().toString(36).toUpperCase()}`;
      const criticalMismatchIssue: SystemIssue = {
        id: incidentId,
        title: `CRITICAL BEDSIDE MISMATCH: Donor ${unit.bloodType} -> Patient ${patientBloodType}`,
        category: 'BEDSIDE_MISMATCH',
        severity: 'CRITICAL',
        status: 'OPEN',
        facility: currentClinician?.facility || 'Princess Marina Hospital (Trauma Bay)',
        affectedEntity: `Unit DIN: ${unitDIN} | Patient: ${patientId}`,
        description: `Bedside barcode scanner prevented lethal ABO incompatibility infusion. Unit ${unit.bloodType} scanned for recipient ${patientBloodType}. Witnessed by ${nurse1} & ${nurse2}.`,
        timestamp: new Date().toISOString()
      };

      await persistIssue(criticalMismatchIssue);

      return {
        success: false,
        error: `FATAL ABO COMPATIBILITY ERROR: Donor unit ${unit.bloodType} cannot be transfused into patient ${patientBloodType}! Infusion locked out. Incident dispatched to National Overwatch.`
      };
    }

    const patientHash = await sha256(`PATIENT-${patientId}`);
    const dualSig = await sha256(`CROSSMATCH-${nurse1}-${nurse2}-${unitDIN}-${patientId}`);

    const updatedUnit: BloodUnit = {
      ...unit,
      status: 'BEDSIDE_CROSSMATCHED',
      patientHash: `PT-${patientHash.slice(0, 10).toUpperCase()}`,
      patientAssignedBloodType: patientBloodType
    };

    setUnits(prev => prev.map(u => u.din === unitDIN ? updatedUnit : u));
    await persistUnit(updatedUnit);

    await appendBlock(
      unitDIN,
      'BEDSIDE_DUAL_VERIFIED',
      {
        id: `${nurse1} & ${nurse2}`,
        role: 'CLINICAL_STAFF',
        facility: currentClinician?.facility || unit.currentFacility,
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

  // ─── Transfusion Administration & Completion ─────────────────────────────

  const completeTransfusion = async (
    unitDIN: string,
    clinicianName: string,
    vitalsSummary: string
  ): Promise<void> => {
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
        facility: currentClinician?.facility || 'Hospital Clinical Ward',
        signature: `0x${sig.slice(0, 48)}`
      },
      {
        postTransfusionVitals: vitalsSummary,
        transfusionEndedAt: nowIso,
        finalCustodyStatus: 'TRANSFUSION_COMPLETED_CLOSED_CYCLE'
      }
    );

    // Call Express clinical route
    try {
      await fetch('/api/clinical/transfusions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitBarcode: unitDIN,
          patientIdentifier: unit.patientHash || 'PT-ANON',
          donorBloodType: unit.bloodType,
          completedAt: nowIso,
          hasReaction: false,
          clinicianId: clinicianName
        })
      });
    } catch (e) {}
  };

  // ─── Hemovigilance & Adverse Reaction Reporting ──────────────────────────

  const reportAdverseReaction = async (
    unitDIN: string,
    type: 'TRALI' | 'TACO' | 'FEBRILE' | 'ACUTE_HEMOLYTIC',
    severity: 'MILD' | 'SEVERE' | 'LIFE_THREATENING',
    notes: string,
    clinicianName: string
  ): Promise<void> => {
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
        facility: currentClinician?.facility || 'Hospital Critical Care Unit',
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

    // Notify Rubric Incident Command via Firestore
    const incidentId = `INC-HEMO-${Date.now().toString(36).toUpperCase()}`;
    const newIssue: SystemIssue = {
      id: incidentId,
      title: `Hemovigilance Alert: ${type} Reaction Reported`,
      category: 'BEDSIDE_MISMATCH',
      severity: severity === 'LIFE_THREATENING' ? 'CRITICAL' : 'HIGH',
      status: 'OPEN',
      facility: currentClinician?.facility || 'Princess Marina Hospital',
      affectedEntity: `Unit DIN: ${unitDIN}`,
      description: `Reported by ${clinicianName}. Severity: ${severity}. Clinical Notes: ${notes}. Linked donor components flagged for emergency quarantine.`,
      timestamp: nowIso
    };

    await persistIssue(newIssue);

    // Call Express clinical route with reaction details
    try {
      await fetch('/api/clinical/transfusions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitBarcode: unitDIN,
          patientIdentifier: unit.patientHash || 'PT-ANON',
          donorBloodType: unit.bloodType,
          completedAt: nowIso,
          hasReaction: true,
          reactionDetails: { type, severity, notes },
          clinicianId: clinicianName
        })
      });
    } catch (e) {}
  };

  // ─── Emergency Hospital Blood Requisition ────────────────────────────────

  const createHospitalRequest = async (
    hospitalName: string,
    department: string,
    urgency: 'EMERGENCY_CODE_CRIMSON' | 'URGENT' | 'ROUTINE',
    bloodType: BloodType,
    componentType: ComponentType,
    unitsNeeded: number
  ): Promise<HospitalRequest> => {
    const newReq: HospitalRequest = {
      id: `REQ-${Date.now().toString(36).toUpperCase()}`,
      hospitalName,
      department,
      urgency,
      bloodType,
      componentType,
      unitsNeeded,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      fulfilledUnitDins: []
    };

    setRequests(prev => [newReq, ...prev]);
    await persistRequest(newReq);

    // Call Express clinical route
    try {
      await fetch('/api/clinical/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: newReq.id,
          hospital: hospitalName,
          department,
          urgency,
          bloodType,
          componentType,
          quantity: unitsNeeded
        })
      });
    } catch (e) {}

    return newReq;
  };

  return (
    <AegisContext.Provider
      value={{
        currentUser,
        currentClinician,
        isAuthenticated: !!currentClinician,
        units,
        requests,
        issuesList,
        blockchain,
        loginClinician,
        quickDemoClinicianLogin,
        logoutClinician,
        verifyBedsideCrossmatch,
        completeTransfusion,
        reportAdverseReaction,
        createHospitalRequest
      }}
    >
      {children}
    </AegisContext.Provider>
  );
};

export const useAegis = () => {
  const context = useContext(AegisContext);
  if (!context) {
    throw new Error('useAegis must be used within an AegisProvider');
  }
  return context;
};
