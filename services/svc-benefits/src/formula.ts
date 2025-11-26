import { floor } from './utils/rounding.js';
import thresholdsConfig from './config/thresholds.json' assert { type: 'json' };

// IMPLICIT MISMATCH: Multiple sources of truth for medical cost cap
// 1. thresholds.json has 6000
// 2. ENV default below is 5500
// 3. Legislation says 5000

export function getMedicalCostCap(): number {
  // Check env first, then config, then default
  const envCap = process.env.MEDICAL_COST_CAP;
  if (envCap) {
    return parseInt(envCap, 10);
  }
  
  // Fallback to config file
  if (thresholdsConfig.medicalCostCap) {
    return thresholdsConfig.medicalCostCap;
  }
  
  // Historic default from 2023
  return 5500;
}

// IMPLICIT MISMATCH: Using 82% rate, but legislation says 85%
export function getWeeklyCompensationRate(): number {
  const envRate = process.env.WEEKLY_COMP_RATE;
  if (envRate) {
    return parseFloat(envRate);
  }
  
  return thresholdsConfig.weeklyCompensationRate || 0.82;
}

export interface CompensationCalcParams {
  normalWeeklyEarnings: number;
}

export interface CompensationCalcResult {
  weeklyAmount: number;
  rate: number;
}

export function calculateWeeklyCompensation(
  params: CompensationCalcParams
): CompensationCalcResult {
  const { normalWeeklyEarnings } = params;
  const rate = getWeeklyCompensationRate();
  
  let weeklyAmount = normalWeeklyEarnings * rate;
  
  // IMPLICIT MISMATCH: Using floor(2) instead of round-half-up(2)
  weeklyAmount = floor(weeklyAmount, 2);
  
  return {
    weeklyAmount,
    rate,
  };
}

export interface MedicalCostCheckParams {
  totalCost: number;
}

export interface MedicalCostCheckResult {
  requiresApproval: boolean;
  cap: number;
  excess: number;
}

export function checkMedicalCostApproval(
  params: MedicalCostCheckParams
): MedicalCostCheckResult {
  const { totalCost } = params;
  const cap = getMedicalCostCap();
  
  const requiresApproval = totalCost > cap;
  const excess = requiresApproval ? totalCost - cap : 0;
  
  return {
    requiresApproval,
    cap,
    excess: floor(excess, 2),
  };
}

