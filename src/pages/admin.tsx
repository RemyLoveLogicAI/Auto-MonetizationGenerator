import { html } from 'hono/html'
import { Context } from 'hono'

export const AdminPage = (c: Context) => {
  return c.render(
    <div className="page-wrapper">
      <nav className="nav-header">
        <div className="nav-container">
          <div className="nav-brand">
            <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Auto-MonetizationGenerator</a>
          </div>
          <ul className="nav-links">
            <li><a href="/health" className="nav-link">Health</a></li>
            <li><a href="/metrics" className="nav-link">Metrics</a></li>
            <li><a href="/dashboards" className="nav-link">Dashboards</a></li>
            <li><a href="/admin" className="nav-link active">Admin</a></li>
          </ul>
        </div>
      </nav>
      
      <main className="main-content">
        <div className="container">
          <section className="section">
            <div className="section-header animate-fade-in-up">
              <h1 className="section-title">Admin Dashboard</h1>
              <p className="section-subtitle">
                Comprehensive administration panel with payment integration, content management, and revenue controls.
              </p>
            </div>
            
            <div className="admin-tabs animate-slide-in-right">
              <div className="tab-header">
                <button className="tab-button active" data-tab="payment">Payment Integration</button>
                <button className="tab-button" data-tab="content">Content Ingestion</button>
                <button className="tab-button" data-tab="revenue">Revenue Management</button>
                <button className="tab-button" data-tab="analytics">Analytics</button>
              </div>
              
              <div className="tab-content">
                {/* Payment Integration Tab */}
                <div className="tab-pane active" id="payment-tab">
                  <div className="card">
                    <h3>Payment Gateway Configuration</h3>
                    <div className="payment-gateway-config">
                      <div className="form-group">
                        <label>Payment Provider</label>
                        <select id="payment-provider" className="form-control">
                          <option value="stripe">Stripe</option>
                          <option value="paypal">PayPal</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>API Key</label>
                        <input type="password" id="api-key" className="form-control" placeholder="sk_live_..." />
                      </div>
                      
                      <div className="form-group">
                        <label>Webhook Secret</label>
                        <input type="password" id="webhook-secret" className="form-control" placeholder="whsec_..." />
                      </div>
                      
                      <div className="form-actions">
                        <button id="save-payment-config" className="btn btn-primary">Save Configuration</button>
                        <button id="test-payment-config" className="btn btn-secondary">Test Connection</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card">
                    <h3>Monetization Products</h3>
                    <div className="products-list" id="products-list">
                      <div className="product-item">
                        <div className="product-info">
                          <span className="product-name">API Access - Basic</span>
                          <span className="product-price">$29.99/month</span>
                        </div>
                        <div className="product-actions">
                          <button className="btn btn-sm btn-edit">Edit</button>
                          <button className="btn btn-sm btn-delete">Delete</button>
                        </div>
                      </div>
                      
                      <div className="product-item">
                        <div className="product-info">
                          <span className="product-name">Content Delivery - Premium</span>
                          <span className="product-price">$49.99/month</span>
                        </div>
                        <div className="product-actions">
                          <button className="btn btn-sm btn-edit">Edit</button>
                          <button className="btn btn-sm btn-delete">Delete</button>
                        </div>
                      </div>
                      
                      <div className="product-item">
                        <div className="product-info">
                          <span className="product-name">Pay-per-use API</span>
                          <span className="product-price">$0.001/call</span>
                        </div>
                        <div className="product-actions">
                          <button className="btn btn-sm btn-edit">Edit</button>
                          <button className="btn btn-sm btn-delete">Delete</button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button id="add-product" className="btn btn-primary">Add New Product</button>
                    </div>
                  </div>
                </div>
                
                {/* Content Ingestion Tab */}
                <div className="tab-pane" id="content-tab">
                  <div className="card">
                    <h3>R2 Content Ingestion</h3>
                    <div className="ingestion-form">
                      <div className="form-group">
                        <label>External URL</label>
                        <input type="text" id="url" className="form-control" placeholder="https://..." />
                      </div>
                      
                      <div className="form-group">
                        <label>Storage Key (optional)</label>
                        <input type="text" id="key" className="form-control" placeholder="optional-key.ext" />
                      </div>
                      
                      <div className="form-actions">
                        <button id="ingest-content" className="btn btn-primary">Ingest Content</button>
                      </div>
                    </div>
                    
                    <div className="response-output">
                      <h4>Response</h4>
                      <pre id="ingest-output" className="output-pre"></pre>
                    </div>
                  </div>
                  
                  <div className="card">
                    <h3>Stored Content</h3>
                    <div className="content-list" id="content-list">
                      <div className="content-item">
                        <span className="content-name">image-1.jpg</span>
                        <div className="content-actions">
                          <button className="btn btn-sm btn-view">View</button>
                          <button className="btn btn-sm btn-delete">Delete</button>
                        </div>
                      </div>
                      
                      <div className="content-item">
                        <span className="content-name">document.pdf</span>
                        <div className="content-actions">
                          <button className="btn btn-sm btn-view">View</button>
                          <button className="btn btn-sm btn-delete">Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Revenue Management Tab */}
                <div className="tab-pane" id="revenue-tab">
                  <div className="card">
                    <h3>Revenue Controls</h3>
                    <div className="revenue-controls">
                      <div className="control-group">
                        <button id="reset-revenue" className="btn btn-danger">Reset Revenue Data</button>
                        <button id="export-revenue" className="btn btn-secondary">Export Revenue Data</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card">
                    <h3>Payment Transactions</h3>
                    <div className="transactions-list" id="transactions-list">
                      <div className="transaction-header">
                        <span className="transaction-id">Transaction ID</span>
                        <span className="transaction-date">Date</span>
                        <span className="transaction-amount">Amount</span>
                        <span className="transaction-status">Status</span>
                      </div>
                      
                      <div className="transaction-item">
                        <span className="transaction-id">txn_1NjE2CKF6tPj10</span>
                        <span className="transaction-date">2023-10-15</span>
                        <span className="transaction-amount">$29.99</span>
                        <span className="transaction-status status-success">Completed</span>
                      </div>
                      
                      <div className="transaction-item">
                        <span className="transaction-id">txn_1NjD8BKF6tPj09</span>
                        <span className="transaction-date">2023-10-14</span>
                        <span className="transaction-amount">$49.99</span>
                        <span className="transaction-status status-success">Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Analytics Tab */}
                <div className="tab-pane" id="analytics-tab">
                  <div className="card">
                    <h3>Revenue Analytics</h3>
                    <div className="analytics-chart">
                      <canvas id="revenueChart" width="400" height="200"></canvas>
                    </div>
                  </div>
                  
                  <div className="card">
                    <h3>Usage Analytics</h3>
                    <div className="analytics-chart">
                      <canvas id="usageChart" width="400" height="200"></canvas>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          // Tab switching functionality
          document.addEventListener('DOMContentLoaded', function() {
            const tabButtons = document.querySelectorAll('.tab-button');
            const tabPanes = document.querySelectorAll('.tab-pane');
            
            tabButtons.forEach(button => {
              button.addEventListener('click', function() {
                // Remove active class from all buttons and panes
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Show corresponding tab pane
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId + '-tab').classList.add('active');
              });
            });
            
            // Content ingestion functionality
            const ingestButton = document.getElementById('ingest-content');
            if (ingestButton) {
              ingestButton.addEventListener('click', function() {
                const url = document.getElementById('url').value;
                const key = document.getElementById('key').value;
                const output = document.getElementById('ingest-output');
                
                output.textContent = 'Ingesting ' + url + ' ...';
                
                fetch('/api/ingestR2', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url: url, key: key || undefined })
                })
                .then(response => response.json())
                .then(data => {
                  output.textContent = JSON.stringify(data, null, 2);
                })
                .catch(error => {
                  output.textContent = 'Error: ' + error.message;
                });
              });
            }
            
            // Payment configuration
            const savePaymentConfig = document.getElementById('save-payment-config');
            if (savePaymentConfig) {
              savePaymentConfig.addEventListener('click', function() {
                const provider = document.getElementById('payment-provider').value;
                const apiKey = document.getElementById('api-key').value;
                const webhookSecret = document.getElementById('webhook-secret').value;
                
                if (!apiKey) {
                  alert('API Key is required');
                  return;
                }
                
                fetch('/api/payment/config', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    provider: provider,
                    apiKey: apiKey,
                    webhookSecret: webhookSecret
                  })
                })
                .then(response => response.json())
                .then(data => {
                  alert('Payment configuration saved successfully!');
                })
                .catch(error => {
                  alert('Error saving payment configuration: ' + error.message);
                });
              });
            }
            
            // Test payment connection
            const testPaymentConfig = document.getElementById('test-payment-config');
            if (testPaymentConfig) {
              testPaymentConfig.addEventListener('click', function() {
                const provider = document.getElementById('payment-provider').value;
                const apiKey = document.getElementById('api-key').value;
                
                if (!apiKey) {
                  alert('API Key is required');
                  return;
                }
                
                fetch('/api/payment/test', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    provider: provider,
                    apiKey: apiKey
                  })
                })
                .then(response => response.json())
                .then(data => {
                  if (data.success) {
                    alert('Connection successful! Payment gateway is properly configured.');
                  } else {
                    alert('Connection failed: ' + data.message);
                  }
                })
                .catch(error => {
                  alert('Error testing connection: ' + error.message);
                });
              });
            }
            
            // Reset revenue data
            const resetRevenueButton = document.getElementById('reset-revenue');
            if (resetRevenueButton) {
              resetRevenueButton.addEventListener('click', function() {
                if (confirm('Are you sure you want to reset all revenue data? This action cannot be undone.')) {
                  fetch('/api/revenue/reset', {
                    method: 'POST'
                  })
                  .then(response => response.json())
                  .then(data => {
                    alert('Revenue data has been reset successfully!');
                  })
                  .catch(error => {
                    alert('Error resetting revenue data: ' + error.message);
                  });
                }
              });
            }
            
            // Add new product
            const addProductButton = document.getElementById('add-product');
            if (addProductButton) {
              addProductButton.addEventListener('click', function() {
                const productName = prompt('Enter product name:');
                if (!productName) return;
                
                const productPrice = prompt('Enter product price:');
                if (!productPrice) return;
                
                fetch('/api/payment/products', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: productName,
                    price: productPrice
                  })
                })
                .then(response => response.json())
                .then(data => {
                  alert('Product added successfully!');
                  // Refresh product list
                  // This would typically reload the products from the server
                  const productsList = document.getElementById('products-list');
                  const newProduct = document.createElement('div');
                  newProduct.className = 'product-item';
                  newProduct.innerHTML = `
                    <div class="product-info">
                      <span class="product-name">${productName}</span>
                      <span class="product-price">${productPrice}</span>
                    </div>
                    <div class="product-actions">
                      <button class="btn btn-sm btn-edit">Edit</button>
                      <button class="btn btn-sm btn-delete">Delete</button>
                    </div>
                  `;
                  productsList.appendChild(newProduct);
                })
                .catch(error => {
                  alert('Error adding product: ' + error.message);
                });
              });
            }
            
            // Initialize charts
            initCharts();
          });
          
          function initCharts() {
            // Check if Chart.js is loaded
            if (typeof Chart === 'undefined') {
              // Load Chart.js dynamically
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
              script.onload = createCharts;
              document.head.appendChild(script);
            } else {
              createCharts();
            }
          }
          
          function createCharts() {
            // Revenue Chart
            const revenueCtx = document.getElementById('revenueChart');
            if (revenueCtx) {
              new Chart(revenueCtx, {
                type: 'line',
                data: {
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                  datasets: [{
                    label: 'Monthly Revenue',
                    data: [1250, 1730, 2463, 3200, 4180, 5100],
                    borderColor: '#059669',
                    backgroundColor: 'rgba(5, 150, 105, 0.1)',
                    tension: 0.4,
                    fill: true
                  }]
                },
                options: {
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: false }
                  }
                }
              });
            }
            
            // Usage Chart
            const usageCtx = document.getElementById('usageChart');
            if (usageCtx) {
              new Chart(usageCtx, {
                type: 'bar',
                data: {
                  labels: ['API Calls', 'Content Views', 'Data Exports', 'Payments'],
                  datasets: [{
                    label: 'Usage Count',
                    data: [12500, 8300, 5200, 950],
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.7)',
                      'rgba(16, 185, 129, 0.7)',
                      'rgba(245, 158, 11, 0.7)',
                      'rgba(139, 92, 246, 0.7)'
                    ],
                    borderWidth: 0
                  }]
                },
                options: {
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: false }
                  }
                }
              });
            }
          }
        })();
      ` }}
    </div>
  )
}