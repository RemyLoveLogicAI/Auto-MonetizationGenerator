import { metrics, healthMetrics } from '../src/metrics'
import { monitoring } from '../src/monitoring'

// Mock context for testing
const createMockContext = (url: string = 'http://localhost:3000/metrics') => ({
  json: jest.fn((data) => ({ json: data })),
  text: jest.fn((data) => ({ text: data })),
  req: {
    url,
    headers: {},
  },
})

describe('Metrics Endpoint', () => {
  beforeEach(() => {
    monitoring.cleanup(0)
    jest.clearAllMocks()
  })

  describe('JSON Format (Default)', () => {
    it('should return metrics in JSON format', async () => {
      // Add some test data
      monitoring.recordMetric('test_metric', 42, { env: 'test' })
      monitoring.log('info', 'Test log message')
      
      const mockContext = createMockContext()
      await metrics(mockContext)
      
      expect(mockContext.json).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.any(Object),
          metrics: expect.any(Array),
          logs: expect.any(Array),
          timestamp: expect.any(Number),
        })
      )
      
      const callArgs = mockContext.json.mock.calls[0][0]
      expect(callArgs.metrics).toHaveLength(1)
      expect(callArgs.metrics[0]).toMatchObject({
        name: 'test_metric',
        value: 42,
        tags: { env: 'test' },
      })
      expect(callArgs.logs).toHaveLength(1)
    })

    it('should filter metrics by timestamp', async () => {
      const now = Date.now()
      monitoring.recordMetric('old_metric', 1)
      
      // Simulate time passing
      jest.spyOn(Date, 'now').mockReturnValue(now + 1000)
      monitoring.recordMetric('new_metric', 2)
      
      const mockContext = createMockContext(`http://localhost:3000/metrics?since=${now + 500}`)
      await metrics(mockContext)
      
      const callArgs = mockContext.json.mock.calls[0][0]
      expect(callArgs.metrics).toHaveLength(1)
      expect(callArgs.metrics[0].name).toBe('new_metric')
      
      jest.restoreAllMocks()
    })

    it('should filter logs by level', async () => {
      monitoring.log('info', 'Info message')
      monitoring.log('error', 'Error message')
      monitoring.log('warn', 'Warning message')
      
      const mockContext = createMockContext('http://localhost:3000/metrics?level=error')
      await metrics(mockContext)
      
      const callArgs = mockContext.json.mock.calls[0][0]
      expect(callArgs.logs).toHaveLength(1)
      expect(callArgs.logs[0].level).toBe('error')
    })
  })

  describe('Prometheus Format', () => {
    it('should return metrics in Prometheus format', async () => {
      monitoring.recordMetric('http_requests_total', 100, { method: 'GET', status: '200' })
      monitoring.recordMetric('response_time_ms', 150)
      
      const mockContext = createMockContext('http://localhost:3000/metrics?format=prometheus')
      await metrics(mockContext)
      
      expect(mockContext.text).toHaveBeenCalled()
      const prometheusOutput = mockContext.text.mock.calls[0][0]
      
      expect(prometheusOutput).toContain('http_requests_total{method="GET",status="200"} 100')
      expect(prometheusOutput).toContain('response_time_ms 150')
    })

    it('should handle metrics without tags in Prometheus format', async () => {
      monitoring.recordMetric('simple_metric', 42)
      
      const mockContext = createMockContext('http://localhost:3000/metrics?format=prometheus')
      await metrics(mockContext)
      
      const prometheusOutput = mockContext.text.mock.calls[0][0]
      expect(prometheusOutput).toContain('simple_metric 42')
      expect(prometheusOutput).not.toContain('{}')
    })
  })

  describe('Query Parameters', () => {
    it('should handle multiple query parameters', async () => {
      const now = Date.now()
      monitoring.log('info', 'Info message')
      monitoring.log('error', 'Error message')
      monitoring.recordMetric('test_metric', 1)
      
      const mockContext = createMockContext(
        `http://localhost:3000/metrics?level=error&since=${now - 1000}&format=json`
      )
      await metrics(mockContext)
      
      const callArgs = mockContext.json.mock.calls[0][0]
      expect(callArgs.logs.every((log: any) => log.level === 'error')).toBe(true)
    })

    it('should handle invalid query parameters gracefully', async () => {
      monitoring.recordMetric('test_metric', 1)
      
      const mockContext = createMockContext('http://localhost:3000/metrics?since=invalid&level=invalid')
      await metrics(mockContext)
      
      expect(mockContext.json).toHaveBeenCalled()
      // Should not throw and should return data
      const callArgs = mockContext.json.mock.calls[0][0]
      expect(callArgs).toHaveProperty('metrics')
    })
  })
})

describe('Health Metrics Endpoint', () => {
  beforeEach(() => {
    monitoring.cleanup(0)
    jest.clearAllMocks()
  })

  it('should return healthy status with no recent errors', async () => {
    monitoring.log('info', 'Normal operation')
    
    const mockContext = createMockContext()
    await healthMetrics(mockContext)
    
    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ok',
        system: expect.any(Object),
        recent_errors: 0,
        timestamp: expect.any(Number),
      })
    )
  })

  it('should return degraded status with many recent errors', async () => {
    // Add more than 10 errors in the last 5 minutes
    for (let i = 0; i < 12; i++) {
      monitoring.log('error', `Error ${i}`)
    }
    
    const mockContext = createMockContext()
    await healthMetrics(mockContext)
    
    const callArgs = mockContext.json.mock.calls[0][0]
    expect(callArgs.status).toBe('degraded')
    expect(callArgs.recent_errors).toBe(12)
  })

  it('should only count recent errors', async () => {
    const now = Date.now()
    
    // Mock old timestamp for old errors
    jest.spyOn(Date, 'now').mockReturnValue(now - 10 * 60 * 1000) // 10 minutes ago
    for (let i = 0; i < 15; i++) {
      monitoring.log('error', `Old error ${i}`)
    }
    
    // Reset to current time
    jest.spyOn(Date, 'now').mockReturnValue(now)
    monitoring.log('error', 'Recent error')
    
    const mockContext = createMockContext()
    await healthMetrics(mockContext)
    
    const callArgs = mockContext.json.mock.calls[0][0]
    expect(callArgs.status).toBe('ok') // Should be ok because only 1 recent error
    expect(callArgs.recent_errors).toBe(1)
    
    jest.restoreAllMocks()
  })

  it('should include system statistics', async () => {
    monitoring.recordMetric('test_metric', 1)
    monitoring.log('info', 'Test log')
    
    const mockContext = createMockContext()
    await healthMetrics(mockContext)
    
    const callArgs = mockContext.json.mock.calls[0][0]
    expect(callArgs.system).toMatchObject({
      metrics: expect.objectContaining({
        total: expect.any(Number),
        recent: expect.any(Number),
      }),
      logs: expect.objectContaining({
        total: expect.any(Number),
        recent: expect.any(Number),
        errors: expect.any(Number),
        warnings: expect.any(Number),
      }),
      uptime: expect.any(Number),
    })
  })
})