<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Product } from '../../lib/types'
import { formatEuro } from '../../composables/useCurrency'
import { VENDOR_MARGIN } from '../../lib/constants'

const props = defineProps<{ product: Product; addedStreamId?: string; highlightedId?: string | null }>()
const router = useRouter()

const isHighlighted = computed(() => props.highlightedId === props.product.id)

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

// ── Calculation breakdown modal ───────────────────────────────────────────

const showCalc = ref(false)

const calcDetails = computed(() => {
  const p = props.product
  if (!p.defaultLifetimeMonths || !p.extendedLifetimeMonths) return null
  const buyResaleAmt = p.price * (p.resaleAtDefaultEnd ?? 0)
  const buyNetCost = p.price - buyResaleAmt
  const buyMonthly = buyNetCost / p.defaultLifetimeMonths

  const r2rResaleAmt = p.price * (p.resaleAtExtendedEnd ?? 0)
  const r2rAmortisation = (p.price - r2rResaleAmt) / p.extendedLifetimeMonths
  const r2rMaintenance = p.maintenancePerMonth ?? 0
  const r2rBase = r2rAmortisation + r2rMaintenance
  const r2rMarginAmt = r2rBase * VENDOR_MARGIN

  return {
    price: p.price,
    buyLifetimeYears: p.defaultLifetimeMonths / 12,
    buyResaleAmt,
    buyResalePct: (p.resaleAtDefaultEnd ?? 0) * 100,
    buyNetCost,
    buyMonthly,
    r2rLifetimeYears: p.extendedLifetimeMonths / 12,
    r2rResaleAmt,
    r2rResalePct: (p.resaleAtExtendedEnd ?? 0) * 100,
    r2rAmortisation,
    r2rMaintenance,
    r2rMarginPct: VENDOR_MARGIN * 100,
    r2rMarginAmt,
    r2rMonthly: r2rMonthly.value,
    savings: savings.value,
    savingsPct: savingsPercent.value,
  }
})
</script>

<template>
  <div
    :id="'product-' + product.id"
    class="rounded-xl border dark:border-border dark:bg-surface-card border-slate-200 bg-white overflow-hidden flex flex-col"
    :class="{ 'stream-highlight': isHighlighted }"
  >

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

      <button
        class="mx-5 mb-4 rounded-md px-3 py-2 text-xs text-center w-[calc(100%-2.5rem)] transition-opacity hover:opacity-80"
        :class="savings > 0.5
          ? 'dark:bg-income/10 bg-emerald-50'
          : 'dark:bg-surface-elevated bg-slate-100'"
        @click="showCalc = true"
      >
        <template v-if="savings > 0.5">
          <span class="font-semibold text-income">{{ formatEuro(savings) }}/mo cheaper than buying</span>
          <span class="dark:text-text-secondary text-slate-500 ml-1">({{ savingsPercent.toFixed(0) }}% less)</span>
          <span class="dark:text-text-muted text-slate-400 ml-1 text-[10px]">· how?</span>
        </template>
        <template v-else>
          <span class="dark:text-text-secondary text-slate-500">
            Minimal saving over buying — ownership works well here
          </span>
          <span class="dark:text-text-muted text-slate-400 ml-1 text-[10px]">· how?</span>
        </template>
      </button>
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
        v-if="!addedStreamId"
        @click="emit('addToStreams', product, streamMonthly)"
        class="w-full rounded-lg py-2 text-xs font-medium transition-colors
               dark:bg-surface-elevated dark:text-text-primary dark:hover:bg-white/10
               bg-slate-100 text-slate-700 hover:bg-slate-200"
      >
        {{ isSubscription ? `Subscribe for ${formatEuro(streamMonthly)}/mo` : `Rent for ${formatEuro(streamMonthly)}/mo` }}
      </button>
      <button
        v-else
        @click="router.push({ path: '/dashboard', query: { highlight: addedStreamId } })"
        class="w-full rounded-lg py-2 text-xs font-medium transition-colors text-center
               dark:bg-income/10 dark:text-income dark:hover:bg-income/20
               bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      >
        Already in your streams →
      </button>
    </div>
  </div>

  <!-- Calculation breakdown modal -->
  <Teleport to="body">
    <div
      v-if="showCalc && calcDetails"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="showCalc = false"
    >
      <div class="w-full max-w-sm rounded-xl border p-6 space-y-4
                  dark:border-border dark:bg-surface-elevated
                  border-slate-200 bg-white">
        <!-- Title -->
        <div>
          <h2 class="text-sm font-semibold dark:text-text-primary text-slate-900">
            Why rental is cheaper
          </h2>
          <p class="mt-0.5 text-xs dark:text-text-muted text-slate-500">
            {{ product.icon }} {{ product.name }}
          </p>
        </div>

        <!-- Why -->
        <p class="text-sm leading-relaxed dark:text-text-secondary text-slate-600">
          When a vendor rents you a device, they only earn while it keeps working.
          A device that fails stops paying rent — so longevity becomes their problem, not yours.
          They have every reason to repair rather than replace, and to build things that last.
          The same device, kept running longer, costs less per month.
        </p>

        <!-- Saving summary -->
        <div v-if="calcDetails.savings > 0.5"
          class="rounded-lg dark:bg-income/10 bg-emerald-50 px-3 py-2.5 text-xs flex justify-between items-center">
          <span class="dark:text-text-secondary text-slate-600">Monthly saving</span>
          <span class="font-mono font-semibold text-income">
            {{ formatEuro(calcDetails.savings) }}/mo ({{ calcDetails.savingsPct.toFixed(0) }}% less)
          </span>
        </div>

        <button
          @click="showCalc = false"
          class="w-full rounded-lg px-4 py-2 text-xs font-medium transition-colors border
                 dark:border-border dark:text-text-secondary dark:hover:bg-surface-card
                 border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          Close
        </button>
      </div>
    </div>
  </Teleport>
</template>
