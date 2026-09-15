import { expect, test } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

type Position = { x: number; y: number }
type Player = Position & { life: number; energy: number; score: number }
type GameState = {
  status: 'playing' | 'finished'
  time: number
  player1: Player
  player2: Player
  crystals: Position[]
  obstacles: Position[]
  winner: 1 | 2 | 'draw' | null
}

type ActionResult = {
  success: boolean
  message: string
  game: GameState
}

const movementKeys: Record<string, { x: number; y: number; key: string }> = {
  up: { x: 0, y: -1, key: 'w' },
  down: { x: 0, y: 1, key: 's' },
  left: { x: -1, y: 0, key: 'a' },
  right: { x: 1, y: 0, key: 'd' }
}

function positionKey(position: Position): string {
  return `${position.x},${position.y}`
}

function findPath(start: Position, targets: Position[], obstacles: Position[], blocked: Position[]): string[] {
  const targetKeys = new Set(targets.map(positionKey))
  const obstacleKeys = new Set(obstacles.map(positionKey))
  const blockedKeys = new Set(blocked.map(positionKey))
  const queue: Position[] = [start]
  const parents = new Map<string, { previous: string; key: string }>()
  const visited = new Set([positionKey(start)])
  const directions = Object.values(movementKeys)

  while (queue.length > 0) {
    const current = queue.shift()!
    const currentKey = positionKey(current)
    if (targetKeys.has(currentKey)) {
      const path: string[] = []
      let cursor = currentKey
      while (cursor !== positionKey(start)) {
        const step = parents.get(cursor)!
        path.unshift(step.key)
        cursor = step.previous
      }
      return path
    }

    for (const direction of directions) {
      const next = { x: current.x + direction.x, y: current.y + direction.y }
      const nextKey = positionKey(next)
      if (next.x < 0 || next.x >= 12 || next.y < 0 || next.y >= 8 || visited.has(nextKey) || obstacleKeys.has(nextKey) || blockedKeys.has(nextKey)) continue
      visited.add(nextKey)
      parents.set(nextKey, { previous: currentKey, key: direction.key })
      queue.push(next)
    }
  }

  throw new Error('No se encontró una ruta válida en el tablero generado')
}

async function startGame(page: Parameters<typeof test>[0]['page']): Promise<GameState> {
  const startResponse = page.waitForResponse((response) => response.url().endsWith('/api/game') && response.request().method() === 'POST')
  await page.goto('/')
  await page.getByRole('button', { name: /Iniciar partida/ }).click()
  await expect(page.getByText('Partida en curso')).toBeVisible()
  return await (await startResponse).json() as GameState
}

async function pressAndReadAction(page: Parameters<typeof test>[0]['page'], key: string): Promise<ActionResult> {
  const responsePromise = page.waitForResponse((response) => response.url().includes('/api/game/action') && response.request().method() === 'POST')
  await page.keyboard.press(key)
  const response = await responsePromise
  const result = await response.json() as ActionResult
  await page.waitForTimeout(50)
  return result
}

test('muestra la pantalla inicial y permite comenzar', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Crystal Rush' })).toBeVisible()
  await page.getByRole('button', { name: /Iniciar partida/ }).click()
  await expect(page.getByRole('heading', { name: 'La carrera por los cristales' })).toBeVisible()
  await expect(page.getByLabel('Tablero de Crystal Rush')).toBeVisible()
  await expect(page.getByText('Partida en curso')).toBeVisible()
})

test('envía una acción de teclado al backend y actualiza el marcador', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Iniciar partida/ }).click()
  await expect(page.getByText('Partida en curso')).toBeVisible()
  const actionRequest = page.waitForRequest((request) => request.url().includes('/api/game/action'))
  await page.keyboard.press('d')
  expect((await actionRequest).postDataJSON()).toMatchObject({ player: 1, action: 'move', direction: 'right' })
  await expect(page.getByText(/Movimiento válido|Movimiento inválido/)).toBeVisible()
})

