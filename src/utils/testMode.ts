/**
 * Test/Demo Mode Utility
 * Allows testing the full order flow without triggering real payments, emails, or deliveries
 */

export const isTestMode = (): boolean => {
  // Check environment variable
  const testMode = process.env.TEST_MODE === 'true' || process.env.DEMO_MODE === 'true';
  
  // Also check NODE_ENV for development
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Allow test mode to be explicitly enabled, or default to test mode in development
  // In production, require explicit TEST_MODE=true
  if (process.env.NODE_ENV === 'production') {
    return testMode;
  }
  
  // In development, default to test mode unless explicitly disabled
  return testMode !== false;
};

export const getTestModeMessage = (): string => {
  return isTestMode() ? '🧪 TEST MODE: ' : '';
};

/**
 * Mock Stripe Payment Intent for test mode
 */
export const createMockPaymentIntent = (amount: number) => {
  return {
    id: `pi_test_${Date.now()}`,
    client_secret: `pi_test_${Date.now()}_secret_mock`,
    status: 'succeeded',
    amount: Math.round(amount * 100),
    currency: 'usd',
    metadata: {
      test_mode: 'true',
      note: 'Mock payment intent created in test mode'
    }
  };
};

/**
 * Mock Uber Delivery for test mode
 */
export const createMockDelivery = (orderId: string) => {
  return {
    success: true,
    deliveryId: `uber_test_${orderId}_${Date.now()}`,
    trackingUrl: `https://courier.uber.com/track/uber_test_${orderId}_${Date.now()}`,
    status: 'requested',
    etaMinutes: 18,
    message: '🧪 TEST MODE: Mock delivery created (no real courier requested)',
    isMock: true,
    testMode: true
  };
};

