# Tasks: Material Planning Web (Vue 3 + TS)

**Input**: Design docs in `specs/001-material-planning-web/`
**Prerequisites**: `plan.md` (required), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Execution Flow (main)
```
1. Load plan.md → extract tech stack, structure (single frontend project)
2. Load optional docs: data-model.md (entities), contracts/ (interfaces), research.md (decisions), quickstart.md (scenarios)
3. Generate tasks by category (Setup → Tests → Core → Integration → Polish)
4. Apply rules: Tests before implementation; [P] for independent files; sequential if same file
5. Number tasks (T001+), add dependencies and parallel examples
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup
- [X] T001 Ensure toolchain ready; install deps
  - Path(s): `package.json`
  - Command(s): `pnpm install`
  - Notes: Node 22+, pnpm 9+ per `quickstart.md`
- [X] T002 [P] Configure lint + typecheck CI gate
  - Path(s): `package.json`, `.github/workflows` (if present)
  - Command(s): `pnpm lint`, `pnpm run type-check`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
CRITICAL: Write tests and make sure they FAIL before any implementation changes.

- [X] T003 [P] Unit test for validation rules from `data-model.md`
  - Path: `tests/unit/lib/validation.spec.ts`
  - Covers: width/length > 0; quantity ≥ 1; availablePieces null or ≥0; price ≥ 0
- [X] T004 [P] Contract tests for planner store API surface
  - Path: `tests/unit/stores/planner.contract.spec.ts`
  - Assert presence and types of state/getters/actions per `contracts/README.md`
- [X] T005 [P] Integration scenario: happy path from `quickstart.md`
  - Path: `tests/integration/app.happy.spec.ts` (extend existing with actual user flow; keep mount infra)
- [X] T006 [P] Unit tests: optimizer respects orientation + kerf; tie-breaker
  - Path: `tests/unit/services/optimizer.orientation.spec.ts`, `tests/unit/services/optimizer.tiebreak.spec.ts` (extend to assert totals and costs deterministically)

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [X] T007 [P] Add missing types from data model
  - Path: `src/types/planner.ts`
  - Add: `currency` on settings, `donePieces` map, `pieceIdentity` helper types, `PurchasePlanItem`/`CutPlan` already exist (ensure parity with `data-model.md`)
- [X] T008 Implement validation helpers aligned with `data-model.md`
  - Path: `src/lib/validation.ts`
  - Export: `validatePlankSKU`, `validateRequiredPiece`, `validateSettings`
- [X] T009 Update planner store to expose full contract
  - Path: `src/stores/planner.ts`
  - Add actions: `setCurrency`, `markPieceDone`, `resetAllDone`, `computePlans` already present; ensure getters match contracts; persist `donePieces`
- [X] T010 Improve optimizer to satisfy extended tests (non-rotating, kerf-aware packing, availability caps)
  - Path: `src/services/optimizer.ts`
  - Ensure: tie-break fewest cuts, then fewest purchased planks; compute `totalCuts` deterministically

## Phase 3.4: Integration
- [X] T011 Wire UI to new store contract and validators
  - Path(s): `src/pages/index.vue`, `src/components/*`
  - Ensure inputs validate, auto/manual compute toggle behavior per `research.md`
- [X] T012 Add SVG cut plan visualization hooks
  - Path: `src/components/CutPlanView.vue`
  - Render assignments and cut positions; reflect `totalCuts`

## Phase 3.5: Polish
- [X] T013 [P] Unit tests for sorting utility coverage
  - Path: `tests/unit/lib/sorting.spec.ts`
  - Ensure width→length→price ordering
- [X] T014 [P] Performance budget test for compute under 1.0s p95
  - Path: `tests/unit/services/optimizer.performance.spec.ts`
- [X] T015 [P] Update docs with current store contract and scenarios
  - Path: `specs/001-material-planning-web/contracts/README.md`, `specs/001-material-planning-web/quickstart.md`

## Dependencies
- Setup (T001–T002) before all
- Tests (T003–T006) before implementation (T007–T010)
- Models/types (T007) before store (T009) and optimizer (T010)
- Store and optimizer (T009–T010) before UI wiring (T011–T012)
- Implementation before polish (T013–T015)

## Parallel Execution Examples
```
# After setup completes, run these tests in parallel [P]:
Task: "Unit test validation rules" → pnpm test -t validation
Task: "Planner store contract tests" → pnpm test -t planner.contract
Task: "Happy path integration" → pnpm test -t app.happy
Task: "Optimizer invariants" → pnpm test -t optimizer

# After tests fail, implement in parallel where files are independent [P]:
Task: "Add missing types" (src/types/planner.ts)
Task: "Validation helpers" (src/lib/validation.ts)
```

## Validation Checklist
- [ ] Entities from `data-model.md` reflected in types and validators
- [ ] Store contract in `contracts/README.md` fully implemented
- [ ] Tests precede implementation and fail first
- [ ] [P] tasks only touch independent files
- [ ] Each task lists exact file path and intent

# Tasks: Material Planning and Cut Optimization

Feature Dir: `C:\Users\schoc\Documents\Git\Wildau\material-planner\specs\001-material-planning-web`
Repo Root: `C:\Users\schoc\Documents\Git\Wildau\material-planner`

Conventions
- [P] = can run in parallel (different files, no dependency conflicts)
- Use pnpm for scripts; add scripts as specified below
- Test-first where applicable; write failing tests before implementation

## Phase 3.1: Setup
- [X] T001 Ensure dependencies: add @vueuse/core, vitest, @vue/test-utils, jsdom
  - Files: `C:\Users\schoc\Documents\Git\Wildau\material-planner\package.json`
  - Add deps: `@vueuse/core`, `vitest`, `@vue/test-utils`, `jsdom`
  - Add script: "test": "vitest --run", "test:watch": "vitest"
- [X] T002 Create Vitest config
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\vitest.config.ts`
  - jsdom environment, alias `@` to `src`, include `.vue` transform
- [X] T003 [P] Create test setup file
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\tests\setup.ts`
  - Configure Vuetify and global stubs for tests
- [X] T004 [P] Create shared domain types
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\types\planner.ts`
  - Define `PlankSKU`, `RequiredPiece`, `GlobalSettings`, `PurchasePlanItem`, `CutAssignment`, `CutPlan`

## Phase 3.2: Tests First (TDD)
- [X] T005 [P] Unit test: sorting of Available Planks
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\tests\unit\stores\planner.sort.spec.ts`
  - Assert sort by width asc, then length asc, then price asc
- [X] T006 [P] Unit test: persistence with useLocalStorage
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\tests\unit\stores\planner.persist.spec.ts`
  - Assert state rehydrates after store re-initialization
- [X] T007 [P] Unit test: tie-breaker logic (fewest SKUs, then fewest cuts)
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\tests\unit\services\optimizer.tiebreak.spec.ts`
- [X] T008 [P] Unit test: orientation constraint and kerf spacing
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\tests\unit\services\optimizer.orientation.spec.ts`
- [X] T009 [P] Integration test: user story happy-path compute and visualization presence
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\tests\integration\app.happy.spec.ts`
  - Load `src/pages/index.vue`, enter sample data, assert purchase plan table and cut plan appear
- [X] T010 [P] Integration test: unsatisfiable demand shows clear error with blocking constraints
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\tests\integration\app.unsatisfiable.spec.ts`
- [X] T011 [P] Unit test: unit conversion and formatting rules
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\tests\unit\composables\useUnits.spec.ts`

## Phase 3.3: Core Implementation
- [X] T012 Implement Pinia planner store with persisted state
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\stores\planner.ts`
  - State: availablePlanks, requiredPieces, settings
  - Persistence: VueUse `useLocalStorage` inside store declaration
  - Getters: sortedAvailablePlanks, purchasePlan, cutPlan, totalCuts
  - Actions: add/update/remove rows; setSawKerf; setUnitSystem; computePlans; toggle auto-recompute
- [X] T013 Implement optimization service with constraints and tie-breaker
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\services\optimizer.ts`
  - Inputs: store state; Outputs: PurchasePlan, CutPlan, totalCuts; enforce availability caps; orientation; kerf spacing; tie-break
- [X] T014 [P] Implement unit conversion composable
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\composables\useUnits.ts`
  - Convert mm <-> inches; formatting per spec
- [X] T015 [P] Implement utility: sort helpers
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\lib\sorting.ts`
  - Compare by width, then length, then price
- [X] T016 [P] Implement validation utilities
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\lib\validation.ts`
  - Validate dimensions > 0, quantities integer ≥ 1, availability null or integer ≥ 0

## Phase 3.4: UI Components (Vuetify)
- [X] T017 Available Planks table (editable, add/remove, auto-sort)
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\components\AvailablePlanksTable.vue`
- [X] T018 [P] Required Pieces table (editable, add/remove)
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\components\RequiredPiecesTable.vue`
- [X] T019 [P] Global Settings card (kerf, unit toggle, auto-recompute toggle, timing)
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\components\GlobalSettingsCard.vue`
- [X] T020 [P] Purchase Plan table (SKU, dims, price, quantity, subtotal, totals)
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\components\PurchasePlanTable.vue`
- [X] T021 [P] Cut Plan visualization (SVG) with kerf spacing and labels/hover details
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\components\CutPlanView.vue`
- [X] T022 [P] Compute status/error bar (unsatisfiable explanations, performance, manual compute button)
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\components\ComputeStatusBar.vue`

## Phase 3.5: Page Integration
- [X] T023 Integrate components into index page with responsive layout
  - File: `C:\Users\schoc\Documents\Git\Wildau\material-planner\src\pages\index.vue`
  - Use Vuetify grid; persist and restore state; wire to store actions

## Phase 3.6: Polish & Accessibility
## Phase 3.6: Remediation (Spec Alignment & A11y)
- [X] T024 Update CI to run tests and add basic a11y check
  - Files: `.github/workflows/ci.yml`, `tests/unit/a11y/app.a11y.spec.ts`
  - Steps: add `pnpm test` step; add axe-core jsdom smoke test
- [X] T025 Implement sticky Compute bar timing and last-computed display
  - Files: `src/stores/planner.ts`, `src/components/ComputeStatusBar.vue`
  - Add `computeMs`, `lastComputedAt`; show timing and lockout reason
- [X] T026 Add currency formatting and totals to Purchase Plan
  - Files: `src/lib/format.ts`, `src/components/PurchasePlanTable.vue`
  - Format unitPrice/subtotal with currency; show Total row
- [X] T027 Implement duplicate-merge logic on addPlank per spec
  - File: `src/stores/planner.ts`
  - Merge by ArticleNr when present; else by (Width, Length, Price); sum availability; latest price wins
- [X] T028 Add right-side persistent settings drawer
  - File: `src/pages/index.vue`
  - Use Vuetify `v-navigation-drawer` on right; persist open state
- [ ] T029 Enhance Cut Plan interactions (Done toggle/reset, labels, tooltips)
  - Files: `src/components/CutPlanView.vue`, `src/stores/planner.ts`
  - Add click to toggle piece done; hatch overlay; Reset All; labels/tooltips
- [ ] T030 Cleanup spec/plan/tasks inconsistencies
  - Files: `specs/001-material-planning-web/spec.md`, `specs/001-material-planning-web/plan.md`, `specs/001-material-planning-web/tasks.md`
  - Remove duplicate FR-023; replace plan placeholder structure; prune legacy task block

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
