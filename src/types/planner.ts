export class PlankDimension {
  widthMm: number
  lengthMm: number

  constructor ({ widthMm = 0, lengthMm = 0 }: { widthMm?: number, lengthMm?: number }) {
    this.widthMm = widthMm
    this.lengthMm = lengthMm
  }

  get hash () {
    return this.widthMm + ',' + this.lengthMm
  }
}

export class AvailablePlank extends PlankDimension {
  pricePerPiece: number
  articleNr: string | null

  constructor ({ widthMm = 0, lengthMm = 0, pricePerPiece = 0, articleNr = null }: { widthMm?: number, lengthMm?: number, pricePerPiece?: number, articleNr?: string | null }) {
    super({ widthMm, lengthMm })
    this.articleNr = articleNr
    this.pricePerPiece = pricePerPiece
  }

  // get hash() {
  //   return this.widthMm + ',' + this.lengthMm + ',' + this.pricePerPiece + ',' + this.articleNr
  // }

  get completeHash () {
    return this.widthMm + ',' + this.lengthMm + ',' + this.pricePerPiece + ',' + this.articleNr
  }
}

// A real world plank
export class Plank extends PlankDimension {
  availablePlank: AvailablePlank
  isHalved: boolean
  otherHalf: Plank | null
  pieces: PlankPiece[]

  constructor ({ availablePlank, pieces = [] }: { availablePlank: AvailablePlank, pieces?: PlankPiece[] }) {
    super({ widthMm: availablePlank.widthMm, lengthMm: availablePlank.lengthMm })
    this.availablePlank = availablePlank
    this.pieces = pieces
    this.isHalved = false
    this.otherHalf = null
  }

  get lengthMmLeft () {
    let lengthMmLeft = this.availablePlank.lengthMm
    for (const piece of this.pieces) {
      lengthMmLeft -= piece.lengthMm
      lengthMmLeft -= piece.cutWidthMm
    }
    return lengthMmLeft
  }

  get wasteFraction() {
    return this.lengthMmLeft / this.availablePlank.lengthMm
  }

  get pricePerMeter () {
    return this.availablePlank.pricePerPiece / this.availablePlank.lengthMm
  }

  get hash () {
    return this.availablePlank.hash + '(' + this.pieces.reduce((acc, p) => acc + p.lengthMm, 0) + ')'
  }

  addPiece (piece: PlankPiece) {
    const offset = this.pieces.reduce((acc, p) => acc + p.lengthMm + p.cutWidthMm, 0)
    this.pieces.push(piece)

    // Calculate offset of piece
    piece.offsetMm = offset
  }

  copy () {
    return new Plank({ availablePlank: this.availablePlank, pieces: [...this.pieces] })
  }

  halve () {
    const plank1 = this.copy()
    const plank2 = this.copy()
    plank1.widthMm /= 2
    plank2.widthMm /= 2
    plank1.isHalved = true
    plank2.isHalved = true

    plank1.otherHalf = plank2
    plank2.otherHalf = plank1

    return { plank1, plank2 }
  }
}

export class PlankPiece extends PlankDimension {
  cutWidthMm: number
  offsetMm: number

  constructor ({ widthMm = 0, lengthMm = 0, cutWidthMm = 0 }: { widthMm?: number, lengthMm?: number, cutWidthMm?: number }) {
    super({ widthMm, lengthMm })
    this.cutWidthMm = cutWidthMm
    this.offsetMm = 0
  }
}

export class PlankStorage {
  availablePlankAmount: Map<Plank, number | null>

  constructor () {
    this.availablePlankAmount = new Map()
  }

  get hash () {
    return Array.from(this.availablePlankAmount.entries()).map(([plank, amount]) => plank.hash + ',' + amount).join('|')
  }

  get availablePlanks () {
    return Array.from(this.availablePlankAmount.entries())
      .filter(([_plank, amount]) => amount === null || amount > 0)
      .map(([plank, _amount]) => plank)
  }

  copy () {
    const copy = new PlankStorage()
    copy.availablePlankAmount = new Map(this.availablePlankAmount)
    return copy
  }

  addPlank (plank: Plank) {
    const amount = this.availablePlankAmount.get(plank) ?? null
    this.availablePlankAmount.set(plank, amount === null ? null : amount + 1)
    return this
  }

  removePlank (plank: Plank) {
    const amount = this.availablePlankAmount.get(plank) ?? null
    this.availablePlankAmount.set(plank, amount === null ? null : amount - 1)
    return this
  }
}

// Minimal UI/storage-facing required piece shape
export interface RequiredPieceInput {
  widthMm: number
  lengthMm: number
  quantity: number
  comment?: string | null
}

export interface GlobalSettings {
  sawKerfMm: number
  unitSystem: 'mm' | 'inch'
  currency: string
  allowHalving: boolean
}

export interface PurchasePlanItem {
  plank: AvailablePlank
  quantity: number
}

export interface CutAssignment {
  plank: Plank
  pieceIds: string[]
  cutPositionsMm: number[]
}

// export interface CutPlanItem {
//   source: PlankSKU
//   assignments: CutAssignment[]
// }

// export interface CutPlan {
//   items: CutPlanItem[]
//   totalCost: number
//   totalCuts: number
// }

export type PieceIdentity = string // hash of width, length, source articleNr, ordinal
