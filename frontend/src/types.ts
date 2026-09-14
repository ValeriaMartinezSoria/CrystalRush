export type Direction = 'up' | 'down' | 'left' | 'right'
export type PlayerNumber = 1 | 2

export interface Position {
  x: number
  y: number
}

export interface Player extends Position {
  life: number
  energy: number
  score: number
}

export interface GameState {
  status: 'playing' | 'finished'
  time: number
  player1: Player
  player2: Player
  crystals: Position[]
  obstacles: Position[]
  winner: PlayerNumber | 'draw' | null
}

export interface ActionResponse {
  success: boolean
  message: string
  game?: GameState
}
