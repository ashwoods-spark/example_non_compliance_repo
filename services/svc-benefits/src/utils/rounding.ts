// Rounding utilities
// IMPLICIT MISMATCH: floor(2) is used, but roundHalfUp2 exists but is not used

export function floor(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.floor(value * factor) / factor;
}

export function roundHalfUp2(value: number): number {
  // This is the correct implementation per legislation
  // But it's not actually used in the benefit calculations
  return Math.round(value * 100) / 100;
}

export function roundHalfUp(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

