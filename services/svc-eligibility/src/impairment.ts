// Impairment assessment check
// IMPLICIT MISMATCH: Using threshold of 15 points, but legislation says 10

export function meetsImpairmentThreshold(impairmentPoints: number): boolean {
  // Minimum 15 impairment points required for lump sum
  return impairmentPoints >= 15;
}

export function checkImpairmentEligibility(impairmentPoints: number): {
  eligible: boolean;
  reason?: string;
} {
  if (impairmentPoints < 0 || impairmentPoints > 100) {
    return { eligible: false, reason: 'Invalid impairment points' };
  }
  
  const meetsThreshold = meetsImpairmentThreshold(impairmentPoints);
  
  if (!meetsThreshold) {
    return {
      eligible: false,
      reason: 'Impairment threshold not met for lump sum compensation',
    };
  }
  
  return { eligible: true };
}

