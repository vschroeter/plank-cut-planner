export function toInches (mm: number): number {
  return mm / 25.4
}

export function toMillimeters (inches: number): number {
  return inches * 25.4
}

export function formatLength (valueMm: number, unit: 'mm' | 'inch'): string {
  if (unit === 'mm') {
    const isInt = Math.abs(valueMm - Math.round(valueMm)) < 1e-6
    const v = isInt ? Math.round(valueMm).toString() : valueMm.toFixed(1)
    return `${v} mm`
  }
  const inches = toInches(valueMm)
  return `${inches.toFixed(1)} in`
}
