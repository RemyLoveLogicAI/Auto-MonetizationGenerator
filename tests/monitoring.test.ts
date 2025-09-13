import { monitoring, withMonitoring } from '../src/monitoring'

describe('Monitoring Service', () => {
  beforeEach(() => {
    // Clear monitoring data before each test
    monitoring.cleanup(0)
  })

  describe('Metrics Recording', () => {
    it('should record metrics with timestamp', () => {
      monitoring.recordMetric('test_metric', 42, { tag: 'test' })
      
      const metrics = monitoring.getMetrics()
      expect(metrics).toHaveLength(1)
      expect(metrics[0]).toMatchObject({
        name: 'test_metric',
        value: 42,
        tags: { tag: 'test' },
      })
      expect(metrics[0].timestamp).toBeGreaterThan(0)
    })

    it('should limit metrics storage', () => {
      // Record more than max metrics
      for (let i = 0; i < 1100; i++) {
        monitoring.recordMetric(`metric_${i}`, i)
      }
      
      const metrics = monitoring.getMetrics()
      expect(metrics.length).toBeLessThanOrEqual(1000)
    })

    it('should filter metrics by timestamp', (done) => {
      const now = Date.now()
      monitoring.recordMetric('old_metric', 1)
      
      // Wait a bit and record new metric
      setTimeout(() => {
        monitoring.recordMetric('new_metric', 2)
        
        const recentMetrics = monitoring.getMetrics(now + 50)
        expect(recentMetrics).toHaveLength(1)
        expect(recentMetrics[0].name).toBe('new_metric')
        done()
      }, 100)
    })
  })

  describe('Logging System', () => {
    it('should record logs with different levels', () => {
      monitoring.log('info', 'Test info message')
      monitoring.log('error', 'Test error message', { context: 'test' })
      
      const logs = monitoring.getLogs()
      expect(logs).toHaveLength(2)
      expect(logs[0].level).toBe('info')
      expect(logs[1].level).toBe('error')
      expect(logs[1].context).toEqual({ context: 'test' })
    })

    it('should filter logs by level', () => {
      monitoring.log('info', 'Info message')
      monitoring.log('error', 'Error message')
      monitoring.log('warn', 'Warning message')
      
      const errorLogs = monitoring.getLogs('error')
      expect(errorLogs).toHaveLength(1)
      expect(errorLogs[0].message).toBe('Error message')
    })

    it('should limit log storage', () => {
      // Record more than max logs
      for (let i = 0; i < 1100; i++) {
        monitoring.log('info', `Log message ${i}`)
      }
      
      const logs = monitoring.getLogs()
      expect(logs.length).toBeLessThanOrEqual(1000)
    })
  })

  describe('Performance Timing', () => {
    it('should measure execution time', (done) => {
      const stopTimer = monitoring.startTimer('test_operation')
      
      setTimeout(() => {
        stopTimer()
        
        const metrics = monitoring.getMetrics()
        const durationMetric = metrics.find(m => m.name === 'test_operation_duration_ms')
        
        expect(durationMetric).toBeDefined()
        expect(durationMetric?.value).toBeGreaterThan(0)
        done()
      }, 10)
    })
  })

  describe('Error Tracking', () => {
    it('should record errors with context', () => {
      const error = new Error('Test error')
      monitoring.recordError(error, { userId: '123' })
      
      const logs = monitoring.getLogs('error')
      expect(logs).toHaveLength(1)
      expect(logs[0].message).toBe('Test error')
      expect(logs[0].context).toMatchObject({
        name: 'Error',
        userId: '123',
      })
      
      const metrics = monitoring.getMetrics()
      const errorMetric = metrics.find(m => m.name === 'error_count')
      expect(errorMetric).toBeDefined()
      expect(errorMetric?.value).toBe(1)
    })
  })

  describe('Health Check Metrics', () => {
    it('should record health check status and response time', () => {
      monitoring.recordHealthCheck('ok', 150)
      
      const metrics = monitoring.getMetrics()
      expect(metrics).toHaveLength(2)
      
      const responseTimeMetric = metrics.find(m => m.name === 'health_check_response_time_ms')
      const statusMetric = metrics.find(m => m.name === 'health_check_status')
      
      expect(responseTimeMetric?.value).toBe(150)
      expect(statusMetric?.value).toBe(1)
      expect(statusMetric?.tags?.status).toBe('ok')
    })

    it('should record degraded status correctly', () => {
      monitoring.recordHealthCheck('degraded', 500)
      
      const metrics = monitoring.getMetrics()
      const statusMetric = metrics.find(m => m.name === 'health_check_status')
      
      expect(statusMetric?.value).toBe(0)
      expect(statusMetric?.tags?.status).toBe('degraded')
    })
  })

  describe('System Stats', () => {
    it('should provide system statistics', () => {
      monitoring.recordMetric('test_metric', 1)
      monitoring.log('info', 'Test log')
      monitoring.log('error', 'Test error')
      
      const stats = monitoring.getSystemStats()
      
      expect(stats.metrics.total).toBe(1)
      expect(stats.logs.total).toBe(2)
      expect(stats.logs.errors).toBe(1)
      expect(stats.uptime).toBeGreaterThan(0)
    })
  })

  describe('Data Cleanup', () => {
    it('should clean up old data', () => {
      const oldTimestamp = Date.now() - 1000 // 1 second ago
      
      // Mock the timestamp for old data
      jest.spyOn(Date, 'now').mockReturnValueOnce(oldTimestamp)
      monitoring.recordMetric('old_metric', 1)
      
      jest.spyOn(Date, 'now').mockReturnValueOnce(oldTimestamp)
      monitoring.log('info', 'Old log')
      
      // Restore normal time
      jest.restoreAllMocks()
      
      // Clean up everything older than 500ms
      monitoring.cleanup(500)
      
      expect(monitoring.getMetrics()).toHaveLength(0)
      expect(monitoring.getLogs()).toHaveLength(0)
    })
  })
})

