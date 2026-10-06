export type BloodchainAppId = 'scyther' | 'rubric' | 'aegis' | 'crucible' | 'torrent' | 'gateway';

export type EventType =
  | 'DONATION_INTAKE'
  | 'SEROLOGY_COMPLETED'
  | 'QC_RELEASE'
  | 'REQUISITION_CREATED'
  | 'REQUISITION_DISPATCHED'
  | 'TELEMETRY_PING'
  | 'THERMAL_EXCURSION'
  | 'CUSTODY_HANDOVER'
  | 'BEDSIDE_VERIFIED'
  | 'TRANSFUSION_COMPLETED'
  | 'ABO_MISMATCH_LOCKOUT'
  | 'DEFICIT_APPEAL'
  | 'DOCUMENT_REVIEWED'
  | 'HEARTBEAT';

export interface InterAppEvent<T = any> {
  id: string;
  type: EventType;
  sourceApp: BloodchainAppId;
  targetApp?: BloodchainAppId | 'ALL';
  timestamp: string;
  payload: T;
}

export interface TelemetryPingPayload {
  din: string;
  courierId?: string;
  vanId?: string;
  tempC: number;
  humidity?: number;
  ambientTempC?: number;
  batteryPct?: number;
  gps?: { lat: number; lng: number };
  locationName?: string;
  speedKmh?: number;
  status?: 'IN_TRANSIT' | 'EXCURSION_ALARM' | 'DELIVERED';
  timestamp?: string;
}

export interface ClinicalOrderPayload {
  orderId?: string;
  hospitalName: string;
  wardRoom: string;
  patientIdentifier: string;
  bloodType: string;
  component: string;
  unitsRequested: number;
  urgency: 'stat_trauma' | 'urgent' | 'routine';
  indication?: string;
  ledgerRef?: string;
}

export interface TransfusionRecordPayload {
  unitBarcode: string;
  patientIdentifier: string;
  donorBloodType: string;
  patientBloodType?: string;
  startedAt?: string;
  completedAt?: string;
  hasReaction?: boolean;
  reactionDetails?: any;
  clinicianId?: string;
}

export interface DeficitAppealPayload {
  bloodType: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  message: string;
  targetCentres: string[];
  expiresAt: string;
}
