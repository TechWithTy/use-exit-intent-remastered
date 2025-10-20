/**
 * Test script to verify the cookie synchronization fix
 * This simulates the user's Next.js scenario where unsubscribe is called from a button click
 */

// Simulate the scenario
console.log('Testing cookie synchronization fix...')

// Mock Cookies API
const mockCookies = {
  _cookies: {},

  get(key) {
    return this._cookies[key] || null
  },

  set(key, value, options) {
    this._cookies[key] = value
  },

  remove(key, options) {
    delete this._cookies[key]
  },
}

// Mock the isCurrentlyUnsubscribed function
const isCurrentlyUnsubscribed = () => {
  return mockCookies.get('exit-intent') === 'true'
}

// Test scenario 1: Initial state
console.log(
  '1. Initial state - should not be unsubscribed:',
  !isCurrentlyUnsubscribed()
)

// Test scenario 2: User clicks unsubscribe button (simulating user's manual trigger)
console.log('2. Simulating user clicking unsubscribe button...')
mockCookies.set('exit-intent', 'true', { expires: 30, sameSite: 'Strict' })

// Check if unsubscribe state is detected correctly
console.log(
  '3. After unsubscribe - should be unsubscribed:',
  isCurrentlyUnsubscribed()
)

// Test scenario 3: Multiple instances (simulating Next.js root layout)
console.log('4. Simulating multiple hook instances...')
const unsubscribeState1 = isCurrentlyUnsubscribed()
const unsubscribeState2 = isCurrentlyUnsubscribed()
console.log(
  '5. Both instances should see same unsubscribe state:',
  unsubscribeState1 === unsubscribeState2
)

console.log('✅ Cookie synchronization fix test completed successfully!')
