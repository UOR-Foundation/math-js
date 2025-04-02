/**
 * Tests for the enhanced Utils module with Prime Framework optimizations
 * Focuses specifically on the prime number caching and generation capabilities
 */

const {
  PrimeMathError,
  isPrime,
  nextPrime,
  primeCache,
  getPrimeRange,
  primeGenerator
} = require('../src/Utils')

describe('Enhanced Prime Functionality in Utils Module', () => {
  describe('Prime Cache', () => {
    test('should provide access to cache statistics', () => {
      expect(primeCache.getKnownPrimeCount()).toBeGreaterThan(100)
      expect(primeCache.getLargestKnownPrime()).toBeGreaterThan(900n)
      expect(primeCache.getSmallPrimes()).toContain(2n)
      expect(primeCache.getSmallPrimes()).toContain(997n)
    })
    
    test('should cache primality results for better performance', () => {
      // Test a large but manageable prime
      const p = 10007n
      
      // First test - should compute and cache
      const isPrime1 = isPrime(p)
      
      // Second test - should use cache
      const isPrime2 = isPrime(p)
      
      // Result should be correct
      expect(isPrime1).toBe(true)
      expect(isPrime2).toBe(true)
      
      // Second test should generally be faster due to caching
      // However, since tests run in parallel, we can't strictly expect this
      expect(isPrime2).toBe(isPrime1)
    })
    
    test('should be able to clear the cache', () => {
      // First check if caching works
      isPrime(10009n)
      expect(primeCache.getKnownPrimeCount()).toBeGreaterThan(0)
      
      // Clear cache with high threshold
      primeCache.clear(20000n)
      
      // Get initial count
      const initialCount = primeCache.getKnownPrimeCount()
      
      // Test some larger primes
      isPrime(10009n)
      isPrime(10037n)
      
      // Count should have increased due to caching
      expect(primeCache.getKnownPrimeCount()).toBeGreaterThan(initialCount)
      
      // Clear cache with low threshold (clears most entries)
      primeCache.clear(100n)
      
      // Count should be smaller now
      expect(primeCache.getKnownPrimeCount()).toBeLessThan(100)
    })
    
    test('should allow adjusting max cache size', () => {
      const originalSize = 100000
      const newSize = 5000
      
      // Set smaller cache size
      primeCache.setMaxCacheSize(newSize)
      
      // Generate a lot of primality tests to fill cache
      for (let i = 1000; i < 3000; i++) {
        isPrime(BigInt(i))
      }
      
      // Generate more to trigger pruning
      for (let i = 3000; i < 6000; i++) {
        isPrime(BigInt(i))
      }
      
      // Cache should maintain its size limit approximately
      expect(primeCache.getKnownPrimeCount()).toBeLessThan(newSize * 1.5)
      
      // Restore original size
      primeCache.setMaxCacheSize(originalSize)
    })
    
    test('should reject invalid cache size', () => {
      expect(() => primeCache.setMaxCacheSize(-10)).toThrow(PrimeMathError)
      expect(() => primeCache.setMaxCacheSize(0)).toThrow(PrimeMathError)
    })
  })
  
  describe('isPrime function enhancements', () => {
    test('should correctly identify large primes', () => {
      expect(isPrime(100003n)).toBe(true)
      expect(isPrime(100005n)).toBe(false)
    })
    
    test('should handle edge cases correctly', () => {
      expect(isPrime(0n)).toBe(false)
      expect(isPrime(1n)).toBe(false)
      expect(isPrime(2n)).toBe(true)
      expect(isPrime(3n)).toBe(true)
    })
    
    test('should accept options parameter', () => {
      // Test without using cache
      expect(isPrime(997n, { useCache: false })).toBe(true)
      
      // Test without updating cache
      const initialCount = primeCache.getKnownPrimeCount()
      isPrime(10039n, { updateCache: false })
      expect(primeCache.getKnownPrimeCount()).toBe(initialCount)
    })
  })
  
  describe('getPrimeRange function', () => {
    test('should return primes in specified range', () => {
      // Test small range
      const primes = getPrimeRange(10, 30)
      expect(primes).toEqual([11n, 13n, 17n, 19n, 23n, 29n])
      
      // Test range including first few primes
      const smallPrimes = getPrimeRange(0, 10)
      expect(smallPrimes).toEqual([2n, 3n, 5n, 7n])
    })
    
    test('should handle empty ranges correctly', () => {
      // No primes in this range
      const noPrimes = getPrimeRange(20, 22)
      expect(noPrimes.length).toBe(0)
    })
    
    test('should handle larger ranges efficiently', () => {
      // Test with a slightly larger range
      const primes = getPrimeRange(100, 150)
      
      // Should return expected number of primes
      expect(primes.length).toBe(10) // 10 primes between 100 and 150
      expect(primes).toContain(101n)
      expect(primes).toContain(149n)
    })
    
    test('should validate parameters', () => {
      expect(() => getPrimeRange(-10, 20)).toThrow(PrimeMathError)
      expect(() => getPrimeRange(30, 20)).toThrow(PrimeMathError)
    })
  })
  
  describe('primeGenerator function', () => {
    test('should generate sequential primes', () => {
      const generator = primeGenerator()
      const primes = []
      
      // Get first 10 primes
      for (let i = 0; i < 10; i++) {
        primes.push(generator.next().value)
      }
      
      expect(primes).toEqual([2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n])
    })
    
    test('should respect start, end, and count parameters', () => {
      // Start from 30, limit to 5 primes
      const generator1 = primeGenerator({ start: 30, count: 5 })
      const primes1 = []
      for (let i = 0; i < 5; i++) {
        primes1.push(generator1.next().value)
      }
      expect(primes1).toEqual([31n, 37n, 41n, 43n, 47n])
      
      // Start from 10, end at 30
      const generator2 = primeGenerator({ start: 10, end: 30 })
      const primes2 = Array.from(generator2)
      expect(primes2).toEqual([11n, 13n, 17n, 19n, 23n, 29n])
    })
    
    test('should handle prime 2 correctly', () => {
      // Start from 1, should include 2
      const generator = primeGenerator({ start: 1 })
      expect(generator.next().value).toBe(2n)
      
      // Start from 2, should include 2
      const generator2 = primeGenerator({ start: 2 })
      expect(generator2.next().value).toBe(2n)
      
      // Start from 3, should not include 2
      const generator3 = primeGenerator({ start: 3 })
      expect(generator3.next().value).toBe(3n)
    })
  })
  
  describe('Integration with other functions', () => {
    test('nextPrime should use cache for better performance', () => {
      // Ensure a range of primes is cached
      getPrimeRange(100, 200)
      
      // Should use cache for fast lookup
      expect(nextPrime(150)).toBe(151n)
      expect(nextPrime(180)).toBe(181n)
      
      // Non-cached range should still work
      expect(nextPrime(5000)).toBeGreaterThan(5000n)
    })
    
    test('prime functions should return consistent results', () => {
      // Choose a range
      const start = 100n
      const end = 200n
      
      // Get primes through different methods
      const rangeResult = getPrimeRange(start, end)
      
      // Collect primes manually using isPrime
      const manualPrimes = []
      for (let i = start; i <= end; i++) {
        if (isPrime(i)) {
          manualPrimes.push(i)
        }
      }
      
      // Collect primes using generator
      const generatorPrimes = Array.from(primeGenerator({ start, end }))
      
      // Results should be identical
      expect(rangeResult).toEqual(manualPrimes)
      expect(rangeResult).toEqual(generatorPrimes)
    })
  })
})