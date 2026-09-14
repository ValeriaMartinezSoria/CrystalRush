import type { GameState, PlayerNumber } from '../types'

interface ScoreboardProps {
  game: GameState
}

function PlayerCard({ game, player }: ScoreboardProps & { player: PlayerNumber }) {
  const data = player === 1 ? game.player1 : game.player2
  return (
    <section className={`player-card player-card-${player}`}>
      <div className="player-heading">
        <span className="player-badge">P{player}</span>
        <h2>Jugador {player}</h2>
      </div>
      <div className="stat-line"><span>Vidas</span><strong>{'♥'.repeat(data.life)}{'♡'.repeat(3 - data.life)}</strong></div>
      <div className="stat-line"><span>Energía</span><strong>{data.energy}</strong></div>
      <div className="energy-track"><span style={{ width: `${data.energy}%` }} /></div>
      <div className="stat-line"><span>Puntos</span><strong>{data.score}</strong></div>
    </section>
  )
}

function Scoreboard({ game }: ScoreboardProps) {
  return (
    <div className="scoreboard">
      <PlayerCard game={game} player={1} />
      <PlayerCard game={game} player={2} />
    </div>
  )
}

export default Scoreboard
