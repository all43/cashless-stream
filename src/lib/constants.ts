import type { Period, PeriodConfig, TaxBracket } from './types'

/** Vendor profit margin applied on top of amortisation + maintenance in R2R rental model */
export const VENDOR_MARGIN = 0.15

export const PERIOD_CONFIG: Record<Period, PeriodConfig> = {
  annual: {
    factor: 3.154e7,
    precision: 0,
    format: '0',
  },
  monthly: {
    factor: 2.628e6,
    precision: 0,
    format: '0',
  },
  daily: {
    factor: 86400,
    precision: 2,
    format: '0.00',
  },
  hourly: {
    factor: 3600,
    precision: 2,
    format: '0.00',
  },
  everyMinute: {
    factor: 60,
    precision: 6,
    format: '0.00000',
  },
  everySecond: {
    factor: 1,
    precision: 12,
    format: '0.00000000',
  },
}

export const PERIOD_LABELS: Record<Period, string> = {
  annual: 'Year',
  monthly: 'Month',
  daily: 'Day',
  hourly: 'Hour',
  everyMinute: 'Minute',
  everySecond: 'Second',
}

// Illustrative progressive tax brackets — not based on any real jurisdiction
export const TAX_BRACKETS: TaxBracket[] = [
  { min: 0,      max: 12000,  rate: 0    },
  { min: 12000,  max: 30000,  rate: 0.15 },
  { min: 30000,  max: 75000,  rate: 0.25 },
  { min: 75000,  max: 200000, rate: 0.35 },
  { min: 200000, max: null,   rate: 0.45 },
]
