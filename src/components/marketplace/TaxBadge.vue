<script setup lang="ts">
import { computed } from 'vue'
import { useStreamStore } from '../../stores/streams'
import { totalStreams } from '../../lib/calc'
import { effectiveTaxRate, taxForPeriod } from '../../lib/tax'
import AnimatedNumber from '../shared/AnimatedNumber.vue'
import { formatCurrency } from '../../composables/useCurrency'

const store = useStreamStore()

const annualIncome = computed(() =>
  totalStreams(store.incomeStreams, 'annual', store.account.currency).amount,
)

const annualDeductible = computed(() => store.annualDeductibleExpenses)

const taxableAnnual = computed(() => Math.max(0, annualIncome.value - annualDeductible.value))

const luxuryStreams = computed(() =>
  store.expenseStreams.filter((s) => s.taxDeductible === false),
)

const luxuryForPeriod = computed(() =>
  totalStreams(luxuryStreams.value, store.selectedPeriod, store.account.currency),
)

const hasLuxury = computed(() => luxuryStreams.value.length > 0)

const taxRate = computed(() => effectiveTaxRate(annualIncome.value, annualDeductible.value))

const taxForCurrentPeriod = computed(() =>
  taxForPeriod(annualIncome.value, store.selectedPeriod, store.account.currency, annualDeductible.value),
)

const netIncome = computed(() => ({
  amount: store.totalIncome.amount - taxForCurrentPeriod.value.amount,
  precision: store.totalIncome.precision,
  currency: store.account.currency,
}))
</script>

<template>
  <div class="rounded-xl border dark:border-border dark:bg-surface-card border-slate-200 bg-white p-4">
    <h3 class="text-xs font-semibold uppercase tracking-wider mb-3 dark:text-text-secondary text-slate-500">
      Tax flow (simplified)
    </h3>

    <div class="space-y-2">
      <div v-if="hasLuxury" class="flex items-center justify-between">
        <span class="text-sm dark:text-text-secondary text-slate-600">Luxury (non-deductible)</span>
        <AnimatedNumber
          :value="luxuryForPeriod.amount"
          :precision="luxuryForPeriod.precision"
          :currency="luxuryForPeriod.currency"
          class="font-mono text-sm text-balance-negative"
        />
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm dark:text-text-secondary text-slate-600">Taxable income</span>
        <span class="font-mono text-sm dark:text-text-primary text-slate-700">
          {{ formatCurrency({ amount: taxableAnnual / 12, precision: 0, currency: store.account.currency }) }}/mo
        </span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm dark:text-text-secondary text-slate-600">Effective rate</span>
        <span class="font-mono text-sm font-bold text-balance-negative">
          {{ (taxRate * 100).toFixed(1) }}%
        </span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm dark:text-text-secondary text-slate-600">Tax stream</span>
        <AnimatedNumber
          :value="taxForCurrentPeriod.amount"
          :precision="taxForCurrentPeriod.precision"
          :currency="taxForCurrentPeriod.currency"
          class="font-mono text-sm font-bold text-expense"
        />
      </div>
      <div class="border-t dark:border-border border-slate-200 pt-2 flex items-center justify-between">
        <span class="text-sm font-medium dark:text-text-primary text-slate-800">Net income</span>
        <AnimatedNumber
          :value="netIncome.amount"
          :precision="netIncome.precision"
          :currency="netIncome.currency"
          class="font-mono text-sm font-bold text-income"
        />
      </div>
    </div>
  </div>
</template>
