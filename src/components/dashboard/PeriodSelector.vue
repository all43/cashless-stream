<script setup lang="ts">
import { useStreamStore } from '../../stores/streams'
import { PERIOD_LABELS } from '../../lib/constants'
import type { Period } from '../../lib/types'

const store = useStreamStore()

const periods = Object.entries(PERIOD_LABELS) as [Period, string][]
</script>

<template>
  <div class="flex items-center gap-2">
    <label class="text-sm dark:text-text-secondary text-slate-500">Per</label>
    <div class="flex gap-1">
      <button
        v-for="[key, label] in periods"
        :key="key"
        @click="store.selectedPeriod = key"
        class="rounded-md px-2.5 py-1 text-xs font-medium transition-all
               dark:text-text-secondary dark:hover:text-text-primary
               text-slate-500 hover:text-slate-800"
        :class="{
          'dark:!bg-surface-elevated dark:!text-text-primary !bg-slate-200 !text-slate-900 shadow-sm':
            store.selectedPeriod === key,
        }"
      >
        {{ label }}
      </button>
    </div>
  </div>
</template>
