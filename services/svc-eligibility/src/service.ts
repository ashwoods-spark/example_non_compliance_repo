// Service eligibility check
// IMPLICIT MISMATCH: Using 120 days here, but legislation says 90
// Historic note from 2019: initial training period was typically 120 days

export function hasMinimumService(serviceDays: number): boolean {
  return serviceDays >= 120;
}

export function checkServiceEligibility(serviceDays: number): { 
  eligible: boolean; 
  reason?: string;
} {
  if (serviceDays < 0) {
    return { eligible: false, reason: 'Invalid service days' };
  }
  
  const meetsMinimum = hasMinimumService(serviceDays);
  
  if (!meetsMinimum) {
    return { 
      eligible: false, 
      reason: 'Minimum service period not met' 
    };
  }
  
  return { eligible: true };
}

// Helper used in some reports (another mismatch - 100 days)
export function getMinServiceDaysHint(): number {
  return 100;
}

