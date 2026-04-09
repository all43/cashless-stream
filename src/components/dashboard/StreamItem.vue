<script setup lang="ts">
import { computed } from 'vue'
import type { Stream } from '../../lib/types'
import { toPeriod } from '../../lib/calc'
import { useStreamStore } from '../../stores/streams'
import { formatCurrency } from '../../composables/useCurrency'
import AnimatedNumber from '../shared/AnimatedNumber.vue'
import StreamTypeBadge from '../shared/StreamTypeBadge.vue'
import ContractBadge from '../shared/ContractBadge.vue'

const props = defineProps<{
  stream: Stream
  hoveredId?: string | null
}>()

const emit = defineEmits<{
  edit: [stream: Stream]
  hover: [id: string | null]
}>()

const store = useStreamStore()

const convertedValue = computed(() =>
  toPeriod(props.stream.value, props.stream.period, store.selectedPeriod, store.account.currency),
)

/** Annual hint shown on income streams when viewing in monthly mode */
const annualHint = computed(() => {
  if (props.stream.category !== 'income' || store.selectedPeriod !== 'monthly') return null
  return toPeriod(props.stream.value, props.stream.period, 'annual', store.account.currency)
})

const isHovered = computed(() => props.hoveredId === props.stream.id)

const shimmerDelay = computed(() => {
  const hash = props.stream.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return `${(hash % 30) / 10}s`
})

/** Share of this stream's value relative to its column total (0–1) */
const proportion = computed(() => {
  const total =
    props.stream.category === 'income'
      ? store.totalIncome.amount
      : store.totalExpenses.amount
  if (total <= 0 || convertedValue.value.amount <= 0) return 0
  return Math.min(1, convertedValue.value.amount / total)
})
</script>

<template>
  <div
    class="group relative overflow-hidden flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-all cursor-pointer
           dark:hover:bg-white/5 hover:bg-slate-50"
    :class="{ 'dark:!bg-white/10 !bg-slate-100': isHovered }"
    @mouseenter="emit('hover', stream.id)"
    @mouseleave="emit('hover', null)"
    @click="emit('edit', stream)"
  >
    <!-- Flow shimmer -->
    <div class="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
      <div
        class="absolute inset-y-0 w-1/3"
        :style="{
          background: stream.category === 'income'
            ? 'linear-gradient(90deg, transparent, rgba(52,211,153,0.08), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(251,113,133,0.08), transparent)',
          animation: stream.category === 'income'
            ? `shimmer-ltr 4s ease-in-out ${shimmerDelay} infinite`
            : `shimmer-rtl 4s ease-in-out ${shimmerDelay} infinite`,
        }"
      />
    </div>

    <div class="flex items-center gap-3 min-w-0">
      <span class="text-lg shrink-0">{{ stream.icon || '💰' }}</span>
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium truncate dark:text-text-primary text-slate-800">
            {{ stream.title }}
          </span>
          <StreamTypeBadge v-if="stream.type !== 'live'" :type="stream.type" />
          <ContractBadge v-if="stream.contract" :contract="stream.contract" />
          <span v-if="stream.taxDeductible === false"
            class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium
                   dark:bg-amber-500/10 dark:text-amber-400 bg-amber-50 text-amber-700"
            title="Luxury — does not reduce taxable income">
            luxury
          </span>
        </div>
      </div>
    </div>
    <div class="text-right shrink-0">
      <AnimatedNumber
        :value="convertedValue.amount"
        :precision="convertedValue.precision"
        :currency="convertedValue.currency"
        class="text-sm font-semibold"
      />
      <div v-if="annualHint" class="text-[10px] dark:text-text-muted text-slate-400 tabular-nums">
        {{ formatCurrency(annualHint) }}/yr
      </div>
    </div>

    <!-- Proportion bar -->
    <div class="absolute bottom-0 left-0 h-[2px] rounded-full transition-[width] duration-700"
         :style="{ width: `${proportion * 100}%` }"
         :class="stream.category === 'income' ? 'bg-income/30' : 'bg-expense/30'"
    />
  </div>
</template>
