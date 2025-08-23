interface MetricData {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  timestamp: number
  context?: Record<string, unknown>
}

class MonitoringService {
  private metrics: MetricData[] = []
  private logs: LogEntry[] = []
  private readonly maxMetrics = 1000
  private readonly maxLogs = 1000
  private metricQueue: MetricData[] = []
  private processingQueue = false

  // Performance tracking
  recordMetric(name: string, value: number, tags?: Record<string, string>) {
    const metric: MetricData = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    }

    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log significant metrics
    if (name.includes('error') || name.includes('latency')) {
      this.log('info', `Metric recorded: ${name} = ${value}`, { tags })
    }
  }

  // Async metric recording for critical paths
  recordMetricAsync(name: string, value: number, tags?: Record<string, string>) {
    const metric: MetricData = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    }

    this.metricQueue.push(metric)
    this.processMetricQueue()
  }

  private async processMetricQueue() {
    if (this.processingQueue || this.metricQueue.length === 0) {
      return
    }

    this.processingQueue = true

    // Process in next tick to avoid blocking
    await new Promise(resolve => setTimeout(resolve, 0))

    while (this.metricQueue.length > 0) {
      const metric = this.metricQueue.shift()
      if (metric) {
        this.metrics.push(metric)

        // Keep only recent metrics
        if (this.metrics.length > this.maxMetrics) {
          this.metrics = this.metrics.slice(-this.maxMetrics)
        }

        // Log significant metrics
        if (metric.name.includes('error') || metric.name.includes('latency')) {
          this.log('info', `Async metric recorded: ${metric.name} = ${metric.value}`, { tags: metric.tags })
        }
      }
    }

    this.processingQueue = false
  }

  // Logging system
  log(
    level: LogEntry['level'],
    message: string,
    context?: Record<string, unknown>
  ) {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context,
    }

    this.logs.push(logEntry)

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Console output for development
    if (typeof console !== 'undefined') {
      const logMethod = console[level] || console.log
      logMethod(`[${level.toUpperCase()}] ${message}`, context || '')
    }
  }

  // Performance measurement
  startTimer(name: string): () => void {
    const startTime = Date.now()
    return () => {
      const duration = Date.now() - startTime
      this.recordMetric(`${name}_duration_ms`, duration)
    }
  }

  // Error tracking
  recordError(error: Error, context?: Record<string, unknown>) {
    this.log('error', error.message, {
      stack: error.stack,
      name: error.name,
      ...context,
    })
    this.recordMetric('error_count', 1, {
      error_type: error.name,
    })
  }

  // Health check metrics
  recordHealthCheck(status: 'ok' | 'degraded' | 'down', responseTime: number) {
    this.recordMetric('health_check_response_time_ms', responseTime)
    this.recordMetric('health_check_status', status === 'ok' ? 1 : 0, {
      status,
    })
  }

  // Get monitoring data
  getMetrics(since?: number): MetricData[] {
    if (since) {
      return this.metrics.filter((m) => m.timestamp >= since)
    }
    return [...this.metrics]
  }

  getLogs(level?: LogEntry['level'], since?: number): LogEntry[] {
    let filteredLogs = [...this.logs]

    if (level) {
      filteredLogs = filteredLogs.filter((log) => log.level === level)
    }

    if (since) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp >= since)
    }

    return filteredLogs
  }

  // System stats
  getSystemStats() {
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000

    const recentMetrics = this.getMetrics(oneHourAgo)
    const recentLogs = this.getLogs(undefined, oneHourAgo)

    return {
      metrics: {
        total: this.metrics.length,
        recent: recentMetrics.length,
      },
      logs: {
        total: this.logs.length,
        recent: recentLogs.length,
        errors: recentLogs.filter((log) => log.level === 'error').length,
        warnings: recentLogs.filter((log) => log.level === 'warn').length,
      },
      uptime: now,
    }
  }

  // Clear old data
  cleanup(olderThan: number = 24 * 60 * 60 * 1000) {
    const cutoff = Date.now() - olderThan
    this.metrics = this.metrics.filter((m) => m.timestamp >= cutoff)
    this.logs = this.logs.filter((log) => log.timestamp >= cutoff)
  }
}

// Global monitoring instance
export const monitoring = new MonitoringService()

// Monitoring middleware for requests
export function withMonitoring<T extends (..._args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: Parameters<T>) => {
    const stopTimer = monitoring.startTimer(name)
    try {
      const result = fn(...args)
      
      // Handle async functions
      if (result && typeof result === 'object' && 'then' in result && typeof result.then === 'function') {
        return (result as Promise<unknown>)
          .then((value: unknown) => {
            stopTimer()
            monitoring.recordMetric(`${name}_success`, 1)
            return value
          })
          .catch((error: Error) => {
            stopTimer()
            monitoring.recordError(error, { function: name })
            throw error
          })
      }
      
      stopTimer()
      monitoring.recordMetric(`${name}_success`, 1)
      return result
    } catch (error) {
      stopTimer()
      monitoring.recordError(error as Error, { function: name })
      throw error
    }
  }) as T
}

// Export types for external use
export type { MetricData, LogEntry }