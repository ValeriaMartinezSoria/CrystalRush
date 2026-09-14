import type { GameState, Position } from '../types'

interface GameBoardProps {
  game: GameState
}

function contains(positions: Position[], x: number, y: number): boolean {
  return positions.some((position) => position.x === x && position.y === y)
}

function GameBoard({ game }: GameBoardProps) {
  const cells = []
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 12; x += 1) {
      const playerOne = game.player1.x === x && game.player1.y === y
      const playerTwo = game.player2.x === x && game.player2.y === y
      const crystal = contains(game.crystals, x, y)
      const obstacle = contains(game.obstacles, x, y)
      const classes = ['board-cell']
      if ((x + y) % 2 === 0) classes.push('cell-light')
      if (playerOne) classes.push('player-one')
      if (playerTwo) classes.push('player-two')
      if (crystal) classes.push('crystal')
      if (obstacle) classes.push('obstacle')

      cells.push(
        <div className={classes.join(' ')} key={`${x}-${y}`} aria-label={`Casilla ${x},${y}`}>
          {playerOne && <span className="piece">1</span>}
          {playerTwo && <span className="piece">2</span>}
          {crystal && <span className="crystal-mark">✦</span>}
          {obstacle && <span className="obstacle-mark" />}
        </div>
      )
    }
  }

  return <div className="game-board" aria-label="Tablero de Crystal Rush">{cells}</div>
}

export default GameBoard
