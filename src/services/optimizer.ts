import { Heap } from 'data-structure-typed'
import { type GlobalSettings, type Plank, PlankDimension, PlankPiece, type PlankStorage, type RequiredPieceInput } from '@/types/planner'

interface ComputeInput {
  // availablePlanks: AvailablePlank[]
  availablePlanks: PlankStorage
  storage: PlankStorage
  requiredPieces: RequiredPieceInput[]
  settings: GlobalSettings
}

interface ComputeResult {
  planksToBePurchased: Plank[]
  errors: string[]
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

  // get hash () {
  //   return this.requiredPiecesLeft.map(p => p.hash).join('|') + '--' + this.planksToBePurchased.map(p => p.lengthMmLeft).join('|')
  // }

  getVisitedHash (minLengthMm: number) {
    return this.requiredPiecesLeft.map(p => p.hash).join('|') + '--' + this.planksToBePurchased.filter(p => p.lengthMmLeft > minLengthMm).toSorted((a, b) => b.lengthMmLeft - a.lengthMmLeft).map(p => p.lengthMmLeft).join('|')
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
    })
    plank.addPiece(_plankPiece)

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

    const _plankPiece = new PlankPiece({
      widthMm: currentRequiredPiece.widthMm,
      lengthMm: currentRequiredPiece.lengthMm,
      cutWidthMm: settings.sawKerfMm,
    })
    plank.addPiece(_plankPiece)

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
  // const cutPlan: CutPlan = { items: [], totalCost: 0, totalCuts: 0 }
  const errors: string[] = []

  // Visit statistics grouped by remaining required pieces signature
  type GroupStats = {
    polled: number
    uniqueVisited: number
    duplicates: number
    enqueueNewPlank: number
    enqueueExistingPlank: number
    minCost: number
    maxCost: number
    examplePiecesLeft: Array<{ widthMm: number, lengthMm: number }>
  }
  const visitStatsByPiecesLeft = new Map<string, GroupStats>()
  let totalPolled = 0
  let totalUniqueVisited = 0
  let totalDuplicates = 0

  const getPiecesLeftKey = (pieces: PlankDimension[]): string => pieces.map(p => p.hash).join('|')
  const ensureGroup = (key: string, pieces: PlankDimension[], cost: number): GroupStats => {
    const existing = visitStatsByPiecesLeft.get(key)
    if (existing) {
      existing.minCost = Math.min(existing.minCost, cost)
      existing.maxCost = Math.max(existing.maxCost, cost)
      return existing
    }
    const created: GroupStats = {
      polled: 0,
      uniqueVisited: 0,
      duplicates: 0,
      enqueueNewPlank: 0,
      enqueueExistingPlank: 0,
      minCost: cost,
      maxCost: cost,
      examplePiecesLeft: pieces.map(p => ({ widthMm: p.widthMm, lengthMm: p.lengthMm })),
    }
    visitStatsByPiecesLeft.set(key, created)
    return created
  }
  const finalizeAndLog = (): void => {
    const byPiecesLeft = Array.from(visitStatsByPiecesLeft.entries()).map(([key, stats]) => ({
      key,
      ...stats,
    })).toSorted((a, b) => b.polled - a.polled || b.uniqueVisited - a.uniqueVisited)
    const summary = {
      totals: {
        polled: totalPolled,
        uniqueVisited: totalUniqueVisited,
        duplicates: totalDuplicates,
        groups: byPiecesLeft.length,
      },
      byPiecesLeft,
    }
    // Single consolidated log output for optimizer visit stats
    console.log(summary)
  }

  if (requiredPieces.length === 0) {
    finalizeAndLog()
    return { planksToBePurchased: [], errors }
  }

  // Convert required pieces to simple PlankDimension-like objects
  const requiredPiecesAsDimensions = new Array<PlankDimension>()
  for (const piece of requiredPieces) {
    for (let i = 0; i < piece.quantity; i++) {
      requiredPiecesAsDimensions.push(new PlankDimension({ widthMm: piece.widthMm, lengthMm: piece.lengthMm }))
    }
  }

  // We want to execute the optimizer for each unique width separately
  const uniqueWidths = [...new Set(requiredPiecesAsDimensions.map(p => p.widthMm))]
  console.log('Unique widths', uniqueWidths)

  const results: ComputeResult[] = uniqueWidths.map(width => {
    console.log('Processing width', width)
    const widthRequiredPieces = requiredPiecesAsDimensions.filter(p => p.widthMm === width)

    // Sort the required planks by length descending, starting with the longest
    const sortedRequiredPieces = [...widthRequiredPieces].toSorted((a, b) => b.widthMm - a.widthMm || b.lengthMm - a.lengthMm)
    const _maxLengthMm = sortedRequiredPieces[0]!.lengthMm
    const minLengthMm = sortedRequiredPieces.at(-1)!.lengthMm

    console.log('Sorted required pieces', sortedRequiredPieces)

    // Pre-validate feasibility: widths and lengths
    const availableByWidth = new Map<number, Plank[]>()
    for (const [plank, amount] of availablePlanks.availablePlankAmount.entries()) {
      if (amount === null || amount > 0) {
        const list = availableByWidth.get(plank.widthMm) ?? []
        list.push(plank)
        availableByWidth.set(plank.widthMm, list)
      }
    }

    const missingWidthErrors = new Set<string>()
    const noFitLengthErrors = new Set<string>()
    for (const req of requiredPieces) {
      const candidates = availableByWidth.get(req.widthMm) ?? []
      if (candidates.length === 0) {
        missingWidthErrors.add(`No available planks with width ${req.widthMm}mm for required pieces`)
        continue
      }
      const hasFit = candidates.some(p => p.lengthMm >= req.lengthMm)
      if (!hasFit) {
        noFitLengthErrors.add(`No plank of width ${req.widthMm}mm has length ≥ ${req.lengthMm}mm`)
      }
    }

    errors.push(...missingWidthErrors, ...noFitLengthErrors)
    if (errors.length > 0) {
      finalizeAndLog()
      return { planksToBePurchased: [], errors }
    }

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

    // return { planksToBePurchased: [] }

    while (queue.size > 0) {
      const currentNode = queue.poll()

      if (!currentNode) {
        break
      }

      const requiredPiecesLeft = currentNode.requiredPiecesLeft
      const _currentTotalCost = currentNode.totalPrice
      const availableStorage = currentNode.storage

      // Update group-level poll stats
      const groupKey = getPiecesLeftKey(requiredPiecesLeft)
      const groupStats = ensureGroup(groupKey, requiredPiecesLeft, _currentTotalCost)
      groupStats.polled += 1
      totalPolled += 1

      // If we have no required pieces, we have found a solution
      if (requiredPiecesLeft.length === 0) {
        totalUniqueVisited = visited.size
        finalizeAndLog()
        return { planksToBePurchased: currentNode.planksToBePurchased, errors }
      }

      // Check if we have already visited this node
      const hash = currentNode.getVisitedHash(minLengthMm)
      if (visited.has(hash)) {
        groupStats.duplicates += 1
        totalDuplicates += 1
        continue
      }

      visited.add(hash)
      groupStats.uniqueVisited += 1

      const currentPiece = requiredPiecesLeft[0]!
      // const restRequiredPieces = requiredPiecesLeft.slice(1)

      // Create possible next nodes
      let newPlankAdds = 0
      for (const plank of availableStorage.availablePlanks) {
        if (plank.lengthMmLeft >= currentPiece.lengthMm && plank.widthMm == currentPiece.widthMm) {
          const nextNode = currentNode.createNextNodeWithNewPlank(plank, settings)
          queue.add(nextNode)
          newPlankAdds += 1
        }
      }
      groupStats.enqueueNewPlank += newPlankAdds

      let existingPlankAdds = 0
      for (const plank of currentNode.planksToBePurchased) {
        if (plank.lengthMmLeft >= currentPiece.lengthMm && plank.widthMm == currentPiece.widthMm) {
          const nextNode = currentNode.createNextNodeWithExistingPlank(plank, settings)
          queue.add(nextNode)
          existingPlankAdds += 1
        }
      }
      groupStats.enqueueExistingPlank += existingPlankAdds
    }

    // If we exhaust the search without a solution, report as unsatisfiable
    errors.push('Not enough material to satisfy all required pieces')
    totalUniqueVisited = visited.size
    finalizeAndLog()
    return { planksToBePurchased: [], errors }
  })

  return results.reduce((acc, result) => {
    acc.planksToBePurchased.push(...result.planksToBePurchased)
    acc.errors.push(...result.errors)
    return acc
  }, { planksToBePurchased: [], errors: [] } as ComputeResult)
}
