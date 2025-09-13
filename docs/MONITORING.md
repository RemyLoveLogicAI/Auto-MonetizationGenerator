# Monitoring System

This document describes the monitoring, logging, and performance tracking system implemented in the Auto-MonetizationGenerator application.

## Overview

The monitoring system provides comprehensive observability for the application, including:

- **Performance Metrics**: Track execution times, success rates, and system performance
- **Logging**: Structured logging with different levels (info, warn, error, debug)
- **Error Tracking**: Automatic error capture with context and stack traces
- **Health Monitoring**: System health checks and status reporting
- **Data Export**: Metrics available in JSON and Prometheus formats

## Components

### MonitoringService (`src/monitoring.ts`)

The core monitoring service that handles:

- Metric collection and storage
- Log aggregation with level filtering
- Performance timing
- Error tracking with context
- Data cleanup and retention

#### Key Methods

```typescript
// Record a metric
monitoring.recordMetric('api_response_time', 150, { endpoint: '/health' })

// Log messages
monitoring.log('info', 'User logged in', { userId: '123' })

// Time operations
const stopTimer = monitoring.startTimer('database_query')
// ... perform operation
stopTimer()

// Track errors
monitoring.recordError(error, { context: 'user_registration' })

// Health checks
monitoring.recordHealthCheck('ok', 120)
```

### Monitoring Middleware (`withMonitoring`)

Wraps functions to automatically track:
- Execution time
- Success/failure rates
- Error capture

```typescript
const monitoredFunction = withMonitoring(originalFunction, 'function_name')
```

### Metrics Endpoint (`src/metrics.ts`)

Exposes monitoring data via HTTP endpoints:

#### `/metrics` - Main metrics endpoint

Query parameters:
- `format`: `json` (default) or `prometheus`
- `since`: Unix timestamp to filter recent data
- `level`: Log level filter (`info`, `warn`, `error`, `debug`)

#### `/health-metrics` - Health-focused metrics

Returns system health status and recent error counts.

## Usage Examples

### Basic Monitoring

```typescript
import { monitoring } from './monitoring'

// Record custom metrics
monitoring.recordMetric('user_registrations', 1, { source: 'web' })

// Log important events
monitoring.log('info', 'Payment processed', { 
  amount: 99.99, 
  currency: 'USD' 
})

// Track errors
try {
  await riskyOperation()
} catch (error) {
  monitoring.recordError(error, { operation: 'payment_processing' })
  throw error
}
```

### Function Monitoring

```typescript
import { withMonitoring } from './monitoring'

// Automatically monitor function performance
export const processPayment = withMonitoring(
  async (paymentData) => {
    // Payment processing logic
    return result
  },
  'payment_processing'
)
```

### Health Endpoint Integration

The health endpoint (`src/health.ts`) is automatically monitored and tracks:
- Response times
- Success rates
- Error occurrences

## Data Retention

The monitoring system automatically manages data retention:

- **Metrics**: Limited to 1,000 most recent entries
- **Logs**: Limited to 1,000 most recent entries
- **Cleanup**: Automatic cleanup of data older than 24 hours (configurable)

## Metrics Export

### JSON Format (Default)

```json
{
  "system": {
    "metrics": { "total": 150, "recent": 45 },
    "logs": { "total": 300, "recent": 89, "errors": 2, "warnings": 5 },
    "uptime": 1640995200000
  },
  "metrics": [
    {
      "name": "api_response_time",
      "value": 150,
      "timestamp": 1640995200000,
      "tags": { "endpoint": "/health" }
    }
  ],
  "logs": [
    {
      "level": "info",
      "message": "User logged in",
      "timestamp": 1640995200000,
      "context": { "userId": "123" }
    }
  ]
}
```

### Prometheus Format

```
api_response_time{endpoint="/health"} 150 1640995200000
user_registrations{source="web"} 1 1640995200000
error_count{error_type="ValidationError"} 3 1640995200000
```

## Testing

The monitoring system includes comprehensive tests:

- **Unit Tests**: `tests/monitoring.test.ts`
- **Integration Tests**: `tests/metrics.test.ts`
- **Coverage**: All major functionality and edge cases

Run tests with:
```bash
npm test
```

## Configuration

### Environment Variables

- `NODE_ENV`: Affects console logging behavior
- Custom retention periods can be configured in the MonitoringService constructor

### ESLint Configuration

The monitoring system is configured to work with the project's ESLint setup, including proper handling of:
- Global variables (setTimeout, URL, etc.)
- TypeScript strict mode
- Jest testing environment

## Best Practices

1. **Metric Naming**: Use descriptive names with consistent patterns
   - `operation_duration_ms` for timing
   - `operation_count` for counters
   - `operation_success` for success rates

2. **Tagging**: Use tags for dimensional data
   ```typescript
   monitoring.recordMetric('api_requests', 1, {
     method: 'POST',
     endpoint: '/users',
     status: '200'
   })
   ```

3. **Error Context**: Always provide context when recording errors
   ```typescript
   monitoring.recordError(error, {
     userId: user.id,
     operation: 'user_update',
     input: sanitizedInput
   })
   ```

4. **Log Levels**: Use appropriate log levels
   - `debug`: Detailed debugging information
   - `info`: General information about application flow
   - `warn`: Warning conditions that should be noted
   - `error`: Error conditions that need attention

## Monitoring Dashboard Integration

The metrics endpoint supports integration with external monitoring systems:

- **Prometheus**: Use `?format=prometheus` for Prometheus scraping
- **Grafana**: Can visualize Prometheus metrics
- **Custom Dashboards**: JSON format for custom monitoring solutions

## Performance Considerations

- Metrics are stored in memory with automatic cleanup
- Console logging can be disabled in production
- Minimal performance overhead for wrapped functions
- Efficient data structures for fast querying and filtering

## Troubleshooting

### High Memory Usage
- Check metric and log retention limits
- Verify cleanup is running properly
- Monitor for metric/log spam

### Missing Metrics
- Verify function wrapping with `withMonitoring`
- Check metric naming consistency
- Ensure proper error handling doesn't skip metric recording

### Performance Impact
- Monitor the monitoring system itself
- Use sampling for high-frequency operations
- Consider async metric recording for critical paths