test('rechaza una acción fuera del tablero', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Iniciar partida/ }).click()
  await expect(page.getByText('Partida en curso')).toBeVisible()
  const firstMove = page.waitForResponse((response) => response.url().includes('/api/game/action'))
  await page.keyboard.press('w')
  await firstMove
  const invalidMove = page.waitForResponse((response) => response.url().includes('/api/game/action'))
  await page.keyboard.press('w')
  await invalidMove
  await expect(page.getByText('Movimiento inválido: fuera del tablero')).toBeVisible()
})

test('el Pulso consume energía y envía JSON al backend real', async ({ page }) => {
  const game = await startGame(page)
  expect(game.status).toBe('playing')
  expect(game.player1.energy).toBe(100)

  const requestPromise = page.waitForRequest((request) => request.url().includes('/api/game/action') && request.method() === 'POST')
  const responsePromise = page.waitForResponse((response) => response.url().includes('/api/game/action') && response.request().method() === 'POST')
  await page.keyboard.press('Space')
  const request = await requestPromise
  const response = await responsePromise
  const result = await response.json() as ActionResult

  expect(request.headers()['content-type']).toContain('application/json')
  expect(request.postDataJSON()).toEqual({ player: 1, action: 'pulse', direction: undefined })
  expect(response.status()).toBe(200)
  expect(result.success).toBe(true)
  expect(result.game.player1.energy).toBe(70)
  await expect(page.locator('.player-card-1').locator('.stat-line').filter({ hasText: 'Energía' }).locator('strong')).toHaveText('70')
})

test('recoger un cristal actualiza la puntuación mostrada', async ({ page }) => {
  const game = await startGame(page)
  const path = findPath(game.player1, [game.crystals[0]], game.obstacles, [game.player2])
  let result: ActionResult | undefined
  for (const key of path) result = await pressAndReadAction(page, key)

  expect(result?.success).toBe(true)
  expect(result?.message).toContain('Cristal recogido')
  expect(result?.game.player1.score).toBeGreaterThan(0)
  expect(result?.game.player1.score % 10).toBe(0)
  await expect(page.locator('.player-card-1').locator('.stat-line').filter({ hasText: 'Puntos' }).locator('strong')).toHaveText(String(result?.game.player1.score))
})

test('finaliza la partida y rechaza acciones posteriores', async ({ page }) => {
  const initialGame = await startGame(page)
  const adjacentPositions: Position[] = [
    { x: initialGame.player1.x + 1, y: initialGame.player1.y },
    { x: initialGame.player1.x - 1, y: initialGame.player1.y },
    { x: initialGame.player1.x, y: initialGame.player1.y + 1 },
    { x: initialGame.player1.x, y: initialGame.player1.y - 1 }
  ].filter((position) => position.x >= 0 && position.x < 12 && position.y >= 0 && position.y < 8)
  const path = findPath(initialGame.player2, adjacentPositions, initialGame.obstacles, [initialGame.player1])
  let result: ActionResult | undefined
  for (const key of path) result = await pressAndReadAction(page, key.replace('w', 'ArrowUp').replace('a', 'ArrowLeft').replace('s', 'ArrowDown').replace('d', 'ArrowRight'))

  for (let pulse = 0; pulse < 3; pulse += 1) result = await pressAndReadAction(page, 'Enter')

  expect(result?.game.status).toBe('finished')
  expect(result?.game.winner).toBe(2)
  await expect(page.getByText('Resultado final')).toBeVisible()
  await expect(page.locator('.result-panel').getByRole('heading', { name: 'Jugador 2' })).toBeVisible()

  const afterFinish = await page.evaluate(async () => {
    const response = await fetch('/api/game/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player: 1, action: 'move', direction: 'right' })
    })
    return { status: response.status, body: await response.json() }
  })
  expect(afterFinish.status).toBe(400)
  expect(afterFinish.body.message).toBe('La partida ha terminado')
})
