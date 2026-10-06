import { BloodUnit, BlockchainBlock, DonorProfile, HospitalRequest, StaffAccount, SystemIssue } from '../types/bloodchain';

export const INITIAL_DONOR: DonorProfile = {
  id: 'DONOR-88219',
  anonymizedHash: '9e7b23c91d4e082a5c34f19b023e98f21908abde03810f',
  fullName: 'Elena Rostova',
  email: 'elena.rostova@nationaldonor.org',
  phone: '+267 71 894 102',
  nationalIdNumber: 'BW-ID-9821-440',
  cityDistrict: 'Gaborone Central',
  bloodType: 'O-',
  totalDonations: 8,
  lastDonationDate: '2026-09-18',
  eligibilityStatus: 'ELIGIBLE',
  nextEligibleDate: '2026-11-15',
  linkedUnitDins: ['W0423-26-894101', 'W0423-26-894105', 'W0423-26-894106'],
  tier: 4, // Level 4: Confirmed Repeat Donor (Verified + >= 2 donations)
  uploadedDocuments: [
    {
      id: 'DOC-901',
      name: 'National_ID_Passport_Elena.pdf',
      type: 'NATIONAL_ID',
      sizeKb: 1420,
      uploadedAt: '2026-01-10T09:15:00Z',
      status: 'APPROVED',
      reviewedBy: 'Director Neo Molefe',
      reviewNotes: 'Verified against national civil identity database.'
    },
    {
      id: 'DOC-902',
      name: 'Medical_Clearance_Gaborone_Lab.pdf',
      type: 'MEDICAL_CLEARANCE',
      sizeKb: 890,
      uploadedAt: '2026-01-10T09:20:00Z',
      status: 'APPROVED',
      reviewedBy: 'Director Neo Molefe',
      reviewNotes: 'Standard clinical clearance confirmed.'
    }
  ],
  tierUpdatedAt: '2026-03-12T14:00:00Z'
};

