# Data Model

## Entities

### PlankSKU (Available Plank)
- widthMm: number (mm)
- lengthMm: number (mm)
- pricePerPiece: number (currency)
- articleNr: string | null (optional)
- availablePieces: number | null (null = unlimited)
- derived: areaMm2 (number; informational)

Validation:
- widthMm, lengthMm > 0
- pricePerPiece ≥ 0
- availablePieces is null or integer ≥ 0

### RequiredPiece
- widthMm: number (mm)
- lengthMm: number (mm)
- quantity: number (integer ≥ 1)
- comment: string | null

Validation:
- widthMm, lengthMm > 0
- quantity integer ≥ 1

### GlobalSettings
- sawKerfMm: number (default 3)
- unitSystem: 'mm' | 'inch' (default 'mm')
- currency: string (default '€')

### PurchasePlanItem
- articleNr: string | null
- widthMm: number
- lengthMm: number
- unitPrice: number
- quantity: number
- subtotal: number (unitPrice × quantity)

### CutAssignment
- articleNr: string (source plank)
- pieceIds: string[] (or indices)
- cutPositionsMm: number[] (ordered positions along length, kerf applied)

### CutPlan
- items: Array<{ source: PlankSKU, assignments: CutAssignment[] }>
- totalCost: number
- totalCuts: number

### PieceIdentity & Done State
- pieceIdentity: string (hash of width, length, source articleNr, ordinal)
- donePieces: Record<string, boolean> (persisted; true when piece is marked Done)

## Units & Formatting
- Internally store in mm. Convert for display when unitSystem is 'inch'. Preserve value fidelity on toggles.

## Store Shape (Pinia)
State:
- availablePlanks: PlankSKU[] (persisted)
- requiredPieces: RequiredPiece[] (persisted)
- settings: GlobalSettings (persisted)
- donePieces: Record<string, boolean> (persisted)

Getters:
- sortedAvailablePlanks
- purchasePlan: PurchasePlanItem[]
- cutPlan: CutPlan
- totalCuts: number

Actions:
- addPlank, updatePlank, removePlank
- addRequiredPiece, updateRequiredPiece, removeRequiredPiece
- setSawKerf, setUnitSystem
- setCurrency
- computePlans (auto/manual depending on mode)
- markPieceDone(pieceIdentity: string, done: boolean)
- resetAllDone()

Constraints:
- Orientation: no 90° rotation; cuts along length only.
- Availability caps respected when optimizing.


