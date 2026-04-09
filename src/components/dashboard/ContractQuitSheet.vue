<script setup lang="ts">
import { computed } from 'vue'
import type { Stream } from '../../lib/types'
import {
  cancellationCost,
  breakEvenMonths,
  monthsRemaining,
  monthlyValue,
} from '../../lib/contract'
import { formatCurrency } from '../../composables/useCurrency'

const props = defineProps<{
  stream: Stream
  currency: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const contract = computed(() => props.stream.contract!)
const monthly = computed(() => monthlyValue(props.stream))
const remaining = computed(() => monthsRemaining(contract.value))
const exitCost = computed(() => cancellationCost(contract.value, props.stream))
const breakEven = computed(() => breakEvenMonths(contract.value, props.stream))
const isRemainingMonths = computed(() => contract.value.cancellationModel === 'remaining-months')

function fmt(amount: number) {
  return formatCurrency({ amount, precision: 2, currency: props.currency })
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
    <div
      class="w-full max-w-sm rounded-xl border p-6 space-y-5
             dark:border-border dark:bg-surface-elevated
             border-slate-200 bg-white"
    >
      <div>
        <h2 class="text-sm font-semibold dark:text-text-primary text-slate-900">Cancel contract</h2>
        <p class="mt-1 text-xs dark:text-text-muted text-slate-500">
          {{ stream.icon }} {{ stream.title }}
        </p>
      </div>

      <div class="space-y-2 text-xs">
        <div class="flex justify-between">
          <span class="dark:text-text-secondary text-slate-500">Months remaining</span>
          <span class="font-mono font-medium dark:text-text-primary text-slate-800">{{ remaining }}</span>
        </div>
        <div class="flex justify-between">
          <span class="dark:text-text-secondary text-slate-500">Monthly relief</span>
          <span class="font-mono font-medium text-income">{{ fmt(monthly) }} stops</span>
        </div>
        <div class="flex justify-between">
          <span class="dark:text-text-secondary text-slate-500">Cost to exit</span>
          <span class="font-mono font-medium" :class="exitCost > 0 ? 'text-expense' : 'dark:text-text-primary text-slate-800'">
            {{ exitCost > 0 ? fmt(exitCost) : 'Free' }}
          </span>
        </div>

        <!-- Flat fee insight -->
        <div
          v-if="!isRemainingMonths && breakEven"
          class="rounded-lg dark:bg-surface-card/50 bg-slate-50 px-3 py-2 leading-relaxed dark:text-text-secondary text-slate-600"
        >
          Staying
          <span class="font-semibold dark:text-text-primary text-slate-800">
            {{ breakEven }} more month{{ breakEven !== 1 ? 's' : '' }}
          </span>
          would cost the same as exiting now. After that, staying is cheaper.
        </div>

        <!-- Remaining-months insight -->
        <div
          v-else-if="isRemainingMonths"
          class="rounded-lg dark:bg-surface-card/50 bg-slate-50 px-3 py-2 leading-relaxed dark:text-text-secondary text-slate-600"
        >
          Exiting now costs the same as staying — you pay the remaining months upfront.
          What you gain is
          <span class="font-semibold dark:text-text-primary text-slate-800">freedom from this stream</span>.
        </div>
      </div>

      <div class="flex gap-2">
        <button
          @click="emit('cancel')"
          class="flex-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors
                 dark:text-text-secondary dark:hover:bg-surface-card
                 text-slate-500 hover:bg-slate-100"
        >
          Stay
        </button>
        <button
          @click="emit('confirm')"
          class="flex-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors
                 bg-expense text-white hover:bg-expense/90"
        >
          Exit contract
        </button>
      </div>
    </div>
  </div>
</template>
