/**
 * Tests for the enhanced Utils module with Prime Framework optimizations
 * Focuses specifically on the prime number caching and generation capabilities
 * and the Prime Framework algebraic structure implementation
 */

const {
  PrimeMathError,
  isPrime,
  nextPrime,
  primeCache,
  getPrimeRange,
  primeGenerator,
  getNthPrime,
  isMersennePrime,
  moebiusFunction,
  quadraticResidue
} = require('../src/Utils')

const PrimeMath = require('../src/PrimeMath')

describe('Enhanced Prime Functionality in Utils Module', () => {
  describe('Prime Cache', () => {
    test('should provide access to cache statistics', () => {
      expect(primeCache.getKnownPrimeCount()).toBeGreaterThan(100)
      expect(primeCache.getLargestKnownPrime()).toBeGreaterThan(900n)
      expect(primeCache.getSmallPrimes()).toContain(2n)
      expect(primeCache.getSmallPrimes()).toContain(997n)
    })
    
    test('should provide detailed cache statistics with getStats', () => {
      // Clear cache to a known state
      primeCache.clear(1000n)
      
      // Test some numbers to populate cache
      isPrime(1009n)
      isPrime(1010n)
      
      // Get statistics
      const stats = primeCache.getStats()
      
      // Verify stats structure
      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('maxSize')
      expect(stats).toHaveProperty('utilization')
      expect(stats).toHaveProperty('primes')
      expect(stats).toHaveProperty('composites')
      expect(stats).toHaveProperty('largestPrime')
      expect(stats).toHaveProperty('largestChecked')
      
      // Verify basic stats correctness
      expect(stats.size).toBeGreaterThan(0)
      expect(stats.maxSize).toBeGreaterThan(0)
      expect(stats.utilization).toBeGreaterThan(0)
      expect(stats.primes + stats.composites).toBe(stats.size)
      expect(stats.largestPrime).toBeGreaterThanOrEqual(1009n)
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
      const originalSize = primeCache.getMaxCacheSize()
      const newSize = 5000
      
      // Set smaller cache size
      primeCache.setMaxCacheSize(newSize)
      
      // Verify the size was set correctly
      expect(primeCache.getMaxCacheSize()).toBe(newSize)
      
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
    
    test('should support aggressive pruning option', () => {
      const smallSize = 200
      
      // Fill cache with many primes
      for (let i = 1000; i < 3000; i++) {
        isPrime(BigInt(i))
      }
      
      // Set a small cache size with aggressive pruning
      primeCache.setMaxCacheSize(smallSize, { aggressive: true })
      
      // Cache should be pruned immediately to approximately target size
      const count = primeCache.getKnownPrimeCount()
      expect(count).toBeLessThanOrEqual(smallSize * 1.1)
      
      // Restore default size
      primeCache.setMaxCacheSize(100000)
    })
    
    test('should reject invalid cache size parameters', () => {
      // Negative number
      expect(() => primeCache.setMaxCacheSize(-10)).toThrow(PrimeMathError)
      
      // Zero
      expect(() => primeCache.setMaxCacheSize(0)).toThrow(PrimeMathError)
      
      // Non-finite values
      expect(() => primeCache.setMaxCacheSize(Infinity)).toThrow(PrimeMathError)
      expect(() => primeCache.setMaxCacheSize(NaN)).toThrow(PrimeMathError)
      
      // Non-number values
      expect(() => primeCache.setMaxCacheSize('1000')).toThrow(PrimeMathError)
      expect(() => primeCache.setMaxCacheSize(null)).toThrow(PrimeMathError)
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
      expect(isPrime(997n, { useCache: false, updateCache: true })).toBe(true)
      
      // Test without updating cache
      const initialCount = primeCache.getKnownPrimeCount()
      isPrime(10039n, { useCache: true, updateCache: false })
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

describe('Prime Framework Utils Enhancements', () => {
  describe('getNthPrime', () => {
    test('should return correct small prime numbers', () => {
      expect(getNthPrime(1n)).toBe(2n)
      expect(getNthPrime(2n)).toBe(3n)
      expect(getNthPrime(3n)).toBe(5n)
      expect(getNthPrime(4n)).toBe(7n)
      expect(getNthPrime(5n)).toBe(11n)
      expect(getNthPrime(10n)).toBe(29n)
    })

    test('should throw error for non-positive indices', () => {
      expect(() => getNthPrime(0n)).toThrow()
      expect(() => getNthPrime(-1n)).toThrow()
    })
  })

  describe('isMersennePrime', () => {
    test('should identify Mersenne primes correctly', () => {
      // Known Mersenne primes: 2^p-1 where p in [2,3,5,7,13,17,19,31,...]
      expect(isMersennePrime(3n)).toBe(true)  // 2^2-1
      expect(isMersennePrime(7n)).toBe(true)  // 2^3-1
      expect(isMersennePrime(31n)).toBe(true) // 2^5-1
      expect(isMersennePrime(127n)).toBe(true) // 2^7-1
    })

    test('should reject non-Mersenne primes', () => {
      expect(isMersennePrime(2n)).toBe(false)  // prime but not Mersenne
      expect(isMersennePrime(11n)).toBe(false) // prime but not Mersenne
      expect(isMersennePrime(15n)).toBe(false) // not prime (3*5)
      expect(isMersennePrime(63n)).toBe(false) // 2^6-1, but 6 is not prime
    })
  })

  describe('moebiusFunction', () => {
    test('should return correct Möbius function values', () => {
      expect(moebiusFunction(1n)).toBe(1n)   // μ(1) = 1 by definition
      expect(moebiusFunction(2n)).toBe(-1n)  // prime, odd number of prime factors
      expect(moebiusFunction(3n)).toBe(-1n)  // prime, odd number of prime factors
      expect(moebiusFunction(4n)).toBe(0n)   // 2^2, has squared factor
      expect(moebiusFunction(6n)).toBe(1n)   // 2*3, even number of prime factors
      expect(moebiusFunction(10n)).toBe(1n)  // 2*5, even number of prime factors
      expect(moebiusFunction(15n)).toBe(1n)  // 3*5, even number of prime factors
      expect(moebiusFunction(30n)).toBe(-1n) // 2*3*5, odd number of prime factors
    })

    test('should throw error for non-positive inputs', () => {
      expect(() => moebiusFunction(0n)).toThrow()
      expect(() => moebiusFunction(-1n)).toThrow()
    })
  })

  describe('quadraticResidue', () => {
    test('should identify quadratic residues correctly', () => {
      // For p=7, the quadratic residues are 1,2,4 (1^2, 2^2, 4^2 mod 7)
      expect(quadraticResidue(1n, 7n)).toBe(true)
      expect(quadraticResidue(2n, 7n)).toBe(true)
      expect(quadraticResidue(4n, 7n)).toBe(true)
      
      // For p=11, the quadratic residues are 1,3,4,5,9 (1^2, 10^2, 2^2, 9^2, 3^2 mod 11)
      expect(quadraticResidue(1n, 11n)).toBe(true)
      expect(quadraticResidue(3n, 11n)).toBe(true)
      expect(quadraticResidue(4n, 11n)).toBe(true)
      expect(quadraticResidue(5n, 11n)).toBe(true)
      expect(quadraticResidue(9n, 11n)).toBe(true)
    })

    test('should identify quadratic non-residues correctly', () => {
      // For p=7, the non-residues are 3,5,6
      expect(quadraticResidue(3n, 7n)).toBe(false)
      expect(quadraticResidue(5n, 7n)).toBe(false)
      expect(quadraticResidue(6n, 7n)).toBe(false)
      
      // For p=11, the non-residues are 2,6,7,8,10
      expect(quadraticResidue(2n, 11n)).toBe(false)
      expect(quadraticResidue(6n, 11n)).toBe(false)
      expect(quadraticResidue(7n, 11n)).toBe(false)
      expect(quadraticResidue(8n, 11n)).toBe(false)
      expect(quadraticResidue(10n, 11n)).toBe(false)
    })

    test('should throw error for invalid inputs', () => {
      expect(() => quadraticResidue(1n, 0n)).toThrow()
      expect(() => quadraticResidue(1n, -7n)).toThrow()
      expect(() => quadraticResidue(1n, 4n)).toThrow() // 4 is not prime
    })
  })
})

describe('PrimeMath Prime Framework Enhancements', () => {
  describe('coherenceInnerProduct and coherenceNorm', () => {
    test('should calculate coherence inner product correctly', () => {
      // Coherence inner product for two numbers is based on their prime factorizations
      // For simple numbers with single prime factors
      expect(PrimeMath.coherenceInnerProduct(2n, 2n)).toBe(2n) // 2*1*1
      expect(PrimeMath.coherenceInnerProduct(3n, 3n)).toBe(3n) // 3*1*1
      
      // For numbers with multiple prime factors
      // 4 = 2^2, 6 = 2*3
      // Inner product should be 2*2*1 = 4
      expect(PrimeMath.coherenceInnerProduct(4n, 6n)).toBe(4n)
      
      // 12 = 2^2 * 3, 18 = 2 * 3^2
      // Inner product should be 2*2*1 + 3*1*2 = 4 + 6 = 10
      expect(PrimeMath.coherenceInnerProduct(12n, 18n)).toBe(10n)
    })

    test('should calculate coherence norm correctly', () => {
      // Coherence norm is essentially the inner product of a number with itself
      
      // For prime numbers p, norm is p*1^2 = p
      expect(PrimeMath.coherenceNorm(2n)).toBe(2n)
      expect(PrimeMath.coherenceNorm(3n)).toBe(3n)
      expect(PrimeMath.coherenceNorm(5n)).toBe(5n)
      
      // For powers of primes p^n, norm is p*n^2
      expect(PrimeMath.coherenceNorm(4n)).toBe(8n)   // 2*2^2 = 8
      expect(PrimeMath.coherenceNorm(8n)).toBe(18n)  // 2*3^2 = 18
      expect(PrimeMath.coherenceNorm(9n)).toBe(12n)  // 3*2^2 = 12
      
      // For products of different primes
      // 6 = 2*3, norm should be 2*1^2 + 3*1^2 = 5
      expect(PrimeMath.coherenceNorm(6n)).toBe(5n)
      
      // 30 = 2*3*5, norm should be 2*1^2 + 3*1^2 + 5*1^2 = 10
      expect(PrimeMath.coherenceNorm(30n)).toBe(10n)
    })
  })

  describe('coherenceDistance', () => {
    test('should calculate distance between numbers correctly', () => {
      // Distance is defined as the norm of the difference
      // For small numbers
      expect(PrimeMath.coherenceDistance(5n, 3n)).toBe(2n) // |5-3| = 2, norm of 2 is 2
      expect(PrimeMath.coherenceDistance(10n, 2n)).toBe(18n) // |10-2| = 8, norm of 8 is 2*3^2 = 18
      
      // Symmetric property
      expect(PrimeMath.coherenceDistance(7n, 2n)).toBe(PrimeMath.coherenceDistance(2n, 7n))
    })
  })

  describe('nthPrime', () => {
    test('should return the correct nth prime number', () => {
      // For UniversalNumber return type, we need to check the BigInt value
      const result1 = PrimeMath.nthPrime(1)
      expect(result1 instanceof Object && result1.toBigInt ? result1.toBigInt() : result1).toBe(2n)
      
      const result5 = PrimeMath.nthPrime(5)
      expect(result5 instanceof Object && result5.toBigInt ? result5.toBigInt() : result5).toBe(11n)
      
      const result10 = PrimeMath.nthPrime(10)
      expect(result10 instanceof Object && result10.toBigInt ? result10.toBigInt() : result10).toBe(29n)
      
      const result25 = PrimeMath.nthPrime(25)
      expect(result25 instanceof Object && result25.toBigInt ? result25.toBigInt() : result25).toBe(97n)
    })

    test('should throw error for invalid inputs', () => {
      expect(() => PrimeMath.nthPrime(0)).toThrow()
      expect(() => PrimeMath.nthPrime(-1)).toThrow()
    })
  })

  describe('legendreSymbol', () => {
    test('should compute Legendre symbol correctly', () => {
      // Known values for Legendre symbol
      expect(PrimeMath.legendreSymbol(1, 7)).toBe(1)   // 1 is always a quadratic residue
      expect(PrimeMath.legendreSymbol(2, 7)).toBe(1)   // 2 is a quadratic residue mod 7
      expect(PrimeMath.legendreSymbol(3, 7)).toBe(-1)  // 3 is not a quadratic residue mod 7
      expect(PrimeMath.legendreSymbol(0, 7)).toBe(0)   // 0 is a special case
      
      // More cases
      expect(PrimeMath.legendreSymbol(2, 11)).toBe(-1) // 2 is not a quadratic residue mod 11
      expect(PrimeMath.legendreSymbol(3, 11)).toBe(1)  // 3 is a quadratic residue mod 11
    })

    test('should throw error for invalid inputs', () => {
      expect(() => PrimeMath.legendreSymbol(1, 4)).toThrow() // 4 is not prime
      expect(() => PrimeMath.legendreSymbol(1, 0)).toThrow()
      expect(() => PrimeMath.legendreSymbol(1, -7)).toThrow()
    })
  })

  describe('jacobiSymbol', () => {
    test('should compute Jacobi symbol correctly for prime moduli', () => {
      // For prime moduli, Jacobi symbol = Legendre symbol
      expect(PrimeMath.jacobiSymbol(1, 7)).toBe(1)
      expect(PrimeMath.jacobiSymbol(2, 7)).toBe(1)
      expect(PrimeMath.jacobiSymbol(3, 7)).toBe(-1)
      expect(PrimeMath.jacobiSymbol(0, 7)).toBe(0)
    })

    test('should compute Jacobi symbol correctly for composite moduli', () => {
      // Known values for composite moduli
      expect(PrimeMath.jacobiSymbol(1, 15)).toBe(1)   // 1 is always 1
      expect(PrimeMath.jacobiSymbol(2, 15)).toBe(1)   // (2/15) = (2/3)*(2/5) = -1*-1 = 1
      expect(PrimeMath.jacobiSymbol(7, 15)).toBe(-1)  // (7/15) = (7/3)*(7/5) = 1*-1 = -1
    })

    test('should throw error for invalid inputs', () => {
      expect(() => PrimeMath.jacobiSymbol(1, 0)).toThrow()
      expect(() => PrimeMath.jacobiSymbol(1, -15)).toThrow()
      expect(() => PrimeMath.jacobiSymbol(1, 2)).toThrow() // 2 is not odd
    })
  })

  describe('discreteLog', () => {
    test('should compute discrete logarithm correctly for small values', () => {
      // Find x such that 2^x ≡ 3 (mod 5)
      // 2^0 = 1, 2^1 = 2, 2^2 = 4, 2^3 = 3 (mod 5)
      expect(PrimeMath.discreteLog(2, 3, 5)).toBe(3n)
      
      // Find x such that 2^x ≡ 5 (mod 11)
      // 2^0 = 1, 2^1 = 2, 2^2 = 4, 2^3 = 8, 2^4 = 5 (mod 11)
      expect(PrimeMath.discreteLog(2, 5, 11)).toBe(4n)
      
      // Find x such that 3^x ≡ 4 (mod 7)
      // 3^0 = 1, 3^1 = 3, 3^2 = 2, 3^3 = 6, 3^4 = 4 (mod 7)
      expect(PrimeMath.discreteLog(3, 4, 7)).toBe(4n)
    })

    test('should return null when no solution exists', () => {
      // There is no x such that 2^x ≡ 0 (mod 7)
      expect(PrimeMath.discreteLog(2, 0, 7)).toBeNull()
    })

    test('should handle special cases correctly', () => {
      // g^0 = 1 for any g
      expect(PrimeMath.discreteLog(2, 1, 11)).toBe(0n)
      
      // g^1 = g for any g
      expect(PrimeMath.discreteLog(3, 3, 7)).toBe(1n)
    })

    test('should throw error for invalid inputs', () => {
      expect(() => PrimeMath.discreteLog(0, 1, 7)).toThrow()
      expect(() => PrimeMath.discreteLog(2, 3, 1)).toThrow()
    })
  })

  describe('isMersennePrime', () => {
    test('should identify Mersenne primes correctly', () => {
      expect(PrimeMath.isMersennePrime(3)).toBe(true)   // 2^2-1
      expect(PrimeMath.isMersennePrime(7)).toBe(true)   // 2^3-1
      expect(PrimeMath.isMersennePrime(31)).toBe(true)  // 2^5-1
      expect(PrimeMath.isMersennePrime(127)).toBe(true) // 2^7-1
    })

    test('should reject non-Mersenne primes', () => {
      expect(PrimeMath.isMersennePrime(2)).toBe(false)  // prime but not Mersenne
      expect(PrimeMath.isMersennePrime(11)).toBe(false) // prime but not Mersenne
      expect(PrimeMath.isMersennePrime(15)).toBe(false) // not prime (3*5)
      expect(PrimeMath.isMersennePrime(63)).toBe(false) // 2^6-1, but 6 is not prime
    })
  })

  describe('moebius', () => {
    test('should calculate the Möbius function correctly', () => {
      expect(PrimeMath.moebius(1)).toBe(1n)   // μ(1) = 1 by definition
      expect(PrimeMath.moebius(2)).toBe(-1n)  // prime, odd number of factors
      expect(PrimeMath.moebius(6)).toBe(1n)   // 2*3, even number of distinct primes
      expect(PrimeMath.moebius(8)).toBe(0n)   // 2^3, has a squared factor
      expect(PrimeMath.moebius(30)).toBe(-1n) // 2*3*5, odd number of distinct primes
    })

    test('should throw error for invalid inputs', () => {
      expect(() => PrimeMath.moebius(0)).toThrow()
      expect(() => PrimeMath.moebius(-1)).toThrow()
    })
  })
})