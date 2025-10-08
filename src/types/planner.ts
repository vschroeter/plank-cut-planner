export interface PlankSKU {
  widthMm: number
  lengthMm: number
  pricePerPiece: number
  articleNr: string | null
  availablePieces: number | null
  // derived informational area
  areaMm2?: number
}

export interface RequiredPiece {
  widthMm: number
  lengthMm: number
  quantity: number
  comment?: string | null
}

export interface GlobalSettings {
  sawKerfMm: number
  unitSystem: 'mm' | 'inch'
  currency: string
}

export interface PurchasePlanItem {
  articleNr: string | null
  widthMm: number
  lengthMm: number
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface CutAssignment {
  articleNr: string | null
  pieceIds: string[]
  cutPositionsMm: number[]
}

export interface CutPlanItem {
  source: PlankSKU
  assignments: CutAssignment[]
}

export interface CutPlan {
  items: CutPlanItem[]
  totalCost: number
  totalCuts: number
}

export type PieceIdentity = string


