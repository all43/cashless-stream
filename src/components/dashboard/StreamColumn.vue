<script setup lang="ts">
import { computed } from 'vue'
import type { MoneyResult } from '../../lib/calc'
import type { Stream, StreamCategory } from '../../lib/types'
import StreamItem from './StreamItem.vue'
import AnimatedNumber from '../shared/AnimatedNumber.vue'

const props = defineProps<{
  title: string
  streams: Stream[]
  total: MoneyResult
  category: StreamCategory
  hoveredId?: string | null
}>()

const emit = defineEmits<{
  edit: [stream: Stream]
  add: []
  hover: [id: string | null]
}>()

const borderColor = computed(() =>
  props.category === 'income' ? 'border-income/30' : 'border-expense/30',
)

const accentColor = computed(() =>
  props.category === 'income' ? 'text-income' : 'text-expense',
)
</script>

<template>
  <div
    class="flex flex-col rounded-xl border dark:bg-surface-card dark:border-border bg-white border-slate-200"
    :class="borderColor"
  >
    <!-- Header -->
    <div class="flex items-center justify-between border-b px-4 py-3 dark:border-border border-slate-200">
      <h2 class="text-sm font-semibold uppercase tracking-wider" :class="accentColor">
        {{ title }}
      </h2>
      <button
        @click="emit('add')"
        class="rounded-md px-2 py-1 text-xs font-medium transition-colors
               dark:text-text-muted dark:hover:text-text-primary dark:hover:bg-surface-elevated
               text-slate-500 hover:text-slate-700 hover:bg-slate-100"
      >
        + Add
      </button>
    </div>

    <!-- Items -->
    <div class="flex-1 divide-y dark:divide-border/50 divide-slate-100 px-1 py-1">
      <StreamItem
        v-for="stream in streams"
        :key="stream.id"
        :stream="stream"
        :hovered-id="hoveredId"
        @edit="emit('edit', $event)"
        @hover="emit('hover', $event)"
      />
      <div
        v-if="streams.length === 0"
        class="px-3 py-6 text-center text-sm dark:text-text-muted text-slate-500"
      >
        No streams yet
      </div>
    </div>

    <!-- Subtotal -->
    <div class="flex items-center justify-between border-t px-4 py-3 dark:border-border border-slate-200">
      <span class="text-xs font-medium uppercase tracking-wider dark:text-text-muted text-slate-500">
        Subtotal
      </span>
      <AnimatedNumber
        :value="total.amount"
        :precision="total.precision"
        :currency="total.currency"
        class="text-sm font-bold"
        :class="accentColor"
      />
    </div>
  </div>
</template>
