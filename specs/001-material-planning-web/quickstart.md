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
- Duplicate handling: Merge by ArticleNr when present (sum availability; latest price wins if changed). If ArticleNr blank, merge only when (Width, Length, Price) are identical.
- Tie-break: fewest cuts; if still tied, fewest purchased planks. Total cuts are displayed in the UI.
- ArticleNr is optional; leave blank if unknown.
