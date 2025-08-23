import { COMMIT_SHA, COMMIT_SHORT, BUILD_TIME } from './version'
import { withMonitoring } from './monitoring'

interface HealthContext {
  json: (_responseData: Record<string, unknown>) => unknown
  env: Record<string, unknown>
}

export const health = withMonitoring(async function health(c: HealthContext) {
  const checks = {
    uptime_ms: Date.now() - Date.parse(BUILD_TIME),
    r2_bound: Boolean(c.env?.R2),
    env: 'pages',
  }

  const t0 = Date.now()
  let x = 0
  for (let i = 0; i < 10000; i++) {
    x += Math.sqrt(i)
  }
  const t1 = Date.now()
  // Use x to avoid unused variable warning
  void x

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
  })
}, 'health_endpoint')
