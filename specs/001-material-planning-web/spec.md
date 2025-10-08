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
11. **Given** I have previously entered data for Available Planks and Required Pieces, **When** I load the app, **Then** the purchase plan and cut plan are computed immediately without manual action.
12. **Given** the cut plan visualization is shown, **When** I compare planks, **Then** each purchased plank is rendered in a fixed-height row with width proportional to its length, maintaining aspect ratio; cuts are drawn correctly inside each plank respecting kerf and non-rotation.
13. **Given** I select a currency in Global Settings, **When** I view price fields and totals, **Then** they display with the selected currency symbol (default Euro €) and the choice persists across reloads.
11. **Given** there are at least two purchase plans with the same total cost, **When** the system selects one, **Then** it selects the plan with fewer total cuts; if still tied, the plan with fewer purchased planks.
11. **Given** I add duplicate Available Planks, **When** duplicates share an ArticleNr, **Then** they merge into one row, availability is summed, and if the price differs the price is updated to the latest provided value.
12. **Given** I add duplicate Available Planks without ArticleNr, **When** they share identical (Width, Length, Price), **Then** they merge into one row and availability is summed. Rows with same dimensions but different prices remain separate offers.

### Edge Cases
- Unlimited availability: Available Pieces left blank is treated as unlimited; any non-blank must be a non-negative integer.
- Duplicate SKUs: Merge by ArticleNr when present; otherwise merge by (Width, Length, Price). Sum availability. If the same ArticleNr appears with a different price, update the SKU's price to the latest provided value. Identical dimensions with different prices remain separate offers.
- Required piece larger than any single plank dimension: The system flags as unsatisfiable with guidance.
- Zero or negative inputs: Inputs must validate and be rejected with inline feedback.
- Decimals and formatting: Support decimal values for dimensions and kerf; in mm, show up to 1 decimal only when needed; inches displayed as decimals; 1 decimal place for inches.
- Tie-breaking: When multiple plans have the same lowest total cost, choose the plan with the fewest cuts; if still tied, choose the plan with the fewest purchased planks.
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
- **FR-016**: Handle ties in total cost deterministically: among equal-cost plans, minimize number of cuts; if still tied, minimize number of purchased planks.
- **FR-017**: Allow clearing all data to return to defaults with a single action and confirm before destructive clear.
- **FR-018**: Support unit system toggle between Metric (millimeters) and Inches across all inputs, outputs, and visualization. Default to Metric (mm).
- **FR-019**: Display formatting rules: In Metric (mm), show a decimal with 1 place only when the value is non-integer; otherwise show an integer. In Inches, display decimals (not fractions); 1 decimal place for inches. Persist the user's chosen unit system.
 - **FR-020**: Provide a persistent sticky footer ("Compute bar") visible on all screens containing: a "Compute" action, an Auto-Compute toggle, and a "Last computed <time>" display. While a computation is running, show a visible in-progress indicator in the footer.
 - **FR-021**: Footer responsiveness: On narrow/mobile viewports render a compact layout (icons only for actions/status); on desktop show expanded labels and status text. All controls remain accessible in both modes.
 - **FR-022**: Expose recomputation execution time and the control to re-enable Auto-Compute after performance lockout (see FR-012) in the sticky footer alongside the Compute action and Auto-Compute toggle.
 - **FR-023**: ArticleNr is optional in "Available Planks". Merge duplicates by ArticleNr when present (sum availability; if price differs, update to the latest provided value). If ArticleNr is blank, merge duplicates only when (Width, Length, Price) are identical; otherwise treat as separate offers.
 - **FR-024**: Cut Plan scaling/layout: Render each purchased plank in a fixed-height row; horizontally scale length to width proportionally, maintaining aspect ratio. Draw cuts within the rectangle respecting kerf and orientation.
 - **FR-025**: Global Settings include Currency with default Euro ("€"); the selected currency persists and is used to format all price cells and totals throughout the app.
 - **FR-026**: Price input/display cells automatically show the selected currency symbol next to values.
 - **FR-027**: "Add" actions in tables use a "+" icon; no "Add" text required.
 - **FR-028**: On app load, if any persisted table data exists, compute purchase and cut plans immediately without manual action.
 - **FR-029**: Right sidebar for Global Settings: persistent collapsible drawer anchored to the right; default open on desktop, default closed on mobile; includes a visible toggle control and retains state across navigation within the session.
 - **FR-023**: ArticleNr is optional in "Available Planks". Merge duplicates by ArticleNr when present (sum availability; if price differs, update to the latest provided value). If ArticleNr is blank, merge duplicates only when (Width, Length, Price) are identical; otherwise treat as separate offers.

 - **FR-030**: In the Cut Plan visualization, clicking a piece segment toggles its Done state. Done pieces must be visually distinct from not-done pieces.
 - **FR-031**: Provide a "Reset All" control within the Cut Plan view to clear all Done states at once.
 - **FR-032**: Display each piece’s length as an in-rect label and show a tooltip with length and width (with unit) on hover/focus. Formatting follows unit rules in FR-019.
 - **FR-033**: Persist Done states locally and preserve them across recomputes and reloads when the piece identity (hash of width, length, source articleNr, ordinal) is stable. Only the explicit Reset All clears persisted Done states. If a piece no longer exists after recompute, its Done state is discarded.
  - **FR-034**: Done pieces render with a green hatch overlay pattern while retaining original fill and outline for contrast and accessibility.
  - **FR-035**: Each source plank in the visualization displays only its width and length (unit-formatted) as a label and provides a tooltip with the same two values.
  - **FR-036**: Piece Done toggle and tooltips may be pointer-only; keyboard activation and focusability are not required.