export const INITIAL_DONORS: DonorProfile[] = [
  INITIAL_DONOR,
  {
    id: 'DONOR-10492',
    anonymizedHash: 'a38f9021dcba98114400234eefa1029384729103940182',
    fullName: 'Tebogo Kgosi',
    email: 'tebogo.kgosi@donor.bw',
    phone: '+267 72 341 908',
    nationalIdNumber: 'BW-ID-7819-201',
    cityDistrict: 'Francistown North',
    bloodType: 'A+',
    totalDonations: 1,
    lastDonationDate: '2026-08-10',
    eligibilityStatus: 'ELIGIBLE',
    nextEligibleDate: '2026-10-10',
    linkedUnitDins: ['W0423-26-894102'],
    tier: 3, // Level 3: Verified by admin (documents greenlit)
    uploadedDocuments: [
      {
        id: 'DOC-881',
        name: 'Omang_ID_Card_Tebogo.jpg',
        type: 'NATIONAL_ID',
        sizeKb: 2100,
        uploadedAt: '2026-08-01T11:00:00Z',
        status: 'APPROVED',
        reviewedBy: 'Admin Verification Desk',
        reviewNotes: 'Valid national Omang ID card approved.'
      }
    ],
    tierUpdatedAt: '2026-08-02T09:30:00Z'
  },
  {
    id: 'DONOR-29381',
    anonymizedHash: 'e719283746192837461928374619283746192837461928',
    fullName: 'Mpho Dlamini',
    email: 'mpho.dlamini@donor.bw',
    phone: '+267 74 819 033',
    nationalIdNumber: 'BW-ID-4491-019',
    cityDistrict: 'Molepolole Kweneng',
    bloodType: 'O-',
    totalDonations: 0,
    lastDonationDate: '',
    eligibilityStatus: 'ELIGIBLE',
    nextEligibleDate: '2026-10-06',
    linkedUnitDins: [],
    tier: 2, // Level 2: Uploaded documents, pending admin greenlight
    uploadedDocuments: [
      {
        id: 'DOC-771',
        name: 'National_Identity_Card_Mpho.pdf',
        type: 'NATIONAL_ID',
        sizeKb: 1650,
        uploadedAt: '2026-10-05T14:22:00Z',
        status: 'PENDING',
        reviewNotes: 'Pending administrator verification.'
      },
      {
        id: 'DOC-772',
        name: 'Health_Screening_Form_2026.pdf',
        type: 'DONOR_QUESTIONNAIRE',
        sizeKb: 920,
        uploadedAt: '2026-10-05T14:25:00Z',
        status: 'PENDING',
        reviewNotes: 'Self-assessment complete. Ready for clinical review.'
      }
    ],
    tierUpdatedAt: '2026-10-05T14:25:00Z'
  },
  {
    id: 'DONOR-48192',
    anonymizedHash: 'bb83746192837461928374619283746192837461928374',
    fullName: 'David Modise',
    email: 'david.modise@donor.bw',
    phone: '+267 75 901 234',
    nationalIdNumber: 'BW-ID-1102-399',
    cityDistrict: 'Gaborone West',
    bloodType: 'B+',
    totalDonations: 0,
    lastDonationDate: '',
    eligibilityStatus: 'ELIGIBLE',
    nextEligibleDate: '2026-10-06',
    linkedUnitDins: [],
    tier: 1, // Level 1: Baseline newly registered account
    uploadedDocuments: [],
    tierUpdatedAt: '2026-10-06T08:00:00Z'
  },
  {
    id: 'DONOR-60192',
    anonymizedHash: 'cd19283746192837461928374619283746192837461928',
    fullName: 'Lesedi Tau',
    email: 'lesedi.tau@donor.bw',
    phone: '+267 76 112 455',
    nationalIdNumber: 'BW-ID-8823-901',
    cityDistrict: 'Gaborone North',
    bloodType: 'AB-',
    totalDonations: 4,
    lastDonationDate: '2026-07-22',
    eligibilityStatus: 'ELIGIBLE',
    nextEligibleDate: '2026-09-22',
    linkedUnitDins: ['W0423-26-894103'],
    tier: 4, // Level 4: Repeat verified donor
    uploadedDocuments: [
      {
        id: 'DOC-551',
        name: 'Omang_Passport_Lesedi.pdf',
        type: 'NATIONAL_ID',
        sizeKb: 1350,
        uploadedAt: '2026-02-14T10:00:00Z',
        status: 'APPROVED',
        reviewedBy: 'Admin Verification Desk'
      }
    ],
    tierUpdatedAt: '2026-04-10T12:00:00Z'
  }
];

