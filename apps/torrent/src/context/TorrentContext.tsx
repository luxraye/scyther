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

interface OfflineTelemetryPing {
  din: string;
  temp: number;
  location: string;
  timestamp: string;
}

interface TorrentContextType {
  currentUser: FirebaseUser | null;
  currentCourier: StaffAccount | null;
  isAuthenticated: boolean;
  units: BloodUnit[];
  issuesList: SystemIssue[];
  blockchain: BlockchainBlock[];

  // Offline Mesh Buffer
  isOffline: boolean;
  offlineQueue: OfflineTelemetryPing[];
  setIsOffline: (offline: boolean) => void;
  syncOfflineQueue: () => Promise<void>;

  // Courier Authentication
  loginCourier: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  quickDemoCourierLogin: () => void;
  logoutCourier: () => Promise<void>;

  // Cold-Chain Logistics Operations
  dispatchUnitToTransit: (
    unitDIN: string,
    courierName: string,
    destinationHospital: string,
    initialTemp: number
  ) => Promise<void>;

  logTelemetryReading: (
    unitDIN: string,
    temperatureCelsius: number,
    locationName: string
  ) => Promise<{ breachDetected: boolean }>;

  confirmHospitalReceipt: (
    unitDIN: string,
    receivingFacility: string,
    receivingStaff: string
  ) => Promise<void>;
}

const TorrentContext = createContext<TorrentContextType | null>(null);

