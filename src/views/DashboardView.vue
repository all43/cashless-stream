<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStreamStore } from '../stores/streams'
import { blankScenario, featuredScenarios, moreScenarios, alternativeScenarios } from '../data/scenarios'
import PeriodSelector from '../components/dashboard/PeriodSelector.vue'
import StreamColumn from '../components/dashboard/StreamColumn.vue'
import BalanceRow from '../components/dashboard/BalanceRow.vue'
import Accumulator from '../components/dashboard/Accumulator.vue'
import FlowCanvas from '../components/dashboard/FlowCanvas.vue'
import StreamItemForm from '../components/dashboard/StreamItemForm.vue'
import ContractAcceptSheet from '../components/dashboard/ContractAcceptSheet.vue'
import ContractQuitSheet from '../components/dashboard/ContractQuitSheet.vue'
import UnsubscribeSheet from '../components/dashboard/UnsubscribeSheet.vue'
import TaxBadge from '../components/marketplace/TaxBadge.vue'
import type { Stream, StreamCategory, StreamType, Period, ContractTerms } from '../lib/types'
import { toPeriod } from '../lib/calc'
import { isLocked } from '../lib/contract'
import { products } from '../data/marketplace-products'

const store = useStreamStore()
const route = useRoute()
const router = useRouter()
const hoveredStreamId = ref<string | null>(null)
const highlightedId = ref<string | null>(null)

