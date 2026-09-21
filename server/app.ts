import express from 'express'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { rateLimit } from 'express-rate-limit'
import { tripRequestSchema } from '../shared/tripSchema.js'
import { generateTrip, TripGenerationError } from './generateTrip.js'

type AppOptions = { staticDir?: string; trustProxyHops?: number }

export function createApp(generate: typeof generateTrip = generateTrip, options: AppOptions = {}) {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', options.trustProxyHops ?? 0)
  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' })
  })

  app.use('/api', rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again shortly.' },
  }))
  app.use('/api', express.json({ limit: '8kb' }))
  app.post('/api/generate-trip', async (request, response) => {
    response.setHeader('Cache-Control', 'no-store')
    const parsed = tripRequestSchema.safeParse(request.body)
    if (!parsed.success) {
      response.status(400).json({ error: 'Provide a destination, 1–14 whole days, a valid budget, and at least one valid interest.' })
      return
    }
    try {
      response.json(await generate(parsed.data))
    } catch (error) {
      if (error instanceof TripGenerationError) {
        response.status(error.status).json({ error: error.message })
      } else {
        response.status(500).json({ error: 'Trip generation is temporarily unavailable. Please try again later.' })
      }
    }
  })
  // Unknown API routes must never fall through to the frontend HTML.
  app.use('/api', (_request, response) => {
    response.status(404).json({ error: 'Not found' })
  })

  if (options.staticDir) {
    const indexPath = join(options.staticDir, 'index.html')
    if (!existsSync(indexPath)) throw new Error('Frontend build missing. Run npm run build before starting production.')
    app.use(express.static(options.staticDir, { dotfiles: 'ignore', index: false }))
    app.get('/{*path}', (request, response, next) => {
      // Serve only document navigations; missing assets and private files stay 404.
      if (!request.accepts('html') || request.path.split('/').some(segment => segment.includes('.'))) {
        next()
        return
      }
      response.setHeader('Cache-Control', 'no-cache')
      response.sendFile(indexPath)
    })
  }
  app.use((_request, response) => {
    response.status(404).json({ error: 'Not found' })
  })
  const errorHandler: express.ErrorRequestHandler = (error, _request, response, _next) => {
    const status = error?.type === 'entity.too.large' ? 413 : error instanceof SyntaxError ? 400 : 500
    response.status(status).json({ error: status === 413 ? 'Request body too large' : status === 400 ? 'Invalid JSON' : 'Internal server error' })
  }
  app.use(errorHandler)
  return app
}
