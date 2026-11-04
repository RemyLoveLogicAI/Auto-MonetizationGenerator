import { Hono } from 'hono'
import type { AppEnv } from '../types/bindings'
import { validateIngestUrl, fetchValidated, SsrfError } from '../services/ssrf'
import { health } from '../health'
import { metrics, healthMetrics } from '../metrics'

export const apiRouter = new Hono<AppEnv>()

// R2 object proxy (streams files from R2)
apiRouter.get('/r2/:key{.+}', async (c) => {
  const r2 = c.env.R2
  if (!r2) return c.text('R2 not configured', 501)
  const key = c.req.param('key')
  const obj = await r2.get(key)
  if (!obj) return c.notFound()
  const headers: Record<string, string> = {}
  const ct = obj.httpMetadata?.contentType
  if (ct) headers['Content-Type'] = ct
  return new Response(obj.body, { headers })
})

type AssetEntry = {
  type: string
  name: string
  size?: number
  url: string
  adult?: boolean
}

// Aggregated assets listing: merge static manifest with R2 objects if available
apiRouter.get('/assets', async (c) => {
  try {
    const origin = new URL(c.req.url).origin
    let staticEntries: AssetEntry[] = []
    try {
      const res = await fetch(origin + '/static/assets/assets.json')
      if (res.ok) {
        const j = (await res.json()) as { entries?: AssetEntry[] }
        staticEntries = Array.isArray(j.entries) ? j.entries : []
      }
    } catch {
      // Static manifest is optional; the R2 listing below still works without it.
    }

    let r2Entries: AssetEntry[] = []
    const r2 = c.env.R2
    if (r2) {
      const list = await r2.list()
      r2Entries = list.objects.map((o) => ({
        type: 'r2',
        name: o.key,
        size: o.size,
        url: '/api/r2/' + o.key,
      }))
    }

    return c.json({ generatedAt: new Date().toISOString(), entries: [...staticEntries, ...r2Entries] })
  } catch (e: unknown) {
    return c.json({ error: e instanceof Error ? e.message : String(e) }, 500)
  }
})

// Ingest external URL into R2 (edge-side copy) with SSRF validation
apiRouter.post('/ingestR2', async (c) => {
  const r2 = c.env.R2
  if (!r2) return c.text('R2 not configured', 501)
  const { url, key } = await c.req.json<{ url?: string; key?: string }>()
  if (!url) return c.text('Missing url', 400)

  const ssrfCheck = validateIngestUrl(url)
  if (!ssrfCheck.valid) {
    return c.json({ error: 'SSRF check failed: ' + (ssrfCheck.reason || 'Forbidden host') }, 403)
  }

  let res: Response
  try {
    res = await fetchValidated(url)
  } catch (e: unknown) {
    if (e instanceof SsrfError) return c.json({ error: 'SSRF check failed: ' + e.message }, 403)
    throw e
  }
  if (!res.ok) return c.text('Fetch failed: ' + res.status + ' ' + res.statusText, 502)
  const filename = key || url.split('/').pop() || 'upload-' + Date.now()
  const contentType = res.headers.get('content-type') || 'application/octet-stream'
  const sizeHeader = res.headers.get('content-length')
  const MAX_INGEST_BYTES = 50 * 1024 * 1024
  if (sizeHeader && Number(sizeHeader) > MAX_INGEST_BYTES) {
    return c.text('Payload too large (limit 50MB)', 413)
  }

  // Prefer streaming in production (requires known length via FixedLengthStream)
  try {
    const globalScope = globalThis as unknown as { FixedLengthStream?: new (_length: number) => { readable: ReadableStream; writable: WritableStream } }
    const FLS = globalScope.FixedLengthStream
    if (sizeHeader && res.body && typeof FLS === 'function') {
      const total = Number(sizeHeader)
      if (!Number.isNaN(total) && total > 0) {
        const { readable, writable } = new FLS(total)
        const piping = res.body.pipeTo(writable)
        await r2.put(filename, readable, { httpMetadata: { contentType } })
        await piping
        return c.json({ ok: true, key: filename, size: total, streamed: true, url: '/api/r2/' + filename })
      }
    }
  } catch {
    // Fall back to buffering
  }

  // Fallback: buffer (suitable for smaller files/local dev)
  const buf = await res.arrayBuffer()
  if (buf.byteLength > MAX_INGEST_BYTES) return c.text('Payload too large (limit 50MB)', 413)
  await r2.put(filename, buf, { httpMetadata: { contentType } })
  return c.json({ ok: true, key: filename, size: buf.byteLength, streamed: false, url: '/api/r2/' + filename })
})

// Health check endpoint for monitoring
apiRouter.get('/health', health)

// Monitoring endpoints
apiRouter.get('/metrics', metrics)
apiRouter.get('/health-metrics', healthMetrics)
