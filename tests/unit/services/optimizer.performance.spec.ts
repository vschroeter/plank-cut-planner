import { describe, expect, it } from 'vitest'
import { computeOptimalPlan } from '@/services/optimizer'

function genData (nSkus: number, nPieces: number) {
  const availablePlanks = Array.from({ length: nSkus }, (_, i) => ({
    articleNr: `A${i}`,
    widthMm: 100 + (i % 3) * 10,
    lengthMm: 1000 + (i % 2) * 500,
    pricePerPiece: 10 + (i % 5),
    availablePieces: null as number | null,
  }))
  const requiredPieces = Array.from({ length: nPieces }, () => ({
    widthMm: 100,
    lengthMm: 400,
    quantity: 1,
  }))
  return { availablePlanks, requiredPieces, settings: { sawKerfMm: 3, unitSystem: 'mm' as const } }
}

describe('optimizer performance', () => {
  it('computes within 1.0s for typical dataset', () => {
    const input = genData(20, 100)
    const start = performance.now()
    const result = computeOptimalPlan(input)
    const elapsed = performance.now() - start
    expect(result.purchasePlan.length).toBeGreaterThan(0)
    expect(elapsed).toBeLessThan(1000)
  })
})
