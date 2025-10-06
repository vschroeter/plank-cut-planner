<!--
Sync Impact Report
- Version change: 0.0.0 → 1.0.0
- Modified principles:
  - [PRINCIPLE_1_NAME] → Visual Design and Theming
  - [PRINCIPLE_2_NAME] → Accessibility AA Compliance
  - [PRINCIPLE_3_NAME] → Performance Budgets
  - [PRINCIPLE_4_NAME] → Responsive & Mobile‑first
  - [PRINCIPLE_5_NAME] → Component‑Driven Architecture & Type Safety
- Added sections:
  - Technology & UX Standards
  - Development Workflow & Quality Gates
  - Governance
- Removed sections: None
- Templates requiring updates:
  - .specify/templates/plan-template.md ⚠ pending
  - .specify/templates/spec-template.md ⚠ pending
  - .specify/templates/tasks-template.md ⚠ pending
  - .specify/templates/commands/*.md ⚠ pending
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Original adoption date unknown; set upon ratification.
-->

# Material Planner Constitution

## Core Principles

### Visual Design and Theming
- MUST use Vuetify 3 design tokens with a single source of truth in `src/styles/settings.scss`.
- MUST provide light and dark themes; default to system preference and ensure WCAG AA contrast.
- MUST apply consistent spacing scale, typography (Roboto), and icons (Material Design Icons).
Rationale: Enforces a modern, cohesive look that is easily themeable and maintainable.


### Responsive & Mobile‑first
- MUST implement mobile‑first layouts with responsive breakpoints for 360–1920px viewports.
- MUST ensure touch targets are ≥ 44px and avoid horizontal scroll on standard breakpoints.
- MUST validate layouts on latest Chrome (two latest stable versions).
Rationale: Delivers a consistent experience across devices and input methods.

### Component‑Driven Architecture & Type Safety
- MUST use Vue 3 with TypeScript in strict mode; avoid `any` and unsafe casts.
- MUST use Pinia for state management and Vue Router for navigation.
- MUST favor composables and presentational/container separation for reusability.
- MUST cover core composables and critical components with unit tests.
Rationale: Improves maintainability, correctness, and reuse.

## Technology & UX Standards

- Stack: Vue 3, Vuetify 3, TypeScript, Vite, Pinia, Vue Router, VueUse/core.
- Styling: Centralize theme tokens in `src/styles/settings.scss`; avoid inline layout styles.
- Fonts & Icons: `@fontsource/roboto` and `@mdi/font` are the canonical sources.
- Internationalization: Not mandated initially; additions MUST not block layout or performance budgets.
- Browser Support: Latest two stable versions of Chrome, and Edge.

## Development Workflow & Quality Gates

- Linting and type checks MUST pass (`eslint`, `vue-tsc`) before merge.
- CI MUST run unit tests and automated accessibility checks on PRs.
- Each PR MUST include a checklist referencing these principles and any performance budget impacts.
- Releases MUST note changes that affect principles or governance.

## Governance

- This constitution supersedes other local conventions where conflicts arise.
- Amendments MUST be proposed via PR, include a migration/impact note, and update the version and dates below.
- Versioning policy: Semantic — MAJOR for breaking governance/principle changes; MINOR for new/expanded sections; PATCH for clarifications.
- Compliance reviews SHOULD occur at least quarterly and at each release candidate.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2025-10-06