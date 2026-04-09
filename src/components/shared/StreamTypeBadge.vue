<script setup lang="ts">
import { computed } from 'vue'
import type { StreamType } from '../../lib/types'

const props = defineProps<{
  type: StreamType
}>()

const badgeConfig = computed(() => {
  switch (props.type) {
    case 'live':
      return { label: 'Live', class: 'bg-income-dim/40 text-income', title: '' }
    case 'projected':
      return { label: 'Projected', class: 'bg-amber-900/40 text-balance-negative', title: '' }
    case 'bridged':
      return { label: 'Bridged', class: 'bg-sky-900/40 text-balance-positive', title: 'Real-world service with monthly payments routed via cashless.stream — discrete payments visualised as a continuous flow' }
  }
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
    :class="badgeConfig.class"
    :title="badgeConfig.title || undefined"
  >
    {{ badgeConfig.label }}
  </span>
</template>
