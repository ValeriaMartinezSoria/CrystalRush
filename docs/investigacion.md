# Investigación

## Playwright

Playwright permite probar el navegador real, pulsar teclas y observar peticiones HTTP. Localmente se ejecuta con `npm run test:e2e`; para ver Chrome se usa `npm run test:e2e:headed`; CI usa `npm run test:e2e` después de `npx playwright install --with-deps chromium`.

Las pruebas cubren pantalla inicial, inicio, tablero, teclado, petición al backend y movimiento inválido.

## Publicación

Se preparó `render.yaml` para Render. El build es `npm ci && npm run build` y el inicio es `npm run start --workspace backend`. Express usa `PORT` si Render lo proporciona y, si no, usa 3000 localmente. No hay variables secretas requeridas.

El workflow de deployment construye el proyecto y deja el artefacto listo. La publicación automática requiere conectar el repositorio al servicio elegido y sus credenciales, por eso no se inventa una URL de producción.

No se usa Docker.
