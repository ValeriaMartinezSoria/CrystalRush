# Reglas

- Ambos jugadores comienzan con 3 vidas, 90 de energía y 0 puntos.
- P1 usa W/A/S/D; P2 usa las flechas.
- No se puede salir del tablero, atravesar obstáculos ni ocupar la casilla del rival.
- Recoger un cristal suma 10 puntos. El backend coloca otro cristal en una posición libre.
- Pulso Energético cuesta 30 de energía y alcanza al rival a una distancia Manhattan máxima de 2 casillas. P1 lo activa con Espacio y P2 con Enter; también se puede usar el botón visible. Si acierta, resta 1 vida.
- La partida termina a los 120 segundos o cuando un jugador llega a 0 vidas.
- Al terminar por tiempo gana la puntuación mayor; al perder todas las vidas gana el rival; con igualdad hay empate.
- Después de finalizar, Express rechaza acciones nuevas.

La decisión estratégica principal es gastar energía para atacar o conservarla. Los escenarios cambian al reiniciar porque obstáculos y cristales se generan en el backend.
