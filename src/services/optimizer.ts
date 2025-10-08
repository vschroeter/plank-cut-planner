import { Heap } from 'data-structure-typed'
import { AvailablePlank, type GlobalSettings, type Plank, PlankDimension, PlankPiece, type PlankStorage, type PurchasePlanItem, type RequiredPiece } from '@/types/planner'

interface ComputeInput {
  // availablePlanks: AvailablePlank[]
  availablePlanks: PlankStorage
  storage: PlankStorage
  requiredPieces: RequiredPiece[]
  settings: GlobalSettings
}

interface ComputeResult {
  planksToBePurchased: Plank[]
  // cutPlan: CutPlan
  // totalCuts: number
}

class HeapNode {
  requiredPiecesLeft: PlankDimension[] = []
  planksToBePurchased: Plank[] = []
  totalPrice = 0
  storage: PlankStorage
  previousNode: HeapNode | null = null

  constructor ({ requiredPiecesLeft, planksToBePurchased, storage, previousNode, totalPrice }: { requiredPiecesLeft: PlankDimension[], planksToBePurchased: Plank[], storage: PlankStorage, previousNode: HeapNode | null, totalPrice: number }) {
    this.requiredPiecesLeft = requiredPiecesLeft
    this.planksToBePurchased = planksToBePurchased
    this.storage = storage
    this.previousNode = previousNode
    this.totalPrice = totalPrice
  }

  get hash () {
    return this.requiredPiecesLeft.map(p => p.hash).join('|') + '#' + this.planksToBePurchased.map(p => p.hash).join('|') + '#' + this.storage.hash
  }

  createNextNodeWithNewPlank (plank: Plank, settings: GlobalSettings) {
    // Remove first required piece from requiredPiecesLeft
    const requiredPiecesLeft = [...this.requiredPiecesLeft]
    const currentRequiredPiece = requiredPiecesLeft.shift()

    if (!currentRequiredPiece) {
      throw new Error('No required piece left')
    }

    plank = plank.copy()

    const _plankPiece = new PlankPiece({
      widthMm: currentRequiredPiece.widthMm,
      lengthMm: currentRequiredPiece.lengthMm,
      cutWidthMm: settings.sawKerfMm,
      plank,
    })

    return new HeapNode({
      requiredPiecesLeft,
      planksToBePurchased: [...this.planksToBePurchased, plank],
      storage: this.storage.copy(),
      previousNode: this,
      totalPrice: this.totalPrice + plank.availablePlank.pricePerPiece,
    })
  }

  createNextNodeWithExistingPlank (plank: Plank, settings: GlobalSettings) {
    const requiredPiecesLeft = [...this.requiredPiecesLeft]
    const currentRequiredPiece = requiredPiecesLeft.shift()
    if (!currentRequiredPiece) {
      throw new Error('No required piece left')
    }

    // plank = plank.copy()

    const _plankPiece = new PlankPiece({
      widthMm: currentRequiredPiece.widthMm,
      lengthMm: currentRequiredPiece.lengthMm,
      cutWidthMm: settings.sawKerfMm,
      plank,
    })

    return new HeapNode({
      requiredPiecesLeft,
      planksToBePurchased: this.planksToBePurchased,
      storage: this.storage.copy(),
      previousNode: this,
      totalPrice: this.totalPrice,
    })
  }
}

// // Very simple greedy placeholder satisfying tests; replace with robust optimizer later
// export function computeOptimalPlanGreedy (input: ComputeInput): ComputeResult {
//   const { availablePlanks, requiredPieces, settings } = input
//   const kerf = settings.sawKerfMm

//   const planItems: PurchasePlanItem[] = []
//   const cutPlan: CutPlan = { items: [], totalCost: 0, totalCuts: 0 }

//   if (requiredPieces.length === 0 || availablePlanks.length === 0) {
//     return { purchasePlan: [], cutPlan, totalCuts: 0 }
//   }

//   // Greedy: for each piece, pick the cheapest plank that fits without rotation
//   const sortedPlanks = [...availablePlanks].sort((a, b) => a.pricePerPiece - b.pricePerPiece)

//   const pieceCount = requiredPieces.reduce((sum, p) => sum + p.quantity, 0)
//   if (pieceCount === 0) {
//     return { purchasePlan: [], cutPlan, totalCuts: 0 }
//   }

//   // Compute per SKU piece counts and pairing capability for simple deterministic packing
//   const needsBySku = new Map<string, { plank: PlankSKU, pieces: number, canPair: boolean }>()

//   const piecesExpanded = requiredPieces.flatMap(p => Array.from({ length: p.quantity }, () => ({ widthMm: p.widthMm, lengthMm: p.lengthMm })))

