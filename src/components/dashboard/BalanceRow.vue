<script setup lang="ts">
import { computed } from 'vue'
import type { MoneyResult } from '../../lib/calc'
import AnimatedNumber from '../shared/AnimatedNumber.vue'
import { useStreamStore } from '../../stores/streams'
import { PERIOD_LABELS } from '../../lib/constants'

const store = useStreamStore()

const balance = computed<MoneyResult>(() => store.balance)

const isPositive = computed(() => balance.value.amount >= 0)

const periodLabel = computed(() => PERIOD_LABELS[store.selectedPeriod].toLowerCase())
</script>

<template>
  <div
    class="rounded-xl border px-6 py-5 text-center transition-colors"
    :class="
      isPositive
        ? 'dark:border-income/30 dark:bg-income/5 border-emerald-200 bg-emerald-50'
        : 'dark:border-expense/30 dark:bg-expense/5 border-rose-200 bg-rose-50'
    "
  >
    <div class="text-xs font-medium uppercase tracking-wider mb-1 dark:text-text-secondary text-slate-500">
      Net balance / {{ periodLabel }}
    </div>
    <AnimatedNumber
      :value="balance.amount"
      :precision="balance.precision"
      :currency="balance.currency"
      class="text-2xl font-bold"
      :class="isPositive ? 'text-income' : 'text-expense'"
    />
  </div>
</template>
