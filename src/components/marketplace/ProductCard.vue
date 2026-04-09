<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '../../lib/types'
import { formatEuro } from '../../composables/useCurrency'
import { VENDOR_MARGIN } from '../../lib/constants'

const props = defineProps<{ product: Product; isAdded?: boolean }>()

const emit = defineEmits<{
  addToStreams: [product: Product, monthlyValue: number]
}>()

const isSubscription = computed(() => props.product.priceType === 'monthly')

// ── Physical product calculations ─────────────────────────────────────────

/** What you effectively pay per month buying and replacing on the default cycle */
const buyCycleMonthly = computed(() => {
  const p = props.product
  if (!p.defaultLifetimeMonths) return 0
  const resale = p.price * (p.resaleAtDefaultEnd ?? 0)
  return (p.price - resale) / p.defaultLifetimeMonths
})

/** What a vendor could charge per month under Right to Repair rental model */
const r2rMonthly = computed(() => {
  const p = props.product
  if (!p.extendedLifetimeMonths) return 0
  const resale = p.price * (p.resaleAtExtendedEnd ?? 0)
  const amortisation = (p.price - resale) / p.extendedLifetimeMonths
  return (amortisation + (p.maintenancePerMonth ?? 0)) * (1 + VENDOR_MARGIN)
})

const savings = computed(() => buyCycleMonthly.value - r2rMonthly.value)
const savingsPercent = computed(() =>
  buyCycleMonthly.value > 0 ? (savings.value / buyCycleMonthly.value) * 100 : 0,
)

// ── Subscription calculations ─────────────────────────────────────────────

const dailyCost = computed(() => props.product.price / 30)
const perSecondCost = computed(() => dailyCost.value / 86400)

// ── Stream value to add ───────────────────────────────────────────────────

const streamMonthly = computed(() =>
  isSubscription.value ? props.product.price : r2rMonthly.value,
)
</script>

<template>
  <div class="rounded-xl border dark:border-border dark:bg-surface-card border-slate-200 bg-white overflow-hidden flex flex-col">

    <!-- Header -->
    <div class="px-5 pt-5 pb-4">
      <div class="flex items-start gap-3">
        <span class="text-3xl leading-none mt-0.5">{{ product.icon }}</span>
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold dark:text-text-primary text-slate-800 leading-snug">
            {{ product.name }}
          </h3>
          <div class="flex items-center gap-1.5 flex-wrap mt-0.5">
            <span class="text-xs dark:text-text-muted text-slate-500 capitalize">{{ product.category }}</span>
          </div>
        </div>
        <div class="text-right shrink-0">
          <div class="text-sm font-mono font-semibold dark:text-text-secondary text-slate-600">
            {{ formatEuro(product.price) }}
          </div>
          <div class="text-[10px] dark:text-text-muted text-slate-400">
            {{ isSubscription ? '/month' : 'ref. price' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Physical: rental price as hero -->
    <template v-if="!isSubscription">
      <div class="mx-5 mb-3 rounded-lg px-4 py-4 text-center dark:bg-surface-elevated/40 bg-slate-50">
        <div class="text-[10px] font-medium uppercase tracking-wider mb-2 dark:text-text-muted text-slate-500">
          Rental
        </div>
        <div class="font-mono text-2xl font-bold dark:text-text-primary text-slate-900">
          {{ formatEuro(r2rMonthly) }}
        </div>
        <div class="text-[10px] dark:text-text-muted text-slate-400 mt-1">
          /month · swap anytime
        </div>
      </div>

      <div
        class="mx-5 mb-4 rounded-md px-3 py-2 text-xs text-center"
        :class="savings > 0.5
          ? 'dark:bg-income/10 bg-emerald-50'
          : 'dark:bg-surface-elevated bg-slate-100'"
      >
        <template v-if="savings > 0.5">
          <span class="font-semibold text-income">{{ formatEuro(savings) }}/mo cheaper than buying</span>
          <span class="dark:text-text-secondary text-slate-500 ml-1">({{ savingsPercent.toFixed(0) }}% less)</span>
        </template>
        <template v-else>
          <span class="dark:text-text-secondary text-slate-500">
            Minimal saving over buying — ownership works well here
          </span>
        </template>
      </div>
    </template>

    <!-- Subscription: already a stream -->
    <template v-else>
      <div class="mx-5 mb-3 rounded-lg dark:bg-surface-elevated/40 bg-slate-50 px-4 py-3">
        <div class="text-[10px] font-medium uppercase tracking-wider mb-2 dark:text-text-muted text-slate-500">
          Subscription
        </div>
        <div class="flex justify-around text-center">
          <div>
            <div class="font-mono text-sm font-bold dark:text-text-primary text-slate-800">
              {{ formatEuro(dailyCost) }}
            </div>
            <div class="text-[10px] dark:text-text-muted text-slate-500">/day</div>
          </div>
          <div>
            <div class="font-mono text-xs font-bold dark:text-text-primary text-slate-800">
              {{ formatEuro(perSecondCost, 8) }}
            </div>
            <div class="text-[10px] dark:text-text-muted text-slate-500">/second</div>
          </div>
        </div>
      </div>
      <div class="mx-5 mb-4 rounded-md px-3 py-2 text-xs dark:bg-surface-elevated bg-slate-100 text-center">
        <span class="dark:text-text-secondary text-slate-600">
          Billed monthly, cancel anytime
        </span>
      </div>
    </template>

    <!-- CTA -->
    <div class="px-5 pb-5 mt-auto">
      <button
        v-if="!isAdded"
        @click="emit('addToStreams', product, streamMonthly)"
        class="w-full rounded-lg py-2 text-xs font-medium transition-colors
               dark:bg-surface-elevated dark:text-text-primary dark:hover:bg-white/10
               bg-slate-100 text-slate-700 hover:bg-slate-200"
      >
        {{ isSubscription ? `Subscribe for ${formatEuro(streamMonthly)}/mo` : `Rent for ${formatEuro(streamMonthly)}/mo` }}
      </button>
      <div
        v-else
        class="w-full rounded-lg py-2 text-xs font-medium text-center
               dark:bg-income/10 dark:text-income bg-emerald-50 text-emerald-700"
      >
        Already in your streams
      </div>
    </div>
  </div>
</template>
