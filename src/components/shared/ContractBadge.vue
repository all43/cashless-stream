<script setup lang="ts">
import { computed } from 'vue'
import type { ContractTerms } from '../../lib/types'
import { isLocked, monthsRemaining } from '../../lib/contract'

const props = defineProps<{
  contract: ContractTerms
}>()

const locked = computed(() => isLocked(props.contract))
const remaining = computed(() => monthsRemaining(props.contract))
</script>

<template>
  <span
    v-if="locked"
    class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium
           dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20
           bg-amber-50 text-amber-700 border border-amber-200"
    :title="`Locked for ${remaining} more month${remaining !== 1 ? 's' : ''}`"
  >
    <span>🔒</span>
    <span>{{ remaining }}mo</span>
  </span>
  <span
    v-else
    class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium
           dark:bg-surface-card dark:text-text-muted
           bg-slate-100 text-slate-400"
    title="Minimum period complete — free to cancel"
  >
    🔓
  </span>
</template>
