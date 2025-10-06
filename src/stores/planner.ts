import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { ref, computed } from 'vue'
import type { PlankSKU, RequiredPiece, GlobalSettings, PurchasePlanItem, CutPlan } from '@/types/planner'
import { sortPlanks } from '@/lib/sorting'
import { computeOptimalPlan } from '@/services/optimizer'

const defaultSettings: GlobalSettings = { sawKerfMm: 3, unitSystem: 'mm' }

export const usePlannerStore = defineStore('planner', () => {
  const availablePlanks = useLocalStorage<PlankSKU[]>('planner.availablePlanks', [])
  const requiredPieces = useLocalStorage<RequiredPiece[]>('planner.requiredPieces', [])
  const settings = useLocalStorage<GlobalSettings>('planner.settings', defaultSettings)

  const autoRecompute = ref(true)
  const purchasePlan = ref<PurchasePlanItem[]>([])
  const cutPlan = ref<CutPlan>({ items: [], totalCost: 0, totalCuts: 0 })

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
    if (elapsed > 1000) autoRecompute.value = false
  }

  function maybeRecompute(): void {
    if (autoRecompute.value) computePlans()
  }

  function addPlank(p: PlankSKU): void {
    availablePlanks.value.push(p)
    maybeRecompute()
  }
  function updatePlank(index: number, p: Partial<PlankSKU>): void {
    Object.assign(availablePlanks.value[index], p)
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
    Object.assign(requiredPieces.value[index], p)
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
  function toggleAutoRecompute(value?: boolean): void {
    autoRecompute.value = value ?? !autoRecompute.value
  }

  return {
    // state
    availablePlanks,
    requiredPieces,
    settings,
    autoRecompute,
    purchasePlan,
    cutPlan,
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
    toggleAutoRecompute,
  }
})


