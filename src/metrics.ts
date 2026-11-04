import type { Context } from 'hono'
import { monitoring } from './monitoring'
import type { AppEnv } from './types/bindings'

type MetricsContext = Context<AppEnv> | {
  json: (_responseData: Record<string, unknown>, _status?: number) => Response | unknown
  text: (_responseData: string, _status?: number) => Response | unknown
  req: {
    url: string
    headers?: Record<string, string>
  }
}
export async function metrics(c: MetricsContext): Promise<Response> {
  const url = new URL(c.req.url)
  const format = url.searchParams.get('format') || 'json'
  const since = url.searchParams.get('since')
  const level = url.searchParams.get('level') as 'info' | 'warn' | 'error' | 'debug'

  const sinceTimestamp = since ? parseInt(since, 10) : undefined

  if (format === 'prometheus') {
    // Prometheus format
    const metrics = monitoring.getMetrics(sinceTimestamp)
    const prometheusMetrics = metrics
      .map((metric) => {
        const tags = metric.tags
          ? Object.entries(metric.tags)
              .map(([key, value]) => `${key}="${value}"`)
              .join(',')
          : ''
        const tagString = tags ? `{${tags}}` : ''
        return `${metric.name}${tagString} ${metric.value} ${metric.timestamp}`
      })
      .join('\n')

    return c.text(prometheusMetrics) as unknown as Response
  }

  // JSON format (default)
  const systemStats = monitoring.getSystemStats()
  const metricsData = monitoring.getMetrics(sinceTimestamp)
  const logsData = monitoring.getLogs(level, sinceTimestamp)

  return c.json({
    system: systemStats,
    metrics: metricsData,
    logs: logsData,
    timestamp: Date.now(),
  }) as unknown as Response
}

export async function healthMetrics(c: MetricsContext): Promise<Response> {
  const systemStats = monitoring.getSystemStats()
  const recentErrors = monitoring.getLogs('error', Date.now() - 5 * 60 * 1000) // Last 5 minutes

  const healthStatus = recentErrors.length > 10 ? 'degraded' : 'ok'

  return c.json({
    status: healthStatus,
    system: systemStats,
    recent_errors: recentErrors.length,
    timestamp: Date.now(),
  }) as unknown as Response
}