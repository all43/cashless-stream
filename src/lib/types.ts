export type Period =
  | 'annual'
  | 'monthly'
  | 'daily'
  | 'hourly'
  | 'everyMinute'
  | 'everySecond'

export type StreamType = 'live' | 'projected' | 'bridged'
export type StreamCategory = 'income' | 'expense'

export interface ContractTerms {
  /** ISO date string — when the contract started */
  startDate: string
  /** Minimum commitment period in months */
  minimumMonths: number
  /** How the early cancellation penalty is calculated */
  cancellationModel: 'flat' | 'remaining-months'
  /** Flat exit penalty in currency units (used when cancellationModel = 'flat') */
  cancellationFee?: number
  /** One-time fee paid at signing */
  setupFee?: number
  /** One-time credit received at signing */
  welcomeBonus?: number
}

export interface Stream {
  id: string
  title: string
  value: number
  period: Period
  type: StreamType
  category: StreamCategory
  icon?: string
  sourceProductId?: string
  contract?: ContractTerms
  /**
   * Whether this expense reduces taxable income.
   * Defaults to true (most expenses are deductible).
   * Set to false for luxury/discretionary spending.
   */
  taxDeductible?: boolean
}

/** Contract terms without startDate — used as a template on Product, startDate set at signing */
export interface ContractTemplate {
  minimumMonths: number
  cancellationModel: 'flat' | 'remaining-months'
  cancellationFee?: number
  setupFee?: number
  welcomeBonus?: number
}

export interface Product {
  id: string
  name: string
  /** Reference / purchase price in EUR */
  price: number
  /** 'one-time' = physical good, show buy-cycle vs R2R rental comparison
   *  'monthly'   = subscription, already a stream */
  priceType: 'one-time' | 'monthly'
  // Physical products only:
  /** Manufacturer's intended replacement cycle in months */
  defaultLifetimeMonths?: number
  /** Realistic lifetime under vendor-operated rental (maintained, repairable by design) */
  extendedLifetimeMonths?: number
  /** Fraction of price recovered as resale at end of default cycle (e.g. 0.35) */
  resaleAtDefaultEnd?: number
  /** Fraction of price recovered at end of extended lifetime */
  resaleAtExtendedEnd?: number
  /** Estimated monthly maintenance cost for a vendor-operated rental (EUR) */
  maintenancePerMonth?: number
  category: string
  icon: string
  /** Contract terms that apply when added to streams */
  contractTemplate?: ContractTemplate
}

export interface TaxBracket {
  min: number
  max: number | null
  rate: number
}

export interface Account {
  name: string
  initialBalance: number
  streams: Stream[]
  currency: string
}

export interface PeriodConfig {
  factor: number
  precision: number
  format: string
}
