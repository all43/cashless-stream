<script setup lang="ts">
import type { Product } from '../../lib/types'
import { formatCurrency } from '../../composables/useCurrency'

const props = defineProps<{
  product: Product
  monthlyValue: number
  currency: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const isPhysical = props.product.priceType === 'one-time'

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
        <h2 class="text-sm font-semibold dark:text-text-primary text-slate-900">
          {{ isPhysical ? 'Start rental' : 'Subscribe' }}
        </h2>
        <p class="mt-1 text-xs dark:text-text-muted text-slate-500">
          {{ product.icon }} {{ product.name }}
        </p>
      </div>

      <div class="space-y-2 text-xs">
        <div class="flex justify-between">
          <span class="dark:text-text-secondary text-slate-500">Monthly</span>
          <span class="font-mono font-semibold dark:text-text-primary text-slate-800">{{ fmt(monthlyValue) }}</span>
        </div>
        <div class="rounded-lg dark:bg-surface-card/50 bg-slate-50 px-3 py-2 leading-relaxed dark:text-text-secondary text-slate-600">
          <template v-if="isPhysical">
            Device ships within <span class="font-semibold dark:text-text-primary text-slate-800">3 business days</span>.
            No minimum term — cancel anytime and return it.
          </template>
          <template v-else>
            Billed monthly. Cancel anytime — no exit fee.
          </template>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          @click="emit('cancel')"
          class="flex-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors border
                 dark:border-border dark:text-text-secondary dark:hover:bg-surface-card
                 border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          @click="emit('confirm')"
          class="flex-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors
                 bg-income text-slate-900 hover:bg-income/90"
        >
          {{ isPhysical ? 'Rent it' : 'Subscribe' }}
        </button>
      </div>
    </div>
  </div>
</template>
