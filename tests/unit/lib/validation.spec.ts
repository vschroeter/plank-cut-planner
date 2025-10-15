import { describe, expect, it } from 'vitest'
import { isIntegerAtLeast, isNonNegative, isPositive, validatePlankSKU, validateRequiredPiece, validateSettings } from '@/lib/validation'

describe('validation helpers', () => {
  it('validates positive dimensions', () => {
    expect(isPositive(1)).toBe(true)
    expect(isPositive(0)).toBe(false)
    expect(isPositive(-1)).toBe(false)
  })

  it('validates non-negative values', () => {
    expect(isNonNegative(0)).toBe(true)
    expect(isNonNegative(10)).toBe(true)
    expect(isNonNegative(-0.1)).toBe(false)
  })

  it('validates integer at least N', () => {
    expect(isIntegerAtLeast(1, 1)).toBe(true)
    expect(isIntegerAtLeast(2, 1)).toBe(true)
    expect(isIntegerAtLeast(1.5, 1)).toBe(false)
    expect(isIntegerAtLeast(0, 1)).toBe(false)
  })

  it('validates PlankSKU rules', () => {
    const ok = validatePlankSKU({ widthMm: 10, lengthMm: 100, pricePerPiece: 0, articleNr: 'X', availablePieces: null })
    expect(ok.length).toBe(0)

    const bad = validatePlankSKU({ widthMm: 0, lengthMm: -1, pricePerPiece: -5, articleNr: 'Y', availablePieces: -1 as unknown as number })
    expect(bad.length).toBeGreaterThan(0)
  })

  it('validates RequiredPiece rules', () => {
    const ok = validateRequiredPiece({ widthMm: 10, lengthMm: 10, quantity: 1 })
    expect(ok.length).toBe(0)

    const bad = validateRequiredPiece({ widthMm: 0, lengthMm: 10, quantity: 0 })
    expect(bad.length).toBeGreaterThan(0)
  })

  it('validates GlobalSettings rules', () => {
    const ok = validateSettings({ sawKerfMm: 3, unitSystem: 'mm', currency: '€' })
    expect(ok.length).toBe(0)

    const bad = validateSettings({ sawKerfMm: -1, unitSystem: 'mm', currency: '' })
    expect(bad.length).toBeGreaterThan(0)
  })
})