## Clarifications

### Session 2025-10-06
- Q: Are pieces allowed to rotate 90° and how should cuts be oriented relative to plank dimensions? → A: Pieces cannot rotate 90°; cuts must be placed orthogonal to the plank's long side (length), i.e., length-wise cutting only.
- Q: Should recomputation be automatic or explicit, and how to handle performance? → A: Auto-recompute on every input; measure and show recompute time. If any recompute exceeds 1.0s, disable auto-recompute and require manual compute; provide a control to re-enable.
- Q: For Inches display, decimals or fractions? → A: Decimals.
- Q: What units and precision should all dimensions and kerf use? → A: Allow switching between Metric (mm) and Inches. Default to Metric (mm) with decimals; for mm, show 1 decimal place only when needed; otherwise show integers.
- Q: What is the default saw kerf? → A: 3 mm.
 - Q: How should the sticky footer behave and what controls should it include? → A: Always-visible sticky footer; compact on mobile (icons only), expanded on desktop; includes Compute action, Auto-Compute toggle, and "Last computed <time>". Show a visible in-progress indicator while computation runs.
 - Q: Cut plan rectangles scaling and layout? → A: Scale each plank to fit a fixed-height row; maintain aspect ratio across rows.
 - Q: How to identify and handle duplicate Available Planks when ArticleNr may be blank? → A: Merge by ArticleNr when present; otherwise merge by (Width, Length, Price). Sum availability. If ArticleNr repeats with a new price, update to the latest price.
 - Q: What is the deterministic tie-break rule for equal-cost plans? → A: Minimize number of cuts; then minimize number of purchased planks.
 - Q: Right sidebar for Global Settings behavior? → A: Persistent collapsible drawer on the right; default open on desktop, closed on mobile.

### Session 2025-10-08
- Q: How should “cut part done” status persist and behave when the plan recomputes? → A: Persist across reloads and across recomputes when piece identity is stable; only cleared via explicit Reset All.
 - Q: How is “piece identity” defined for persistence? → A: Hash of piece attributes and assigned source plank (width, length, articleNr, ordinal).
 - Q: How should Done pieces visually differ? → A: Green hatch pattern overlay; keep original fill.
 - Q: What should piece tooltip show? → A: Length and width (with unit).
 - Q: What information should each source plank display? → A: Width and length only.
 - Q: Should toggling Done and tooltips be keyboard-accessible? → A: No; pointer-only is acceptable.
 - Q: Is ArticleNr required for Available Planks? → A: No. ArticleNr is optional and may be left blank.

### Key Entities *(include if feature involves data)*
- **PlankSKU (Available Plank)**: Represents a purchasable plank from the store.
  - Attributes: Width, Length, Price Per Piece, ArticleNr (optional), Available Pieces (nullable/unlimited), Derived Area (informational)
  - Identity & merge: Use ArticleNr if present; otherwise use composite (Width, Length, Price) for duplicate merge. Sum availability; latest price wins for same ArticleNr.
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
