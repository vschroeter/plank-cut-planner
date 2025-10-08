import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlannerStore } from '@/stores/planner'

describe('planner store contract', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('exposes required state, getters, and actions', () => {
    const store = usePlannerStore()

    // State
    expect(Array.isArray(store.availablePlanks)).toBe(true)
    expect(Array.isArray(store.requiredPieces)).toBe(true)
    expect(typeof store.settings).toBe('object')
    expect(typeof store.purchasePlan).toBe('object')
    expect(typeof store.cutPlan).toBe('object')

    // Getters
    expect(Array.isArray(store.sortedAvailablePlanks)).toBe(true)
    expect(typeof store.totalCuts).toBe('number')

    // Actions presence
    expect(typeof store.addPlank).toBe('function')
    expect(typeof store.updatePlank).toBe('function')
    expect(typeof store.removePlank).toBe('function')
    expect(typeof store.addRequiredPiece).toBe('function')
    expect(typeof store.updateRequiredPiece).toBe('function')
    expect(typeof store.removeRequiredPiece).toBe('function')
    expect(typeof store.setSawKerf).toBe('function')
    expect(typeof store.setUnitSystem).toBe('function')
    expect(typeof store.computePlans).toBe('function')
  })
})