export const INITIAL_STAFF_ACCOUNTS: StaffAccount[] = [
  {
    id: 'STAFF-CLIN-01',
    email: 'dr.nkomo@botswanahealth.gov',
    fullName: 'Dr. Thabo Nkomo',
    role: 'CLINICAL_STAFF',
    facility: 'Princess Marina Hospital',
    badgeNumber: 'MD-GAB-8491',
    passwordHash: 'clinician2026',
    mustChangePassword: false,
    status: 'ACTIVE',
    createdAt: '2026-01-15T08:00:00Z',
    lastLoginAt: '2026-10-06T07:15:00Z',
    provisionedBy: 'Director Neo Molefe'
  },
  {
    id: 'STAFF-CLIN-02',
    email: 'dr.sharma@hospital.org',
    fullName: 'Dr. Ananya Sharma',
    role: 'CLINICAL_STAFF',
    facility: 'Princess Marina Trauma Ward',
    badgeNumber: 'MD-GAB-9102',
    temporaryPassword: 'TEMP-DOC-7721',
    passwordHash: 'TEMP-DOC-7721',
    mustChangePassword: true, // Requires first-login password change!
    status: 'ACTIVE',
    createdAt: '2026-10-05T16:00:00Z',
    provisionedBy: 'Director Neo Molefe'
  },
  {
    id: 'STAFF-LAB-01',
    email: 's.jenkins@lab.bloodchain.gov',
    fullName: 'Sarah Jenkins, MLS',
    role: 'LAB_TECH',
    facility: 'Central Serology & Fractionation Lab',
    badgeNumber: 'LAB-TECH-4091',
    passwordHash: 'labtech2026',
    mustChangePassword: false,
    status: 'ACTIVE',
    createdAt: '2026-02-01T09:00:00Z',
    lastLoginAt: '2026-10-06T06:30:00Z',
    provisionedBy: 'Director Neo Molefe'
  },
  {
    id: 'STAFF-LAB-02',
    email: 'm.banda@lab.bloodchain.gov',
    fullName: 'Michael Banda',
    role: 'LAB_TECH',
    facility: 'Northern Reference Lab (Francistown)',
    badgeNumber: 'LAB-TECH-5510',
    temporaryPassword: 'TEMP-LAB-4402',
    passwordHash: 'TEMP-LAB-4402',
    mustChangePassword: true,
    status: 'ACTIVE',
    createdAt: '2026-10-05T17:30:00Z',
    provisionedBy: 'Director Neo Molefe'
  },
  {
    id: 'STAFF-LOG-01',
    email: 's.ndlovu@transit.bloodchain.gov',
    fullName: 'Sipho Ndlovu',
    role: 'LOGISTICS_COURIER',
    facility: 'Cold-Chain Dispatch Corridor Alpha',
    badgeNumber: 'DRV-COLD-2291',
    passwordHash: 'courier2026',
    mustChangePassword: false,
    status: 'ACTIVE',
    createdAt: '2026-03-10T11:00:00Z',
    lastLoginAt: '2026-10-06T08:00:00Z',
    provisionedBy: 'Director Neo Molefe'
  },
  {
    id: 'STAFF-LOG-02',
    email: 'b.pheto@transit.bloodchain.gov',
    fullName: 'Boitumelo Pheto',
    role: 'LOGISTICS_COURIER',
    facility: 'Kweneng District Medical Transport',
    badgeNumber: 'DRV-COLD-3104',
    temporaryPassword: 'TEMP-LOG-9183',
    passwordHash: 'TEMP-LOG-9183',
    mustChangePassword: true,
    status: 'ACTIVE',
    createdAt: '2026-10-06T06:00:00Z',
    provisionedBy: 'Director Neo Molefe'
  },
  {
    id: 'STAFF-OPS-01',
    email: 'neo.molefe@moh.bw',
    fullName: 'Director Neo Molefe',
    role: 'NATIONAL_OPERATOR',
    facility: 'National Operations Command Centre (Gaborone)',
    badgeNumber: 'ADM-EXEC-0001',
    passwordHash: 'admin2026',
    mustChangePassword: false,
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
    lastLoginAt: '2026-10-06T09:00:00Z',
    provisionedBy: 'Sovereign Health Ministry'
  },
  {
    id: 'STAFF-AUDIT-01',
    email: 'r.cole@audit.bloodchain.gov',
    fullName: 'Inspector Raymond Cole',
    role: 'AUDITOR',
    facility: 'WHO & National Quality Inspectorate',
    badgeNumber: 'AUD-REG-1092',
    passwordHash: 'auditor2026',
    mustChangePassword: false,
    status: 'ACTIVE',
    createdAt: '2026-01-10T10:00:00Z',
    lastLoginAt: '2026-10-06T08:30:00Z',
    provisionedBy: 'Director Neo Molefe'
  }
];

export const INITIAL_SYSTEM_ISSUES: SystemIssue[] = [
  {
    id: 'ISSUE-2026-01',
    title: 'Torrent Cold Box #CB-409 Temperature Spike Alert',
    category: 'COLD_CHAIN_ALERT',
    severity: 'HIGH',
    facility: 'Transit Corridor A1 (Gaborone to Molepolole)',
    affectedEntity: 'Sensitech Box #CB-409 (Unit W0423-26-894101)',
    description: 'Ambient sensor registered 6.8°C for 4 minutes during vehicle transfer. Automated IoT alarm triggered. Requires courier inspection confirmation.',
    status: 'OPEN',
    timestamp: '2026-10-06T08:12:00Z'
  },
  {
    id: 'ISSUE-2026-02',
    title: 'Donor Level 2 Verification Review Pending',
    category: 'DONOR_APPEAL',
    severity: 'MEDIUM',
    facility: 'National Donor Registration Enclave',
    affectedEntity: 'Donor Mpho Dlamini (DONOR-29381)',
    description: 'New donor uploaded official Omang ID and medical questionnaire. Verification required to promote to Level 3.',
    status: 'OPEN',
    timestamp: '2026-10-05T14:25:00Z'
  },
  {
    id: 'ISSUE-2026-03',
    title: 'Reactive Syphilis Screening Secondary Confirmatory Required',
    category: 'LAB_QUARANTINE',
    severity: 'HIGH',
    facility: 'Central Serology Lab',
    affectedEntity: 'Unit W0423-26-894103',
    description: 'Preliminary RPR screen flagged reactive. Unit placed in cryptographic quarantine isolation pending FTA-ABS confirmation.',
    status: 'INVESTIGATING',
    timestamp: '2026-10-05T12:00:00Z'
  },
  {
    id: 'ISSUE-2026-04',
    title: 'Sekgoma Memorial Hospital Critical O- Deficit',
    category: 'SUPPLY_DEFICIT',
    severity: 'CRITICAL',
    facility: 'Sekgoma Memorial Hospital',
    affectedEntity: 'Requisition REQ-ER-2026-109',
    description: 'Trauma ward reserve below 2 units of Universal O-. Recommended emergency rebalancing from Princess Marina depository.',
    status: 'OPEN',
    timestamp: '2026-10-06T08:10:00Z'
  }
];


