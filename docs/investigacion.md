# Investigación

## Playwright

Playwright permite probar el navegador real, pulsar teclas y observar peticiones HTTP. Localmente se ejecuta con `npm run test:e2e`; para ver Chrome se usa `npm run test:e2e:headed`; CI usa `npm run test:e2e` después de `npx playwright install --with-deps chromium`.

Las 6 pruebas cubren pantalla inicial, inicio, tablero, teclado, petición al backend, movimiento inválido, Pulso Energético, cristales, puntuación, finalización y rechazo de acciones posteriores. La suite pasa localmente y contra la aplicación publicada.

## Publicación

Se preparó `render.yaml` para Render. El build es `npm ci && npm run build` y el inicio es `npm run start --workspace backend`. Express usa `PORT` si Render lo proporciona y, si no, usa 3000 localmente. No hay variables secretas requeridas.

La aplicación está publicada en https://crystalrush.onrender.com. El workflow de deployment construye el proyecto y deja el artefacto listo; la publicación se realizó mediante Render.

No se usa Docker.
