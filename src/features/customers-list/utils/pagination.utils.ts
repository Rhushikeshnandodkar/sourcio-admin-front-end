/**
 * Pagination utility functions
 */

/**
 * Calculate the starting item number for pagination display
 */
export function calculateStartItem(page: number, pageSize: number): number {
  return (page - 1) * pageSize + 1;
}

/**
 * Calculate the ending item number for pagination display
 */
export function calculateEndItem(
  page: number,
  pageSize: number,
  total: number
): number {
  return Math.min(page * pageSize, total);
}
