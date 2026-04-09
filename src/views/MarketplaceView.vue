<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStreamStore } from '../stores/streams'
import { products } from '../data/marketplace-products'
import ProductCard from '../components/marketplace/ProductCard.vue'
import ContractAcceptSheet from '../components/dashboard/ContractAcceptSheet.vue'
import ConfirmStreamSheet from '../components/dashboard/ConfirmStreamSheet.vue'
import type { Product, ContractTerms } from '../lib/types'

const store = useStreamStore()
const router = useRouter()
const route = useRoute()
const highlightedProductId = ref<string | null>(null)

onMounted(() => {
  const id = route.query.highlight as string | undefined
  if (!id) return
  history.replaceState(null, '', route.path)
  setTimeout(() => {
    highlightedProductId.value = id
    document.getElementById('product-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => { highlightedProductId.value = null }, 2500)
  }, 250)
})

type PendingContract = { kind: 'contract'; product: Product; monthlyValue: number; contract: ContractTerms }
type PendingSimple = { kind: 'simple'; product: Product; monthlyValue: number }
type Pending = PendingContract | PendingSimple
const pending = ref<Pending | null>(null)

function handleAddToStreams(product: Product, monthlyValue: number) {
  const rounded = Math.round(monthlyValue * 100) / 100
  if (product.contractTemplate) {
    pending.value = {
      kind: 'contract',
      product,
      monthlyValue: rounded,
      contract: { ...product.contractTemplate, startDate: new Date().toISOString().slice(0, 10) },
    }
  } else {
    pending.value = { kind: 'simple', product, monthlyValue: rounded }
  }
}

function commitStream(product: Product, monthlyValue: number, contract?: ContractTerms) {
  const id = store.addStream({
    title: product.name,
    value: monthlyValue,
    period: 'monthly',
    type: product.priceType === 'monthly' ? 'live' : 'projected',
    category: 'expense',
    icon: product.icon,
    sourceProductId: product.id,
    ...(contract ? { contract } : {}),
  })
  router.push({ path: '/dashboard', query: { highlight: id } })
}

function handleConfirm() {
  if (!pending.value) return
  if (pending.value.kind === 'contract') {
    commitStream(pending.value.product, pending.value.monthlyValue, pending.value.contract)
  } else {
    commitStream(pending.value.product, pending.value.monthlyValue)
  }
  pending.value = null
}

function handleCancel() {
  pending.value = null
}

const CATEGORY_META: Record<string, { label: string; description: string }> = {
  electronics: {
    label: 'Electronics',
    description: 'Short replace cycles and fast depreciation. In a rental model, vendor revenue depends on the device lasting — so longevity becomes a business incentive, not just a virtue.',
  },
  appliances: {
    label: 'Appliances',
    description: 'Already designed to last. Rental savings are modest here — which is the honest answer. Ownership works well for durable, low-maintenance goods.',
  },
  transport: {
    label: 'Transport',
    description: 'High upfront cost, predictable depreciation. A vendor managing a maintained fleet across a longer lifetime can undercut the buy-and-replace cycle.',
  },
  services: {
    label: 'Services & Subscriptions',
    description: 'These are already the rental model — the vendor operates the service, you pay the stream. No ownership alternative exists.',
  },
  charity: {
    label: 'Charities',
    description: 'Recurring donations are tax-deductible — they reduce your taxable income and show up in your tax flow in real time.',
  },
}

/** Map from sourceProductId → stream id, for already-added products */
const addedStreamIds = computed(() => {
  const map = new Map<string, string>()
  for (const s of store.account.streams) {
    if (s.sourceProductId) map.set(s.sourceProductId, s.id)
  }
  return map
})

const categories = [...new Set(products.map((p) => p.category))]
</script>

<template>
  <div>
  <ContractAcceptSheet
    v-if="pending?.kind === 'contract'"
    :title="pending.product.name"
    :icon="pending.product.icon"
    :monthly-value="pending.monthlyValue"
    :contract="pending.contract"
    :currency="store.account.currency"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />

  <ConfirmStreamSheet
    v-if="pending?.kind === 'simple'"
    :product="pending.product"
    :monthly-value="pending.monthlyValue"
    :currency="store.account.currency"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />

  <div class="mx-auto max-w-5xl px-4 py-8">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold dark:text-text-primary text-slate-900">
        Rent everything.
      </h1>
      <p class="mt-2 text-sm dark:text-text-secondary text-slate-500 max-w-2xl">
        Browse the catalogue and rent what you need. Prices reflect a vendor-operated model
        where products are maintained and designed to last.
      </p>
    </div>

    <!-- Categories -->
    <div v-for="cat in categories" :key="cat" class="mb-10">
      <div class="mb-4">
        <h2 class="text-sm font-semibold dark:text-text-primary text-slate-800">
          {{ CATEGORY_META[cat]?.label ?? cat }}
        </h2>
        <p class="text-xs dark:text-text-muted text-slate-500 mt-0.5">
          {{ CATEGORY_META[cat]?.description }}
        </p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProductCard
          v-for="product in products.filter(p => p.category === cat)"
          :key="product.id"
          :product="product"
          :added-stream-id="addedStreamIds.get(product.id)"
          :highlighted-id="highlightedProductId"
          @add-to-streams="handleAddToStreams"
        />
      </div>
    </div>
  </div>
  </div>
</template>
