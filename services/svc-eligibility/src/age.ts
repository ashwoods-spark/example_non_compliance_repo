// On-duty status check for eligibility
// Simple boolean check - member must have been on duty at time of injury

export function wasOnDuty(onDuty: boolean): boolean {
  return onDuty === true;
}

export function checkDutyStatus(onDuty: boolean, injuryDuringService: boolean): { 
  eligible: boolean; 
  reason?: string;
} {
  if (!injuryDuringService) {
    return { eligible: false, reason: 'Injury not during service period' };
  }
  
  if (!wasOnDuty(onDuty)) {
    return { eligible: false, reason: 'Member was not on duty at time of injury' };
  }
  
  return { eligible: true };
}

