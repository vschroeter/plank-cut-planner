export interface PlankSKU {
  widthMm: number
  lengthMm: number
  pricePerPiece: number
  articleNr: string
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
}

export interface PurchasePlanItem {
  articleNr: string
  widthMm: number
  lengthMm: number
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface CutAssignment {
  articleNr: string
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


