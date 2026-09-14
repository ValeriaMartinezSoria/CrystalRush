# Crystal Rush

Juego competitivo para dos jugadores en el mismo navegador. Se recolectan cristales, se esquivan obstáculos y se decide cuándo usar el Pulso Energético.

## Requisitos e instalación

Se necesita Node.js 22 o compatible.

```bash
npm install
```

## Ejecución local

En dos terminales:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

La interfaz queda en `http://localhost:5173` y Vite reenvía `/api` a Express en `http://localhost:3000`.

## Build y producción

```bash
npm run build
npm run start --workspace backend
```

Express sirve el frontend compilado y la API desde el mismo puerto. `PORT` es opcional; por defecto es `3000`.

## Pruebas y lint

```bash
npm run lint
npm run test:e2e
npm run test:e2e:headed
```

Playwright instala Chromium con `npx playwright install chromium`.

## Arquitectura

`frontend/src/App.tsx` controla pantalla, teclado y `fetch`. `GameBoard` pinta la cuadrícula y `Scoreboard` muestra vidas, energía y puntos. `backend/src/game.ts` mantiene y valida el estado. `backend/src/server.ts` expone la API y sirve `frontend/dist`.

## Endpoints

- `GET /api/game`: devuelve la partida actual.
- `POST /api/game`: crea una partida nueva.
- `POST /api/game/action`: procesa movimiento o Pulso Energético.

## Deployment

La configuración de Render está en `render.yaml`. El servicio ejecuta `npm ci && npm run build` y `npm run start --workspace backend`. La aplicación está publicada en https://crystalrush.onrender.com.

La documentación ampliada está en `docs/`.
