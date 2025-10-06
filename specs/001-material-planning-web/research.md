# Phase 0 Research

## Decisions
- State & persistence: Use Pinia stores with VueUse `useLocalStorage` directly inside store declarations for all global data (available planks, required pieces, settings). Rationale: Zero-boilerplate persistence, reactive, SSR-safe fallback not required.
- UI library: Vuetify 3 for all tables, forms, dialogs, layout, and theming. Rationale: Matches constitution, accelerates DX with accessible components.
- Units & formatting: Default Metric (mm). Allow toggle to Inches. In mm, show 1 decimal only when non-integer; in inches, show decimals (1 decimal). Rationale: From spec and clarifications.
- Recompute policy: Auto-recompute on any valid change; trace execution time. If a recompute exceeds 1.0s, disable auto-recompute and require manual compute; provide a control to re-enable. Rationale: From spec acceptance criteria.
- Duplicates: Allow duplicate SKUs with same `ArticleNr`. Rationale: Clarified by user; vendors may list variants or time-based pricing.
- Tie‑break rule: Among equally cheapest plans, prefer the plan with the fewest SKUs; if still tied, prefer the plan with the fewest cuts. Rationale: Clarified by user; simplifies purchasing and cutting.
- Visualization: Use SVG for the cut plan rendering inside a Vuetify component. Rationale: Resolution-independent, fits DOM-based interactivity and scaling.
- Orientation constraint: No 90° rotation of pieces; cuts orthogonal to long side (length). Rationale: From clarifications.

## Alternatives Considered
- LocalStorage vs IndexedDB: IndexedDB offers better large-data performance but adds complexity; LocalStorage is sufficient for the expected small dataset and is mandated by simplicity.
- Canvas vs SVG for visualization: Canvas is performant but less declarative; SVG integrates better with tooltips, hover states, and accessibility.
- Deduplicate SKUs by `ArticleNr`: Rejected due to user requirement to allow duplicates for now.

## Open Questions Resolved
- Duplicate handling: Allowed.
- Tie‑break: Fewest SKUs, then fewest cuts, deterministic.

## Performance Notes
- Keep compute under 1.0s p95 for typical datasets (tens of SKUs, hundreds of pieces). If exceeded, automatically toggle to manual compute mode.

## Implementation Notes (Non-binding)
- Implement sorting by Width asc, then Length asc, then Price asc immediately after each edit.
- Validate inputs inline; block compute until valid.
- Persist unit preference and kerf.


