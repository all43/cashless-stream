<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStreamStore } from '../../stores/streams'
import { totalStreams } from '../../lib/calc'
import { effectiveTaxRate, taxForPeriod } from '../../lib/tax'
import AnimatedNumber from '../shared/AnimatedNumber.vue'
import { formatCurrency } from '../../composables/useCurrency'

const store = useStreamStore()
const showInfo = ref(false)

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

const isEmpty = computed(() => store.incomeStreams.length === 0)
</script>

<template>
  <div
    class="rounded-xl border dark:border-border dark:bg-surface-card border-slate-200 bg-white p-4 cursor-pointer transition-colors
           dark:hover:border-border/80 hover:border-slate-300"
    @click="showInfo = true"
  >
    <h3 class="text-xs font-semibold uppercase tracking-wider mb-3 dark:text-text-secondary text-slate-500 flex items-center justify-between">
      Tax flow (concept)
      <span class="text-[10px] normal-case font-normal dark:text-text-muted text-slate-400">how?</span>
    </h3>

    <p v-if="isEmpty" class="text-xs dark:text-text-muted text-slate-400">
      Add income streams to see tax flow
    </p>

    <div v-else class="space-y-2">
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

  <!-- Info modal -->
  <Teleport to="body">
    <div
      v-if="showInfo"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="showInfo = false"
    >
      <div class="w-full sm:max-w-sm rounded-xl border p-6 space-y-4
                  dark:border-border dark:bg-surface-elevated
                  border-slate-200 bg-white">

        <div>
          <h2 class="text-sm font-semibold dark:text-text-primary text-slate-900">
            How tax is calculated
          </h2>
          <p class="mt-0.5 text-xs dark:text-text-muted text-slate-500">
            Tax flow (concept) — not real tax advice
          </p>
        </div>

        <p class="text-sm leading-relaxed dark:text-text-secondary text-slate-600">
          <strong>Only the income you don't spend gets taxed.</strong>
        </p>

        <p class="text-sm leading-relaxed dark:text-text-secondary text-slate-600">
          Expenses that serve a real purpose — rent, transport, subscriptions — are deducted
          before tax is applied. What's left is taxable income. This is a thought experiment,
          not a tax calculator: income is taxed progressively, and expenses that serve a real
          purpose reduce what you owe. Luxury spending does not.
        </p>

        <p class="text-sm leading-relaxed dark:text-text-secondary text-slate-600">
          The <strong>effective rate</strong> is the share of total income that actually goes
          to tax — lower than the top rate because progressively higher rates only apply to
          the income above each threshold.
        </p>

        <p class="text-[11px] dark:text-text-muted text-slate-400 leading-snug">
          Rates are invented. This does not reflect any real tax system and has no bearing on
          actual financial or legal obligations.
        </p>

        <button
          @click="showInfo = false"
          class="w-full rounded-lg px-4 py-2 text-xs font-medium transition-colors border
                 dark:border-border dark:text-text-secondary dark:hover:bg-surface-card
                 border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          Close
        </button>
      </div>
    </div>
  </Teleport>
</template>