export const INITIAL_UNITS: BloodUnit[] = [
  {
    din: 'W0423-26-894101',
    donorAnonymizedId: '9e7b23c91d4e082a5c34f19b023e98f21908abde03810f',
    bloodType: 'O-',
    componentType: 'WHOLE_BLOOD',
    volumeMl: 450,
    collectedAt: '2026-10-06T06:30:00Z',
    expiresAt: '2026-11-10T06:30:00Z',
    currentFacility: 'Metro Central Blood Center',
    status: 'IN_TESTING',
    labTests: {
      hiv: 'PENDING',
      hbv: 'PENDING',
      hcv: 'PENDING',
      syphilis: 'PENDING',
      westNile: 'PENDING',
      aboRhConfirmatory: 'PENDING',
      hemoglobinG_dL: 14.8,
    },
    storageTempRange: { min: 1, max: 6 },
    telemetryLogs: [
      {
        timestamp: '2026-10-06T06:35:00Z',
        temperatureCelsius: 4.1,
        locationName: 'Metro Central Blood Center Intake Bay',
        lat: 51.5074,
        lng: -0.1278,
        batteryPct: 98,
        breachDetected: false
      }
    ]
  },
  {
    din: 'W0423-26-894102',
    donorAnonymizedId: 'a38f9021dcba98114400234eefa1029384729103940182',
    bloodType: 'A+',
    componentType: 'PACKED_RED_CELLS',
    volumeMl: 320,
    collectedAt: '2026-10-05T08:15:00Z',
    expiresAt: '2026-11-16T08:15:00Z',
    currentFacility: 'National Reference Lab - Testing Bay',
    status: 'COLLECTED',
    labTests: {
      hiv: 'NEGATIVE',
      hbv: 'NEGATIVE',
      hcv: 'NEGATIVE',
      syphilis: 'NEGATIVE',
      westNile: 'NEGATIVE',
      aboRhConfirmatory: 'A+',
      hemoglobinG_dL: 15.2,
      testedAt: '2026-10-05T14:20:00Z',
      testedBy: 'Dr. Sarah Lin (QC-409)',
      qcReleaseApproval: false
    },
    storageTempRange: { min: 2, max: 6 },
    telemetryLogs: [
      {
        timestamp: '2026-10-06T07:00:00Z',
        temperatureCelsius: 3.8,
        locationName: 'National Reference Lab Cold Vault 2',
        lat: 51.5122,
        lng: -0.1198,
        batteryPct: 94,
        breachDetected: false
      }
    ]
  },
  {
    din: 'W0423-26-894103',
    donorAnonymizedId: 'bf91024840192847192039481920394829103948571920',
    bloodType: 'O-',
    componentType: 'PACKED_RED_CELLS',
    volumeMl: 300,
    collectedAt: '2026-10-04T10:00:00Z',
    expiresAt: '2026-11-15T10:00:00Z',
    currentFacility: 'Metro Central Blood Center - Storage Vault',
    status: 'RELEASED',
    labTests: {
      hiv: 'NEGATIVE',
      hbv: 'NEGATIVE',
      hcv: 'NEGATIVE',
      syphilis: 'NEGATIVE',
      westNile: 'NEGATIVE',
      aboRhConfirmatory: 'O-',
      hemoglobinG_dL: 14.1,
      testedAt: '2026-10-04T16:00:00Z',
      testedBy: 'Dr. Michael Chen (Lead Serologist)',
      qcReleaseApproval: true
    },
    storageTempRange: { min: 2, max: 6 },
    telemetryLogs: [
      {
        timestamp: '2026-10-06T08:00:00Z',
        temperatureCelsius: 3.4,
        locationName: 'Central Regional Vault Compartment B3',
        lat: 51.5080,
        lng: -0.1290,
        batteryPct: 99,
        breachDetected: false
      }
    ]
  },
  {
    din: 'W0423-26-894104',
    donorAnonymizedId: 'cd19283746192837461928374619283746192837461928',
    bloodType: 'B+',
    componentType: 'PLATELETS',
    volumeMl: 280,
    collectedAt: '2026-10-04T11:30:00Z',
    expiresAt: '2026-10-11T11:30:00Z', // 7 day shelf life for platelets
    currentFacility: 'In Transit: ColdBox #CB-409 (Unit 12)',
    status: 'IN_TRANSIT',
    transitCourier: 'SwiftMed Courier Fleet (Unit 14)',
    destinationHospital: 'Saint Jude Memorial Trauma Hospital',
    labTests: {
      hiv: 'NEGATIVE',
      hbv: 'NEGATIVE',
      hcv: 'NEGATIVE',
      syphilis: 'NEGATIVE',
      westNile: 'NEGATIVE',
      aboRhConfirmatory: 'B+',
      hemoglobinG_dL: 13.9,
      testedAt: '2026-10-04T18:00:00Z',
      testedBy: 'Dr. Sarah Lin (QC-409)',
      qcReleaseApproval: true
    },
    storageTempRange: { min: 20, max: 24 }, // Platelets stored at 20-24C with agitation
    telemetryLogs: [
      {
        timestamp: '2026-10-06T08:15:00Z',
        temperatureCelsius: 21.8,
        locationName: 'Highway A40 Express Corridor',
        lat: 51.5200,
        lng: -0.1400,
        batteryPct: 88,
        breachDetected: false
      },
      {
        timestamp: '2026-10-06T08:45:00Z',
        temperatureCelsius: 22.1,
        locationName: 'En Route to Saint Jude Medical District',
        lat: 51.5310,
        lng: -0.1520,
        batteryPct: 85,
        breachDetected: false
      }
    ]
  },
  {
    din: 'W0423-26-894105',
    donorAnonymizedId: '9e7b23c91d4e082a5c34f19b023e98f21908abde03810f',
    bloodType: 'O-',
    componentType: 'PACKED_RED_CELLS',
    volumeMl: 310,
    collectedAt: '2026-10-03T09:00:00Z',
    expiresAt: '2026-11-14T09:00:00Z',
    currentFacility: 'Saint Jude Memorial Trauma Hospital - Blood Bank',
    status: 'DELIVERED_TO_HOSPITAL',
    destinationHospital: 'Saint Jude Memorial Trauma Hospital',
    labTests: {
      hiv: 'NEGATIVE',
      hbv: 'NEGATIVE',
      hcv: 'NEGATIVE',
      syphilis: 'NEGATIVE',
      westNile: 'NEGATIVE',
      aboRhConfirmatory: 'O-',
      hemoglobinG_dL: 14.5,
      testedAt: '2026-10-03T15:00:00Z',
      testedBy: 'Dr. Michael Chen',
      qcReleaseApproval: true
    },
    storageTempRange: { min: 2, max: 6 },
    telemetryLogs: [
      {
        timestamp: '2026-10-05T16:00:00Z',
        temperatureCelsius: 3.5,
        locationName: 'Saint Jude Transfusion Medicine Refrigerator 1',
        lat: 51.5401,
        lng: -0.1602,
        batteryPct: 99,
        breachDetected: false
      }
    ]
  },
  {
    din: 'W0423-26-894106',
    donorAnonymizedId: '9e7b23c91d4e082a5c34f19b023e98f21908abde03810f',
    bloodType: 'O-',
    componentType: 'PACKED_RED_CELLS',
    volumeMl: 320,
    collectedAt: '2026-10-01T10:00:00Z',
    expiresAt: '2026-11-12T10:00:00Z',
    currentFacility: 'Queen Victoria University Hospital - ICU Bay 4',
    status: 'TRANSFUSED',
    destinationHospital: 'Queen Victoria University Hospital',
    patientHash: 'PT-8941-TRAUMA-EMERGENCY',
    patientAssignedBloodType: 'A+',
    transfusedAt: '2026-10-05T20:15:00Z',
    labTests: {
      hiv: 'NEGATIVE',
      hbv: 'NEGATIVE',
      hcv: 'NEGATIVE',
      syphilis: 'NEGATIVE',
      westNile: 'NEGATIVE',
      aboRhConfirmatory: 'O-',
      hemoglobinG_dL: 14.9,
      testedAt: '2026-10-01T16:00:00Z',
      testedBy: 'Dr. Michael Chen',
      qcReleaseApproval: true
    },
    storageTempRange: { min: 2, max: 6 },
    telemetryLogs: [
      {
        timestamp: '2026-10-05T19:50:00Z',
        temperatureCelsius: 4.0,
        locationName: 'Queen Victoria ICU Crossmatch Station',
        lat: 51.5210,
        lng: -0.1340,
        batteryPct: 91,
        breachDetected: false
      }
    ]
  }
];

