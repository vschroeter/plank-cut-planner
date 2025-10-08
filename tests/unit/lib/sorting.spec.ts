import { describe, it, expect } from 'vitest'
import { sortPlanks } from '@/lib/sorting'

describe('sorting utility', () => {
  it('sorts by width, then length, then price', () => {
    const rows = [
      { widthMm: 100, lengthMm: 2000, pricePerPiece: 20 },
      { widthMm: 100, lengthMm: 1000, pricePerPiece: 30 },
      { widthMm: 90, lengthMm: 3000, pricePerPiece: 10 },
      { widthMm: 100, lengthMm: 1000, pricePerPiece: 10 },
    ] as any

    const sorted = rows.sort(sortPlanks)

    expect(sorted[0].widthMm).toBe(90)
    expect(sorted[1].lengthMm).toBe(1000)
    expect(sorted[1].pricePerPiece).toBe(10)
    expect(sorted[2].lengthMm).toBe(1000)
    expect(sorted[2].pricePerPiece).toBe(30)
  })
})


