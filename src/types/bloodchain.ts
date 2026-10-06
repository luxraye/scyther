export type BloodType = 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';

export type ComponentType = 
  | 'WHOLE_BLOOD'
  | 'PACKED_RED_CELLS'
  | 'PLATELETS'
  | 'FRESH_FROZEN_PLASMA'
  | 'CRYOPRECIPITATE';

export type UnitStatus = 
  | 'COLLECTED'
  | 'IN_TESTING'
  | 'RELEASED'
  | 'IN_TRANSIT'
  | 'DELIVERED_TO_HOSPITAL'
  | 'BEDSIDE_CROSSMATCHED'
  | 'TRANSFUSED'
  | 'QUARANTINED'
  | 'DISCARDED';

export type UserRole = 
  | 'DONOR'
  | 'LAB_TECH'
  | 'LOGISTICS_COURIER'
  | 'CLINICAL_STAFF'
  | 'NATIONAL_OPERATOR'
  | 'AUDITOR';

export interface BlockchainBlock {
  index: number;
  timestamp: string;
  unitDIN: string; // Donation Identification Number (ISBT-128 format)
  eventType: 
    | 'GENESIS'
    | 'DONATION_ACCEPTED'
    | 'TESTS_PASSED_AND_RELEASED'
    | 'TESTS_FAILED_QUARANTINED'
    | 'QC_LAB_RELEASED'
    | 'LAB_QUARANTINED'
    | 'CUSTODY_DISPATCHED'
    | 'TRANSIT_DISPATCHED'
    | 'COLD_CHAIN_BREACH_DETECTED'
    | 'HOSPITAL_RECEIVED'
    | 'HOSPITAL_CUSTODY_TRANSFERRED'
    | 'BEDSIDE_DUAL_VERIFIED'
    | 'TRANSFUSION_COMPLETED'
    | 'ADVERSE_REACTION_FLAGGED';
  actor: {
    id: string;
    role: UserRole;
    facility: string;
    signature: string;
  };
  payload: Record<string, any>;
  previousHash: string;
  hash: string;
  isTampered?: boolean;
}

export interface LabTestResults {
  hiv: 'NEGATIVE' | 'POSITIVE' | 'PENDING';
  hbv: 'NEGATIVE' | 'POSITIVE' | 'PENDING';
  hcv: 'NEGATIVE' | 'POSITIVE' | 'PENDING';
  syphilis: 'NEGATIVE' | 'POSITIVE' | 'PENDING';
  westNile: 'NEGATIVE' | 'POSITIVE' | 'PENDING';
  aboRhConfirmatory: BloodType | 'PENDING';
  hemoglobinG_dL: number;
  testedAt?: string;
  testedBy?: string;
  qcReleaseApproval?: boolean;
}

export interface IoTTelemetryPoint {
  timestamp: string;
  temperatureCelsius: number;
  locationName: string;
  lat?: number;
  lng?: number;
  batteryPct?: number;
  breachDetected: boolean;
}

export interface BloodUnit {
  din: string; // e.g. W0423-26-894101
  donorAnonymizedId: string;
  bloodType: BloodType;
  componentType: ComponentType;
  volumeMl: number;
  collectedAt: string;
  expiresAt: string;
  currentFacility: string;
  status: UnitStatus;
  labTests: LabTestResults;
  storageTempRange: { min: number; max: number };
  telemetryLogs: IoTTelemetryPoint[];
  transitCourier?: string;
  destinationHospital?: string;
  patientHash?: string;
  patientAssignedBloodType?: BloodType;
  transfusedAt?: string;
  reactionReported?: {
    type: 'TRALI' | 'TACO' | 'FEBRILE' | 'ACUTE_HEMOLYTIC';
    severity: 'MILD' | 'SEVERE' | 'LIFE_THREATENING';
    timestamp: string;
    reportedBy: string;
    notes: string;
  };
}

export type DonorVerificationTier = 1 | 2 | 3 | 4;

export interface DonorDocument {
  id: string;
  name: string;
  type: 'NATIONAL_ID' | 'MEDICAL_CLEARANCE' | 'SEROLOGY_RECORD' | 'DONOR_QUESTIONNAIRE';
  sizeKb: number;
  uploadedAt: string;
  fileDataUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface DonorProfile {
  id: string;
  anonymizedHash: string;
  fullName: string;
  email: string;
  phone?: string;
  nationalIdNumber?: string;
  cityDistrict?: string;
  bloodType: BloodType;
  totalDonations: number;
  lastDonationDate: string;
  eligibilityStatus: 'ELIGIBLE' | 'DEFERRED';
  nextEligibleDate: string;
  linkedUnitDins: string[];
  tier: DonorVerificationTier;
  uploadedDocuments: DonorDocument[];
  tierUpdatedAt?: string;
  passwordHash?: string;
}

export interface StaffAccount {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  facility: string;
  badgeNumber: string;
  temporaryPassword?: string;
  passwordHash: string;
  mustChangePassword: boolean;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  lastLoginAt?: string;
  provisionedBy: string;
}

export interface SystemIssue {
  id: string;
  title: string;
  category: 'COLD_CHAIN_ALERT' | 'BEDSIDE_MISMATCH' | 'LAB_QUARANTINE' | 'SUPPLY_DEFICIT' | 'DONOR_APPEAL';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  facility: string;
  affectedEntity: string;
  description: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  timestamp: string;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface HospitalRequest {
  id: string;
  hospitalName: string;
  department: string;
  urgency: 'EMERGENCY_CODE_CRIMSON' | 'URGENT' | 'ROUTINE';
  bloodType: BloodType;
  componentType: ComponentType;
  unitsNeeded: number;
  requestedAt: string;
  status: 'PENDING' | 'DISPATCHED' | 'FULFILLED';
  fulfilledUnitDins: string[];
}

export interface OfflineAction {
  id: string;
  actionType: string;
  timestamp: string;
  data: any;
}
