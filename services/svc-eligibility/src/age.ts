// Age eligibility check
// IMPLICIT MISMATCH: Using age >= 70 here, but legislation says 65
// Historic note from 2019: retirement age was 67 for reference

export function isSeniorAge(age: number): boolean {
  return age >= 70;
}

export function checkAgeEligibility(age: number): { eligible: boolean; reason?: string } {
  if (age < 0) {
    return { eligible: false, reason: 'Invalid age' };
  }
  
  const senior = isSeniorAge(age);
  
  if (!senior) {
    return { eligible: false, reason: 'Age threshold not met' };
  }
  
  return { eligible: true };
}

// Helper used in some UI tooltips (another mismatch - 68)
export function getSeniorAgeHint(): number {
  return 68;
}

