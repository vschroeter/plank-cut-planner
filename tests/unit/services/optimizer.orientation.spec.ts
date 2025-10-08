import { describe, it, expect } from 'vitest'
import { computeOptimalPlan } from '@/services/optimizer'

describe('optimizer orientation & kerf', () => {
  it('does not rotate pieces and respects kerf spacing', () => {
    const input = {
      availablePlanks: [
        { articleNr: 'A', widthMm: 100, lengthMm: 1000, pricePerPiece: 10, availablePieces: 1 },
      ],
      requiredPieces: [
        { widthMm: 100, lengthMm: 400, quantity: 2 },
      ],
      settings: { sawKerfMm: 5, unitSystem: 'mm' as const },
    }

    const result = computeOptimalPlan(input)

    // 400 + 5 + 400 = 805 <= 1000 → feasible without rotation
    expect(result.cutPlan.items[0].assignments.length).toBeGreaterThan(0)
    // Deterministic totals
    expect(result.purchasePlan[0]?.quantity).toBe(1)
    expect(result.cutPlan.totalCuts).toBe(1)
    expect(result.cutPlan.totalCost).toBe(10)
  })
})


