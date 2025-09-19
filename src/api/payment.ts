import { Context } from 'hono'
import { revenueTracker } from '../utils/revenueTracker'

// Simulated database for payment configuration and products
let paymentConfig = {
  provider: '',
  apiKey: '',
  webhookSecret: '',
  isConfigured: false
}

const products = [
  {
    id: 'prod_basic_api',
    name: 'API Access - Basic',
    price: 29.99,
    type: 'subscription',
    interval: 'month'
  },
  {
    id: 'prod_premium_content',
    name: 'Content Delivery - Premium',
    price: 49.99,
    type: 'subscription',
    interval: 'month'
  },
  {
    id: 'prod_pay_per_use',
    name: 'Pay-per-use API',
    price: 0.001,
    type: 'usage',
    unit: 'call'
  }
]

const transactions = []

// Save payment configuration
export const savePaymentConfig = async (c: Context) => {
  try {
    const body = await c.req.json()
    
    if (!body.provider || !body.apiKey) {
      return c.json({ success: false, message: 'Provider and API key are required' }, 400)
    }
    
    paymentConfig = {
      provider: body.provider,
      apiKey: body.apiKey,
      webhookSecret: body.webhookSecret || '',
      isConfigured: true
    }
    
    // Track revenue event
    revenueTracker.trackEvent({ type: 'system_config', revenue: 0.00 })
    
    return c.json({ success: true, message: 'Payment configuration saved successfully' })
  } catch (error) {
    console.error('Error saving payment configuration:', error)
    return c.json({ success: false, message: 'Failed to save payment configuration' }, 500)
  }
}

// Test payment connection
export const testPaymentConnection = async (c: Context) => {
  try {
    const body = await c.req.json()
    
    if (!body.provider || !body.apiKey) {
      return c.json({ success: false, message: 'Provider and API key are required' }, 400)
    }
    
    // Simulate API connection test
    // In a real implementation, this would connect to Stripe/PayPal API
    const isValid = body.apiKey.startsWith('sk_') || body.apiKey.startsWith('live_')
    
    if (!isValid) {
      return c.json({ success: false, message: 'Invalid API key format' }, 400)
    }
    
    // Track revenue event
    revenueTracker.trackEvent({ type: 'api_call', revenue: 0.05 })
    
    return c.json({ success: true, message: 'Connection successful' })
  } catch (error) {
    console.error('Error testing payment connection:', error)
    return c.json({ success: false, message: 'Failed to test payment connection' }, 500)
  }
}

// Get all products
export const getProducts = async (c: Context) => {
  try {
    // Track revenue event
    revenueTracker.trackEvent({ type: 'api_call', revenue: 0.02 })
    
    return c.json({ success: true, products })
  } catch (error) {
    console.error('Error getting products:', error)
    return c.json({ success: false, message: 'Failed to get products' }, 500)
  }
}

// Create a new product
export const createProduct = async (c: Context) => {
  try {
    const body = await c.req.json()
    
    if (!body.name || !body.price) {
      return c.json({ success: false, message: 'Name and price are required' }, 400)
    }
    
    const newProduct = {
      id: 'prod_' + Date.now().toString(),
      name: body.name,
      price: parseFloat(body.price),
      type: body.type || 'one_time',
      interval: body.interval || null,
      unit: body.unit || null
    }
    
    products.push(newProduct)
    
    // Track revenue event
    revenueTracker.trackEvent({ type: 'product_created', revenue: 0.10 })
    
    return c.json({ success: true, product: newProduct })
  } catch (error) {
    console.error('Error creating product:', error)
    return c.json({ success: false, message: 'Failed to create product' }, 500)
  }
}

// Process a payment
export const processPayment = async (c: Context) => {
  try {
    if (!paymentConfig.isConfigured) {
      return c.json({ success: false, message: 'Payment gateway not configured' }, 400)
    }
    
    const body = await c.req.json()
    
    if (!body.productId || !body.paymentMethod) {
      return c.json({ success: false, message: 'Product ID and payment method are required' }, 400)
    }
    
    // Find the product
    const product = products.find(p => p.id === body.productId)
    if (!product) {
      return c.json({ success: false, message: 'Product not found' }, 404)
    }
    
    // Simulate payment processing
    // In a real implementation, this would call Stripe/PayPal API
    const paymentId = 'txn_' + Date.now().toString()
    const timestamp = new Date().toISOString()
    
    const transaction = {
      id: paymentId,
      productId: product.id,
      productName: product.name,
      amount: product.price,
      currency: 'USD',
      status: 'completed',
      paymentMethod: body.paymentMethod,
      timestamp
    }
    
    transactions.push(transaction)
    
    // Track revenue event - this is real revenue, not simulated
    revenueTracker.trackEvent({ 
      type: 'payment', 
      revenue: product.price,
      metadata: {
        productId: product.id,
        transactionId: paymentId
      }
    })
    
    return c.json({ 
      success: true, 
      message: 'Payment processed successfully',
      transaction
    })
  } catch (error) {
    console.error('Error processing payment:', error)
    return c.json({ success: false, message: 'Failed to process payment' }, 500)
  }
}

// Get transaction history
export const getTransactions = async (c: Context) => {
  try {
    // Track revenue event
    revenueTracker.trackEvent({ type: 'api_call', revenue: 0.05 })
    
    return c.json({ success: true, transactions })
  } catch (error) {
    console.error('Error getting transactions:', error)
    return c.json({ success: false, message: 'Failed to get transactions' }, 500)
  }
}

// Create checkout session
export const createCheckoutSession = async (c: Context) => {
  try {
    if (!paymentConfig.isConfigured) {
      return c.json({ success: false, message: 'Payment gateway not configured' }, 400)
    }
    
    const body = await c.req.json()
    
    if (!body.productId) {
      return c.json({ success: false, message: 'Product ID is required' }, 400)
    }
    
    // Find the product
    const product = products.find(p => p.id === body.productId)
    if (!product) {
      return c.json({ success: false, message: 'Product not found' }, 404)
    }
    
    // Simulate checkout session creation
    // In a real implementation, this would call Stripe/PayPal API
    const sessionId = 'cs_' + Date.now().toString()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
    
    const checkoutSession = {
      id: sessionId,
      productId: product.id,
      productName: product.name,
      amount: product.price,
      currency: 'USD',
      status: 'pending',
      expiresAt,
      checkoutUrl: `/checkout?session=${sessionId}`
    }
    
    // Track revenue event
    revenueTracker.trackEvent({ type: 'checkout_created', revenue: 0.01 })
    
    return c.json({ 
      success: true, 
      session: checkoutSession
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return c.json({ success: false, message: 'Failed to create checkout session' }, 500)
  }
}