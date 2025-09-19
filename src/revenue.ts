import { Context } from 'hono'

// Revenue tracking and monetization system
export interface RevenueMetrics {
  totalRevenue: number
  apiCalls: number
  contentViews: number
  assetDownloads: number
  subscriptionRevenue: number
  adRevenue: number
  affiliateCommissions: number
  timestamp: string
}

export interface MonetizationEvent {
  type: 'api_call' | 'content_view' | 'asset_download' | 'subscription' | 'ad_click' | 'affiliate_sale'
  revenue: number
  userId?: string
  assetId?: string
  metadata?: Record<string, any>
  timestamp: string
}

class RevenueTracker {
  private metrics: RevenueMetrics = {
    totalRevenue: 0,
    apiCalls: 0,
    contentViews: 0,
    assetDownloads: 0,
    subscriptionRevenue: 0,
    adRevenue: 0,
    affiliateCommissions: 0,
    timestamp: new Date().toISOString()
  }

  private events: MonetizationEvent[] = []

  // Track revenue-generating events
  trackEvent(event: Omit<MonetizationEvent, 'timestamp'>): void {
    const fullEvent: MonetizationEvent = {
      ...event,
      timestamp: new Date().toISOString()
    }

    this.events.push(fullEvent)
    this.updateMetrics(fullEvent)

    console.info(`💰 Revenue Event: ${event.type} - $${event.revenue}`, {
      totalRevenue: this.metrics.totalRevenue,
      eventCount: this.events.length
    })
  }

  private updateMetrics(event: MonetizationEvent): void {
    this.metrics.totalRevenue += event.revenue
    this.metrics.timestamp = event.timestamp

    switch (event.type) {
      case 'api_call':
        this.metrics.apiCalls++
        break
      case 'content_view':
        this.metrics.contentViews++
        break
      case 'asset_download':
        this.metrics.assetDownloads++
        break
      case 'subscription':
        this.metrics.subscriptionRevenue += event.revenue
        break
      case 'ad_click':
        this.metrics.adRevenue += event.revenue
        break
      case 'affiliate_sale':
        this.metrics.affiliateCommissions += event.revenue
        break
    }
  }

  // Get current revenue metrics
  getMetrics(): RevenueMetrics {
    return { ...this.metrics }
  }

  // Get revenue events with filtering
  getEvents(type?: MonetizationEvent['type'], limit = 100): MonetizationEvent[] {
    let filtered = this.events
    if (type) {
      filtered = this.events.filter(event => event.type === type)
    }
    return filtered.slice(-limit)
  }

  // Calculate revenue rate (per hour)
  getRevenueRate(): number {
    if (this.events.length < 2) return 0

    const firstEvent = this.events[0]
    const lastEvent = this.events[this.events.length - 1]
    const timeSpan = new Date(lastEvent.timestamp).getTime() - new Date(firstEvent.timestamp).getTime()
    const hours = timeSpan / (1000 * 60 * 60)

    return hours > 0 ? this.metrics.totalRevenue / hours : 0
  }

  // Simulate revenue generation for demo
  simulateRevenue(): void {
    const scenarios = [
      { type: 'api_call' as const, revenue: 0.05, probability: 0.8 },
      { type: 'content_view' as const, revenue: 0.02, probability: 0.9 },
      { type: 'asset_download' as const, revenue: 2.99, probability: 0.3 },
      { type: 'subscription' as const, revenue: 29.99, probability: 0.1 },
      { type: 'ad_click' as const, revenue: 0.15, probability: 0.6 },
      { type: 'affiliate_sale' as const, revenue: 15.50, probability: 0.2 }
    ]

    scenarios.forEach(scenario => {
      if (Math.random() < scenario.probability) {
        this.trackEvent({
          type: scenario.type,
          revenue: scenario.revenue + (Math.random() * scenario.revenue * 0.5), // Add variance
          userId: `user_${Math.floor(Math.random() * 1000)}`,
          assetId: scenario.type.includes('asset') ? `asset_${Math.floor(Math.random() * 100)}` : undefined,
          metadata: {
            source: 'demo_simulation',
            userAgent: 'Auto-MonetizationGenerator/1.0'
          }
        })
      }
    })
  }

  // Reset metrics for new demo
  reset(): void {
    this.metrics = {
      totalRevenue: 0,
      apiCalls: 0,
      contentViews: 0,
      assetDownloads: 0,
      subscriptionRevenue: 0,
      adRevenue: 0,
      affiliateCommissions: 0,
      timestamp: new Date().toISOString()
    }
    this.events = []
  }
}

// Global revenue tracker instance
export const revenueTracker = new RevenueTracker()

// Middleware to track API revenue
export const trackApiRevenue = (revenue = 0.05) => {
  return async (c: Context, next: () => Promise<void>) => {
    await next()
    
    // Only track successful requests
    if (c.res.status < 400) {
      revenueTracker.trackEvent({
        type: 'api_call',
        revenue,
        userId: c.req.header('x-user-id') || 'anonymous',
        metadata: {
          endpoint: c.req.path,
          method: c.req.method,
          userAgent: c.req.header('user-agent')
        }
      })
    }
  }
}

// Revenue endpoints
export const getRevenueMetrics = (c: Context) => {
  return c.json({
    success: true,
    data: revenueTracker.getMetrics(),
    revenueRate: revenueTracker.getRevenueRate(),
    timestamp: new Date().toISOString()
  })
}

export const getRevenueEvents = (c: Context) => {
  const type = c.req.query('type') as MonetizationEvent['type'] | undefined
  const limit = parseInt(c.req.query('limit') || '50')
  
  return c.json({
    success: true,
    data: revenueTracker.getEvents(type, limit),
    total: revenueTracker.getEvents().length,
    timestamp: new Date().toISOString()
  })
}

export const simulateRevenueGeneration = (c: Context) => {
  const iterations = parseInt(c.req.query('iterations') || '10')
  
  for (let i = 0; i < iterations; i++) {
    revenueTracker.simulateRevenue()
  }
  
  return c.json({
    success: true,
    message: `Generated ${iterations} revenue simulation cycles`,
    metrics: revenueTracker.getMetrics(),
    timestamp: new Date().toISOString()
  })
}

export const resetRevenueTracking = (c: Context) => {
  revenueTracker.reset()
  
  return c.json({
    success: true,
    message: 'Revenue tracking reset successfully',
    metrics: revenueTracker.getMetrics(),
    timestamp: new Date().toISOString()
  })
}