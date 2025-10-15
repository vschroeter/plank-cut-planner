import type { GlobalSettings, PieceIdentity, PurchasePlanItem, RequiredPieceInput } from '@/types/planner'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref, toRaw } from 'vue'
import { sortPlanks } from '@/lib/sorting'
import { computeOptimalPlan } from '@/services/optimizer'
import { AvailablePlank as AvailablePlankClass, Plank, PlankStorage } from '@/types/planner'

const defaultSettings: GlobalSettings = { sawKerfMm: 3, unitSystem: 'mm', currency: '€' }

export const usePlannerStore = defineStore('planner', () => {
  // UI-facing available plank input shape
  type AvailablePlankInput = {
    widthMm: number
    lengthMm: number
    pricePerPiece: number
    articleNr: string | null
    availablePieces: number | null
  }

  const availablePlanks = useLocalStorage<AvailablePlankInput[]>('planner.availablePlanks', [])
  const requiredPieces = useLocalStorage<RequiredPieceInput[]>('planner.requiredPieces', [])
  const plankPlan = useLocalStorage<Plank[]>('planner.plankPlan', [])
  const settings = useLocalStorage<GlobalSettings>('planner.settings', defaultSettings)
  const donePieces = useLocalStorage<Record<string, boolean>>('planner.donePieces', {})

  const autoRecompute = useLocalStorage('planner.autoRecompute', true)
  const purchasePlan = ref<PurchasePlanItem[]>([])
  // Keep a minimal stub for UI components expecting cutPlan
  const cutPlan = ref<{ items: any[], totalCost: number, totalCuts: number }>({ items: [], totalCost: 0, totalCuts: 0 })
  const lastComputedAt = ref<number | null>(null)
  const computeMs = ref<number | null>(null)
  const computeLoading = ref<boolean>(false)
  const computeErrors = ref<string[]>([])

  const sortedAvailablePlanks = computed(() => availablePlanks.value.toSorted(sortPlanks))
  const totalCuts = computed<number>(() => cutPlan.value.totalCuts)

  function computePlans (): void {
    const start = performance.now()
    computeLoading.value = true
    // Build storage from UI-facing available planks
    const storage = new PlankStorage()
    for (const p of availablePlanks.value) {
      const availablePlank = new AvailablePlankClass({
        widthMm: p.widthMm,
        lengthMm: p.lengthMm,
        pricePerPiece: p.pricePerPiece,
        articleNr: p.articleNr ?? null,
      })
      const plank = new Plank({ availablePlank })
      const amount: number | null = p.availablePieces === null ? null : Number(p.availablePieces)
      storage.availablePlankAmount.set(plank, amount)
    }

    let result: ReturnType<typeof computeOptimalPlan>
    try {
      result = computeOptimalPlan({
        availablePlanks: storage,
        storage,
        requiredPieces: toRaw(requiredPieces.value),
        settings: settings.value,
      })
    } finally {
      computeLoading.value = false
    }

    computeErrors.value = result.errors ?? []

    const elapsed = performance.now() - start
    // Aggregate planks to be purchased into purchasePlan items
    const grouped = new Map<string, { plank: Plank, quantity: number }>()
    for (const plank of result.planksToBePurchased) {
      const key = plank.availablePlank.completeHash
      const entry = grouped.get(key)
      if (entry) {
        entry.quantity += 1
      } else {
        grouped.set(key, { plank, quantity: 1 })
      }
    }
    purchasePlan.value = Array.from(grouped.values())
    plankPlan.value = result.planksToBePurchased

    // No cut plan yet in the new optimizer; keep totals at zero
    cutPlan.value = { items: [], totalCost: 0, totalCuts: 0 }
    computeMs.value = Math.round(elapsed)
    lastComputedAt.value = Date.now()
    if (elapsed > 1000) {
      autoRecompute.value = false
    }
  }

  function maybeRecompute (): void {
    if (autoRecompute.value) {
      computePlans()
    }
  }

  function addPlank (p: AvailablePlankInput): void {
    const targetIdx = p.articleNr
      ? availablePlanks.value.findIndex(x => x.articleNr === p.articleNr)
      : availablePlanks.value.findIndex(x => !x.articleNr && x.widthMm === p.widthMm && x.lengthMm === p.lengthMm && x.pricePerPiece === p.pricePerPiece)
    if (targetIdx >= 0) {
      const target = availablePlanks.value[targetIdx]
      if (target) {
        if (p.articleNr && target.articleNr === p.articleNr && target.pricePerPiece !== p.pricePerPiece) {
          target.pricePerPiece = p.pricePerPiece
        }
        const a = target.availablePieces
        const b = p.availablePieces
        target.availablePieces = a === null || b === null ? null : (a + b)
      } else {
        availablePlanks.value.push(p)
      }
    } else {
      availablePlanks.value.push(p)
    }
    maybeRecompute()
  }
  function updatePlank (index: number, p: Partial<AvailablePlankInput>): void {
    const target = availablePlanks.value[index]
    if (!target) {
      return
    }
    Object.assign(target, p)
    maybeRecompute()
  }
  function removePlank (index: number): void {
    availablePlanks.value.splice(index, 1)
    maybeRecompute()
  }
  function addRequiredPiece (p: RequiredPieceInput): void {
    requiredPieces.value.push(p)
    maybeRecompute()
  }
  function updateRequiredPiece (index: number, p: Partial<RequiredPieceInput>): void {
    const target = requiredPieces.value[index]
    if (!target) {
      return
    }
    Object.assign(target, p)
    maybeRecompute()
  }
  function removeRequiredPiece (index: number): void {
    requiredPieces.value.splice(index, 1)
    maybeRecompute()
  }
  function setSawKerf (mm: number): void {
    settings.value.sawKerfMm = mm
    maybeRecompute()
  }
  function setUnitSystem (unit: 'mm' | 'inch'): void {
    settings.value.unitSystem = unit
  }
  function setCurrency (symbol: string): void {
    settings.value.currency = symbol
  }
  function toggleAutoRecompute (value?: boolean): void {
    const next = value ?? !autoRecompute.value
    autoRecompute.value = next
    if (next) {
      // Trigger a recomputation immediately when auto is enabled
      computePlans()
    }
  }

  function markPieceDone (id: PieceIdentity, done: boolean): void {
    donePieces.value[id] = done
  }

  function resetAllDone (): void {
    donePieces.value = {}
  }

  // Clear helpers
  function clearAvailablePlanks (): void {
    availablePlanks.value = []
    maybeRecompute()
  }

  function clearRequiredPieces (): void {
    requiredPieces.value = []
    maybeRecompute()
  }

  // Import/Export
  type ExportData = {
    version: 1
    availablePlanks: typeof availablePlanks.value
    requiredPieces: typeof requiredPieces.value
    settings: typeof settings.value
    donePieces: typeof donePieces.value
    autoRecompute: boolean
  }

  function exportAll (): ExportData {
    return {
      version: 1,
      availablePlanks: toRaw(availablePlanks.value),
      requiredPieces: toRaw(requiredPieces.value),
      settings: toRaw(settings.value),
      donePieces: toRaw(donePieces.value),
      autoRecompute: !!autoRecompute.value,
    }
  }

  function importAll (data: unknown): void {
    try {
      const d = data as Partial<ExportData>
      if (!d || typeof d !== 'object') {
        return
      }
      if (d.availablePlanks && Array.isArray(d.availablePlanks)) {
        availablePlanks.value = d.availablePlanks as any
      }
      if (d.requiredPieces && Array.isArray(d.requiredPieces)) {
        requiredPieces.value = d.requiredPieces as any
      }
      if (d.settings && typeof d.settings === 'object') {
        settings.value = { ...settings.value, ...d.settings }
      }
      if (d.donePieces && typeof d.donePieces === 'object') {
        donePieces.value = d.donePieces as any
      }
      if (typeof d.autoRecompute === 'boolean') {
        autoRecompute.value = d.autoRecompute
      }
    } finally {
      maybeRecompute()
    }
  }

  return {
    // state
    availablePlanks,
    requiredPieces,
    settings,
    donePieces,
    autoRecompute,
    purchasePlan,
    cutPlan,
    plankPlan,
    lastComputedAt,
    computeMs,
    computeLoading,
    computeErrors,
    // getters
    sortedAvailablePlanks,
    totalCuts,
    // actions
    computePlans,
    maybeRecompute,
    addPlank,
    updatePlank,
    removePlank,
    addRequiredPiece,
    updateRequiredPiece,
    removeRequiredPiece,
    setSawKerf,
    setUnitSystem,
    setCurrency,
    toggleAutoRecompute,
    markPieceDone,
    resetAllDone,
    clearAvailablePlanks,
    clearRequiredPieces,
    exportAll,
    importAll,
  }
})
