@../CLAUDE.shared.md

# CLAUDE.md — Motor Web

## Arquitectura

React + Vite + TypeScript. Single-page app consumida desde el navegador del teléfono en red local.

```
App.tsx
├── GeneratorForm   — textarea + botón Generar
├── ProgressBar     — barra de progreso iter/fase
├── LogStream       — scroll log del crítico
├── FrameViewer     — grilla de frames por iteración con feedback artístico
└── VideoPlayer     — player + descarga del video final
```

El backend vive en `orquestador/orc/api.py` (FastAPI, puerto 8000).

## Comunicación

- `POST /api/generar` → devuelve `job_id`
- `GET /api/stream/{job_id}` → SSE con eventos JSON
- `GET /api/archivo/{nombre}` → frames PNG y video MP4

Ver tipos en `src/api.ts`.

## Reglas

- **Mobile first**: diseñar para 375px primero. Touch targets mínimo 44px (`min-height: 44px`).
  `font-size` nunca < 14px. Usable con una sola mano en teléfono vertical.
- Todo texto UI en español.
- Sin dependencias de UI externas (no shadcn, no MUI, no Tailwind) — CSS inline con variables CSS.
- Código en TypeScript, componentes funcionales con hooks.
- Sin manejo de errores para casos imposibles.

## Scripts

```bash
npm install
npm run dev     # puerto 5173, proxy /api → localhost:8000
npm run build   # output en dist/ (sirve FastAPI)
```

## Dependencias aprobadas

- `react` + `react-dom`
- `vite` + `@vitejs/plugin-react`
- `typescript`
