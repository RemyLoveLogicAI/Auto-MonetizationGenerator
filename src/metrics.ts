import { monitoring } from './monitoring'

interface MetricsContext {
  json: (_responseData: Record<string, unknown>) => unknown
  text: (_responseData: string) => unknown
  req: {
    url: string
    headers: Record<string, string>
  }
}

export async function metrics(c: MetricsContext) {
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

    return c.text(prometheusMetrics)
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
  })
}

export async function healthMetrics(c: MetricsContext) {
  const systemStats = monitoring.getSystemStats()
  const recentErrors = monitoring.getLogs('error', Date.now() - 5 * 60 * 1000) // Last 5 minutes

  const healthStatus = recentErrors.length > 10 ? 'degraded' : 'ok'

  return c.json({
    status: healthStatus,
    system: systemStats,
    recent_errors: recentErrors.length,
    timestamp: Date.now(),
  })
}