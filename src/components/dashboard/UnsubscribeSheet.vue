<script setup lang="ts">
import type { Stream } from '../../lib/types'
import { formatCurrency } from '../../composables/useCurrency'
import { monthlyValue } from '../../lib/contract'

const props = defineProps<{
  stream: Stream
  currency: string
  isPhysical?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

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
        <h2 class="text-sm font-semibold dark:text-text-primary text-slate-900">
          {{ isPhysical ? 'Return device' : 'Unsubscribe' }}
        </h2>
        <p class="mt-1 text-xs dark:text-text-muted text-slate-500">
          {{ stream.icon }} {{ stream.title }}
        </p>
      </div>

      <div class="space-y-2 text-xs">
        <div class="flex justify-between">
          <span class="dark:text-text-secondary text-slate-500">Monthly saving</span>
          <span class="font-mono font-medium text-income">{{ fmt(monthlyValue(stream)) }} freed</span>
        </div>
        <div class="rounded-lg dark:bg-surface-card/50 bg-slate-50 px-3 py-2 leading-relaxed dark:text-text-secondary text-slate-600">
          <template v-if="isPhysical">
            Return the device within <span class="font-semibold dark:text-text-primary text-slate-800">3 business days</span>.
            If not received by then, the rental automatically resumes.
          </template>
          <template v-else>
            No contract — you can leave anytime. This stream will be removed immediately.
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
          Keep
        </button>
        <button
          @click="emit('confirm')"
          class="flex-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors
                 bg-expense text-white hover:bg-expense/90"
        >
          {{ isPhysical ? 'Return & cancel' : 'Unsubscribe' }}
        </button>
      </div>
    </div>
  </div>
</template>
