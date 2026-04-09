import { TAX_BRACKETS } from './constants'
import type { Period } from './types'
import { toPeriod } from './calc'

/**
 * Calculate tax on unspent deductible income.
 * taxableIncome = max(0, annualIncome - annualDeductibleExpenses)
 * Luxury expenses (taxDeductible: false) do not reduce taxable income.
 */
export function calculateAnnualTax(annualIncome: number, annualDeductibleExpenses = 0): number {
  const taxableIncome = Math.max(0, annualIncome - annualDeductibleExpenses)
  let tax = 0
  for (const bracket of TAX_BRACKETS) {
    const max = bracket.max ?? Infinity
    if (taxableIncome <= bracket.min) break
    const taxableInBracket = Math.min(taxableIncome, max) - bracket.min
    tax += taxableInBracket * bracket.rate
  }
  return tax
}

export function effectiveTaxRate(annualIncome: number, annualDeductibleExpenses = 0): number {
  if (annualIncome <= 0) return 0
  return calculateAnnualTax(annualIncome, annualDeductibleExpenses) / annualIncome
}

export function taxForPeriod(annualIncome: number, period: Period, currency = 'EUR', annualDeductibleExpenses = 0) {
  const annualTax = calculateAnnualTax(annualIncome, annualDeductibleExpenses)
  return toPeriod(annualTax, 'annual', period, currency)
}