export const INITIAL_BLOCKS: BlockchainBlock[] = [
  {
    index: 0,
    timestamp: '2026-10-01T00:00:00Z',
    unitDIN: 'GENESIS-BLOCK',
    eventType: 'GENESIS',
    actor: {
      id: 'NATIONAL-REGULATOR-GOV',
      role: 'NATIONAL_OPERATOR',
      facility: 'National Blood Authority Root Key',
      signature: '0x99a4192b001ef0492190ab1288491024810294819028401928'
    },
    payload: {
      protocol: 'Bloodchain Protocol v2.4-ISBT128',
      standard: 'ISBT-128 & WHO Blood Regulatory Standard',
      genesisNote: 'National Unbroken Chain of Custody Root Initialized'
    },
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    hash: '8f434346648f619296f952c9ff8170de4e60b4718f3b9a03180241ae29cd5572'
  },
  {
    index: 1,
    timestamp: '2026-10-01T10:05:00Z',
    unitDIN: 'W0423-26-894106',
    eventType: 'DONATION_ACCEPTED',
    actor: {
      id: 'PHLEB-309',
      role: 'DONOR',
      facility: 'Metro Central Blood Center',
      signature: '0xec49102834bba901284729103847102938471029384710293847102938'
    },
    payload: {
      donorHash: '9e7b23c91d4e082a5c34f19b023e98f21908abde03810f',
      bloodType: 'O-',
      volumeMl: 450,
      initialTemp: 4.2
    },
    previousHash: '8f434346648f619296f952c9ff8170de4e60b4718f3b9a03180241ae29cd5572',
    hash: 'a931481b2901c80129fca1029481029481029384719203948192039481920394'
  },
  {
    index: 2,
    timestamp: '2026-10-01T16:15:00Z',
    unitDIN: 'W0423-26-894106',
    eventType: 'TESTS_PASSED_AND_RELEASED',
    actor: {
      id: 'LAB-DR-CHEN',
      role: 'LAB_TECH',
      facility: 'National Reference Serology Center',
      signature: '0xfa10293847102938471029384710293847102938471029384710293847'
    },
    payload: {
      infectiousDiseasePanel: {
        hiv: 'NEGATIVE',
        hbv: 'NEGATIVE',
        hcv: 'NEGATIVE',
        syphilis: 'NEGATIVE',
        westNile: 'NEGATIVE'
      },
      confirmedGroup: 'O-',
      fractionatedComponent: 'PACKED_RED_CELLS',
      qcReleaseAuthorized: true
    },
    previousHash: 'a931481b2901c80129fca1029481029481029384719203948192039481920394',
    hash: '3bc1049281736481920394819203948192039481920394819203948192039481'
  },
  {
    index: 3,
    timestamp: '2026-10-03T11:00:00Z',
    unitDIN: 'W0423-26-894106',
    eventType: 'CUSTODY_DISPATCHED',
    actor: {
      id: 'COURIER-MED-12',
      role: 'LOGISTICS_COURIER',
      facility: 'SwiftMed Cold Chain Unit #12',
      signature: '0x1928374650192837465019283746501928374650192837465019283746'
    },
    payload: {
      coldBoxSensorId: 'CB-409',
      tempOnHandoff: 3.4,
      origin: 'Metro Central Blood Center',
      destination: 'Queen Victoria University Hospital'
    },
    previousHash: '3bc1049281736481920394819203948192039481920394819203948192039481',
    hash: '77ea102938471029384710293847102938471029384710293847102938471029'
  },
  {
    index: 4,
    timestamp: '2026-10-05T20:15:00Z',
    unitDIN: 'W0423-26-894106',
    eventType: 'BEDSIDE_DUAL_VERIFIED',
    actor: {
      id: 'CLINICIAN-TEAM-ICU',
      role: 'CLINICAL_STAFF',
      facility: 'Queen Victoria University Hospital',
      signature: '0xbb28374619283746192837461928374619283746192837461928374619'
    },
    payload: {
      recipientIdHash: 'PT-8941-TRAUMA-EMERGENCY',
      recipientBloodType: 'A+',
      donorUnitBloodType: 'O-',
      compatibilityCheck: 'PASSED (Universal RBC to A+)',
      verifyingNurse1: 'Nurse Specialist J. Doe (PIN-819)',
      verifyingNurse2: 'Attending Dr. K. Martinez (GMC-9942)'
    },
    previousHash: '77ea102938471029384710293847102938471029384710293847102938471029',
    hash: '4d10293847102938471029384710293847102938471029384710293847102938'
  },
  {
    index: 5,
    timestamp: '2026-10-05T21:45:00Z',
    unitDIN: 'W0423-26-894106',
    eventType: 'TRANSFUSION_COMPLETED',
    actor: {
      id: 'NURSE-J-DOE',
      role: 'CLINICAL_STAFF',
      facility: 'Queen Victoria University Hospital - ICU',
      signature: '0x9918273645192837465019283746501928374650192837465019283746'
    },
    payload: {
      volumeInfusedMl: 320,
      postTransfusionVitals: 'NORMAL',
      adverseReactions: 'NONE',
      closedCustodyFinalStatus: 'SUCCESSFULLY_TRANSFUSED'
    },
    previousHash: '4d10293847102938471029384710293847102938471029384710293847102938',
    hash: '6e29384710293847102938471029384710293847102938471029384710293847'
  }
];

