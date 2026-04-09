import type { Period, Stream } from './types'
import { PERIOD_CONFIG } from './constants'

export interface MoneyResult {
  /** Raw numeric value in the target period's precision */
  amount: number
  /** Number of decimal places for display */
  precision: number
  /** Currency code */
  currency: string
}

/**
 * Convert a monetary value from one period to another.
 * Uses simple ratio of period factors (seconds-based).
 */
export function toPeriod(
  value: number,
  periodFrom: Period,
  periodTo: Period,
  currency = 'EUR',
): MoneyResult {
  const fromConfig = PERIOD_CONFIG[periodFrom]
  const toConfig = PERIOD_CONFIG[periodTo]
  const factor = toConfig.factor / fromConfig.factor
  const amount = value * factor

  return {
    amount,
    precision: toConfig.precision,
    currency,
  }
}

/**
 * Sum an array of streams converted to a target period.
 */
export function totalStreams(
  streams: Stream[],
  periodTo: Period,
  currency = 'EUR',
): MoneyResult {
  let total = 0
  for (const stream of streams) {
    const result = toPeriod(stream.value, stream.period, periodTo, currency)
    total += result.amount
  }

  return {
    amount: total,
    precision: PERIOD_CONFIG[periodTo].precision,
    currency,
  }
}

/**
 * Format a MoneyResult as a currency string.
 */
export function formatMoney(result: MoneyResult): string {
  const { amount, precision, currency } = result

  // Use Intl for proper locale formatting
  const formatted = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
    minimumFractionDigits: precision,
    maximumFractionDigits: Math.max(precision, 2),
  }).format(amount)

  return formatted
}

/**
 * Get the per-millisecond rate for a stream (used by accumulator).
 */
export function perMillisecond(value: number, period: Period): number {
  return toPeriod(value, period, 'everySecond').amount / 1000
}
