import type {
  Direction,
  GameResponse,
  GameState,
  PlayerNumber,
  Position
} from './types.js'

export const BOARD_WIDTH = 12
export const BOARD_HEIGHT = 8
export const START_TIME = 120
const PULSE_COST = 30
const PULSE_RANGE = 2

let game: GameState
let startedAt = 0

function samePosition(first: Position, second: Position): boolean {
  return first.x === second.x && first.y === second.y
}

function isOccupied(position: Position, state: GameState): boolean {
  return samePosition(position, state.player1) || samePosition(position, state.player2) ||
    state.obstacles.some((obstacle) => samePosition(position, obstacle))
}

function createLayout(): Pick<GameState, 'crystals' | 'obstacles'> {
  const obstacles: Position[] = []
  const crystals: Position[] = []
  const reserved = [{ x: 1, y: 1 }, { x: 10, y: 6 }]

  for (let attempt = 0; obstacles.length < 9 && attempt < 100; attempt += 1) {
    const position = {
      x: 1 + Math.floor(Math.random() * (BOARD_WIDTH - 2)),
      y: 1 + Math.floor(Math.random() * (BOARD_HEIGHT - 2))
    }
    if (!reserved.some((item) => samePosition(item, position)) &&
      !obstacles.some((item) => samePosition(item, position))) {
      obstacles.push(position)
    }
  }

  for (let attempt = 0; crystals.length < 3 && attempt < 100; attempt += 1) {
    const position = {
      x: Math.floor(Math.random() * BOARD_WIDTH),
      y: Math.floor(Math.random() * BOARD_HEIGHT)
    }
    if (!isOccupied(position, { player1: reserved[0], player2: reserved[1], obstacles, crystals } as GameState) &&
      !crystals.some((item) => samePosition(item, position))) {
      crystals.push(position)
    }
  }

  return { obstacles, crystals }
}

export function createGame(): GameState {
  const layout = createLayout()
  game = {
    status: 'playing',
    time: START_TIME,
    player1: { x: 1, y: 1, life: 3, energy: 100, score: 0 },
    player2: { x: 10, y: 6, life: 3, energy: 100, score: 0 },
    crystals: layout.crystals,
    obstacles: layout.obstacles,
    winner: null
  }
  startedAt = Date.now()
  return game
}

function finishGame(): void {
  if (game.player1.life === 0 && game.player2.life === 0) {
    game.winner = 'draw'
  } else if (game.player1.life === 0) {
    game.winner = 2
  } else if (game.player2.life === 0) {
    game.winner = 1
  } else if (game.player1.score > game.player2.score) {
    game.winner = 1
  } else if (game.player2.score > game.player1.score) {
    game.winner = 2
  } else {
    game.winner = 'draw'
  }
  game.status = 'finished'
}

function updateTime(): void {
  if (game.status === 'finished') return
  const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000)
  game.time = Math.max(0, START_TIME - elapsedSeconds)
  if (game.time === 0) finishGame()
}

function getPlayer(playerNumber: PlayerNumber) {
  return playerNumber === 1 ? game.player1 : game.player2
}

function getOpponent(playerNumber: PlayerNumber) {
  return playerNumber === 1 ? game.player2 : game.player1
}

function move(playerNumber: PlayerNumber, direction: Direction): string {
  const player = getPlayer(playerNumber)
  const next = { x: player.x, y: player.y }
  if (direction === 'up') next.y -= 1
  if (direction === 'down') next.y += 1
  if (direction === 'left') next.x -= 1
  if (direction === 'right') next.x += 1

  if (next.x < 0 || next.x >= BOARD_WIDTH || next.y < 0 || next.y >= BOARD_HEIGHT) {
    return 'Movimiento inválido: fuera del tablero'
  }
  if (game.obstacles.some((obstacle) => samePosition(obstacle, next))) {
    return 'Movimiento inválido: hay un obstáculo'
  }
  if (samePosition(getOpponent(playerNumber), next)) {
    return 'Movimiento inválido: el oponente bloquea la casilla'
  }

  player.x = next.x
  player.y = next.y
  const crystalIndex = game.crystals.findIndex((crystal) => samePosition(crystal, next))
  if (crystalIndex !== -1) {
    player.score += 10
    game.crystals.splice(crystalIndex, 1)
    addCrystal()
    return 'Movimiento válido. Cristal recogido: +10 puntos'
  }
  return 'Movimiento válido'
}

function addCrystal(): void {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const position = {
      x: Math.floor(Math.random() * BOARD_WIDTH),
      y: Math.floor(Math.random() * BOARD_HEIGHT)
    }
    if (!isOccupied(position, game) && !game.crystals.some((crystal) => samePosition(crystal, position))) {
      game.crystals.push(position)
      return
    }
  }
}

function pulse(playerNumber: PlayerNumber): string {
  const player = getPlayer(playerNumber)
  const opponent = getOpponent(playerNumber)
  if (player.energy < PULSE_COST) return 'Pulso rechazado: no hay suficiente energía'

  player.energy -= PULSE_COST
  const distance = Math.abs(player.x - opponent.x) + Math.abs(player.y - opponent.y)
  if (distance > PULSE_RANGE) return 'Pulso realizado, pero el oponente está fuera de alcance'

  opponent.life = Math.max(0, opponent.life - 1)
  if (opponent.life === 0) finishGame()
  return 'Pulso Energético acertado: el oponente pierde 1 vida'
}

export function getGame(): GameState {
  if (!game) createGame()
  updateTime()
  return game
}

export function performAction(
  playerNumber: PlayerNumber,
  action: string,
  direction?: Direction
): GameResponse {
  getGame()
  if (game.status === 'finished') {
    return { success: false, message: 'La partida ha terminado', game }
  }
  if (playerNumber !== 1 && playerNumber !== 2) {
    return { success: false, message: 'Jugador inválido', game }
  }

  let message: string
  if (action === 'move' && direction) {
    message = move(playerNumber, direction)
  } else if (action === 'pulse') {
    message = pulse(playerNumber)
  } else {
    return { success: false, message: 'Acción inválida', game }
  }

  updateTime()
  return { success: !message.startsWith('Movimiento inválido') && !message.startsWith('Pulso rechazado'), message, game }
}
