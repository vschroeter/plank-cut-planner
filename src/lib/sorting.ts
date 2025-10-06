import type { PlankSKU } from '@/types/planner'

export function sortPlanks(a: PlankSKU, b: PlankSKU): number {
  if (a.widthMm !== b.widthMm) return a.widthMm - b.widthMm
  if (a.lengthMm !== b.lengthMm) return a.lengthMm - b.lengthMm
  return a.pricePerPiece - b.pricePerPiece
}