export const TorrentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Default to SwiftMed Courier #14 / Kago Sechele
  const defaultCourier = INITIAL_STAFF_ACCOUNTS.find(s => s.role === 'LOGISTICS_COURIER') || {
    id: 'STF-COURIER-014',
    fullName: 'SwiftMed Courier #14 (ColdVan-Beta)',
    email: 'kago.sechele@logistics.health.gov.bw',
    role: 'LOGISTICS_COURIER' as const,
    facility: 'Botswana Central Transit Hub (Gaborone)',
    badgeNumber: 'BW-LOG-014',
    status: 'ACTIVE' as const,
    mustChangePassword: false,
    createdAt: new Date().toISOString()
  };

  const [currentCourier, setCurrentCourier] = useState<StaffAccount | null>(() => {
    const saved = localStorage.getItem('torrent_active_courier');
    return saved ? JSON.parse(saved) : defaultCourier;
  });

  const [units, setUnits] = useState<BloodUnit[]>(INITIAL_UNITS);
  const [issuesList, setIssuesList] = useState<SystemIssue[]>(INITIAL_SYSTEM_ISSUES);
  const [blockchain, setBlockchain] = useState<BlockchainBlock[]>(INITIAL_BLOCKS);

  // Offline buffer state
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineTelemetryPing[]>([]);

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
    }, err => console.warn('Torrent units sync:', err.message));

    const unsubIssues = onSnapshot(collection(db, 'systemIssues'), snap => {
      if (!snap.empty) {
        setIssuesList(snap.docs.map(d => d.data() as SystemIssue));
      }
    }, err => console.warn('Torrent issues sync:', err.message));

    const qBlocks = query(collection(db, 'blockchainBlocks'), orderBy('index', 'asc'));
    const unsubBlocks = onSnapshot(qBlocks, snap => {
      if (!snap.empty) {
        setBlockchain(snap.docs.map(d => d.data() as BlockchainBlock));
      }
    }, err => console.warn('Torrent blocks sync:', err.message));

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

  const loginCourier = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
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
        id: `STF-LOG-${Date.now().toString(36).toUpperCase()}`,
        fullName: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        email,
        role: 'LOGISTICS_COURIER' as const,
        facility: 'Botswana Central Transit Hub (Gaborone)',
        badgeNumber: 'BW-LOG-4091',
        status: 'ACTIVE' as const,
        mustChangePassword: false,
        createdAt: new Date().toISOString()
      };

      setCurrentCourier(matchedStaff as StaffAccount);
      localStorage.setItem('torrent_active_courier', JSON.stringify(matchedStaff));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Courier authentication failed' };
    }
  };

  const quickDemoCourierLogin = () => {
    setCurrentCourier(defaultCourier as StaffAccount);
    localStorage.setItem('torrent_active_courier', JSON.stringify(defaultCourier));
  };

  const logoutCourier = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {}
    setCurrentCourier(null);
    setCurrentUser(null);
    localStorage.removeItem('torrent_active_courier');
  };

  // ─── Offline Mesh Buffer Synchronization ──────────────────────────────────

  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0) {
      setIsOffline(false);
      return;
    }

    for (const item of offlineQueue) {
      await logTelemetryReading(item.din, item.temp, item.location);
    }

    setOfflineQueue([]);
    setIsOffline(false);
  };

  // ─── Cold-Chain Operations ────────────────────────────────────────────────

  const dispatchUnitToTransit = async (
    unitDIN: string,
    courierName: string,
    destinationHospital: string,
    initialTemp: number
  ): Promise<void> => {
    const unit = units.find(u => u.din === unitDIN);
    if (!unit) return;

    const nowIso = new Date().toISOString();
    const updatedUnit: BloodUnit = {
      ...unit,
      status: 'IN_TRANSIT',
      destinationHospital,
      telemetryLogs: [
        ...unit.telemetryLogs,
        {
          timestamp: nowIso,
          temperatureCelsius: initialTemp,
          locationName: `${unit.currentFacility} Loading Bay (Departure)`,
          breachDetected: false
        }
      ]
    };

    setUnits(prev => prev.map(u => u.din === unitDIN ? updatedUnit : u));
    await persistUnit(updatedUnit);

    const sig = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
    await appendBlock(
      unitDIN,
      'TRANSIT_DISPATCHED',
      {
        id: courierName,
        role: 'LOGISTICS_COURIER',
        facility: unit.currentFacility,
        signature: sig
      },
      {
        courier: courierName,
        destinationHospital,
        initialTempCelsius: initialTemp,
        sensitechSensorBound: `SENSITECH-BW-${Math.floor(100 + Math.random() * 900)}`,
        dispatchedAt: nowIso
      }
    );
  };

  const logTelemetryReading = async (
    unitDIN: string,
    temperatureCelsius: number,
    locationName: string
  ): Promise<{ breachDetected: boolean }> => {
    const unit = units.find(u => u.din === unitDIN);
    if (!unit) return { breachDetected: false };

    const nowIso = new Date().toISOString();
    const isBreach = temperatureCelsius < unit.storageTempRange.min || temperatureCelsius > unit.storageTempRange.max;

    if (isOffline) {
      setOfflineQueue(prev => [...prev, { din: unitDIN, temp: temperatureCelsius, location: locationName, timestamp: nowIso }]);
      return { breachDetected: isBreach };
    }

    const updatedUnit: BloodUnit = {
      ...unit,
      telemetryLogs: [
        ...unit.telemetryLogs,
        {
          timestamp: nowIso,
          temperatureCelsius,
          locationName,
          breachDetected: isBreach
        }
      ]
    };

    setUnits(prev => prev.map(u => u.din === unitDIN ? updatedUnit : u));
    await persistUnit(updatedUnit);

    if (isBreach) {
      const sig = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
      await appendBlock(
        unitDIN,
        'COLD_CHAIN_BREACH_DETECTED',
        {
          id: currentCourier ? currentCourier.fullName : 'SwiftMed Fleet Sensor',
          role: 'LOGISTICS_COURIER',
          facility: unit.destinationHospital || 'Transit Corridor',
          signature: sig
        },
        {
          recordedTempCelsius: temperatureCelsius,
          allowedMin: unit.storageTempRange.min,
          allowedMax: unit.storageTempRange.max,
          breachLocation: locationName,
          timestamp: nowIso
        }
      );

      // Instantly dispatch to Rubric Situation Room via Firestore!
      const incidentId = `INC-TEMP-${Date.now().toString(36).toUpperCase()}`;
      const newIssue: SystemIssue = {
        id: incidentId,
        title: `COLD-CHAIN EXCURSION: ${temperatureCelsius}°C on DIN ${unitDIN}`,
        category: 'COLD_CHAIN_ALERT',
        severity: 'CRITICAL',
        status: 'OPEN',
        facility: `${unit.destinationHospital || 'Express Corridor'} (En Route)`,
        affectedEntity: `Unit DIN: ${unitDIN}`,
        description: `Sensitech continuous IoT telemetry detected temperature breach: ${temperatureCelsius}°C (Allowed range: ${unit.storageTempRange.min}°C to ${unit.storageTempRange.max}°C). Location: ${locationName}. Hard lockout on hospital infusion.`,
        timestamp: nowIso
      };

      await persistIssue(newIssue);
    }

    return { breachDetected: isBreach };
  };

  const confirmHospitalReceipt = async (
    unitDIN: string,
    receivingFacility: string,
    receivingStaff: string
  ): Promise<void> => {
    const unit = units.find(u => u.din === unitDIN);
    if (!unit) return;

    const nowIso = new Date().toISOString();
    const updatedUnit: BloodUnit = {
      ...unit,
      status: 'DELIVERED_TO_HOSPITAL',
      currentFacility: receivingFacility
    };

    setUnits(prev => prev.map(u => u.din === unitDIN ? updatedUnit : u));
    await persistUnit(updatedUnit);

    const sig = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
    await appendBlock(
      unitDIN,
      'HOSPITAL_CUSTODY_TRANSFERRED',
      {
        id: receivingStaff,
        role: 'CLINICAL_STAFF',
        facility: receivingFacility,
        signature: sig
      },
      {
        receivedBy: receivingStaff,
        receivingFacility,
        physicalSealsIntact: true,
        deliveredAt: nowIso
      }
    );
  };

  return (
    <TorrentContext.Provider
      value={{
        currentUser,
        currentCourier,
        isAuthenticated: !!currentCourier,
        units,
        issuesList,
        blockchain,
        isOffline,
        offlineQueue,
        setIsOffline,
        syncOfflineQueue,
        loginCourier,
        quickDemoCourierLogin,
        logoutCourier,
        dispatchUnitToTransit,
        logTelemetryReading,
        confirmHospitalReceipt
      }}
    >
      {children}
    </TorrentContext.Provider>
  );
};

export const useTorrent = () => {
  const context = useContext(TorrentContext);
  if (!context) {
    throw new Error('useTorrent must be used within a TorrentProvider');
  }
  return context;
};
