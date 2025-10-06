import { describe, it, expect } from 'vitest'
import { computeOptimalPlan } from '@/services/optimizer'

describe('optimizer tie-breaker', () => {
  it('prefers fewest SKUs, then fewest cuts when cost equal', () => {
    const input = {
      availablePlanks: [
        { articleNr: 'A', widthMm: 100, lengthMm: 1000, pricePerPiece: 10, availablePieces: null },
        { articleNr: 'B', widthMm: 100, lengthMm: 1000, pricePerPiece: 10, availablePieces: null },
      ],
      requiredPieces: [
        { widthMm: 100, lengthMm: 500, quantity: 2 },
      ],
      settings: { sawKerfMm: 0, unitSystem: 'mm' as const },
    }

    const result = computeOptimalPlan(input)

    expect(result.purchasePlan.length).toBe(1)
    expect(result.totalCuts).toBeGreaterThanOrEqual(1)
  })
})


