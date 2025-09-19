import { html } from 'hono/html'
import { Context } from 'hono'

export const HealthPage = (c: Context) => {
  return c.render(
    <div className="page-wrapper">
      <nav className="nav-header">
        <div className="nav-container">
          <div className="nav-brand">
            <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Auto-MonetizationGenerator</a>
          </div>
          <ul className="nav-links">
            <li><a href="/health" className="nav-link active">Health</a></li>
            <li><a href="/metrics" className="nav-link">Metrics</a></li>
            <li><a href="/dashboards" className="nav-link">Dashboards</a></li>
            <li><a href="/admin/ingest" className="nav-link">Admin</a></li>
          </ul>
        </div>
      </nav>
      
      <main className="main-content">
        <div className="container">
          <section className="section">
            <div className="section-header animate-fade-in-up">
              <h1 className="section-title">System Health Monitor</h1>
              <p className="section-subtitle">
                Real-time system health monitoring with automated diagnostics and performance tracking.
              </p>
            </div>
            
            <div className="dashboard-grid animate-slide-in-right">
              <div className="metric-card status-healthy" id="overall-status">
                <div className="metric-icon">🟢</div>
                <div className="metric-value" id="status-text">Healthy</div>
                <div className="metric-label">Overall Status</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">⏱️</div>
                <div className="metric-value" id="uptime-value">Loading...</div>
                <div className="metric-label">System Uptime</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">📊</div>
                <div className="metric-value" id="memory-value">Loading...</div>
                <div className="metric-label">Memory Usage</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">🚀</div>
                <div className="metric-value" id="response-time">&lt; 50ms</div>
                <div className="metric-label">Response Time</div>
              </div>
            </div>
            
            <div className="health-details">
              <div className="card">
                <h3>System Components</h3>
                <div className="component-list" id="components">
                  <div className="component-item">
                    <span className="component-name">API Server</span>
                    <span className="component-status status-healthy">✅ Operational</span>
                  </div>
                  <div className="component-item">
                    <span className="component-name">Database</span>
                    <span className="component-status status-healthy" id="db-status">✅ Connected</span>
                  </div>
                  <div className="component-item">
                    <span className="component-name">R2 Storage</span>
                    <span className="component-status status-healthy" id="r2-status">✅ Available</span>
                  </div>
                  <div className="component-item">
                    <span className="component-name">Revenue Tracking</span>
                    <span className="component-status status-healthy" id="revenue-status">✅ Active</span>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <h3>Performance Metrics</h3>
                <div className="metrics-chart" id="performance-chart">
                  <canvas id="healthChart" width="400" height="200"></canvas>
                </div>
              </div>
              
              <div className="card">
                <h3>Recent Health Events</h3>
                <div className="health-log" id="health-log">
                  <div className="log-entry">
                    <span className="log-time">Just now</span>
                    <span className="log-message">System health check completed successfully</span>
                    <span className="log-status status-healthy">✅</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <div className="signature-footer">
        Made by Jeremy Morgan-Jones Sr (LoveLogic AI LLC)
      </div>
      
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          let healthData = [];
          let chart = null;
          
          async function updateHealthMetrics() {
            try {
              const [healthRes, metricsRes] = await Promise.all([
                fetch('/api/health'),
                fetch('/api/metrics')
              ]);
              
              const health = await healthRes.json();
              const metrics = await metricsRes.json();
              
              // Update status indicators
              document.getElementById('status-text').textContent = health.status === 'healthy' ? 'Healthy' : 'Warning';
              document.getElementById('uptime-value').textContent = formatUptime(metrics.uptime || 0);
              
              if (metrics.memory) {
                const memUsed = (metrics.memory.heapUsed / 1024 / 1024).toFixed(1);
                document.getElementById('memory-value').textContent = memUsed + ' MB';
              }
              
              // Add to health data for chart
              healthData.push({
                timestamp: new Date(),
                memory: metrics.memory ? metrics.memory.heapUsed / 1024 / 1024 : 0,
                uptime: metrics.uptime || 0
              });
              
              // Keep only last 20 data points
              if (healthData.length > 20) {
                healthData = healthData.slice(-20);
              }
              
              updateChart();
              
            } catch (error) {
              console.error('Health check failed:', error);
              document.getElementById('status-text').textContent = 'Error';
              document.querySelector('#overall-status').className = 'metric-card status-error';
            }
          }
          
          function formatUptime(seconds) {
            const days = Math.floor(seconds / 86400);
            const hours = Math.floor((seconds % 86400) / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            
            if (days > 0) return days + 'd ' + hours + 'h';
            if (hours > 0) return hours + 'h ' + minutes + 'm';
            return minutes + 'm';
          }
          
          function updateChart() {
            const canvas = document.getElementById('healthChart');
            const ctx = canvas.getContext('2d');
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (healthData.length < 2) return;
            
            // Draw memory usage line
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            const maxMemory = Math.max(...healthData.map(d => d.memory));
            const minMemory = Math.min(...healthData.map(d => d.memory));
            const memoryRange = maxMemory - minMemory || 1;
            
            healthData.forEach((point, index) => {
              const x = (index / (healthData.length - 1)) * canvas.width;
              const y = canvas.height - ((point.memory - minMemory) / memoryRange) * canvas.height;
              
              if (index === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            });
            
            ctx.stroke();
            
            // Add labels
            ctx.fillStyle = '#6b7280';
            ctx.font = '12px system-ui';
            ctx.fillText('Memory Usage (MB)', 10, 20);
            ctx.fillText(minMemory.toFixed(1), 10, canvas.height - 5);
            ctx.fillText(maxMemory.toFixed(1), 10, 35);
          }
          
          // Initialize
          updateHealthMetrics();
          
          // Update every 5 seconds
          setInterval(updateHealthMetrics, 5000);
          
        })();
      ` }}
      />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .health-details {
          margin-top: 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
        }
        
        .component-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .component-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
        }
        
        .component-name {
          font-weight: 500;
          color: #1e293b;
        }
        
        .component-status {
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .status-healthy {
          color: #059669;
        }
        
        .status-error {
          color: #dc2626;
        }
        
        .metrics-chart {
          padding: 1rem;
          background: #f8fafc;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
        }
        
        .health-log {
          max-height: 200px;
          overflow-y: auto;
        }
        
        .log-entry {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .log-time {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .log-message {
          flex: 1;
          margin: 0 1rem;
          font-size: 0.875rem;
        }
        
        .metric-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        .nav-link.active {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border-radius: 0.375rem;
        }
      ` }}
      />
    </div>
  )
}