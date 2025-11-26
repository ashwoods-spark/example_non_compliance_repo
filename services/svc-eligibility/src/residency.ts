// Residency eligibility check
// IMPLICIT MISMATCH: Enforcing >= 12 months, but legislation says 10

export function checkResidencyEligibility(residencyMonths: number): { 
  eligible: boolean; 
  reason?: string;
} {
  if (residencyMonths < 0) {
    return { eligible: false, reason: 'Invalid residency period' };
  }
  
  // Minimum 12 months required
  if (residencyMonths < 12) {
    return { 
      eligible: false, 
      reason: 'Minimum residency requirement not met' 
    };
  }
  
  return { eligible: true };
}

// Another helper with different calculation (date-based)
// IMPLICIT MISMATCH: This rounds down months from days differently
export function calculateMonthsFromDays(days: number): number {
  // Using 30 days per month (simplified), rounds down
  return Math.floor(days / 30);
}

export function monthsBetweenDates(startDate: Date, endDate: Date): number {
  const days = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return calculateMonthsFromDays(days);
}

