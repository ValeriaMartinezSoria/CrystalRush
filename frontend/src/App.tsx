import { useEffect, useState } from 'react'
import GameBoard from './components/GameBoard'
import Scoreboard from './components/Scoreboard'
import type { ActionResponse, Direction, GameState, PlayerNumber } from './types'
import './App.css'

const keyDirections: Record<string, { player: PlayerNumber; action: 'move'; direction: Direction }> = {
  w: { player: 1, action: 'move', direction: 'up' }, a: { player: 1, action: 'move', direction: 'left' },
  s: { player: 1, action: 'move', direction: 'down' }, d: { player: 1, action: 'move', direction: 'right' },
  ArrowUp: { player: 2, action: 'move', direction: 'up' }, ArrowLeft: { player: 2, action: 'move', direction: 'left' },
  ArrowDown: { player: 2, action: 'move', direction: 'down' }, ArrowRight: { player: 2, action: 'move', direction: 'right' }
}
const pulseKeys: Record<string, PlayerNumber> = { Space: 1, Enter: 2 }

async function requestGame(path: string, options?: RequestInit): Promise<GameState> {
  const response = await fetch(path, options)
  const data = await response.json() as GameState | ActionResponse
  if (!response.ok) throw new Error('message' in data ? data.message : 'No se pudo consultar la partida')
  return 'game' in data && data.game ? data.game : data as GameState
}

function App() {
  const [game, setGame] = useState<GameState | null>(null)
  const [message, setMessage] = useState('Elige un jugador y prepara tu estrategia.')
  const [error, setError] = useState('')

  const startGame = async () => {
    try {
      setError(''); setMessage('Nueva partida creada.')
      setGame(await requestGame('/api/game', { method: 'POST' }))
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'No se pudo iniciar la partida') }
  }

  const sendAction = async (player: PlayerNumber, action: 'move' | 'pulse', direction?: Direction) => {
    if (!game || game.status === 'finished') return
    try {
      const response = await fetch('/api/game/action', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player, action, direction })
      })
      const data = await response.json() as ActionResponse
      if (data.game) setGame(data.game)
      setMessage(data.message); setError(data.success ? '' : data.message)
    } catch { setError('No se pudo conectar con el backend') }
  }

  useEffect(() => {
    if (!game || game.status === 'finished') return
    const timer = window.setInterval(async () => {
      try { setGame(await requestGame('/api/game')) }
      catch { setError('No se pudo actualizar el tiempo') }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [game?.status])

  useEffect(() => {
    if (!game || game.status === 'finished') return
    const handleKeyDown = (event: KeyboardEvent) => {
      const mapped = keyDirections[event.key]
      const pulsePlayer = pulseKeys[event.code]
      if (pulsePlayer) {
        event.preventDefault(); void sendAction(pulsePlayer, 'pulse'); return
      }
      if (!mapped) return
      event.preventDefault(); void sendAction(mapped.player, 'move', mapped.direction)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [game])

  if (!game) return <main className="start-screen"><div className="start-copy">
    <p className="eyebrow">Duelo de precisión · 2 jugadores</p><h1>Crystal <span>Rush</span></h1>
    <p className="intro">Recolecta cristales, administra tu energía y encuentra el momento exacto para lanzar un Pulso Energético.</p>
    <div className="rules-grid"><div><strong>P1</strong><span>W A S D</span></div><div><strong>P2</strong><span>Flechas</span></div><div><strong>Objetivo</strong><span>Más puntos</span></div></div>
    <button className="primary-button" onClick={() => void startGame()}>Iniciar partida <span>→</span></button>
    {error && <p className="error-message">{error}</p>}
  </div><div className="start-art" aria-hidden="true"><span>✦</span></div></main>

  const winnerText = game.winner === 'draw' ? 'Empate' : `Jugador ${game.winner}`
  return <main className="game-screen">
    <header className="game-header"><div><p className="eyebrow">Crystal Rush · arena local</p><h1>Comer cristales</h1></div><div className={`time-box ${game.time < 15 ? 'urgent' : ''}`}><span>Tiempo</span><strong>{String(Math.floor(game.time / 60)).padStart(2, '0')}:{String(game.time % 60).padStart(2, '0')}</strong></div></header>
    <Scoreboard game={game} />
    <section className="arena-layout"><div className="board-wrap"><GameBoard game={game} /><div className="legend"><span><i className="legend-crystal" /> Cristal +10</span><span><i className="legend-obstacle" /> Obstáculo</span></div></div>
      <aside className="control-panel"><div className="status-label"><span className={game.status === 'playing' ? 'live-dot' : ''} />{game.status === 'playing' ? 'Partida en curso' : 'Partida finalizada'}</div><div className="panel-time"><span>Tiempo restante</span><strong>{String(Math.floor(game.time / 60)).padStart(2, '0')}:{String(game.time % 60).padStart(2, '0')}</strong></div><p className={error ? 'action-message invalid' : 'action-message'}>{error || message}</p>
        <button className="pulse-button" onClick={() => void sendAction(1, 'pulse')} disabled={game.status === 'finished'}>✦ Pulso P1 <small>Espacio · botón · 30 energía</small></button><button className="pulse-button pulse-two" onClick={() => void sendAction(2, 'pulse')} disabled={game.status === 'finished'}>✦ Pulso P2 <small>Enter · botón · 30 energía</small></button>
        <p className="controls-copy"><strong>Controles</strong><br />P1: W A S D · Pulso: Espacio<br />P2: flechas · Pulso: Enter</p></aside></section>
    {game.status === 'finished' && <section className="result-panel"><p className="eyebrow">Resultado final</p><h2>{winnerText}</h2><p>{game.winner === 'draw' ? 'La arena termina en equilibrio.' : `El Jugador ${game.winner} domina la arena.`}</p><button className="primary-button" onClick={() => void startGame()}>Jugar nuevamente <span>↻</span></button></section>}
  </main>
}

export default App
