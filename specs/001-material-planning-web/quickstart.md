# Quickstart

## Prerequisites
- Node.js 22+
- pnpm 9+

## Install
```bash
pnpm install
```

## Run Dev
```bash
pnpm dev
```

## Tech Overview
- Vue 3 + TypeScript
- Vuetify 3 for UI
- Pinia for state; persisted with VueUse `useLocalStorage` in store declarations
- Vue Router for pages

## Feature Entry Points
- Tables and settings under `src/pages/index.vue`
- State in `src/stores`
- Styles and theme tokens in `src/styles/settings.scss`

## Notes
- Auto-recompute is enabled until a compute exceeds 1.0s; then manual compute is required until re-enabled.
- Duplicates (same `ArticleNr`) are allowed.
- Tie-break: fewest SKUs, then fewest cuts; total cuts are displayed in the UI.
