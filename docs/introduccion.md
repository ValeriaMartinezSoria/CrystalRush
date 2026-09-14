# Introducción

Crystal Rush es un juego competitivo local para dos personas que comparten navegador. Cada jugador se mueve en una arena, recoge cristales y puede gastar energía para atacar.

El frontend usa React, TypeScript, Vite y CSS propio. El backend usa Express y TypeScript. React representa el tablero y envía intenciones con `fetch`; Express conserva el estado, genera el escenario y valida cada acción.

La experiencia es deliberadamente sencilla: P1 usa W/A/S/D, P2 usa las flechas, los cristales dan puntos y el tiempo obliga a tomar decisiones rápidas.
