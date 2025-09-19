import { html } from 'hono/html'
import { Context } from 'hono'

export const CheckoutPage = (c: Context) => {
  const sessionId = c.req.query('session') || ''
  
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
            <li><a href="/admin" className="nav-link">Admin</a></li>
          </ul>
        </div>
      </nav>
      
      <main className="main-content">
        <div className="container">
          <section className="section">
            <div className="section-header animate-fade-in-up">
              <h1 className="section-title">Secure Checkout</h1>
              <p className="section-subtitle">
                Complete your purchase securely with our payment processing system.
              </p>
            </div>
            
            <div className="checkout-container animate-slide-in-right">
              <div className="checkout-form-container">
                <div className="card">
                  <div id="checkout-details">
                    <div className="checkout-loading">Loading checkout details...</div>
                  </div>
                  
                  <div id="payment-form" style={{ display: 'none' }}>
                    <h3>Payment Information</h3>
                    
                    <div className="form-group">
                      <label>Card Number</label>
                      <input type="text" id="card-number" className="form-control" placeholder="4242 4242 4242 4242" />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiration Date</label>
                        <input type="text" id="card-expiry" className="form-control" placeholder="MM/YY" />
                      </div>
                      
                      <div className="form-group">
                        <label>CVC</label>
                        <input type="text" id="card-cvc" className="form-control" placeholder="123" />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Name on Card</label>
                      <input type="text" id="card-name" className="form-control" placeholder="John Doe" />
                    </div>
                    
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" id="email" className="form-control" placeholder="your@email.com" />
                    </div>
                    
                    <div className="payment-actions">
                      <button id="submit-payment" className="btn btn-primary">Complete Payment</button>
                      <button id="cancel-payment" className="btn btn-secondary">Cancel</button>
                    </div>
                  </div>
                  
                  <div id="payment-success" style={{ display: 'none' }}>
                    <div className="success-message">
                      <div className="success-icon">✓</div>
                      <h3>Payment Successful!</h3>
                      <p>Your transaction has been completed successfully.</p>
                      <div className="transaction-details" id="transaction-details"></div>
                      <div className="payment-actions">
                        <a href="/" className="btn btn-primary">Return to Home</a>
                      </div>
                    </div>
                  </div>
                  
                  <div id="payment-error" style={{ display: 'none' }}>
                    <div className="error-message">
                      <div className="error-icon">✗</div>
                      <h3>Payment Failed</h3>
                      <p id="error-details">There was an error processing your payment.</p>
                      <div className="payment-actions">
                        <button id="retry-payment" className="btn btn-primary">Try Again</button>
                        <a href="/" className="btn btn-secondary">Cancel</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-summary-container">
                <div className="card">
                  <h3>Order Summary</h3>
                  <div id="order-details">
                    <div className="order-loading">Loading order details...</div>
                  </div>
                  
                  <div className="secure-payment-info">
                    <div className="secure-icon">🔒</div>
                    <div className="secure-text">
                      <h4>Secure Payment</h4>
                      <p>Your payment information is encrypted and secure.</p>
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
          const sessionId = '${sessionId}';
          let productDetails = null;
          
          document.addEventListener('DOMContentLoaded', function() {
            if (!sessionId) {
              showError('Invalid checkout session');
              return;
            }
            
            loadCheckoutSession();
            
            // Event listeners
            document.getElementById('submit-payment').addEventListener('click', processPayment);
            document.getElementById('cancel-payment').addEventListener('click', function() {
              window.location.href = '/';
            });
            document.getElementById('retry-payment').addEventListener('click', function() {
              hideAllSections();
              document.getElementById('payment-form').style.display = 'block';
            });
          });
          
          async function loadCheckoutSession() {
            try {
              // In a real implementation, this would validate the session with the server
              // For demo purposes, we'll simulate fetching session details
              const response = await fetch('/api/payment/products');
              const data = await response.json();
              
              if (!data.success || !data.products || data.products.length === 0) {
                showError('Could not load product details');
                return;
              }
              
              // For demo, just use the first product
              productDetails = data.products[0];
              
              // Update checkout details
              document.getElementById('checkout-details').innerHTML = `
                <h3>Complete Your Purchase</h3>
                <p>You're purchasing:</p>
                <div class="product-details">
                  <h4>${productDetails.name}</h4>
                  <p class="product-description">${productDetails.type === 'subscription' ? 'Monthly subscription' : 'One-time purchase'}</p>
                </div>
              `;
              
              // Update order summary
              document.getElementById('order-details').innerHTML = `
                <div class="order-item">
                  <div class="order-item-details">
                    <span class="order-item-name">${productDetails.name}</span>
                    <span class="order-item-price">$${productDetails.price.toFixed(2)}</span>
                  </div>
                </div>
                <div class="order-total">
                  <span class="order-total-label">Total</span>
                  <span class="order-total-price">$${productDetails.price.toFixed(2)}</span>
                </div>
              `;
              
              // Show payment form
              hideAllSections();
              document.getElementById('payment-form').style.display = 'block';
              
            } catch (error) {
              console.error('Error loading checkout session:', error);
              showError('Failed to load checkout details');
            }
          }
          
          async function processPayment() {
            try {
              // Validate form
              const cardNumber = document.getElementById('card-number').value;
              const cardExpiry = document.getElementById('card-expiry').value;
              const cardCvc = document.getElementById('card-cvc').value;
              const cardName = document.getElementById('card-name').value;
              const email = document.getElementById('email').value;
              
              if (!cardNumber || !cardExpiry || !cardCvc || !cardName || !email) {
                showError('Please fill in all payment details');
                return;
              }
              
              // Simple validation
              if (cardNumber.replace(/\s/g, '').length !== 16) {
                showError('Invalid card number');
                return;
              }
              
              // In a real implementation, this would tokenize the card and send to the server
              // For demo purposes, we'll simulate a payment process
              const paymentMethod = {
                type: 'card',
                card: {
                  last4: cardNumber.slice(-4)
                },
                billing_details: {
                  name: cardName,
                  email: email
                }
              };
              
              // Process payment with the server
              const response = await fetch('/api/payment/process', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  productId: productDetails.id,
                  paymentMethod: paymentMethod
                })
              });
              
              const data = await response.json();
              
              if (data.success) {
                // Show success message
                document.getElementById('transaction-details').innerHTML = `
                  <div class="transaction-info">
                    <p><strong>Transaction ID:</strong> ${data.transaction.id}</p>
                    <p><strong>Amount:</strong> $${data.transaction.amount.toFixed(2)}</p>
                    <p><strong>Date:</strong> ${new Date(data.transaction.timestamp).toLocaleString()}</p>
                  </div>
                `;
                
                hideAllSections();
                document.getElementById('payment-success').style.display = 'block';
              } else {
                showError(data.message || 'Payment processing failed');
              }
              
            } catch (error) {
              console.error('Error processing payment:', error);
              showError('Failed to process payment');
            }
          }
          
          function showError(message) {
            document.getElementById('error-details').textContent = message;
            hideAllSections();
            document.getElementById('payment-error').style.display = 'block';
          }
          
          function hideAllSections() {
            document.getElementById('payment-form').style.display = 'none';
            document.getElementById('payment-success').style.display = 'none';
            document.getElementById('payment-error').style.display = 'none';
          }
        })();
      ` }}
    </div>
  )
}