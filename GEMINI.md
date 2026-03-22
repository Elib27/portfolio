# Portfolio Project - Gemini CLI Context

This project is a high-performance, multilingual personal portfolio built with **Astro** and **SolidJS**. It features a project showcase, a specialized Othello game with WebAssembly-powered AI, and integrated internationalization.

## Project Overview

- **Main Technologies:** Astro 6.0.2, SolidJS, SCSS, TypeScript, Bun.
- **Key Features:**
  - **Multilingual Support:** Full FR/EN support using a custom i18n implementation in `src/i18n`.
  - **Content Management:** Uses Astro Content Collections for managing projects, "about" content, and specific project descriptions.
  - **Interactive Components:** SolidJS is used for complex client-side interactivity, most notably the Othello game.
  - **AI Integration:** The Othello game uses a WebAssembly module (`othelloAI.wasm`) executed within a Web Worker (`AIworker.ts`) to provide a responsive AI opponent.
  - **Animations:** Integrated GSAP for smooth, high-quality transitions and interactions.
  - **Styling:** Combination of global SCSS and scoped CSS Modules for components.

## Building and Running

The project uses **Bun** as the primary package manager.

- **Development:** `bun run dev` (Starts the Astro dev server at `http://localhost:4321`)
- **Build:** `bun run build` (Generates a static site in the `dist/` directory)
- **Preview:** `bun run preview` (Previews the local production build)
- **Lint/Typecheck:** `bun x tsc` (Standard TypeScript checking)

## Project Structure

- `src/content/`: Contains Markdown files organized by language (`fr/`, `en/`) for various sections.
- `src/components/`: Reusable UI components. SolidJS components often use `.tsx` and `.module.css`.
- `src/sections/`: High-level sections of the landing page (Hero, About, Projects, etc.).
- `src/i18n/`: Logic for translation keys (`ui.ts`) and routing utilities (`utils.ts`).
- `src/assets/`: Static assets including SVGs for technologies and social links.
- `src/pages/`: Astro routing. The root `index.astro` serves the default language (FR), while `en/index.astro` serves the English version.

## Development Conventions

- **Internationalization:** Always add new UI strings to `src/i18n/ui.ts` for both `fr` and `en` keys. Use the `useTranslations` hook in Astro components and similar logic in SolidJS components.
- **Styling:** Use SCSS for complex styling. Prefer CSS Modules for SolidJS components to avoid global namespace collisions.
- **Content:** New projects should be added as Markdown files in `src/content/projects/[lang]/`. Images for projects should be placed alongside the Markdown files.
- **Performance:** For heavy computations (like the Othello AI), always offload to a Web Worker to keep the main thread fluid.
- **Interactivity:** Use SolidJS for components requiring complex state management or high-frequency updates. Use Astro components for static or lightly interactive parts.

## Key Files
- `astro.config.mjs`: Core Astro configuration and integrations.
- `src/content.config.ts`: Schema definitions for content collections.
- `src/components/Othello/`: Contains the logic, UI, and WASM worker for the Othello game.