describe('Monitoring Middleware', () => {
  beforeEach(() => {
    monitoring.cleanup(0)
  })

  it('should wrap synchronous functions', () => {
    const testFn = (x: number) => x * 2
    const wrappedFn = withMonitoring(testFn, 'test_sync_fn')
    
    const result = wrappedFn(5)
    expect(result).toBe(10)
    
    const metrics = monitoring.getMetrics()
    expect(metrics.some(m => m.name === 'test_sync_fn_duration_ms')).toBe(true)
    expect(metrics.some(m => m.name === 'test_sync_fn_success')).toBe(true)
  })

  it('should wrap asynchronous functions', async () => {
    const testFn = async (x: number) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return x * 2
    }
    const wrappedFn = withMonitoring(testFn, 'test_async_fn')
    
    const result = await wrappedFn(5)
    expect(result).toBe(10)
    
    const metrics = monitoring.getMetrics()
    expect(metrics.some(m => m.name === 'test_async_fn_duration_ms')).toBe(true)
    expect(metrics.some(m => m.name === 'test_async_fn_success')).toBe(true)
  })

  it('should handle synchronous errors', () => {
    const testFn = () => {
      throw new Error('Sync error')
    }
    const wrappedFn = withMonitoring(testFn, 'test_error_fn')
    
    expect(() => wrappedFn()).toThrow('Sync error')
    
    const logs = monitoring.getLogs('error')
    expect(logs).toHaveLength(1)
    expect(logs[0].message).toBe('Sync error')
    
    const metrics = monitoring.getMetrics()
    expect(metrics.some(m => m.name === 'error_count')).toBe(true)
  })

  it('should handle asynchronous errors', async () => {
    const testFn = async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
      throw new Error('Async error')
    }
    const wrappedFn = withMonitoring(testFn, 'test_async_error_fn')
    
    await expect(wrappedFn()).rejects.toThrow('Async error')
    
    const logs = monitoring.getLogs('error')
    expect(logs).toHaveLength(1)
    expect(logs[0].message).toBe('Async error')
  })
})

describe('Async Metric Recording', () => {
  beforeEach(() => {
    // Clear metrics before each test
    monitoring.getMetrics().length = 0
  })

  it('should record metrics asynchronously without blocking', async () => {
    const startTime = Date.now()
    
    // Record multiple async metrics
    monitoring.recordMetricAsync('async_test_1', 100, { type: 'performance' })
    monitoring.recordMetricAsync('async_test_2', 200, { type: 'latency' })
    monitoring.recordMetricAsync('async_test_3', 300, { type: 'throughput' })
    
    const syncTime = Date.now() - startTime
    expect(syncTime).toBeLessThan(10) // Should be non-blocking
    
    // Wait for async processing
    await new Promise(resolve => setTimeout(resolve, 50))
    
    const metrics = monitoring.getMetrics()
    expect(metrics.length).toBeGreaterThanOrEqual(3)
    
    const asyncMetrics = metrics.filter(m => m.name.startsWith('async_test_'))
    expect(asyncMetrics).toHaveLength(3)
    expect(asyncMetrics[0].value).toBe(100)
    expect(asyncMetrics[1].value).toBe(200)
    expect(asyncMetrics[2].value).toBe(300)
  })

  it('should handle high-volume async metrics efficiently', async () => {
    const metricCount = 100
    const startTime = Date.now()
    
    // Record many metrics quickly
    for (let i = 0; i < metricCount; i++) {
      monitoring.recordMetricAsync(`bulk_metric_${i}`, i, { batch: 'test' })
    }
    
    const syncTime = Date.now() - startTime
    expect(syncTime).toBeLessThan(50) // Should remain fast
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const metrics = monitoring.getMetrics()
    const bulkMetrics = metrics.filter(m => m.name.startsWith('bulk_metric_'))
    expect(bulkMetrics.length).toBe(metricCount)
  })
})