export const INITIAL_HOSPITAL_REQUESTS: HospitalRequest[] = [
  {
    id: 'REQ-EMERG-2026-091',
    hospitalName: 'Saint Jude Memorial Trauma Hospital',
    department: 'Emergency & Acute Trauma Bay 1',
    urgency: 'EMERGENCY_CODE_CRIMSON',
    bloodType: 'O-',
    componentType: 'PACKED_RED_CELLS',
    unitsNeeded: 3,
    requestedAt: '2026-10-06T08:10:00Z',
    status: 'PENDING',
    fulfilledUnitDins: []
  },
  {
    id: 'REQ-SURG-2026-088',
    hospitalName: 'Queen Victoria University Hospital',
    department: 'Cardiac Surgery Theatres',
    urgency: 'URGENT',
    bloodType: 'A+',
    componentType: 'PACKED_RED_CELLS',
    unitsNeeded: 2,
    requestedAt: '2026-10-06T07:20:00Z',
    status: 'FULFILLED',
    fulfilledUnitDins: ['W0423-26-894102']
  },
  {
    id: 'REQ-ONCO-2026-074',
    hospitalName: 'Northfield Regional Cancer Centre',
    department: 'Hematology Day Unit',
    urgency: 'ROUTINE',
    bloodType: 'B+',
    componentType: 'PLATELETS',
    unitsNeeded: 1,
    requestedAt: '2026-10-06T06:00:00Z',
    status: 'DISPATCHED',
    fulfilledUnitDins: ['W0423-26-894104']
  }
];
