<div align="center">

# Plank Cut Planner

Plan the shopping list of wooden planks based on store availability and your required pieces. The app computes an optimized purchase plan and a cut plan that aim to minimize cost and waste.

App available at [vschroeter.github.io/plank-cut-planner/](https://github.com/vschroeter/plank-cut-planner.git)

</div>

---

## Purpose

Given a set of required rectangular pieces and a catalog of available planks at a hardware store (length, width, price, optional article number), the planner finds a combination of planks to buy and assigns cuts so that:

- Total cost is minimized
- Waste is minimized (respecting saw kerf)
- Orientation is respected (pieces are not rotated 90°)
- Tie‑breakers prefer fewer total cuts, then fewer purchased planks

You can add/edit inputs directly in the UI, then view the computed Purchase Plan and Cut Plan. Plans can be exported as JSON (for later import) or Markdown (for printing/sharing).

## Features

- Required Pieces table: length × width and quantity
- Available Planks table: length × width, price, optional article number
- Settings: saw kerf, unit system (`mm` or `inch`), currency, auto‑recompute toggle
- Purchase Plan with totals and cheapest feasible combination
- Cut Plan visualization per purchased plank, respecting kerf and orientation
- Export/Import: JSON round‑trip; Markdown export of the cut plan
- Local persistence: data is stored in the browser (via Pinia + localStorage)

## Quickstart

### Prerequisites

- Node.js 22+
- pnpm 9+

### Install

```bash
pnpm install
```

### Run dev server

```bash
pnpm dev
```

Vite will print the local URL (typically `http://localhost:3000`).

### Build and preview

```bash
pnpm build
pnpm preview
```

### Test and lint

```bash
pnpm test        # run tests once
pnpm test:watch  # watch mode
pnpm lint        # eslint --fix
pnpm type-check  # vue-tsc project check
```

## Usage

1. Open the app and go to the main planner page.
2. Add Required Pieces: enter length × width and quantity. Units follow the setting in Settings.
3. Add Available Planks: enter plank length × width and price; article number is optional.
   - Duplicate handling: rows with the same article number are merged (availability sums; latest price wins). If article number is blank, rows are merged only when `(width, length, price)` are identical.
4. Adjust Settings: saw kerf (mm), unit system (`mm`/`inch`), currency, and auto‑recompute.
   - Auto‑recompute is enabled until a computation takes > 1.0s; then it is disabled to keep the UI responsive. You can re‑enable it in Settings.
5. Compute:
   - If auto is on, plans recompute as you edit.
   - If auto is off, click the Compute button in the footer or “Compute Now” in Settings.
6. Review results:
   - Purchase Plan: see which planks to buy and totals.
   - Cut Plan: per‑plank layout of cuts, respecting kerf and orientation.
7. Export/Import:
   - Toolbar actions: Export JSON (download icon), Export Markdown (document icon), Import JSON (upload icon).
   - JSON lets you save and restore all tables and settings.
   - Markdown exports a printable cut‑plan summary.

## ⚠️ Performance Warning

**This problem is NP-hard** (it's a variant of the bin packing problem). The current implementation uses exact algorithms that work well for small to medium-sized inputs, but performance degrades exponentially with larger problem sizes.

**Recommendation**: Keep the number of required pieces below 20 for optimal performance. For larger inputs, the computation may become slow or unresponsive.


## TODO

- [ ] Implement approximation algorithms (e.g., First Fit Decreasing, Best Fit Decreasing) for handling larger inputs efficiently

<!-- 
## How it works (high level)

- Cuts are orthogonal to the plank’s long side (length); pieces are not rotated 90°.
- Saw kerf is inserted between sequential cuts.
- The solver searches feasible assignments, optimizing for cost and waste with tie‑breakers: fewest cuts, then fewest purchased planks.
- Errors (e.g., unsatisfiable inputs) are shown as alerts above the tables. -->
