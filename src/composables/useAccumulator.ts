import { computed, type Ref } from 'vue'
import type { MoneyResult } from '../lib/calc'

/**
 * Computes accumulated money based on elapsed milliseconds and a per-ms rate.
 */
export function useAccumulator(
  perMsRate: Ref<number> | (() => number),
  elapsedMs: Ref<number>,
): { accumulated: Ref<MoneyResult> } {
  const accumulated = computed<MoneyResult>(() => {
    const rate = typeof perMsRate === 'function' ? perMsRate() : perMsRate.value
    return {
      amount: rate * elapsedMs.value,
      precision: 8,
      currency: 'EUR',
    }
  })

  return { accumulated }
}
