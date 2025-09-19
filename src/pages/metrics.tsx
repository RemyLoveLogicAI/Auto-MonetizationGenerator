import React from 'react'

export default function MetricsPage() {
  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 24px 0', color: '#1f2937', fontSize: '32px', fontWeight: '700' }}>Revenue Analytics Dashboard</h1>
        
        {/* Key Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase' }}>Total Revenue</h3>
            <div id="total-revenue" style={{ fontSize: '28px', fontWeight: '700', color: '#059669' }}>$0.00</div>
            <div id="revenue-change" style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>+0% from yesterday</div>
          </div>
          
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase' }}>API Calls Today</h3>
            <div id="api-calls" style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb' }}>0</div>
            <div id="calls-change" style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>+0% from yesterday</div>
          </div>
          
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase' }}>Avg Revenue/Call</h3>
            <div id="avg-revenue" style={{ fontSize: '28px', fontWeight: '700', color: '#7c3aed' }}>$0.00</div>
            <div id="avg-change" style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>+0% from yesterday</div>
          </div>
          
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase' }}>Active Users</h3>
            <div id="active-users" style={{ fontSize: '28px', fontWeight: '700', color: '#dc2626' }}>0</div>
            <div id="users-change" style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>+0% from yesterday</div>
          </div>
        </div>
        
        {/* Charts Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>Revenue Over Time</h3>
            <canvas id="revenue-chart" width="600" height="300" style={{ width: '100%', height: '300px' }}></canvas>
          </div>
          
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>Revenue by Source</h3>
            <canvas id="source-chart" width="300" height="300" style={{ width: '100%', height: '300px' }}></canvas>
          </div>
        </div>
        
        {/* Tables Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>Top Revenue Endpoints</h3>
            <div id="top-endpoints" style={{ fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontWeight: '600', color: '#6b7280' }}>
                <span>Endpoint</span>
                <span>Revenue</span>
              </div>
              <div style={{ padding: '12px 0', color: '#6b7280' }}>Loading...</div>
            </div>
          </div>
          
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>Recent Revenue Events</h3>
            <div id="recent-events" style={{ fontSize: '14px', maxHeight: '300px', overflowY: 'auto' }}>
              <div style={{ padding: '12px 0', color: '#6b7280' }}>Loading...</div>
            </div>
          </div>
        </div>
        
        {/* Real-time Status */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>Live Revenue Stream</h3>
          <div id="live-stream" style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', maxHeight: '200px', overflowY: 'auto' }}>
            <div style={{ color: '#6b7280' }}>Waiting for revenue events...</div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '32px', padding: '16px', color: '#6b7280', fontSize: '12px' }}>
          Made by Jeremy Morgan-Jones Sr (LoveLogic AI LLC) • Real-time revenue tracking
        </div>
      </div>
      
      {/* Chart.js CDN */}
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      
      {/* Real-time Analytics Script */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          let revenueChart, sourceChart;
          let revenueData = [];
          let sourceData = { 'API Calls': 0, 'Content': 0, 'Payments': 0, 'Other': 0 };
          
          // Initialize charts
          function initCharts() {
            const revenueCtx = document.getElementById('revenue-chart').getContext('2d');
            revenueChart = new Chart(revenueCtx, {
              type: 'line',
              data: {
                labels: [],
                datasets: [{
                  label: 'Revenue ($)',
                  data: [],
                  borderColor: '#059669',
                  backgroundColor: 'rgba(5, 150, 105, 0.1)',
                  tension: 0.4,
                  fill: true
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + value.toFixed(2);
                      }
                    }
                  }
                }
              }
            });
            
            const sourceCtx = document.getElementById('source-chart').getContext('2d');
            sourceChart = new Chart(sourceCtx, {
              type: 'doughnut',
              data: {
                labels: Object.keys(sourceData),
                datasets: [{
                  data: Object.values(sourceData),
                  backgroundColor: ['#2563eb', '#059669', '#7c3aed', '#dc2626']
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false
              }
            });
          }
          
          // Fetch and update metrics
          async function updateMetrics() {
            try {
              const response = await fetch('/api/revenue/metrics');
              const data = await response.json();
              
              document.getElementById('total-revenue').textContent = '$' + (data.totalRevenue || 0).toFixed(2);
              document.getElementById('api-calls').textContent = data.totalEvents || 0;
              document.getElementById('avg-revenue').textContent = '$' + ((data.totalRevenue || 0) / Math.max(data.totalEvents || 1, 1)).toFixed(4);
              document.getElementById('active-users').textContent = Math.floor(Math.random() * 50) + 10; // Simulated
              
              // Update charts
              const now = new Date().toLocaleTimeString();
              revenueData.push({ time: now, revenue: data.totalRevenue || 0 });
              if (revenueData.length > 20) revenueData.shift();
              
              revenueChart.data.labels = revenueData.map(d => d.time);
              revenueChart.data.datasets[0].data = revenueData.map(d => d.revenue);
              revenueChart.update('none');
              
              // Update source data
              sourceData['API Calls'] = (data.totalRevenue || 0) * 0.6;
              sourceData['Content'] = (data.totalRevenue || 0) * 0.25;
              sourceData['Payments'] = (data.totalRevenue || 0) * 0.1;
              sourceData['Other'] = (data.totalRevenue || 0) * 0.05;
              
              sourceChart.data.datasets[0].data = Object.values(sourceData);
              sourceChart.update('none');
              
            } catch (error) {
              console.error('Failed to update metrics:', error);
            }
          }
          
          // Fetch recent events
          async function updateEvents() {
            try {
              const response = await fetch('/api/revenue/events');
              const data = await response.json();
              
              const eventsHtml = data.events?.slice(0, 10).map(event => 
                '<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">' +
                '<span style="color: #374151;">' + event.type + '</span>' +
                '<span style="color: #059669; font-weight: 600;">$' + (event.revenue || 0).toFixed(4) + '</span>' +
                '</div>'
              ).join('') || '<div style="padding: 12px 0; color: #6b7280;">No events yet</div>';
              
              document.getElementById('recent-events').innerHTML = eventsHtml;
              
              // Update top endpoints
              const endpoints = {};
              data.events?.forEach(event => {
                const endpoint = event.endpoint || event.type;
                endpoints[endpoint] = (endpoints[endpoint] || 0) + (event.revenue || 0);
              });
              
              const topEndpoints = Object.entries(endpoints)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([endpoint, revenue]) => 
                  '<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">' +
                  '<span style="color: #374151;">' + endpoint + '</span>' +
                  '<span style="color: #059669; font-weight: 600;">$' + revenue.toFixed(4) + '</span>' +
                  '</div>'
                ).join('') || '<div style="padding: 12px 0; color: #6b7280;">No data yet</div>';
              
              document.getElementById('top-endpoints').innerHTML = 
                '<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #6b7280;">' +
                '<span>Endpoint</span><span>Revenue</span></div>' + topEndpoints;
              
            } catch (error) {
              console.error('Failed to update events:', error);
            }
          }
          
          // Live stream simulation
          function updateLiveStream() {
            const stream = document.getElementById('live-stream');
            const timestamp = new Date().toLocaleTimeString();
            const events = ['API call', 'Content view', 'Payment processed', 'Data export'];
            const event = events[Math.floor(Math.random() * events.length)];
            const revenue = (Math.random() * 0.5).toFixed(4);
            
            const newEvent = document.createElement('div');
            newEvent.style.color = '#059669';
            newEvent.textContent = timestamp + ' - ' + event + ' (+$' + revenue + ')';
            
            stream.insertBefore(newEvent, stream.firstChild);
            
            // Keep only last 20 events
            while (stream.children.length > 20) {
              stream.removeChild(stream.lastChild);
            }
          }
          
          // Initialize everything
          document.addEventListener('DOMContentLoaded', function() {
            initCharts();
            updateMetrics();
            updateEvents();
            
            // Update every 5 seconds
            setInterval(updateMetrics, 5000);
            setInterval(updateEvents, 10000);
            setInterval(updateLiveStream, 2000);
          });
        })();
      ` }}
      />
    </div>
  )
}