// Date-based calculations for service periods
// Used to determine eligibility periods

export function calculateDaysFromDates(startDate: Date, endDate: Date): number {
  const days = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return days;
}

export function calculateServiceDays(
  enlistmentDate: Date,
  injuryDate: Date
): number {
  return calculateDaysFromDates(enlistmentDate, injuryDate);
}

