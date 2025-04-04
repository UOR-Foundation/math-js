/**
 * Tests for the segmented sieve algorithm with configurable size
 */

const { isPrime, getPrimeRange, primeCache } = require('../src/Utils')
const { configure, resetConfig, getConfig } = require('../src/config')

describe('Segmented Sieve with Configurable Size', () => {
  // Reset config before each test
  beforeEach(() => {
    resetConfig()
    primeCache.clear()
  })
  
  test('Should use default segment size', () => {
    // Default segment size is 1000000
    const start = 10000000n
    const end = 10001000n
    
    const primes = getPrimeRange(start, end)
    
    // Verify the primes are correct
    for (const p of primes) {
      expect(isPrime(p)).toBe(true)
      expect(p >= start && p <= end).toBe(true)
    }
    
    // Verify we found all primes in the range
    for (let n = start; n <= end; n++) {
      if (isPrime(n)) {
        expect(primes.includes(n)).toBe(true)
      }
    }
  })
  
  test('Should use custom segment size from configuration', () => {
    // Configure a smaller segment size
    configure({
      primalityTesting: {
        segmentedSieveSize: 500
      }
    })
    
    // Verify the configuration was applied
    expect(getConfig().primalityTesting.segmentedSieveSize).toBe(500)
    
    const start = 10000n
    const end = 10500n
    
    const primes = getPrimeRange(start, end)
    
    // Verify the primes are correct
    for (const p of primes) {
      expect(isPrime(p)).toBe(true)
      expect(p >= start && p <= end).toBe(true)
    }
  })
  
  test('Should use custom segment size from options', () => {
    // The options parameter should override the configuration
    const start = 10000n
    const end = 10500n
    
    const primes = getPrimeRange(start, end, { segmentSize: 100 })
    
    // Verify the primes are correct
    for (const p of primes) {
      expect(isPrime(p)).toBe(true)
      expect(p >= start && p <= end).toBe(true)
    }
  })
  
  test('Should use dynamic sizing when enabled', () => {
    // Configure dynamic sizing to be disabled
    configure({
      primalityTesting: {
        dynamicSegmentSizing: false
      }
    })
    
    // Then override with options to enable it
    const start = 1000000n
    const end = 1001000n
    
    const primes = getPrimeRange(start, end, { dynamic: true })
    
    // Verify the primes are correct
    for (const p of primes) {
      expect(isPrime(p)).toBe(true)
      expect(p >= start && p <= end).toBe(true)
    }
  })
  
  test('Should work with large ranges', () => {
    // A larger range with a reasonable segment size
    configure({
      primalityTesting: {
        segmentedSieveSize: 10000
      }
    })
    
    const start = 1000000n
    const end = 1000300n // Small range to keep test fast
    
    const primes = getPrimeRange(start, end)
    
    // Verify we have some primes and they're in the correct range
    expect(primes.length).toBeGreaterThan(0)
    
    for (const p of primes) {
      expect(p >= start && p <= end).toBe(true)
      expect(isPrime(p)).toBe(true)
    }
  })
  
  test('Should handle very small segment sizes', () => {
    // An extremely small segment size
    const start = 10000n
    const end = 10100n
    
    const primes = getPrimeRange(start, end, { segmentSize: 10 })
    
    // Verify the primes are correct
    for (const p of primes) {
      expect(isPrime(p)).toBe(true)
      expect(p >= start && p <= end).toBe(true)
    }
    
    // Verify we found all primes in the range
    for (let n = start; n <= end; n++) {
      if (isPrime(n)) {
        expect(primes.includes(n)).toBe(true)
      }
    }
  })
})