export function isPositive (value: number): boolean {
  return Number.isFinite(value) && value > 0
}

export function isNonNegative (value: number): boolean {
  return Number.isFinite(value) && value >= 0
}

export function isIntegerAtLeast (value: number, min: number): boolean {
  return Number.isInteger(value) && value >= min
}

// High-level validators return a list of error messages; empty list means valid
export function validatePlankSKU (input: {
  widthMm: number
  lengthMm: number
  pricePerPiece: number
  articleNr: string | null
  availablePieces: number | null
}): string[] {
  const errors: string[] = []
  if (!isPositive(input.widthMm)) {
    errors.push('widthMm must be > 0')
  }
  if (!isPositive(input.lengthMm)) {
    errors.push('lengthMm must be > 0')
  }
  if (!isNonNegative(input.pricePerPiece)) {
    errors.push('pricePerPiece must be ≥ 0')
  }
  if (input.availablePieces !== null && !isIntegerAtLeast(input.availablePieces, 0)) {
    errors.push('availablePieces must be null or integer ≥ 0')
  }
  return errors
}

export function validateRequiredPiece (input: {
  widthMm: number
  lengthMm: number
  quantity: number
}): string[] {
  const errors: string[] = []
  if (!isPositive(input.widthMm)) {
    errors.push('widthMm must be > 0')
  }
  if (!isPositive(input.lengthMm)) {
    errors.push('lengthMm must be > 0')
  }
  if (!isIntegerAtLeast(input.quantity, 1)) {
    errors.push('quantity must be integer ≥ 1')
  }
  return errors
}

export function validateSettings (input: {
  sawKerfMm: number
  unitSystem: 'mm' | 'inch'
  currency: string
}): string[] {
  const errors: string[] = []
  if (!isNonNegative(input.sawKerfMm)) {
    errors.push('sawKerfMm must be ≥ 0')
  }
  if (!['mm', 'inch'].includes(input.unitSystem)) {
    errors.push('unitSystem must be mm or inch')
  }
  if (!input.currency) {
    errors.push('currency required')
  }
  return errors
}
