# Cashless Stream

## Project
Portfolio demo: visualize finances as continuous per-second money flows instead of discrete payments. Concept: "(almost) everything is a subscription."

## Stack
- Vue 3 + Vite 6 + TypeScript + Tailwind CSS 4 + Pinia + GSAP
- No backend — static SPA, localStorage for persistence

## Commands
- `npm run dev` — dev server (localhost:5173)
- `npm run build` — production build to dist/
- `npm run preview` — preview production build

## Structure
- `src/views/` — 3 pages: LandingView, DashboardView, MarketplaceView
- `src/components/` — organized by feature: dashboard/, marketplace/, layout/, shared/
- `src/stores/` — Pinia stores: streams.ts (main state + CRUD), theme.ts (dark/light)
- `src/lib/` — calc.ts (period conversion), types.ts, constants.ts, tax.ts
- `src/composables/` — useTick (rAF timer), useAccumulator, useCurrency
- `src/data/` — default-account.ts, scenarios.ts, marketplace-products.ts
- `src/router/` — Vue Router setup (/, /dashboard, /marketplace)

## Current status
- All features implemented and building clean
- Use Chrome integration (`claude --chrome`) for visual debugging if needed
