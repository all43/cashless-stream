<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Period, StreamCategory, StreamType, Stream, ContractTerms } from '../../lib/types'
import { PERIOD_LABELS } from '../../lib/constants'
import { isLocked } from '../../lib/contract'
import { useStreamStore } from '../../stores/streams'
import { effectiveTaxRate } from '../../lib/tax'
import { toPeriod } from '../../lib/calc'
import { formatCurrency } from '../../composables/useCurrency'

const props = defineProps<{
  stream?: Stream | null
  category: StreamCategory
}>()

type SaveData = {
  title: string
  value: number
  period: Period
  type: StreamType
  category: StreamCategory
  icon: string
  contract?: ContractTerms
  taxDeductible?: boolean
}

const emit = defineEmits<{
  save: [data: SaveData]
  cancel: []
  delete: [id: string]
  quit: [stream: Stream]
  goToProduct: [productId: string]
}>()

const title = ref(props.stream?.title ?? '')
const value = ref(props.stream?.value ?? 0)
const period = ref<Period>(props.stream?.period ?? 'monthly')
const type = ref<StreamType>(props.stream?.type ?? 'projected')
const icon = ref(props.stream?.icon ?? (props.category === 'income' ? '💰' : '💸'))

// Contract state
const isLuxury = ref(props.stream?.taxDeductible === false)
const hasContract = ref(!!props.stream?.contract)
const minimumMonths = ref(props.stream?.contract?.minimumMonths ?? 12)
const cancellationModel = ref<'flat' | 'remaining-months'>(
  props.stream?.contract?.cancellationModel ?? 'flat',
)
const cancellationFee = ref(props.stream?.contract?.cancellationFee ?? 0)
const setupFee = ref(props.stream?.contract?.setupFee ?? 0)
const welcomeBonus = ref(props.stream?.contract?.welcomeBonus ?? 0)

const existingContract = computed(() => props.stream?.contract)
const contractIsLocked = computed(
  () => !!existingContract.value && isLocked(existingContract.value),
)
const isMarketplaceStream = computed(() => !!props.stream?.sourceProductId)

const streamStore = useStreamStore()

const taxTip = computed(() => {
  const s = props.stream
  if (!s) return null
  const annualIncome = streamStore.account.streams
    .filter(x => x.category === 'income')
    .reduce((sum, x) => sum + toPeriod(x.value, x.period, 'annual').amount, 0)
  const annualDeductible = streamStore.annualDeductibleExpenses
  const rate = effectiveTaxRate(annualIncome, annualDeductible)
  const monthly = toPeriod(s.value, s.period, 'monthly', streamStore.account.currency)

  if (s.category === 'income') {
    if (annualIncome <= 0 || rate <= 0) return null
    const taxAmt = { amount: monthly.amount * rate, precision: 2, currency: streamStore.account.currency }
    return {
      icon: '📊',
      text: `~${formatCurrency(taxAmt)}/mo goes to tax at ${(rate * 100).toFixed(1)}% effective rate`,
      positive: false,
    }
  }
  if (s.taxDeductible === false) {
    return { icon: '⚠️', text: 'Luxury — does not reduce your taxable income', positive: false }
  }
  if (rate > 0) {
    const saving = { amount: monthly.amount * rate, precision: 2, currency: streamStore.account.currency }
    return {
      icon: '✓',
      text: `Reduces taxable income → saves ~${formatCurrency(saving)}/mo in tax`,
      positive: true,
    }
  }
  return { icon: '✓', text: 'Tax-deductible — reduces your taxable income', positive: true }
})

/** Read-only only for marketplace streams (custom streams are always editable) */
const isReadOnly = computed(() => !!props.stream && isMarketplaceStream.value)

const periods = Object.entries(PERIOD_LABELS) as [Period, string][]
const isEditing = !!props.stream
// Live = marketplace subscription. Manual entry: projected (planned) or bridged (real-world service via cashless.stream)
const types: StreamType[] = isEditing ? ['live', 'projected', 'bridged'] : ['projected', 'bridged']

const TYPE_DESCRIPTIONS: Record<StreamType, string> = {
  live: 'Active marketplace subscription',
  projected: 'An anticipated income or expense — add it to model a scenario and see how it shifts your balance before it becomes real',
  bridged: 'Existing real-world service with monthly payments, routed via cashless.stream to appear as a continuous flow',
}

