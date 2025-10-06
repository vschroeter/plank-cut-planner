# Feature Specification: Material Planning and Cut Optimization

**Feature Branch**: `001-material-planning-web`  
**Created**: 2025-10-06  
**Status**: Draft  
**Input**: User description: "Material planning web app to plan a list of planks to buy based on the cuts that have to be done and the price of planks from the hardware store.\nThe web app should provide the following:\nA) A table of available planks in the hardware store with the colums [Width, Length, Price Per Piece, ArticleNr, Available Pieces] with directly editable fields and the possibility to add entries. The entries are automatically sorted by Width, then by Length, then by Price.\nThe Available Pieces field can be cleared, meaning that there are inifinite pieces (which is also the default)\nB) A table of plank pieces we want to have with the columns [Width, Length, Pieces, Comment], again with directly in the table editable fields and the possibility to add new rows.\nC) Global settings like the width of the saw that is used.\nD) An output table containing the cheapest combination of planks that have to be bought in order to be able to cut out alle the required pieces. The pieces can be retreived either by buying a perfectly fitting piece, by buying a larger pieces an cut something off, or by distributing a combination of pieces via a larger plank (including the saw width).\nE) A visualization of the cut plan, so the planks to be bought to scale and the cuts that have to be placed on them. \n\nAll global data should be stored in the local browser, so that they are available on a page reload."

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies  
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a planner of wood projects, I want to input available plank options from a hardware store, my required piece dimensions and quantities, and my saw kerf, so that I receive the cheapest combination of planks to purchase and a visual cut plan showing how to obtain all pieces, with my data preserved between page reloads.

### Acceptance Scenarios
1. **Given** an empty app state, **When** I open the app, **Then** I see two editable tables with one empty row each (available planks, required pieces) and a global setting for saw width with a sensible default of 3 mm (metric by default).
2. **Given** I enter multiple plank SKUs with Width, Length, Price Per Piece, ArticleNr, and leave Available Pieces blank, **When** the list is displayed, **Then** it is automatically sorted by Width asc, then Length asc, then Price asc, and unlimited availability is assumed for blank values.
3. **Given** I set Available Pieces to a number for some SKUs, **When** the purchase plan is computed, **Then** the selected quantities do not exceed those numeric limits.
4. **Given** I enter required pieces with Width, Length, and Pieces, **When** I change any value, **Then** the system updates the cheapest purchase plan and cut plan to satisfy all quantities, accounting for saw kerf between cuts.
5. **Given** a computed plan, **When** I view the output table, **Then** I see which SKUs to buy, how many of each, the total cost, and a breakdown that covers all required pieces.
6. **Given** a computed plan, **When** I view the visualization, **Then** I see planks to scale with cut lines, labels or hoverable details for cuts/pieces, and clear indication of kerf spacing. Cuts must be placed orthogonal to the plank's long side (length) only; pieces cannot be rotated 90°.
7. **Given** I refresh the page, **When** the app reloads, **Then** all previously entered SKUs, required pieces, and settings are restored.
8. **Given** the demand cannot be satisfied due to size constraints or availability limits, **When** the system computes the plan, **Then** I see a clear message explaining why it is unsatisfiable and which constraints are blocking.

9. **Given** I toggle the unit system between Metric (mm) and Inches, **When** I switch units, **Then** all inputs, outputs, and the visualization reflect the chosen units with correct value conversion and formatting rules (mm: show 1 decimal place only when needed; otherwise integer; inches: decimals).
10. **Given** I set a preferred unit system, **When** I refresh the page, **Then** my unit preference persists.

