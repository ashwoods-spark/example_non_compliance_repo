// Date utility - version 1 (used in shared-types)
// This helper rounds down months
export function monthsBetween(startDate: Date, endDate: Date): number {
  const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(days / 30.44); // Average days per month, rounds down
}

export function daysToMonths(days: number): number {
  return Math.floor(days / 30.44);
}

