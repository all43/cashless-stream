<script setup lang="ts">
import { computed } from 'vue'
import type { MoneyResult } from '../../lib/calc'
import { formatCurrency } from '../../composables/useCurrency'

const props = defineProps<{
  value: MoneyResult
  colorize?: boolean
}>()

const formatted = computed(() => formatCurrency(props.value))

const colorClass = computed(() => {
  if (!props.colorize) return ''
  return props.value.amount >= 0 ? 'text-income' : 'text-expense'
})
</script>

<template>
  <span class="font-mono tabular-nums" :class="colorClass">
    {{ formatted }}
  </span>
</template>
