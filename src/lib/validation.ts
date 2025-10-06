export function isPositive(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

export function isNonNegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0
}

export function isIntegerAtLeast(value: number, min: number): boolean {
  return Number.isInteger(value) && value >= min
}


