import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Account, Period, Stream, StreamCategory } from '../lib/types'
import { defaultAccount } from '../data/default-account'
import { scenarios } from '../data/scenarios'
import { totalStreams } from '../lib/calc'

export const useStreamStore = defineStore(
  'streams',
  () => {
    const account = ref<Account>({ ...defaultAccount, streams: [...defaultAccount.streams] })
    const selectedPeriod = ref<Period>('monthly')
    const showProjections = ref(true)
    const showVisualization = ref(false)

    const incomeStreams = computed(() =>
      account.value.streams.filter(
        (s) => s.category === 'income' && (showProjections.value || s.type !== 'projected'),
      ),
    )

    const expenseStreams = computed(() =>
      account.value.streams.filter(
        (s) => s.category === 'expense' && (showProjections.value || s.type !== 'projected'),
      ),
    )

    /** Expense streams that reduce taxable income (everything except explicit luxury) */
    const deductibleStreams = computed(() =>
      account.value.streams.filter(
        (s) =>
          s.category === 'expense' &&
          s.taxDeductible !== false &&
          (showProjections.value || s.type !== 'projected'),
      ),
    )

    const annualDeductibleExpenses = computed(() =>
      totalStreams(deductibleStreams.value, 'annual', account.value.currency).amount,
    )

    const totalIncome = computed(() =>
      totalStreams(incomeStreams.value, selectedPeriod.value, account.value.currency),
    )

    const totalExpenses = computed(() =>
      totalStreams(expenseStreams.value, selectedPeriod.value, account.value.currency),
    )

    const balance = computed(() => ({
      amount: totalIncome.value.amount - totalExpenses.value.amount,
      precision: totalIncome.value.precision,
      currency: account.value.currency,
    }))

    function addStream(stream: Omit<Stream, 'id'>) {
      const id = `stream-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      account.value.streams.push({ ...stream, id })
    }

    function updateStream(id: string, updates: Partial<Stream>) {
      const index = account.value.streams.findIndex((s) => s.id === id)
      if (index !== -1) {
        account.value.streams[index] = { ...account.value.streams[index], ...updates }
      }
    }

    function removeStream(id: string) {
      account.value.streams = account.value.streams.filter((s) => s.id !== id)
    }

    function reorderStreams(category: StreamCategory, fromIndex: number, toIndex: number) {
      const categoryStreams = account.value.streams.filter((s) => s.category === category)
      const otherStreams = account.value.streams.filter((s) => s.category !== category)
      const [moved] = categoryStreams.splice(fromIndex, 1)
      categoryStreams.splice(toIndex, 0, moved)
      account.value.streams = [...otherStreams, ...categoryStreams]
    }

    function loadScenario(name: string) {
      const scenario = scenarios.find((s) => s.name === name)
      if (scenario) {
        account.value = { ...scenario, streams: [...scenario.streams] }
      }
    }

    function reset() {
      account.value = { ...defaultAccount, streams: [...defaultAccount.streams] }
    }

    return {
      account,
      selectedPeriod,
      showProjections,
      showVisualization,
      incomeStreams,
      expenseStreams,
      deductibleStreams,
      annualDeductibleExpenses,
      totalIncome,
      totalExpenses,
      balance,
      addStream,
      updateStream,
      removeStream,
      reorderStreams,
      loadScenario,
      reset,
    }
  },
  {
    persist: {
      pick: ['account', 'showProjections', 'showVisualization'],
    },
  },
)
