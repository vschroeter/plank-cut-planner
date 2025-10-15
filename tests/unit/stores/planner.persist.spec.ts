import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { usePlannerStore } from '@/stores/planner'

describe('planner store persistence', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('rehydrates state after store re-initialization', () => {
    const first = usePlannerStore()
    first.availablePlanks.push({ articleNr: 'X', widthMm: 80, lengthMm: 800, pricePerPiece: 8, availablePieces: 5 })
    first.settings.sawKerfMm = 3

    // ensure persistence
    localStorage.setItem('planner.availablePlanks', JSON.stringify(first.availablePlanks))
    localStorage.setItem('planner.settings', JSON.stringify(first.settings))

    // simulate new app instance
    setActivePinia(createPinia())
    const second = usePlannerStore()

    expect(second.availablePlanks[0].articleNr).toBe('X')
    expect(second.settings.sawKerfMm).toBe(3)
  })
})
