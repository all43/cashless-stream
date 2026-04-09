import type { ContractTerms, Stream } from './types'
import { toPeriod } from './calc'

export function monthlyValue(stream: Stream): number {
  return toPeriod(stream.value, stream.period, 'monthly').amount
}

export function contractEndDate(contract: ContractTerms): Date {
  const start = new Date(contract.startDate)
  start.setMonth(start.getMonth() + contract.minimumMonths)
  return start
}

export function isLocked(contract: ContractTerms): boolean {
  return new Date() < contractEndDate(contract)
}

export function monthsRemaining(contract: ContractTerms): number {
  const now = new Date()
  const end = contractEndDate(contract)
  if (now >= end) return 0
  const diff =
    (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth())
  return Math.max(0, diff)
}

export function cancellationCost(contract: ContractTerms, stream: Stream): number {
  if (!isLocked(contract)) return 0
  if (contract.cancellationModel === 'flat') return contract.cancellationFee ?? 0
  return monthsRemaining(contract) * monthlyValue(stream)
}

/** How many months of staying equals the flat exit fee. Null for remaining-months model. */
export function breakEvenMonths(contract: ContractTerms, stream: Stream): number | null {
  if (contract.cancellationModel !== 'flat') return null
  const fee = contract.cancellationFee ?? 0
  const monthly = monthlyValue(stream)
  if (monthly <= 0 || fee <= 0) return null
  return Math.ceil(fee / monthly)
}
