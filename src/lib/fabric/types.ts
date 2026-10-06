export interface RecordDonationParams {
  txId: string;
  donorHash: string;
  centreId: string;
  centreName: string;
  district: string;
  bloodType: string;
  donatedAt: string;
  operatorHash: string;
}

export interface RecordDonationResult {
  success: boolean;
  blockHeight: string;
  ledgerTimestamp: string;
}

export interface DonationRecord extends RecordDonationParams {
  blockchainVerified: boolean;
  ledgerTimestamp: string;
}

export interface PublicDonationEntry {
  txId: string;
  centreName: string;
  district: string;
  bloodType: string;
  donatedAt: string;
  donorHash: string;
  operatorHash: string;
  ledgerTimestamp: string;
}

export interface LedgerFeedResult {
  records: PublicDonationEntry[];
  nextBookmark: string;
  totalCount: number;
}

export interface LedgerStatsResult {
  totalDonations: number;
  uniqueDonors: number;
  uniqueCentres: number;
}

export class DuplicateTxError extends Error {
  constructor(txId: string) {
    super(`Transaction with ID "${txId}" already exists on the ledger`);
    this.name = 'DuplicateTxError';
  }
}

export class NotFoundError extends Error {
  constructor(txId: string) {
    super(`Transaction with ID "${txId}" was not found on the ledger`);
    this.name = 'NotFoundError';
  }
}

export class LedgerUnavailableError extends Error {
  constructor(message: string) {
    super(`Hyperledger Fabric ledger is unavailable: ${message}`);
    this.name = 'LedgerUnavailableError';
  }
}
