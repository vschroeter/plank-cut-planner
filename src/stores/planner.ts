import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { ref, computed } from 'vue'
import type { PlankSKU, RequiredPiece, GlobalSettings, PurchasePlanItem, CutPlan, PieceIdentity } from '@/types/planner'
import { sortPlanks } from '@/lib/sorting'
import { computeOptimalPlan } from '@/services/optimizer'

const defaultSettings: GlobalSettings = { sawKerfMm: 3, unitSystem: 'mm', currency: '€' }

export const usePlannerStore = defineStore('planner', () => {
  const availablePlanks = useLocalStorage<PlankSKU[]>('planner.availablePlanks', [])
  const requiredPieces = useLocalStorage<RequiredPiece[]>('planner.requiredPieces', [])
  const settings = useLocalStorage<GlobalSettings>('planner.settings', defaultSettings)
  const donePieces = useLocalStorage<Record<string, boolean>>('planner.donePieces', {})

  const autoRecompute = ref(true)
  const purchasePlan = ref<PurchasePlanItem[]>([])
  const cutPlan = ref<CutPlan>({ items: [], totalCost: 0, totalCuts: 0 })
  const lastComputedAt = ref<number | null>(null)
  const computeMs = ref<number | null>(null)

  const sortedAvailablePlanks = computed<PlankSKU[]>(() => [...availablePlanks.value].sort(sortPlanks))
  const totalCuts = computed<number>(() => cutPlan.value.totalCuts)

  function computePlans(): void {
    const start = performance.now()
    const result = computeOptimalPlan({
      availablePlanks: availablePlanks.value,
      requiredPieces: requiredPieces.value,
      settings: settings.value,
    })
    const elapsed = performance.now() - start
    purchasePlan.value = result.purchasePlan
    cutPlan.value = result.cutPlan
    computeMs.value = Math.round(elapsed)
    lastComputedAt.value = Date.now()
    if (elapsed > 1000) autoRecompute.value = false
  }

  function maybeRecompute(): void {
    if (autoRecompute.value) computePlans()
  }

  function addPlank(p: PlankSKU): void {
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
  function updatePlank(index: number, p: Partial<PlankSKU>): void {
    const target = availablePlanks.value[index]
    if (!target) return
    Object.assign(target, p)
    maybeRecompute()
  }
  function removePlank(index: number): void {
    availablePlanks.value.splice(index, 1)
    maybeRecompute()
  }
  function addRequiredPiece(p: RequiredPiece): void {
    requiredPieces.value.push(p)
    maybeRecompute()
  }
  function updateRequiredPiece(index: number, p: Partial<RequiredPiece>): void {
    const target = requiredPieces.value[index]
    if (!target) return
    Object.assign(target, p)
    maybeRecompute()
  }
  function removeRequiredPiece(index: number): void {
    requiredPieces.value.splice(index, 1)
    maybeRecompute()
  }
  function setSawKerf(mm: number): void {
    settings.value.sawKerfMm = mm
    maybeRecompute()
  }
  function setUnitSystem(unit: 'mm' | 'inch'): void {
    settings.value.unitSystem = unit
  }
  function setCurrency(symbol: string): void {
    settings.value.currency = symbol
  }
  function toggleAutoRecompute(value?: boolean): void {
    autoRecompute.value = value ?? !autoRecompute.value
  }

  function markPieceDone(id: PieceIdentity, done: boolean): void {
    donePieces.value[id] = done
  }

  function resetAllDone(): void {
    donePieces.value = {}
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
    lastComputedAt,
    computeMs,
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
  }
})


