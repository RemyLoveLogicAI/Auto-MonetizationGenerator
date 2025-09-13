import { health } from '../src/health'

// Mock Context for testing
const mockContext = {
  json: jest.fn(),
  env: {
    R2: true,
  },
} as { json: jest.Mock; env: Record<string, unknown> }

describe('Health Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return health status with correct structure', async () => {
    const mockJsonResponse = {
      status: 'ok',
      version: expect.any(Object),
      perf: expect.any(Object),
      checks: expect.any(Object),
      now: expect.any(String),
    }

    mockContext.json.mockReturnValue(mockJsonResponse)

    await health(mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ok',
        version: expect.objectContaining({
          commit: expect.any(String),
          short: expect.any(String),
          built_at: expect.any(String),
        }),
        perf: expect.objectContaining({
          micro_bench_ms: expect.any(Number),
        }),
        checks: expect.objectContaining({
          uptime_ms: expect.any(Number),
          r2_bound: expect.any(Boolean),
          env: 'pages',
        }),
        now: expect.any(String),
      })
    )
  })

  it('should detect R2 binding correctly', async () => {
    await health(mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        checks: expect.objectContaining({
          r2_bound: true,
        }),
      })
    )
  })

  it('should handle missing R2 binding', async () => {
    const contextWithoutR2 = {
      ...mockContext,
      env: {},
    }

    await health(contextWithoutR2)

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        checks: expect.objectContaining({
          r2_bound: false,
        }),
      })
    )
  })
})
