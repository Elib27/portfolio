# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

Package manager is **Bun**.

- `bun run dev` — dev server at localhost:4321
- `bun run build` — static site build to `dist/`
- `bun run preview` — preview production build
- `bun x tsc` — typecheck

No test runner or linter is configured.

## Architecture

**Astro 6 + SolidJS** static portfolio site. Astro handles routing, layout, and static content. SolidJS (`.tsx`) is used only for components needing complex client-side state (Othello game, tabbed interfaces). SolidJS components are loaded with `client:idle`.

**Styling:** SCSS for global styles and Astro scoped styles; CSS Modules (`.module.css`) for SolidJS components. No Tailwind. Design tokens are CSS custom properties defined in `Layout.astro` (theme colors, radius, fonts). Fonts: Space Grotesk (headings), Plus Jakarta Sans (body).

**i18n:** Custom implementation, not a library. Default language is French (root `/`), English at `/en/`. Translation strings live in `src/i18n/ui.ts` (both `fr` and `en` keys required). Use `useTranslations(getLangFromUrl(url))` in Astro components.

**Content Collections:** Projects, about, and othello content as Markdown in `src/content/[collection]/[lang]/`. Schema in `src/content.config.ts`.

## Key Patterns

- **TopographicBackground** (`src/components/TopographicBackground.astro`): Three.js full-screen shader animation with custom GLSL (simplex noise contour lines, mouse interaction). Parameters controlled via uniform updates.
- **Othello game** (`src/components/Othello/`): SolidJS UI + pure game logic in `othello.ts` + WASM AI engine (`othelloAI.wasm`) running in a Web Worker (`AIworker.ts`). Heavy computation stays off the main thread.
- **GravityButton** (`src/components/GravityButton.astro`): Mouse-tracking interactive button with gravitational pull effect.

## Conventions

- New UI strings must go in `src/i18n/ui.ts` for both FR and EN.
- New projects: add Markdown files in `src/content/projects/fr/` and `src/content/projects/en/` with cover images alongside.
- Use SolidJS only when complex state is needed; default to Astro components.
- Offload heavy computation to Web Workers.
