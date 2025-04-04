/**
 * Benchmark Suite: Factorization
 * 
 * Tests the performance of various factorization algorithms and approaches
 * with different number types and sizes.
 */

const { createSuite } = require('../benchmark-runner')
const mathjs = require('../../src')
const { UniversalNumber } = mathjs
const Factorization = require('../../src/Factorization')

// Create the factorization benchmark suite
const suite = createSuite('Factorization', {
  warmupRuns: 3,
  iterations: 5,
  // This suite takes longer to run
})

// Create test numbers for factorization
function createFactorizationTestNumbers() {
  return {
    // Small numbers with known factorizations
    simple: [
      new UniversalNumber(24),    // 2^3 * 3
      new UniversalNumber(60),    // 2^2 * 3 * 5
      new UniversalNumber(100),   // 2^2 * 5^2
      new UniversalNumber(720),   // 2^4 * 3^2 * 5
    ],
    // Medium sized numbers
    medium: [
      new UniversalNumber(1234),  // 2 * 617
      new UniversalNumber(9973),  // Prime
      new UniversalNumber(10000), // 2^4 * 5^4
      new UniversalNumber(12345), // 3 * 5 * 823
    ],
    // Larger numbers
    large: [
      new UniversalNumber('1000000007'),      // Prime
      new UniversalNumber('100000039'),   // Smaller prime 
      new UniversalNumber('100000003'),    // Smaller product
      new UniversalNumber('10000000000'),  // 10^10 = 2^10 * 5^10
    ],
    // Semiprime numbers (product of two primes)
    semiprimes: [
      new UniversalNumber(15),              // 3 * 5
      new UniversalNumber(2021),            // 43 * 47
      new UniversalNumber(1000009),         // 1000 * 1000.009
      new UniversalNumber('10403'),         // 101 * 103
      new UniversalNumber('2147483647'),    // (2^31 - 1) (Mersenne prime)
    ],
    // Numbers with many small factors
    manyFactors: [
      new UniversalNumber(2310),        // 2 * 3 * 5 * 7 * 11
      new UniversalNumber(30030),       // 2 * 3 * 5 * 7 * 11 * 13
      new UniversalNumber(720720),      // 2^4 * 3^2 * 5 * 11 * 13
      new UniversalNumber('9699690'),   // 2 * 3^2 * 5 * 7 * 11 * 13 * 17
    ],
    // Prime powers
    primePowers: [
      new UniversalNumber(32),       // 2^5
      new UniversalNumber(81),       // 3^4
      new UniversalNumber(1024),     // 2^10
      new UniversalNumber(2048),     // 2^11
      new UniversalNumber(59049),    // 3^10
    ]
  }
}

// Basic factorization benchmarks
suite.add('Basic Factorization (simple numbers)', () => {
  const numbers = createFactorizationTestNumbers().simple
  
  for (const num of numbers) {
    const factors = num.getFactorization()
  }
})

suite.add('Basic Factorization (medium numbers)', () => {
  const numbers = createFactorizationTestNumbers().medium
  
  for (const num of numbers) {
    const factors = num.getFactorization()
  }
})

// Test different factorization algorithms
suite.add('factorizeWithPrimes (many small factors)', () => {
  const values = createFactorizationTestNumbers().manyFactors.map(n => n.toBigInt())
  
  for (const num of values) {
    const factors = Factorization.factorizeWithPrimes(num)
  }
})

suite.add('factorizePollardsRho (semiprimes)', () => {
  const values = createFactorizationTestNumbers().semiprimes.map(n => n.toBigInt())
  
  for (const num of values) {
    const factors = Factorization.factorizePollardsRho(num)
  }
})

suite.add('factorizeOptimal (various numbers)', () => {
  const values = [
    ...createFactorizationTestNumbers().simple,
    ...createFactorizationTestNumbers().medium,
    ...createFactorizationTestNumbers().semiprimes
  ].map(n => n.toBigInt())
  
  for (const num of values) {
    const factors = Factorization.factorizeOptimal(num)
  }
})

// Test the effect of caching
suite.add('Factorization with caching', () => {
  // Clear cache first
  Factorization.factorizationCache.clear()
  
  const numbers = createFactorizationTestNumbers().manyFactors.map(n => n.toBigInt())
  
  // First run - should populate cache
  for (const num of numbers) {
    const factors = Factorization.factorizeOptimal(num, { useCache: true })
  }
  
  // Second run - should use cache
  for (const num of numbers) {
    const factors = Factorization.factorizeOptimal(num, { useCache: true })
  }
})

suite.add('Factorization without caching', () => {
  // Clear cache first
  Factorization.factorizationCache.clear()
  
  const numbers = createFactorizationTestNumbers().manyFactors.map(n => n.toBigInt())
  
  // Both runs should recompute
  for (const num of numbers) {
    const factors = Factorization.factorizeOptimal(num, { useCache: false })
  }
  
  for (const num of numbers) {
    const factors = Factorization.factorizeOptimal(num, { useCache: false })
  }
})

// Primality testing benchmarks
suite.add('Miller-Rabin Primality Test', () => {
  const primes = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 101n, 997n, 10007n, 1000000007n]
  const composites = [4n, 6n, 8n, 9n, 10n, 12n, 15n, 100n, 1000n, 10000n]
  
  const numbers = [...primes, ...composites]
  
  for (const num of numbers) {
    const isPrime = Factorization.millerRabinTest(num)
  }
})

// Test reconstruction from factors
suite.add('Reconstruction from Factors', () => {
  const numbers = createFactorizationTestNumbers().manyFactors
  
  for (const num of numbers) {
    const factors = num.getFactorization()
    const reconstructed = Factorization.fromPrimeFactors(factors)
  }
})

// Test different number types
suite.add('Factorization - Prime Powers', () => {
  const numbers = createFactorizationTestNumbers().primePowers
  
  for (const num of numbers) {
    const factors = num.getFactorization()
  }
})

// Export the suite
module.exports = suite