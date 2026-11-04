import type { Context } from 'hono'
import { COMMIT_SHA, COMMIT_SHORT, BUILD_TIME } from './version'
import { withMonitoring } from './monitoring'
import type { AppEnv } from './types/bindings'

type R2Like = {
  list?: (options?: { limit?: number }) => Promise<unknown>
}

export type HealthContext = Context<AppEnv> | {
  json: (_responseData: Record<string, unknown>, _status?: number) => Response | unknown
  env?: { R2?: R2Like | unknown; [key: string]: unknown }
}

export const health = withMonitoring(async function health(c: HealthContext): Promise<Response> {
  const r2 = c.env?.R2
  let r2Connected = Boolean(r2)
  const t0 = Date.now()
  if (r2 && typeof r2 === 'object' && 'list' in r2 && typeof r2.list === 'function') {
    try {
      await r2.list({ limit: 1 })
      r2Connected = true
    } catch {
      r2Connected = false
    }
  }
  const t1 = Date.now()

  const checks = {
    uptime_ms: Date.now() - Date.parse(BUILD_TIME),
    r2_bound: Boolean(c.env?.R2),
    r2_connected: r2Connected,
    env: 'pages',
  }

  return c.json({
    status: 'ok',
    version: {
      commit: COMMIT_SHA,
      short: COMMIT_SHORT,
      built_at: BUILD_TIME,
    },
    perf: {
      micro_bench_ms: +(t1 - t0).toFixed(3),
    },
    checks,
    now: new Date().toISOString(),
  }) as unknown as Response
}, 'health_endpoint')
