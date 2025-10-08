// Generic sorter for plank-like objects used in UI tables
export function sortPlanks<T extends { widthMm: number, lengthMm: number, pricePerPiece: number }>(a: T, b: T): number {
  if (a.widthMm !== b.widthMm) return a.widthMm - b.widthMm
  if (a.lengthMm !== b.lengthMm) return a.lengthMm - b.lengthMm
  return a.pricePerPiece - b.pricePerPiece
}


