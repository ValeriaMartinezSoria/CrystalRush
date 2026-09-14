# Decisiones técnicas

- React permite separar la pantalla, el tablero y el marcador usando estado local y componentes simples.
- Express centraliza la lógica crítica: posiciones, colisiones, cristales, energía, vidas, tiempo y ganador. El navegador nunca puede decidir unilateralmente el resultado.
- `fetch` es suficiente para intercambiar JSON y cumple la restricción del examen sin Axios.
- Se usa una cuadrícula de 12 x 8 porque es fácil de explicar y ocupa bien el área visible.
- El tiempo se calcula con el reloj del servidor cada vez que llega una petición. Así se evita un proceso de juego en segundo plano.
- El estado vive en memoria. Es una decisión sencilla para una partida local, pero no serviría para varias instancias o persistencia.
- Vite se usa solo como herramienta de desarrollo y build. En producción Express sirve `frontend/dist` bajo el mismo dominio y puerto.
- La generación aleatoria evita las posiciones iniciales de los jugadores y coloca obstáculos/cristales en casillas libres.

Riesgos: reiniciar el proceso borra la partida, y una aplicación desplegada con varias instancias necesitaría almacenamiento compartido. No son necesarios para el alcance actual.
