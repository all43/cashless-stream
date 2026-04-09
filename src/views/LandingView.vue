<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStreamStore } from '../stores/streams'
import { totalStreams } from '../lib/calc'
import { formatCurrency } from '../composables/useCurrency'

const store = useStreamStore()

// Animated per-second counter
const elapsed = ref(0)
let rafId = 0
let lastTime = 0

function tick(time: number) {
  if (lastTime > 0) {
    elapsed.value += time - lastTime
  }
  lastTime = time
  rafId = requestAnimationFrame(tick)
}

onMounted(() => {
  rafId = requestAnimationFrame(tick)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
})

const perSecondIncome = computed(() =>
  totalStreams(store.incomeStreams, 'everySecond', store.account.currency),
)

const perSecondExpense = computed(() =>
  totalStreams(store.expenseStreams, 'everySecond', store.account.currency),
)

const perSecondNet = computed(() => ({
  amount: perSecondIncome.value.amount - perSecondExpense.value.amount,
  precision: 8,
  currency: store.account.currency,
}))

const isPositive = computed(() => perSecondNet.value.amount >= 0)

/** 0–100: how much of total flow is income */
const incomePercent = computed(() => {
  const total = perSecondIncome.value.amount + perSecondExpense.value.amount
  if (total <= 0) return 50
  return Math.round((perSecondIncome.value.amount / total) * 100)
})

const accumulatedNet = computed(() => ({
  amount: perSecondNet.value.amount * (elapsed.value / 1000),
  precision: 8,
  currency: store.account.currency,
}))

const concepts = [
  {
    icon: '💸',
    title: 'Everything Flows',
    desc: 'Salary, rent, subscriptions — all visualized as continuous per-second streams instead of discrete monthly payments.',
  },
  {
    icon: '📱',
    title: 'Products as Subscriptions',
    desc: 'That €1,199 smartphone? It\'s really €49.96/month over 2 years. See the true cost of ownership.',
  },
  {
    icon: '🔧',
    title: 'Right to Repair',
    desc: 'Vendors currently profit from short replacement cycles. If they rented out instead of sold, longevity becomes revenue — not a cost. Right to Repair legislation is what makes that shift viable.',
  },
  {
    icon: '📊',
    title: 'Real-time Taxation',
    desc: 'Tax as a continuous flow based on your income stream, not a yearly surprise. Transparent and predictable.',
  },
]
</script>

<template>
  <div class="min-h-[calc(100vh-3.5rem)]">
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <!-- Background grid -->
      <div class="absolute inset-0 dark:opacity-30 opacity-10"
           style="background-image: linear-gradient(rgba(148,163,184,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(148,163,184,0.1) 1px, transparent 1px);
                  background-size: 40px 40px;" />

      <div class="relative mx-auto max-w-4xl px-4 py-24 md:py-36 text-center">
        <!-- Eyebrow -->
        <div class="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5
                    dark:border-border dark:bg-surface-card/50 border-slate-200 bg-white/50
                    text-xs font-medium dark:text-text-secondary text-slate-500">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-income animate-pulse" />
          Concept Demo
        </div>

        <!-- Main headline -->
        <h1 class="text-4xl md:text-6xl font-bold tracking-tight leading-tight
                    dark:text-text-primary text-slate-900">
          Money doesn't arrive.<br />
          <span class="text-income">It flows.</span>
        </h1>

        <p class="mt-6 text-lg md:text-xl max-w-2xl mx-auto dark:text-text-secondary text-slate-500">
          What if we replaced discrete payments with continuous streams?
          Your salary, rent, and even your smartphone — all flowing in real time.
        </p>

        <!-- Live balance scale -->
        <div class="mt-10 w-full max-w-sm mx-auto flex flex-col items-center gap-4">

          <!-- In / Out labels -->
          <div class="flex justify-between w-full text-xs font-mono">
            <span class="text-income">
              ↑ {{ formatCurrency(perSecondIncome) }}/s
            </span>
            <span class="text-expense">
              ↓ {{ formatCurrency(perSecondExpense) }}/s
            </span>
          </div>

          <!-- Balance bar -->
          <div class="w-full h-1.5 rounded-full dark:bg-expense/25 bg-rose-100 overflow-hidden">
            <div
              class="h-full bg-income rounded-full transition-[width] duration-700"
              :style="{ width: `${incomePercent}%` }"
            />
          </div>

          <!-- Net flow -->
          <div class="text-center">
            <div class="text-[10px] font-medium uppercase tracking-wider dark:text-text-muted text-slate-500 mb-1">
              Net flow per second
            </div>
            <div
              class="font-mono text-3xl md:text-5xl font-bold tracking-tight tabular-nums"
              :class="isPositive ? 'text-income' : 'text-expense'"
            >
              {{ formatCurrency(perSecondNet) }}
            </div>
          </div>

          <!-- Accumulated -->
          <div class="w-full rounded-lg border px-5 py-3 text-center
                      dark:border-border dark:bg-surface-card/50 border-slate-200 bg-white/50">
            <div class="text-[10px] font-medium uppercase tracking-wider mb-1 dark:text-text-muted text-slate-500">
              Since you opened this page
            </div>
            <div
              class="font-mono text-xl font-bold tabular-nums"
              :class="accumulatedNet.amount >= 0 ? 'text-income' : 'text-expense'"
            >
              {{ formatCurrency(accumulatedNet) }}
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="mt-10 flex flex-wrap gap-3 justify-center">
          <router-link
            to="/dashboard"
            class="rounded-lg px-6 py-3 text-sm font-medium transition-colors
                   bg-income text-slate-900 hover:bg-income/90 shadow-lg shadow-income/20"
          >
            Explore your streams
          </router-link>
          <router-link
            to="/marketplace"
            class="rounded-lg px-6 py-3 text-sm font-medium transition-colors border
                   dark:border-border dark:text-text-primary dark:hover:bg-surface-elevated
                   border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Visit Marketplace
          </router-link>
        </div>
      </div>
    </section>

    <!-- Concept cards -->
    <section class="mx-auto max-w-5xl px-4 pb-24">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="concept in concepts"
          :key="concept.title"
          class="rounded-xl border p-6 transition-colors
                 dark:border-border dark:bg-surface-card dark:hover:bg-surface-elevated
                 border-slate-200 bg-white hover:bg-slate-50"
        >
          <span class="text-2xl">{{ concept.icon }}</span>
          <h3 class="mt-3 text-sm font-semibold dark:text-text-primary text-slate-800">
            {{ concept.title }}
          </h3>
          <p class="mt-1 text-sm leading-relaxed dark:text-text-secondary text-slate-500">
            {{ concept.desc }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
