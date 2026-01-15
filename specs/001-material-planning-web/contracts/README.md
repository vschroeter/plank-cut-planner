# Contracts

This feature is frontend-only with no external network API. Contracts here define internal store and composable interfaces to ensure consistent usage.

## Store: useAppStore

```ts
// State (persisted via VueUse useLocalStorage)
interface PlankSKU {
  widthMm: number;
  lengthMm: number;
  pricePerPiece: number;
  articleNr?: string | null;
  availablePieces: number | null;
}

interface RequiredPiece {
  widthMm: number;
  lengthMm: number;
  quantity: number;
  comment?: string | null;
}

interface GlobalSettings {
  sawKerfMm: number; // default 3
  unitSystem: 'mm' | 'inch';
  currency: string; // default '€'
}
```

```ts
// Getters
function sortedAvailablePlanks(): PlankSKU[];
function purchasePlan(): Array<{ articleNr: string | null; widthMm: number; lengthMm: number; unitPrice: number; quantity: number; subtotal: number }>;
function cutPlan(): { items: Array<any>; totalCost: number; totalCuts: number };
function totalCuts(): number;
```

```ts
// Actions
function addPlank(p: PlankSKU): void;
function updatePlank(index: number, p: Partial<PlankSKU>): void;
function removePlank(index: number): void;

function addRequiredPiece(p: RequiredPiece): void;
function updateRequiredPiece(index: number, p: Partial<RequiredPiece>): void;
function removeRequiredPiece(index: number): void;

function setSawKerf(mm: number): void;
function setUnitSystem(unit: 'mm' | 'inch'): void;
function setCurrency(symbol: string): void;

function computePlans(): void; // switches to manual mode when auto disabled
function markPieceDone(pieceIdentity: string, done: boolean): void;
function resetAllDone(): void;
```

Validation rules align with `data-model.md`.
