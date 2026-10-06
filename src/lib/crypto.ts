import { BlockchainBlock } from '../types/bloodchain';

/**
 * Calculates SHA-256 hash using the native browser Web Crypto API
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Synchronous fallback hash function for instant reactivity
 */
export function quickHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  // Convert to positive hex and repeat for 64-char pseudo-sha256 appearance if needed
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return hex.repeat(8).slice(0, 64);
}

/**
 * Computes block hash based on block contents
 */
export async function calculateBlockHash(
  index: number,
  timestamp: string,
  unitDIN: string,
  eventType: string,
  actor: { id: string; role: string; facility: string; signature: string },
  payload: Record<string, any>,
  previousHash: string
): Promise<string> {
  const content = JSON.stringify({
    index,
    timestamp,
    unitDIN,
    eventType,
    actor,
    payload,
    previousHash
  });
  return await sha256(content);
}

/**
 * Validates a block's hash integrity against its payload
 */
export async function verifyBlockIntegrity(block: BlockchainBlock): Promise<boolean> {
  const computed = await calculateBlockHash(
    block.index,
    block.timestamp,
    block.unitDIN,
    block.eventType,
    block.actor,
    block.payload,
    block.previousHash
  );
  return computed === block.hash;
}

/**
 * Verifies the full chain integrity from genesis to latest block
 */
export async function verifyChainIntegrity(chain: BlockchainBlock[]): Promise<{
  isValid: boolean;
  brokenIndex?: number;
  reason?: string;
}> {
  for (let i = 0; i < chain.length; i++) {
    const current = chain[i];
    
    // Check previous hash link
    if (i > 0) {
      const prev = chain[i - 1];
      if (current.previousHash !== prev.hash) {
        return {
          isValid: false,
          brokenIndex: i,
          reason: `Previous hash pointer mismatch at block #${current.index}`
        };
      }
    } else {
      // Genesis block
      if (current.previousHash !== '0000000000000000000000000000000000000000000000000000000000000000') {
        return {
          isValid: false,
          brokenIndex: 0,
          reason: 'Genesis previous hash invalid'
        };
      }
    }

    // Check block hash calculation
    const isValidHash = await verifyBlockIntegrity(current);
    if (!isValidHash) {
      return {
        isValid: false,
        brokenIndex: i,
        reason: `Cryptographic digest mismatch at block #${current.index}. Content was altered!`
      };
    }
  }

  return { isValid: true };
}
