import { Hono } from 'hono'
import type { AppEnv } from '../types/bindings'

export const viewsRouter = new Hono<AppEnv>()

// Landing page route
viewsRouter.get('/', (c) => {
  return c.render(
    <div className="page-wrapper">
      <nav className="nav-header">
        <div className="nav-container">
          <div className="nav-brand">Auto-MonetizationGenerator</div>
          <ul className="nav-links">
            <li><a href="/api/health" className="nav-link">Health</a></li>
            <li><a href="/api/metrics" className="nav-link">Metrics</a></li>
            <li><a href="/dashboards" className="nav-link">Dashboards</a></li>
            <li><a href="/admin/ingest" className="nav-link">Admin</a></li>
          </ul>
        </div>
      </nav>
      
      <main className="main-content">
        <div className="container">
          <section className="section">
            <div className="section-header animate-fade-in-up">
              <h1 className="section-title">Auto-MonetizationGenerator</h1>
              <p className="section-subtitle">
                Advanced monetization platform with real-time analytics, 
                automated optimization, and comprehensive monitoring capabilities.
              </p>
            </div>
            
            <div className="dashboard-grid animate-slide-in-right">
              <div className="card">
                <h3>System Health</h3>
                <p>Monitor application performance, uptime, and system metrics in real-time.</p>
                <a href="/api/health" className="btn btn-primary">View Health Status</a>
              </div>
              
              <div className="card">
                <h3>Analytics Dashboard</h3>
                <p>Comprehensive metrics visualization with advanced filtering and insights.</p>
                <a href="/dashboards" className="btn btn-primary">Open Dashboard</a>
              </div>
              
              <div className="card">
                <h3>API Metrics</h3>
                <p>Access detailed performance metrics and system statistics via REST API.</p>
                <a href="/api/metrics" className="btn btn-secondary">View API</a>
              </div>
              
              <div className="card">
                <h3>Content Management</h3>
                <p>Manage R2 storage, ingest external content, and configure monetization rules.</p>
                <a href="/admin/ingest" className="btn btn-secondary">Admin Panel</a>
              </div>
            </div>
          </section>
          
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">Platform Features</h2>
            </div>
            
            <div className="dashboard-grid">
              <div className="metric-card">
                <div className="metric-value">99.9%</div>
                <div className="metric-label">Uptime</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">&lt;50ms</div>
                <div className="metric-label">Response Time</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">24/7</div>
                <div className="metric-label">Monitoring</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">Auto</div>
                <div className="metric-label">Optimization</div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <div className="signature-footer">
        Made by Jeremy Morgan-Jones Sr (LoveLogic AI LLC)
      </div>
    </div>
  )
})

// Asset Library route
viewsRouter.get('/library', (c) => {
  return c.render(
    <div style={{ padding: '24px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial' }}>
      <h1>Asset Library</h1>
      <p style={{ marginTop: '8px', color: '#444' }}>Local and external archives available for browsing and download.</p>
      <label style={{ display: 'block', marginTop: '12px' }}>
        <input id="toggleAdult" type="checkbox" style={{ marginRight: '8px' }} /> Show adult content
      </label>
      <div id="assets" style={{ marginTop: '16px' }}>Loading…</div>
      <script src="/static/library.js"></script>
    </div>
  )
})

// CSV Explorer route (client-side parsing in /static/csv.js)
viewsRouter.get('/csv', (c) => {
  const u = new URL(c.req.url)
  const src = u.searchParams.get('src') || '/static/assets/REVENUE_TRACKING_SYSTEM.csv'
  return c.render(
    <div style={{ padding: '24px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial' }}>
      <h1>CSV Explorer</h1>
      <p style={{ marginTop: '8px', color: '#444' }}>Parse and explore CSVs client-side. Default source can be overridden via ?src=URL</p>
      <div style={{ marginTop: '12px' }}>
        <input id="src" type="text" value={src} style={{ width: '80%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
        <button id="load" style={{ marginLeft: '8px', padding: '8px 12px', background: '#2563eb', color: '#fff', borderRadius: '6px', border: 0 }}>Load</button>
      </div>
      <div id="status" style={{ marginTop: '12px', color: '#6b7280' }}>Idle</div>
      <div style={{ marginTop: '10px' }}>
        <input id="filter" type="text" placeholder="Filter rows (case-insensitive)" style={{ width: '60%', padding: '6px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
      </div>
      <div id="table" style={{ marginTop: '12px', overflowX: 'auto' }}></div>
      <script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>
      <script src="/static/csv.js"></script>
    </div>
  )
})

// Dashboards viewer with sidebar
viewsRouter.get('/dashboards', (c) => {
  return c.render(
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial' }}>
      <aside style={{ width: '340px', borderRight: '1px solid #e5e7eb', padding: '16px' }}>
        <h2 style={{ margin: 0 }}>Dashboards</h2>
        <div id="list" style={{ marginTop: '12px' }}>Loading…</div>
      </aside>
      <main style={{ flex: 1, padding: '16px' }}>
        <div id="viewer" style={{ height: '85vh', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          <iframe id="frame" src="about:blank" style={{ width: '100%', height: '100%', border: 0 }}></iframe>
        </div>
      </main>
      <script src="/static/dashboards.js"></script>
      <div className="signature-footer">Made by Jeremy Morgan-Jones Sr (LoveLogic AI LLC)</div>
    </div>
  )
})
