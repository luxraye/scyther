import { BloodType } from '../types/bloodchain';

/**
 * RBC compatibility matrix (Red Blood Cells)
 * Can donorType be safely transfused to recipientType?
 */
export const RBC_COMPATIBILITY: Record<BloodType, BloodType[]> = {
  // Donor Type -> Array of Recipients who can receive it
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'], // Universal recipient for RBC
};

/**
 * Plasma compatibility matrix (Plasma is opposite of RBC!)
 */
export const PLASMA_COMPATIBILITY: Record<BloodType, BloodType[]> = {
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'], // Universal plasma donor
  'AB-': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A+', 'A-', 'O+', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B+', 'B-', 'O+', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O+', 'O-'],
};

export function isRbcCompatible(donor: BloodType, recipient: BloodType): boolean {
  return RBC_COMPATIBILITY[donor]?.includes(recipient) ?? false;
}

export function isPlasmaCompatible(donor: BloodType, recipient: BloodType): boolean {
  return PLASMA_COMPATIBILITY[donor]?.includes(recipient) ?? false;
}
