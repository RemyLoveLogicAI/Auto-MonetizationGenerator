import type { Context } from 'hono' import { COMMIT_SHA, COMMIT_SHORT, BUILD_TIME } from './version'

export async function health(c: Context) { const checks = { uptime_ms: Date.now() - Date.parse(BUILD_TIME), r2_bound: Boolean((c as any).env?.R2), env: 'pages', } const t0 = performance.now() let x = 0 for (let i = 0; i < 10000; i++) x += Math.sqrt(i) const t1 = performance.now() return c.json({ status: 'ok', version: { commit: COMMIT_SHA, short: COMMIT_SHORT, built_at: BUILD_TIME }, perf: { micro_bench_ms: +(t1 - t0).toFixed(3) }, checks, now: new Date().toISOString(), }) }
