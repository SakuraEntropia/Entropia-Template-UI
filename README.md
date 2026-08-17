# Entropia UI Template

A reusable **node-graph editor UI shell** extracted from
[Entropia Riko](https://github.com/SakuraEntropia/Entropia-Riko): React + Vite +
TypeScript + React Flow + Zustand.

It ships the whole front-end shell — Blender-style workspace panels, draggable
floating windows, collapsible popup menus, themes (incl. Apple Liquid Glass),
node frames, subgraph breadcrumb, code editor, handwriting pad, plugin panel,
file manager, and a Windows-style file picker — ready to wire to your own
backend.

## Use as a library (npm)

```bash
npm install entropia-template-ui
```

`react` / `react-dom` are peer dependencies (install them alongside);
`@xyflow/react` and `zustand` are bundled as dependencies.

```tsx
import { App, GraphCanvas, useGraphStore, APP_VERSION } from "entropia-template-ui";
import "entropia-template-ui/style.css";
import "@xyflow/react/dist/style.css";
```

The full editor is `<App />`; every panel, the canvas, the store, and the theme
helpers are also exported for custom embedding.

## Quick start (development)

```bash
npm install
npm run dev      # http://localhost:5173
```

The UI calls `/api/*`; the dev server proxies those to `http://localhost:8000`.
Point it at any backend by editing `vite.config.ts` → `server.proxy`.

## Structure

```
src/
├── main.tsx            # entry
├── App.tsx             # workspace shell
├── store/graphStore.ts # zustand store (the data layer you adapt)
├── components/         # panels, windows, menus, canvas, file manager…
├── theme.ts            # light / dark / system / Liquid Glass
├── areas.ts            # Blender-style area tree + workspace presets
├── styles.css          # frosted-glass design tokens
└── __tests__/          # vitest unit tests
public/brand/           # replace logo.ico / logo.png / favicon to rebrand
```

## Scripts

```bash
npm run dev        # Vite dev server
npm run build      # tsc + production build
npm test           # vitest
npm run preview    # preview the production build
```

## License

MIT