//   for (const piece of piecesExpanded) {
//     // find plank that fits width and length with kerf placement; choose cheapest
//     const candidate = sortedPlanks.find(pl => pl.widthMm >= piece.widthMm && pl.lengthMm >= piece.lengthMm)
//     if (!candidate) {
//       // unsatisfiable: return empty results; UI will show error later
//       return { purchasePlan: [], cutPlan, totalCuts: 0 }
//     }

//     const key = candidate.articleNr + '|' + candidate.lengthMm + '|' + candidate.widthMm
//     const canTwo = piece.lengthMm * 2 + kerf <= candidate.lengthMm
//     const current = needsBySku.get(key) ?? { plank: candidate, pieces: 0, canPair: true }
//     current.pieces += 1
//     current.canPair = current.canPair && canTwo
//     needsBySku.set(key, current)
//   }

//   for (const { plank, pieces, canPair } of needsBySku.values()) {
//     const quantity = canPair ? Math.ceil(pieces / 2) : pieces
//     const cuts = canPair ? Math.max(0, pieces - quantity) : 0
//     const subtotal = quantity * plank.pricePerPiece
//     planItems.push({
//       articleNr: plank.articleNr,
//       widthMm: plank.widthMm,
//       lengthMm: plank.lengthMm,
//       unitPrice: plank.pricePerPiece,
//       quantity,
//       subtotal,
//     })
//     // Populate minimal cut assignments to satisfy test expectations
//     const assignments = quantity > 0
//       ? [{
//           articleNr: plank.articleNr,
//           pieceIds: [],
//           cutPositionsMm: cuts > 0 ? Array.from({ length: Math.max(1, cuts) }, (_, i) => (i + 1) * 100) : [],
//         }]
//       : []
//     cutPlan.items.push({ source: plank, assignments })
//     cutPlan.totalCost += subtotal
//     cutPlan.totalCuts += cuts
//   }

//   // Tie-breaker implicitly favors fewer SKUs because we grouped by candidate selection
//   return { purchasePlan: planItems, cutPlan, totalCuts: cutPlan.totalCuts }
// }

// Dynamic Disjkstra optimizer
export function computeOptimalPlan (input: ComputeInput): ComputeResult {
  const { availablePlanks, requiredPieces, settings } = input
  const kerf = settings.sawKerfMm

  const planItems: PurchasePlanItem[] = []
  // const cutPlan: CutPlan = { items: [], totalCost: 0, totalCuts: 0 }

  if (requiredPieces.length === 0) {
    return { planksToBePurchased: [] }
  }

  // Convert required pieces to simple PlankDimension-like objects
  const requiredPiecesAsDimensions = new Array<PlankDimension>()
  for (const piece of requiredPieces) {
    for (let i = 0; i < piece.quantity; i++) {
      requiredPiecesAsDimensions.push(new PlankDimension({ widthMm: piece.widthMm, lengthMm: piece.lengthMm }))
    }
  }

  // Sort the required planks by length descending, starting with the longest
  const sortedRequiredPieces = [...requiredPiecesAsDimensions].toSorted((a, b) => b.lengthMm - a.lengthMm)

  const initialNode: HeapNode = new HeapNode({
    requiredPiecesLeft: sortedRequiredPieces,
    planksToBePurchased: [],
    totalPrice: 0,
    storage: availablePlanks.copy(),
    previousNode: null,
  })

  const queue = new Heap<HeapNode>([initialNode], {
    comparator: (a, b) => {
      if (a.totalPrice == b.totalPrice) {
        return a.planksToBePurchased.length - b.planksToBePurchased.length
      }
      return a.totalPrice - b.totalPrice
    },
  })

  const visited = new Set<string>()

  while (queue.size > 0) {
    const currentNode = queue.poll()

    if (!currentNode) {
      break
    }

    const requiredPiecesLeft = currentNode.requiredPiecesLeft
    const currentTotalCost = currentNode.totalPrice
    const availableStorage = currentNode.storage

    // If we have no required pieces, we have found a solution
    if (requiredPiecesLeft.length === 0) {
      return { planksToBePurchased: currentNode.planksToBePurchased }
    }

    // Check if we have already visited this node
    const hash = currentNode.hash
    if (visited.has(hash)) {
      continue
    }

    visited.add(hash)

    const currentPiece = requiredPiecesLeft[0]!
    // const restRequiredPieces = requiredPiecesLeft.slice(1)

    // Create possible next nodes
    for (const plank of availableStorage.availablePlanks) {
      if (plank.lengthMmLeft >= currentPiece.lengthMm) {
        const nextNode = currentNode.createNextNodeWithNewPlank(plank, settings)
        queue.add(nextNode)
      }
    }

    for (const plank of currentNode.planksToBePurchased) {
      if (plank.lengthMmLeft >= currentPiece.lengthMm) {
        const nextNode = currentNode.createNextNodeWithExistingPlank(plank, settings)
        queue.add(nextNode)
      }
    }
  }

  return { planksToBePurchased: [] }
}
