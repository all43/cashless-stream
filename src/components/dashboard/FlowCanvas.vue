<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useStreamStore } from '../../stores/streams'
import { totalStreams, toPeriod } from '../../lib/calc'
import type { Stream } from '../../lib/types'

const props = defineProps<{
  hoveredId?: string | null
}>()

const store = useStreamStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId = 0
let particles: Particle[] = []
let cssWidth = 0
let cssHeight = 0
let smoothEquilibriumX = -1
let resizeObserver: ResizeObserver | null = null

// Fractional spawn accumulators — ensures ratio matches rate ratio exactly
let incomeAcc = 0
let expenseAcc = 0
const SPAWN_RATE = 1.0 // total particles per frame, split by income/expense ratio

interface Particle {
  x: number
  y: number
  vx: number
  size: number
  opacity: number
  isIncome: boolean
  streamId: string | null
}

const incomeRate = computed(() =>
  totalStreams(store.incomeStreams, 'everySecond', store.account.currency).amount,
)
const expenseRate = computed(() =>
  totalStreams(store.expenseStreams, 'everySecond', store.account.currency).amount,
)

/** Pick a stream weighted by its per-second value — bigger streams emit more particles */
function weightedRandom(streams: Stream[]): Stream | null {
  if (streams.length === 0) return null
  const rates = streams.map((s) => toPeriod(s.value, s.period, 'everySecond').amount)
  const total = rates.reduce((a, b) => a + b, 0)
  if (total <= 0) return streams[Math.floor(Math.random() * streams.length)]
  let r = Math.random() * total
  for (let i = 0; i < streams.length; i++) {
    r -= rates[i]
    if (r <= 0) return streams[i]
  }
  return streams[streams.length - 1]
}

function spawnParticle(side: 'income' | 'expense', stream: Stream | null) {
  const isIncome = side === 'income'
  const total = incomeRate.value + expenseRate.value || 1
  const incomeRatio = incomeRate.value / total

  // Dominant side is slightly faster
  const speed = isIncome
    ? 1.8 + incomeRatio * 2 + Math.random() * 0.8
    : 1.8 + (1 - incomeRatio) * 2 + Math.random() * 0.8

  // Size proportional to stream's share of its side (sqrt for perceptual area scaling)
  let sizeFactor = 1
  if (stream) {
    const sideRate = isIncome ? incomeRate.value : expenseRate.value
    if (sideRate > 0) {
      const streamRate = toPeriod(stream.value, stream.period, 'everySecond').amount
      sizeFactor = Math.max(0.3, Math.min(2.8, Math.sqrt(streamRate / sideRate) * 3))
    }
  }

  particles.push({
    x: isIncome ? 0 : cssWidth,
    y: Math.random() * cssHeight * 0.8 + cssHeight * 0.1,
    vx: isIncome ? speed : -speed,
    size: (0.8 + Math.random()) * sizeFactor,
    opacity: 0,
    isIncome,
    streamId: stream?.id ?? null,
  })
}

function animate() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const total = incomeRate.value + expenseRate.value
  const incomeRatio = total > 0 ? incomeRate.value / total : 0.5
  const expenseRatio = 1 - incomeRatio
  const isPositive = incomeRate.value >= expenseRate.value

  // Snap on first frame, lerp after
  const targetEquilibriumX = cssWidth * incomeRatio
  if (smoothEquilibriumX < 0) smoothEquilibriumX = targetEquilibriumX
  smoothEquilibriumX += (targetEquilibriumX - smoothEquilibriumX) * 0.018

  ctx.clearRect(0, 0, cssWidth, cssHeight)

  // Equilibrium line
  const imbalance = Math.abs(incomeRatio - 0.5) * 2
  const lineAlpha = 0.12 + imbalance * 0.25
  ctx.strokeStyle = isPositive
    ? `rgba(52, 211, 153, ${lineAlpha})`
    : `rgba(251, 113, 133, ${lineAlpha})`
  ctx.lineWidth = 1 + imbalance
  ctx.setLineDash([3, 5])
  ctx.beginPath()
  ctx.moveTo(smoothEquilibriumX, 0)
  ctx.lineTo(smoothEquilibriumX, cssHeight)
  ctx.stroke()
  ctx.setLineDash([])

  // Accumulator spawn — ratio exactly tracks income/expense ratio
  incomeAcc += incomeRatio * SPAWN_RATE
  expenseAcc += expenseRatio * SPAWN_RATE

  while (incomeAcc >= 1) {
    incomeAcc -= 1
    spawnParticle('income', weightedRandom(store.incomeStreams))
  }
  while (expenseAcc >= 1) {
    expenseAcc -= 1
    spawnParticle('expense', weightedRandom(store.expenseStreams))
  }

  // Update and draw
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx

    const travelDist = p.isIncome ? smoothEquilibriumX : cssWidth - smoothEquilibriumX
    const distTraveled = p.isIncome ? p.x : cssWidth - p.x
    const distToEquilibrium = p.isIncome ? smoothEquilibriumX - p.x : p.x - smoothEquilibriumX

    if (distTraveled < travelDist * 0.15) {
      p.opacity = Math.min(p.opacity + 0.05, 0.85)
    } else {
      const fadeZone = travelDist * 0.35
      if (distToEquilibrium < fadeZone) {
        p.opacity = Math.max((distToEquilibrium / fadeZone) * 0.85, 0)
      }
    }

    if (
      (p.isIncome && p.x > smoothEquilibriumX + 4) ||
      (!p.isIncome && p.x < smoothEquilibriumX - 4)
    ) {
      particles.splice(i, 1)
      continue
    }

    const isHighlighted = props.hoveredId != null && p.streamId === props.hoveredId
    const alpha = isHighlighted ? Math.min(p.opacity * 2, 1) : p.opacity
    const size = isHighlighted ? p.size * 1.8 : p.size

    ctx.beginPath()
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
    ctx.fillStyle = p.isIncome
      ? `rgba(52, 211, 153, ${alpha})`
      : `rgba(251, 113, 133, ${alpha})`
    ctx.fill()

    if (isHighlighted) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2)
      ctx.fillStyle = p.isIncome
        ? `rgba(52, 211, 153, ${alpha * 0.15})`
        : `rgba(251, 113, 133, ${alpha * 0.15})`
      ctx.fill()
    }
  }

  if (particles.length > 300) particles = particles.slice(-200)

  animationId = requestAnimationFrame(animate)
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  cssWidth = rect.width
  cssHeight = rect.height
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  const ctx = canvas.getContext('2d')
  if (ctx) ctx.scale(dpr, dpr)
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`
  smoothEquilibriumX = -1
}

onMounted(() => {
  const canvas = canvasRef.value
  if (canvas) {
    resizeObserver = new ResizeObserver(() => resizeCanvas())
    resizeObserver.observe(canvas)
  }
  window.addEventListener('resize', resizeCanvas)
  animationId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  resizeObserver?.disconnect()
  resizeObserver = null
  window.removeEventListener('resize', resizeCanvas)
  particles = []
})
</script>

<template>
  <div class="rounded-xl border dark:border-border dark:bg-surface-card border-slate-200 bg-white overflow-hidden">
    <canvas ref="canvasRef" class="w-full h-40" />
  </div>
</template>
