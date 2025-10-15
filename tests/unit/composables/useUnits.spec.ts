import { describe, expect, it } from 'vitest'
import { formatLength, toInches, toMillimeters } from '@/composables/useUnits'

describe('useUnits', () => {
  it('converts mm <-> inches', () => {
    expect(toInches(25.4)).toBeCloseTo(1, 5)
    expect(toMillimeters(1)).toBeCloseTo(25.4, 5)
  })

  it('formats values per rules', () => {
    expect(formatLength(100, 'mm')).toBe('100 mm')
    expect(formatLength(25.4, 'inch')).toMatch(/1(\.0)? in/)
  })
})
