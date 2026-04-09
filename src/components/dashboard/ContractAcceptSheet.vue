<script setup lang="ts">
import { computed } from 'vue'
import type { ContractTerms } from '../../lib/types'
import { formatCurrency } from '../../composables/useCurrency'

const props = defineProps<{
  title: string
  icon: string
  monthlyValue: number
  contract: ContractTerms
  currency: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const netFirstMonth = computed(
  () => props.monthlyValue + (props.contract.setupFee ?? 0) - (props.contract.welcomeBonus ?? 0),
)

const totalCommitment = computed(
  () =>
    props.contract.minimumMonths * props.monthlyValue +
    (props.contract.setupFee ?? 0) -
    (props.contract.welcomeBonus ?? 0),
)

function fmt(amount: number) {
  return formatCurrency({ amount, precision: 2, currency: props.currency })
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
    <div
      class="w-full sm:max-w-sm rounded-xl border p-5 sm:p-6 space-y-5
             dark:border-border dark:bg-surface-elevated
             border-slate-200 bg-white"
    >
      <div>
        <h2 class="text-sm font-semibold dark:text-text-primary text-slate-900">Sign contract</h2>
        <p class="mt-1 text-xs dark:text-text-muted text-slate-500">{{ icon }} {{ title }}</p>
      </div>

      <div class="space-y-2 text-xs">
        <div class="flex justify-between">
          <span class="dark:text-text-secondary text-slate-500">Monthly payment</span>
          <span class="font-mono font-medium dark:text-text-primary text-slate-800">{{ fmt(monthlyValue) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="dark:text-text-secondary text-slate-500">Minimum term</span>
          <span class="font-mono font-medium dark:text-text-primary text-slate-800">
            {{ contract.minimumMonths }} months
          </span>
        </div>
        <div v-if="contract.setupFee" class="flex justify-between">
          <span class="dark:text-text-secondary text-slate-500">Setup fee (today)</span>
          <span class="font-mono font-medium text-expense">{{ fmt(contract.setupFee) }}</span>
        </div>
        <div v-if="contract.welcomeBonus" class="flex justify-between">
          <span class="dark:text-text-secondary text-slate-500">Welcome bonus (today)</span>
          <span class="font-mono font-medium text-income">+{{ fmt(contract.welcomeBonus) }}</span>
        </div>

        <div class="border-t dark:border-border border-slate-200 pt-2 space-y-1.5">
          <div class="flex justify-between">
            <span class="dark:text-text-secondary text-slate-500">First month total</span>
            <span class="font-mono font-semibold dark:text-text-primary text-slate-800">
              {{ fmt(netFirstMonth) }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="dark:text-text-secondary text-slate-500">Total commitment</span>
            <span class="font-mono font-semibold dark:text-text-primary text-slate-800">
              {{ fmt(totalCommitment) }}
            </span>
          </div>
        </div>

        <div
          v-if="contract.cancellationFee || contract.cancellationModel === 'remaining-months'"
          class="rounded-lg dark:bg-surface-card/50 bg-slate-50 px-3 py-2 text-[11px] dark:text-text-muted text-slate-500 leading-relaxed"
        >
          <template v-if="contract.cancellationModel === 'flat' && contract.cancellationFee">
            Early exit costs {{ fmt(contract.cancellationFee) }}.
          </template>
          <template v-else>
            Early exit requires paying out remaining months.
          </template>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          @click="emit('cancel')"
          class="flex-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors
                 dark:text-text-secondary dark:hover:bg-surface-card
                 text-slate-500 hover:bg-slate-100"
        >
          Go back
        </button>
        <button
          @click="emit('confirm')"
          class="flex-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors
                 bg-income text-slate-900 hover:bg-income/90"
        >
          Sign &amp; start
        </button>
      </div>
    </div>
  </div>
</template>
