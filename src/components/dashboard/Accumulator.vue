<script setup lang="ts">
import { computed } from 'vue'
import { useTick } from '../../composables/useTick'
import { useStreamStore } from '../../stores/streams'
import { totalStreams } from '../../lib/calc'
import { formatCurrency } from '../../composables/useCurrency'

const store = useStreamStore()
const { elapsed } = useTick()

const incomePerMs = computed(() =>
  totalStreams(store.incomeStreams, 'everySecond', store.account.currency).amount / 1000,
)

const expensePerMs = computed(() =>
  totalStreams(store.expenseStreams, 'everySecond', store.account.currency).amount / 1000,
)

const balancePerMs = computed(() => incomePerMs.value - expensePerMs.value)

const accumulatedIncome = computed(() => ({
  amount: incomePerMs.value * elapsed.value,
  precision: 8,
  currency: store.account.currency,
}))

const accumulatedExpense = computed(() => ({
  amount: expensePerMs.value * elapsed.value,
  precision: 8,
  currency: store.account.currency,
}))

const accumulatedBalance = computed(() => ({
  amount: balancePerMs.value * elapsed.value,
  precision: 8,
  currency: store.account.currency,
}))

const isPositive = computed(() => accumulatedBalance.value.amount >= 0)
const isEmpty = computed(
  () => store.incomeStreams.length === 0 && store.expenseStreams.length === 0,
)
</script>

<template>
  <div class="rounded-xl border dark:border-border dark:bg-surface-card border-slate-200 bg-white p-4">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-xs font-semibold uppercase tracking-wider dark:text-text-secondary text-slate-500">
        Since you opened this page
      </h3>
      <span v-if="!isEmpty" class="text-[10px] font-mono dark:text-text-muted text-slate-500">
        {{ (elapsed / 1000).toFixed(1) }}s
      </span>
    </div>

    <template v-if="isEmpty">
      <p class="text-xs dark:text-text-muted text-slate-400 mt-4">
        Waiting for streams…
      </p>
    </template>
    <template v-else>
      <!-- Accumulated balance — the hero -->
      <div class="font-mono text-2xl font-bold tabular-nums"
           :class="isPositive ? 'text-income' : 'text-expense'">
        {{ formatCurrency(accumulatedBalance) }}
      </div>

      <!-- Secondary: earned vs spent -->
      <div class="mt-2 flex gap-4 text-[11px] font-mono tabular-nums">
        <span class="text-income">+{{ formatCurrency(accumulatedIncome) }} earned</span>
        <span class="text-expense">−{{ formatCurrency(accumulatedExpense) }} spent</span>
      </div>
    </template>
  </div>
</template>
