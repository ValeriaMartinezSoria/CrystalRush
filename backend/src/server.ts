import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createGame, getGame, performAction } from './game.js'
import type { Direction, PlayerNumber } from './types.js'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(express.json())

app.get('/api/game', (_request, response) => {
  response.json(getGame())
})

app.post('/api/game', (_request, response) => {
  response.json(createGame())
})

app.post('/api/game/action', (request, response) => {
  const { player, action, direction } = request.body as {
    player?: PlayerNumber
    action?: string
    direction?: Direction
  }
  const result = performAction(player as PlayerNumber, action ?? '', direction)
  response.status(result.success ? 200 : 400).json(result)
})

const currentFile = fileURLToPath(import.meta.url)
const frontendPath = path.resolve(path.dirname(currentFile), '../../frontend/dist')
app.use(express.static(frontendPath))
app.use((_request, response) => {
  response.sendFile(path.join(frontendPath, 'index.html'))
})

app.listen(port, () => {
  console.log(`Crystal Rush backend listening on port ${port}`)
})
