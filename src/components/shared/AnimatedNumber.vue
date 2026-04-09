<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

const props = withDefaults(
  defineProps<{
    value: number
    precision?: number
    duration?: number
    currency?: string
  }>(),
  {
    precision: 2,
    duration: 0.6,
    currency: 'EUR',
  },
)

const displayValue = ref(0)
let tween: gsap.core.Tween | null = null

function format(val: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: props.currency,
    minimumFractionDigits: Math.min(props.precision, 8),
    maximumFractionDigits: Math.max(props.precision, 2),
  }).format(val)
}

watch(
  () => props.value,
  (newVal) => {
    tween?.kill()
    tween = gsap.to(displayValue, {
      value: newVal,
      duration: props.duration,
      ease: 'power2.out',
    })
  },
)

onMounted(() => {
  displayValue.value = props.value
})

onUnmounted(() => {
  tween?.kill()
})
</script>

<template>
  <span class="font-mono tabular-nums">{{ format(displayValue) }}</span>
</template>