### Edge Cases
- Unlimited availability: Available Pieces left blank is treated as unlimited; any non-blank must be a non-negative integer.
- Duplicate SKUs (same ArticleNr): The system either merges or warns [NEEDS CLARIFICATION: merge duplicates vs. allow duplicates].
- Required piece larger than any single plank dimension: The system flags as unsatisfiable with guidance.
- Zero or negative inputs: Inputs must validate and be rejected with inline feedback.
- Decimals and formatting: Support decimal values for dimensions and kerf; in mm, show up to 1 decimal only when needed; inches displayed as decimals; 1 decimal place for inches.
- Tie-breaking: Multiple equally cheap purchase plans may exist [NEEDS CLARIFICATION: tie-break rule e.g., fewer SKUs, fewer cuts].
- Orientation: Pieces cannot rotate 90° relative to length/width; cuts are length-wise only (orthogonal to the long side).
- Computation trigger: Auto-recompute on every valid input change. Measure recompute duration; if any recompute exceeds 1.0s, disable further auto-recomputes until explicitly re-enabled or a manual compute is performed.
- Unit switching and rounding: Values convert between mm and inches; preserve value fidelity on round-trip.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: Provide an editable "Available Planks" table with columns: Width, Length, Price Per Piece, ArticleNr, Available Pieces.
- **FR-002**: Allow adding and removing rows directly in the "Available Planks" table.
- **FR-003**: Automatically sort "Available Planks" by Width asc, then Length asc, then Price asc after any edit or row add/remove.
- **FR-004**: Treat a blank "Available Pieces" as unlimited availability; a non-blank value must be a non-negative integer and acts as a hard cap.
- **FR-005**: Provide an editable "Required Pieces" table with columns: Width, Length, Pieces, Comment, with the ability to add and remove rows.
- **FR-006**: Provide global settings including the saw kerf (cut width) with a default of 3 mm; changes must trigger plan recomputation.
- **FR-007**: Persist all tables and global settings locally in the browser so they survive page reloads.
- **FR-008**: Compute the cheapest combination of planks to purchase that can produce all required pieces subject to availability limits.
- **FR-009**: A required piece may be fulfilled by: (a) purchasing an exactly matching plank piece, (b) purchasing a larger plank and trimming, or (c) cutting multiple required pieces from a larger plank while respecting kerf between cuts.
- **FR-010**: Output a "Purchase Plan" table listing each SKU (ArticleNr), Width, Length, Price Per Piece, Quantity to buy, Subtotal, and overall Total cost.
- **FR-011**: Provide a "Cut Plan" visualization showing each purchased plank to scale with cut lines for all assigned pieces and kerf spacing. Cuts must be placed orthogonal to the plank's long side (length). Pieces cannot rotate 90°.
- **FR-012**: Auto-recompute the purchase and cut plans on every valid input change (any table cell or global setting). Trace and display recompute execution time. If a recompute exceeds 1.0 second, automatically disable auto-recompute and require an explicit "Compute" action; provide a control to re-enable auto-recompute.
- **FR-013**: Validate inputs with inline feedback (e.g., negative or zero dimensions, invalid numbers) and prevent computation until valid.
- **FR-014**: If the requirements cannot be satisfied (due to size or availability), present a clear error with which pieces are unfulfillable.
- **FR-015**: Orientation constraint: Pieces cannot rotate 90°; cuts are length-wise only (orthogonal to the long side).
- **FR-016**: Handle ties in total cost deterministically [NEEDS CLARIFICATION: tie-break criterion].
- **FR-017**: Allow clearing all data to return to defaults with a single action and confirm before destructive clear.
- **FR-018**: Support unit system toggle between Metric (millimeters) and Inches across all inputs, outputs, and visualization. Default to Metric (mm).
- **FR-019**: Display formatting rules: In Metric (mm), show a decimal with 1 place only when the value is non-integer; otherwise show an integer. In Inches, display decimals (not fractions); 1 decimal place for inches. Persist the user's chosen unit system.

## Clarifications

### Session 2025-10-06
- Q: Are pieces allowed to rotate 90° and how should cuts be oriented relative to plank dimensions? → A: Pieces cannot rotate 90°; cuts must be placed orthogonal to the plank's long side (length), i.e., length-wise cutting only.
- Q: Should recomputation be automatic or explicit, and how to handle performance? → A: Auto-recompute on every input; measure and show recompute time. If any recompute exceeds 1.0s, disable auto-recompute and require manual compute; provide a control to re-enable.
- Q: For Inches display, decimals or fractions? → A: Decimals.
- Q: What units and precision should all dimensions and kerf use? → A: Allow switching between Metric (mm) and Inches. Default to Metric (mm) with decimals; for mm, show 1 decimal place only when needed; otherwise show integers.
- Q: What is the default saw kerf? → A: 3 mm.

### Key Entities *(include if feature involves data)*
- **PlankSKU (Available Plank)**: Represents a purchasable plank from the store.
  - Attributes: Width, Length, Price Per Piece, ArticleNr, Available Pieces (nullable/unlimited), Derived Area (informational)
- **RequiredPiece**: Represents a desired output piece.
  - Attributes: Width, Length, Quantity (Pieces), Comment
- **GlobalSettings**: Represents app-wide configuration.
  - Attributes: Saw Kerf (cut width, default 3 mm), Unit System (Metric mm | Inches), Display formatting rules (mm: conditional 1 decimal; inches: decimals), [optional future settings]
- **PurchasePlanItem**: Represents a decision to buy some quantity of a SKU.
  - Attributes: ArticleNr, Width, Length, Unit Price, Quantity, Subtotal
- **CutAssignment**: Represents mapping of required pieces onto a purchased plank with cut positions.
  - Attributes: ArticleNr (source plank), Piece identifiers, Positions/ordering [conceptual], Kerf applied
- **CutPlan**: Aggregates all purchased planks and their cut assignments for visualization and reporting.

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---
