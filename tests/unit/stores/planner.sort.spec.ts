import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Store under test (to be implemented in T012)
import { usePlannerStore } from '@/stores/planner'

describe('sortedAvailablePlanks', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('sorts by width asc, then length asc, then price asc', () => {
    const store = usePlannerStore()

    store.availablePlanks = [
      { articleNr: 'A', widthMm: 100, lengthMm: 1000, pricePerPiece: 12, availablePieces: null },
      { articleNr: 'B', widthMm: 90, lengthMm: 1100, pricePerPiece: 10, availablePieces: null },
      { articleNr: 'C', widthMm: 100, lengthMm: 900, pricePerPiece: 15, availablePieces: null },
      { articleNr: 'D', widthMm: 100, lengthMm: 900, pricePerPiece: 11, availablePieces: null },
    ]

    const ordered = store.sortedAvailablePlanks
    expect(ordered.map(p => p.articleNr)).toEqual(['B', 'D', 'C', 'A'])
  })
})


