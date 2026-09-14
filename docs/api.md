# API

Todas las rutas usan JSON.

## `GET /api/game`

Devuelve el estado actual:

```json
{
  "status": "playing",
  "time": 120,
  "player1": { "x": 1, "y": 1, "life": 3, "energy": 90, "score": 0 },
  "player2": { "x": 10, "y": 6, "life": 3, "energy": 90, "score": 0 },
  "crystals": [{ "x": 4, "y": 2 }],
  "obstacles": [{ "x": 6, "y": 4 }],
  "winner": null
}
```

## `POST /api/game`

Sin cuerpo obligatorio. Crea una partida nueva y devuelve el estado inicial.

## `POST /api/game/action`

Entrada de movimiento:

```json
{ "player": 1, "action": "move", "direction": "right" }
```

Entrada de pulso:

```json
{ "player": 2, "action": "pulse" }
```

Respuesta válida:

```json
{ "success": true, "message": "Movimiento válido", "game": {} }
```

Respuesta inválida:

```json
{ "success": false, "message": "Movimiento inválido: fuera del tablero", "game": {} }
```

Los estados se mantienen en memoria del proceso. Para este examen no se necesita una base de datos.