function buildContract(): ContractTerms | undefined {
  if (!hasContract.value) return undefined
  // Preserve startDate when editing an existing contract
  const startDate = existingContract.value?.startDate ?? new Date().toISOString().slice(0, 10)
  return {
    startDate,
    minimumMonths: minimumMonths.value,
    cancellationModel: cancellationModel.value,
    ...(cancellationModel.value === 'flat' && cancellationFee.value > 0
      ? { cancellationFee: cancellationFee.value }
      : {}),
    ...(setupFee.value > 0 ? { setupFee: setupFee.value } : {}),
    ...(welcomeBonus.value > 0 ? { welcomeBonus: welcomeBonus.value } : {}),
  }
}

function handleSave() {
  if (!title.value.trim() || value.value <= 0) return
  emit('save', {
    title: title.value.trim(),
    value: value.value,
    period: period.value,
    type: type.value,
    category: props.category,
    icon: icon.value,
    contract: buildContract(),
    ...(props.category === 'expense' && isLuxury.value ? { taxDeductible: false } : {}),
  })
}

const titleInput = ref<HTMLInputElement | null>(null)
onMounted(() => titleInput.value?.focus())
</script>

<template>
  <div class="rounded-lg border dark:border-border dark:bg-surface-elevated border-slate-200 bg-slate-50 p-4">
    <div class="space-y-3">

      <!-- ── Read-only view (marketplace streams only) ───────────────────── -->
      <template v-if="isReadOnly">
        <div class="flex items-center gap-3">
          <span class="text-2xl">{{ stream?.icon }}</span>
          <div>
            <div class="text-sm font-medium dark:text-text-primary text-slate-800">{{ stream?.title }}</div>
            <div class="text-xs dark:text-text-muted text-slate-500 font-mono">
              €{{ stream?.value }}/{{ stream?.period }}
            </div>
          </div>
        </div>

        <!-- Marketplace link -->
        <button
          v-if="isMarketplaceStream && stream?.sourceProductId"
          @click="emit('goToProduct', stream.sourceProductId)"
          class="w-full rounded-md px-3 py-1.5 text-xs font-medium text-left transition-colors
                 dark:text-text-secondary dark:hover:text-text-primary dark:hover:bg-surface-card
                 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
        >
          View in marketplace →
        </button>

        <!-- Contract summary -->
        <div
          v-if="existingContract"
          class="rounded-lg dark:bg-surface-card/50 bg-slate-100 px-3 py-2 text-xs space-y-1"
        >
          <div class="flex justify-between">
            <span class="dark:text-text-muted text-slate-500">Started</span>
            <span class="font-mono dark:text-text-primary text-slate-700">{{ existingContract.startDate }}</span>
          </div>
          <div class="flex justify-between">
            <span class="dark:text-text-muted text-slate-500">Minimum term</span>
            <span class="font-mono dark:text-text-primary text-slate-700">{{ existingContract.minimumMonths }} months</span>
          </div>
          <div v-if="existingContract.cancellationFee" class="flex justify-between">
            <span class="dark:text-text-muted text-slate-500">Exit fee</span>
            <span class="font-mono dark:text-text-primary text-slate-700">€{{ existingContract.cancellationFee }}</span>
          </div>
        </div>

        <!-- Quit button (locked contract) -->
        <button
          v-if="existingContract && contractIsLocked && stream"
          @click="emit('quit', stream)"
          class="w-full rounded-md px-3 py-1.5 text-xs font-medium transition-colors text-left
                 dark:text-amber-400 dark:hover:bg-amber-500/10
                 text-amber-700 hover:bg-amber-50"
        >
          🔒 Cancel this contract…
        </button>

        <!-- Tax tip -->
        <div
          v-if="taxTip"
          class="rounded-md px-3 py-2 text-xs leading-snug"
          :class="taxTip.positive
            ? 'dark:bg-income/10 dark:text-income bg-emerald-50 text-emerald-700'
            : stream?.taxDeductible === false
              ? 'dark:bg-amber-500/10 dark:text-amber-400 bg-amber-50 text-amber-700'
              : 'dark:bg-surface-card dark:text-text-muted bg-slate-100 text-slate-500'"
        >
          {{ taxTip.icon }} {{ taxTip.text }}
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-1">
          <div>
            <button
              v-if="stream && !(existingContract && contractIsLocked)"
              @click="emit('quit', stream)"
              class="rounded-md px-3 py-1.5 text-xs font-medium text-expense hover:bg-expense/10 transition-colors"
            >
              {{ isMarketplaceStream ? 'Unsubscribe…' : 'Remove…' }}
            </button>
          </div>
          <button
            @click="emit('cancel')"
            class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors
                   dark:text-text-secondary dark:hover:text-text-primary
                   text-slate-500 hover:text-slate-800"
          >
            Close
          </button>
        </div>
      </template>

      <!-- ── Full edit form (projected streams + new streams) ─────────── -->
      <template v-else>
        <!-- Title + Icon -->
        <div class="flex gap-2">
          <input
            v-model="icon"
            class="w-10 rounded-md border px-2 py-1.5 text-center text-lg
                   dark:border-border dark:bg-surface-card dark:text-text-primary
                   border-slate-300 bg-white text-slate-800"
            maxlength="2"
          />
          <input
            ref="titleInput"
            v-model="title"
            placeholder="Stream name"
            class="flex-1 rounded-md border px-3 py-1.5 text-sm
                   dark:border-border dark:bg-surface-card dark:text-text-primary dark:placeholder:text-text-muted
                   border-slate-300 bg-white text-slate-800 placeholder:text-slate-500"
          />
        </div>

        <!-- Value + Period -->
        <div class="flex gap-2">
          <div class="relative flex-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm dark:text-text-muted text-slate-500">
              &euro;
            </span>
            <input
              v-model.number="value"
              type="number"
              min="0"
              step="0.01"
              class="w-full rounded-md border pl-7 pr-3 py-1.5 text-sm font-mono
                     dark:border-border dark:bg-surface-card dark:text-text-primary
                     border-slate-300 bg-white text-slate-800"
            />
          </div>
          <select
            v-model="period"
            class="rounded-md border px-3 py-1.5 text-sm
                   dark:border-border dark:bg-surface-card dark:text-text-primary
                   border-slate-300 bg-white text-slate-800"
          >
            <option v-for="[key, label] in periods" :key="key" :value="key">
              / {{ label }}
            </option>
          </select>
        </div>

        <!-- Type -->
        <div class="flex gap-1">
          <button
            v-for="t in types"
            :key="t"
            @click="type = t"
            class="rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors
                   dark:text-text-secondary dark:hover:text-text-primary
                   text-slate-500 hover:text-slate-800"
            :class="{
              'dark:!bg-surface-card dark:!text-text-primary !bg-white !text-slate-900 shadow-sm':
                type === t,
            }"
          >
            {{ t }}
          </button>
        </div>
        <p class="text-[11px] dark:text-text-muted text-slate-400 leading-snug">
          {{ TYPE_DESCRIPTIONS[type] }}
        </p>

        <!-- Luxury toggle (expenses only) -->
        <div v-if="category === 'expense'" class="flex items-center gap-2">
          <label class="flex items-center gap-2 text-xs cursor-pointer dark:text-text-secondary text-slate-500">
            <input type="checkbox" v-model="isLuxury" class="rounded accent-amber-500" />
            Luxury (not tax-deductible)
          </label>
        </div>

        <!-- Contract section -->
        <div class="border-t dark:border-border border-slate-200 pt-3 space-y-2.5">
          <label class="flex items-center gap-2 text-xs cursor-pointer dark:text-text-secondary text-slate-500">
            <input
              type="checkbox"
              v-model="hasContract"
              :disabled="!!existingContract"
              class="rounded accent-income"
            />
            Contract terms
          </label>

          <template v-if="hasContract">
            <!-- Existing locked contract status -->
            <div
              v-if="existingContract && contractIsLocked"
              class="rounded-lg dark:bg-surface-card/50 bg-slate-100 px-3 py-2 text-xs space-y-1"
            >
              <div class="flex justify-between">
                <span class="dark:text-text-muted text-slate-500">Started</span>
                <span class="font-mono dark:text-text-primary text-slate-700">{{ existingContract.startDate }}</span>
              </div>
              <div class="flex justify-between">
                <span class="dark:text-text-muted text-slate-500">Minimum term</span>
                <span class="font-mono dark:text-text-primary text-slate-700">{{ existingContract.minimumMonths }} months</span>
              </div>
              <div v-if="existingContract.cancellationFee" class="flex justify-between">
                <span class="dark:text-text-muted text-slate-500">Exit fee</span>
                <span class="font-mono dark:text-text-primary text-slate-700">€{{ existingContract.cancellationFee }}</span>
              </div>
            </div>

            <!-- Editable contract fields (new stream) -->
            <template v-else-if="!existingContract">
              <div class="flex gap-2 items-center">
                <label class="text-xs dark:text-text-muted text-slate-500 w-24 shrink-0">Minimum months</label>
                <input
                  v-model.number="minimumMonths"
                  type="number"
                  min="1"
                  step="1"
                  class="flex-1 rounded-md border px-3 py-1 text-xs font-mono
                         dark:border-border dark:bg-surface-card dark:text-text-primary
                         border-slate-300 bg-white text-slate-800"
                />
              </div>

              <div class="flex gap-2 items-center">
                <label class="text-xs dark:text-text-muted text-slate-500 w-24 shrink-0">Exit penalty</label>
                <div class="flex gap-1 flex-1">
                  <button
                    v-for="m in (['flat', 'remaining-months'] as const)"
                    :key="m"
                    @click="cancellationModel = m"
                    class="flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors
                           dark:text-text-secondary dark:hover:text-text-primary
                           text-slate-500 hover:text-slate-800"
                    :class="{
                      'dark:!bg-surface-card dark:!text-text-primary !bg-white !text-slate-900 shadow-sm':
                        cancellationModel === m,
                    }"
                  >
                    {{ m === 'flat' ? 'Flat fee' : 'Remaining months' }}
                  </button>
                </div>
              </div>

              <div v-if="cancellationModel === 'flat'" class="flex gap-2 items-center">
                <label class="text-xs dark:text-text-muted text-slate-500 w-24 shrink-0">Exit fee (€)</label>
                <div class="relative flex-1">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs dark:text-text-muted text-slate-500">&euro;</span>
                  <input
                    v-model.number="cancellationFee"
                    type="number"
                    min="0"
                    step="1"
                    class="w-full rounded-md border pl-7 pr-3 py-1 text-xs font-mono
                           dark:border-border dark:bg-surface-card dark:text-text-primary
                           border-slate-300 bg-white text-slate-800"
                  />
                </div>
              </div>

              <div class="flex gap-2">
                <div class="flex-1 space-y-1">
                  <label class="text-xs dark:text-text-muted text-slate-500">Setup fee (€)</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs dark:text-text-muted text-slate-500">&euro;</span>
                    <input
                      v-model.number="setupFee"
                      type="number"
                      min="0"
                      step="1"
                      class="w-full rounded-md border pl-7 pr-3 py-1 text-xs font-mono
                             dark:border-border dark:bg-surface-card dark:text-text-primary
                             border-slate-300 bg-white text-slate-800"
                    />
                  </div>
                </div>
                <div class="flex-1 space-y-1">
                  <label class="text-xs dark:text-text-muted text-slate-500">Welcome bonus (€)</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs dark:text-text-muted text-slate-500">&euro;</span>
                    <input
                      v-model.number="welcomeBonus"
                      type="number"
                      min="0"
                      step="1"
                      class="w-full rounded-md border pl-7 pr-3 py-1 text-xs font-mono
                             dark:border-border dark:bg-surface-card dark:text-text-primary
                             border-slate-300 bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </template>

            <!-- Quit contract button (manual contract, locked) -->
            <button
              v-if="existingContract && contractIsLocked && category === 'expense' && stream"
              @click="emit('quit', stream)"
              class="w-full rounded-md px-3 py-1.5 text-xs font-medium transition-colors text-left
                     dark:text-amber-400 dark:hover:bg-amber-500/10
                     text-amber-700 hover:bg-amber-50"
            >
              🔒 Cancel this contract…
            </button>
          </template>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-1">
          <div>
            <button
              v-if="isEditing && stream && !(existingContract && contractIsLocked)"
              @click="emit('delete', stream.id)"
              class="rounded-md px-3 py-1.5 text-xs font-medium text-expense hover:bg-expense/10 transition-colors"
            >
              Delete
            </button>
          </div>
          <div class="flex gap-2">
            <button
              @click="emit('cancel')"
              class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors
                     dark:text-text-secondary dark:hover:text-text-primary
                     text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              @click="handleSave"
              class="rounded-md px-4 py-1.5 text-xs font-medium transition-colors
                     bg-income text-slate-900 hover:bg-income/90"
              :disabled="!title.trim() || value <= 0"
            >
              {{ isEditing ? 'Update' : 'Add' }}
            </button>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>
