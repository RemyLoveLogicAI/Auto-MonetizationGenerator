import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { cors } from 'hono/cors'
import { timing } from 'hono/timing'
import { renderer } from './renderer'
import { COMMIT_SHA, COMMIT_SHORT, BUILD_TIME } from './version'
import type { AppEnv } from './types/bindings'
import { apiRouter } from './routes/api'
import { viewsRouter } from './routes/views'
import { adminRouter } from './routes/admin'

const app = new Hono<AppEnv>()

// Serve static files from public/ via /static/*
app.use('/static/*', serveStatic({ root: './public' }))

// Server-Timing telemetry
app.use('*', timing())

// Setup renderer
app.use(renderer)

// CORS for API
app.use('/api/*', cors())

// Version endpoint
app.get('/version.json', (c) => c.json({
  commit: COMMIT_SHA,
  short: COMMIT_SHORT,
  built_at: BUILD_TIME,
}))

// Mount routers
app.route('/api', apiRouter)
app.route('/', viewsRouter)
app.route('/', adminRouter)

export default app
