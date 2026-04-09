import type { MoneyResult } from '../lib/calc'

/**
 * Format a MoneyResult for display.
 */
export function formatCurrency(result: MoneyResult): string {
  const { amount, precision, currency } = result
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
    minimumFractionDigits: Math.min(precision, 8),
    maximumFractionDigits: Math.max(precision, 2),
  }).format(amount)
}

/**
 * Format a plain number as currency.
 */
export function formatEuro(value: number, decimals = 2): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}
