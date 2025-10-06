# Tasks: Material Planning and Cut Optimization

Feature Dir: `C:\Users\schoc\Documents\Git\Wildau\material-planner\specs\001-material-planning-web`
Repo Root: `C:\Users\schoc\Documents\Git\Wildau\material-planner`

Conventions
- [P] = can run in parallel (different files, no dependency conflicts)
- Use pnpm for scripts; add scripts as specified below
- Test-first where applicable; write failing tests before implementation

## Phase 3.1: Setup
- [ ] T001 Ensure dependencies: add @vueuse/core, vitest, @vue/test-utils, jsdom
  - Files: `C:\Users\schoc\Documents\Git\Wildau\material-planner\package.json`
  - Add deps: `@vueuse/core`, `vitest`, `@vue/test-utils`, `jsdom`
  - Add script: "test": "vitest --run", "test:watch": "vitest"
- [ ] T002 Create Vitest config
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\vitest.config.ts`
  - jsdom environment, alias `@` to `src`, include `.vue` transform
- [ ] T003 [P] Create test setup file
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\tests\setup.ts`
  - Configure Vuetify and global stubs for tests
- [ ] T004 [P] Create shared domain types
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\types\planner.ts`
  - Define `PlankSKU`, `RequiredPiece`, `GlobalSettings`, `PurchasePlanItem`, `CutAssignment`, `CutPlan`

## Phase 3.2: Tests First (TDD)
- [ ] T005 [P] Unit test: sorting of Available Planks
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\tests\unit\stores\planner.sort.spec.ts`
  - Assert sort by width asc, then length asc, then price asc
- [ ] T006 [P] Unit test: persistence with useLocalStorage
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\tests\unit\stores\planner.persist.spec.ts`
  - Assert state rehydrates after store re-initialization
- [ ] T007 [P] Unit test: tie-breaker logic (fewest SKUs, then fewest cuts)
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\tests\unit\services\optimizer.tiebreak.spec.ts`
- [ ] T008 [P] Unit test: orientation constraint and kerf spacing
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\tests\unit\services\optimizer.orientation.spec.ts`
- [ ] T009 [P] Integration test: user story happy-path compute and visualization presence
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\tests\integration\app.happy.spec.ts`
  - Load `src/pages/index.vue`, enter sample data, assert purchase plan table and cut plan appear
- [ ] T010 [P] Integration test: unsatisfiable demand shows clear error with blocking constraints
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\tests\integration\app.unsatisfiable.spec.ts`
- [ ] T011 [P] Unit test: unit conversion and formatting rules
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\tests\unit\composables\useUnits.spec.ts`

## Phase 3.3: Core Implementation
- [ ] T012 Implement Pinia planner store with persisted state
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\stores\planner.ts`
  - State: availablePlanks, requiredPieces, settings
  - Persistence: VueUse `useLocalStorage` inside store declaration
  - Getters: sortedAvailablePlanks, purchasePlan, cutPlan, totalCuts
  - Actions: add/update/remove rows; setSawKerf; setUnitSystem; computePlans; toggle auto-recompute
- [ ] T013 Implement optimization service with constraints and tie-breaker
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\services\optimizer.ts`
  - Inputs: store state; Outputs: PurchasePlan, CutPlan, totalCuts; enforce availability caps; orientation; kerf spacing; tie-break
- [ ] T014 [P] Implement unit conversion composable
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\composables\useUnits.ts`
  - Convert mm <-> inches; formatting per spec
- [ ] T015 [P] Implement utility: sort helpers
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\lib\sorting.ts`
  - Compare by width, then length, then price
- [ ] T016 [P] Implement validation utilities
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\lib\validation.ts`
  - Validate dimensions > 0, quantities integer ≥ 1, availability null or integer ≥ 0

## Phase 3.4: UI Components (Vuetify)
- [ ] T017 Available Planks table (editable, add/remove, auto-sort)
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\components\AvailablePlanksTable.vue`
- [ ] T018 [P] Required Pieces table (editable, add/remove)
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\components\RequiredPiecesTable.vue`
- [ ] T019 [P] Global Settings card (kerf, unit toggle, auto-recompute toggle, timing)
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\components\GlobalSettingsCard.vue`
- [ ] T020 [P] Purchase Plan table (SKU, dims, price, quantity, subtotal, totals)
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\components\PurchasePlanTable.vue`
- [ ] T021 [P] Cut Plan visualization (SVG) with kerf spacing and labels/hover details
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\components\CutPlanView.vue`
- [ ] T022 [P] Compute status/error bar (unsatisfiable explanations, performance, manual compute button)
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\components\ComputeStatusBar.vue`

## Phase 3.5: Page Integration
- [ ] T023 Integrate components into index page with responsive layout
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\pages\index.vue`
  - Use Vuetify grid; persist and restore state; wire to store actions

## Phase 3.6: Polish & Accessibility
- [ ] T024 [P] Unit tests for store actions and getters coverage (additional)
  - Files: `C:\Users\schoc\Documents\Git\Wildau\material-planner\tests\unit\stores\planner.more.spec.ts`
- [ ] T025 [P] Unit tests for components (input validation, events)
  - Files: `C:\Users\schoc\Documents\Git\Wildau\material-planner\tests\unit\components\tables.spec.ts`
- [ ] T026 [P] Performance test: optimizer typical dataset under 1.0s
  - Files: `C:\Users\schoc\Documents\Git\Wildau\material-planner\tests\unit\services\optimizer.perf.spec.ts`
- [ ] T027 [P] Documentation updates (usage notes in quickstart)
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\specs\001-material-planning-web\quickstart.md`

## Dependencies
- Setup (T001–T004) before Tests (T005–T011)
- Tests (T005–T011) before Core (T012–T016)
- Core before UI (T017–T022)
- UI before Page Integration (T023)
- Everything before Polish (T024–T027)

## Parallel Execution Examples
- Group A (after setup): run tests in parallel
  - T005, T006, T007, T008, T009, T010, T011 [P]
  - Command suggestion:
    - pnpm test -- -t sort
    - pnpm test -- -t persist
    - pnpm test -- -t tiebreak
    - pnpm test -- -t orientation
    - pnpm test -- -t happy
    - pnpm test -- -t unsatisfiable
    - pnpm test -- -t units
- Group B (core utilities):
  - T014, T015, T016 [P]

## Notes
- Use Pinia with VueUse useLocalStorage inside the store declarations
- Use Vuetify components for all UI
- Duplicates allowed (same ArticleNr); tie-break by fewest SKUs then fewest cuts; display total cuts
