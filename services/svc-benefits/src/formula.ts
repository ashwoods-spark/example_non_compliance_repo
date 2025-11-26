import { floor } from './utils/rounding.js';
import thresholdsConfig from './config/thresholds.json' assert { type: 'json' };

// IMPLICIT MISMATCH: Multiple sources of truth for income cap
// 1. thresholds.json has 90000
// 2. ENV default below is 88000
// 3. Legislation says 85000

export function getIncomeCap(): number {
  // Check env first, then config, then default
  const envCap = process.env.INCOME_CAP;
  if (envCap) {
    return parseInt(envCap, 10);
  }
  
  // Fallback to config file
  if (thresholdsConfig.incomeCap) {
    return thresholdsConfig.incomeCap;
  }
  
  // Historic default from 2023
  return 88000;
}

export interface BenefitCalcParams {
  annualIncome: number;
  base: number;
}

export interface BenefitCalcResult {
  amount: number;
  reduction: number;
  capped: boolean;
}

export function calculateBenefit(params: BenefitCalcParams): BenefitCalcResult {
  const { annualIncome, base } = params;
  const cap = getIncomeCap();
  
  let reduction = 0;
  let capped = false;
  
  if (annualIncome > cap) {
    const excess = annualIncome - cap;
    // Apply reduction rate from config
    reduction = excess * thresholdsConfig.reductionRate;
    
    if (reduction > thresholdsConfig.maxReduction) {
      reduction = thresholdsConfig.maxReduction;
    }
    
    capped = true;
  }
  
  let amount = base - reduction;
  if (amount < 0) {
    amount = 0;
  }
  
  // IMPLICIT MISMATCH: Using floor(2) instead of round-half-up(2)
  amount = floor(amount, 2);
  reduction = floor(reduction, 2);
  
  return {
    amount,
    reduction,
    capped,
  };
}