onMounted(() => {
  const id = route.query.highlight as string | undefined
  if (!id) return
  history.replaceState(null, '', route.path)
  setTimeout(() => {
    highlightedId.value = id
    document.getElementById('stream-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => { highlightedId.value = null }, 2500)
  }, 250)
})

// Form state
const showForm = ref(false)
const formCategory = ref<StreamCategory>('income')
const editingStream = ref<Stream | null>(null)

// Contract sheet state
type PendingStream = { title: string; value: number; period: Period; type: StreamType; category: StreamCategory; icon: string; contract: ContractTerms }
const pendingStream = ref<PendingStream | null>(null)
const quitStream = ref<Stream | null>(null)
const unsubscribeStream = ref<Stream | null>(null)

function handleEdit(stream: Stream) {
  editingStream.value = stream
  formCategory.value = stream.category
  showForm.value = true
}

function handleAdd(category: StreamCategory) {
  editingStream.value = null
  formCategory.value = category
  showForm.value = true
}

function handleSave(data: { title: string; value: number; period: Period; type: StreamType; category: StreamCategory; icon: string; contract?: ContractTerms }) {
  if (editingStream.value) {
    store.updateStream(editingStream.value.id, data)
    showForm.value = false
    editingStream.value = null
    return
  }
  // New expense stream with contract terms → show accept sheet first
  if (!editingStream.value && data.category === 'expense' && data.contract) {
    pendingStream.value = data as PendingStream
    showForm.value = false
    return
  }
  store.addStream(data)
  showForm.value = false
  editingStream.value = null
}

function handleAcceptConfirm() {
  if (pendingStream.value) {
    store.addStream(pendingStream.value)
  }
  pendingStream.value = null
}

function handleAcceptCancel() {
  pendingStream.value = null
  showForm.value = true  // reopen form so user doesn't lose their input
}

function handleQuit(stream: Stream) {
  showForm.value = false
  editingStream.value = null
  if (stream.contract && isLocked(stream.contract)) {
    quitStream.value = stream
  } else {
    unsubscribeStream.value = stream
  }
}

function handleQuitConfirm() {
  if (quitStream.value) {
    store.removeStream(quitStream.value.id)
  }
  quitStream.value = null
}

function handleDelete(id: string) {
  store.removeStream(id)
  showForm.value = false
  editingStream.value = null
}

function handleCancel() {
  showForm.value = false
  editingStream.value = null
}

function handleGoToProduct(productId: string) {
  showForm.value = false
  editingStream.value = null
  router.push({ path: '/marketplace', query: { highlight: productId } })
}
</script>

<template>
  <div>
  <div class="mx-auto max-w-5xl px-4 py-8">
    <!-- Controls bar -->
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <PeriodSelector />

      <div class="flex items-center gap-4">
        <!-- Scenario selector -->
        <select
          value=""
          @change="store.loadScenario(($event.target as HTMLSelectElement).value)"
          class="rounded-md border px-2 py-1 text-xs
                 dark:border-border dark:bg-surface-card dark:text-text-secondary
                 border-slate-300 bg-white text-slate-600"
        >
          <option value="" disabled>Switch scenario…</option>
          <option :value="blankScenario.name">{{ blankScenario.name }}</option>
          <optgroup label="Featured">
            <option v-for="s in featuredScenarios" :key="s.name" :value="s.name">
              {{ s.name }}
            </option>
          </optgroup>
          <optgroup label="More">
            <option v-for="s in moreScenarios" :key="s.name" :value="s.name">
              {{ s.name }}
            </option>
          </optgroup>
          <optgroup label="Alternative Income">
            <option v-for="s in alternativeScenarios" :key="s.name" :value="s.name">
              {{ s.name }}
            </option>
          </optgroup>
        </select>

        <label class="flex items-center gap-2 text-sm cursor-pointer dark:text-text-secondary text-slate-500">
          <input type="checkbox" v-model="store.showProjections" class="rounded accent-income" />
          Projections
        </label>
        <label class="flex items-center gap-2 text-sm cursor-pointer dark:text-text-secondary text-slate-500">
          <input type="checkbox" v-model="store.showVisualization" class="rounded accent-income" />
          Flow
        </label>

        <button
          @click="store.reset()"
          class="rounded-md px-2 py-1 text-xs font-medium transition-colors
                 dark:text-text-muted dark:hover:text-text-secondary
                 text-slate-500 hover:text-slate-600"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Contract accept sheet -->
    <ContractAcceptSheet
      v-if="pendingStream"
      :title="pendingStream.title"
      :icon="pendingStream.icon"
      :monthly-value="toPeriod(pendingStream.value, pendingStream.period, 'monthly').amount"
      :contract="pendingStream.contract"
      :currency="store.account.currency"
      @confirm="handleAcceptConfirm"
      @cancel="handleAcceptCancel"
    />

    <!-- Contract quit sheet -->
    <ContractQuitSheet
      v-if="quitStream"
      :stream="quitStream"
      :currency="store.account.currency"
      @confirm="handleQuitConfirm"
      @cancel="quitStream = null"
    />

    <!-- Unsubscribe sheet (no locked contract) -->
    <UnsubscribeSheet
      v-if="unsubscribeStream"
      :stream="unsubscribeStream"
      :currency="store.account.currency"
      :is-physical="products.find(p => p.id === unsubscribeStream!.sourceProductId)?.priceType === 'one-time'"
      @confirm="store.removeStream(unsubscribeStream!.id); unsubscribeStream = null"
      @cancel="unsubscribeStream = null"
    />

    <!-- Income / Expense columns -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <StreamColumn
        title="Income"
        :streams="store.incomeStreams"
        :total="store.totalIncome"
        category="income"
        :hovered-id="hoveredStreamId"
        :highlighted-id="highlightedId"
        @edit="handleEdit"
        @add="handleAdd('income')"
        @hover="hoveredStreamId = $event"
      />
      <StreamColumn
        title="Expenses"
        :streams="store.expenseStreams"
        :total="store.totalExpenses"
        category="expense"
        :hovered-id="hoveredStreamId"
        :highlighted-id="highlightedId"
        @edit="handleEdit"
        @add="handleAdd('expense')"
        @hover="hoveredStreamId = $event"
      />
    </div>

    <!-- Flow canvas (when enabled) -->
    <div v-if="store.showVisualization" class="mb-4">
      <FlowCanvas :hovered-id="hoveredStreamId" />
    </div>

    <!-- Balance + Tax (+ Accumulator when flow is on) -->
    <div class="grid grid-cols-1 gap-4" :class="store.showVisualization ? 'md:grid-cols-3' : 'md:grid-cols-2'">
      <BalanceRow />
      <Accumulator v-if="store.showVisualization" />
      <TaxBadge />
    </div>
  </div>

  <!-- Edit / Add modal -->
  <Teleport to="body">
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm"
        @click="handleCancel"
      />
      <div class="relative z-10 w-full max-w-md">
        <StreamItemForm
          :stream="editingStream"
          :category="formCategory"
          @save="handleSave"
          @cancel="handleCancel"
          @delete="handleDelete"
          @quit="handleQuit"
          @go-to-product="handleGoToProduct"
        />
      </div>
    </div>
  </Teleport>
  </div>
</template>
