/**
 * Benchmark Suite: Factorization
 * 
 * Tests the performance of various factorization algorithms and approaches
 * with different number types and sizes.
 * 
 * This suite adapts to different configuration profiles and test sizes,
 * allowing proper evaluation of the math-js library's capabilities.
 */

const { createSuite } = require('../benchmark-runner')
const mathjs = require('../../src')
const { UniversalNumber, configure } = mathjs
const Factorization = require('../../src/Factorization')

// Create the factorization benchmark suite
const suite = createSuite('Factorization', {
  warmupRuns: 3,
  iterations: 5,
  // This suite takes longer to run
})

/**
 * Generate a test number with a specific number of digits
 * @param {number} digits - Number of digits desired
 * @param {boolean} prime - Whether the number should be prime (approximate)
 * @param {boolean} composite - Whether to ensure the number is composite
 * @returns {string} A string representation of a number with the requested properties
 */
function generateTestNumber(digits, prime = false, composite = false) {
  if (prime && composite) {
    throw new Error('Number cannot be both prime and composite')
  }
  
  // Generate a random number with the specified number of digits
  let num
  do {
    // Create a number with exactly 'digits' digits
    const firstDigit = Math.floor(Math.random() * 9) + 1 // Non-zero first digit
    const restDigits = Array(digits - 1).fill(0).map(() => Math.floor(Math.random() * 10)).join('')
    num = firstDigit + restDigits
    
    // For small numbers, we can check primality directly
    if (digits <= 15) {
      const isPrimeResult = mathjs.PrimeMath.isPrime(BigInt(num))
      if ((prime && isPrimeResult) || (composite && !isPrimeResult) || (!prime && !composite)) {
        break
      }
    } else {
      // For large numbers, we can't easily check primality
      // If prime is requested, make it odd at least
      if (prime) {
        // Make it odd
        if (parseInt(num[num.length - 1]) % 2 === 0) {
          num = num.slice(0, -1) + (parseInt(num[num.length - 1]) + 1).toString()
        }
      }
      
      if (composite) {
        // Make it even to ensure it's composite
        if (parseInt(num[num.length - 1]) % 2 !== 0) {
          num = num.slice(0, -1) + (parseInt(num[num.length - 1]) + 1).toString()
        }
      }
      
      break
    }
  } while (true)
  
  return num
}

/**
 * Creates test numbers for factorization based on the test suite configuration
 * @param {Object} options - Configuration options
 * @param {Object} options.testSizes - Size definitions for test numbers
 * @returns {Object} Test number sets
 */
function createFactorizationTestNumbers(options = {}) {
  // Get factorization size ranges from the options, or use defaults
  const sizes = options.testSizes?.factorization || {
    small: 5,    // 5-digit numbers
    medium: 12,  // 12-digit numbers 
    large: 18    // 18-digit numbers
  }
  
  return {
    // Small numbers with known factorizations
    simple: [
      new UniversalNumber(24),    // 2^3 * 3
      new UniversalNumber(60),    // 2^2 * 3 * 5
      new UniversalNumber(100),   // 2^2 * 5^2
      new UniversalNumber(720),   // 2^4 * 3^2 * 5
    ],
    // Medium sized numbers (dynamically sized)
    medium: [
      new UniversalNumber(generateTestNumber(sizes.small)),  // Random number
      new UniversalNumber(generateTestNumber(sizes.small, true)),  // Probable prime
      new UniversalNumber(10 ** sizes.small),  // Power of 10
      new UniversalNumber(generateTestNumber(sizes.small, false, true)),  // Composite
    ],
    // Larger numbers (dynamically sized)
    large: [
      new UniversalNumber(generateTestNumber(sizes.medium, true)),  // Probable prime
      new UniversalNumber(generateTestNumber(sizes.medium)),  // Random number
      new UniversalNumber(generateTestNumber(sizes.medium, false, true)),  // Composite
      new UniversalNumber(10 ** sizes.medium),  // Power of 10
    ],
    // Semiprime numbers (product of two primes - dynamically sized)
    semiprimes: [
      new UniversalNumber(15),  // 3 * 5 (fixed small example)
      new UniversalNumber(2021),  // 43 * 47 (fixed small example)
      // Generate a semiprime of appropriate size dynamically
      (() => {
        const halfDigits = Math.floor(sizes.small / 2)
        const p = BigInt(generateTestNumber(halfDigits, true))
        const q = BigInt(generateTestNumber(halfDigits, true))
        return new UniversalNumber((p * q).toString())
      })(),
      // Another dynamically generated semiprime
      (() => {
        const halfDigits = Math.floor(sizes.medium / 2)
        const p = BigInt(generateTestNumber(halfDigits, true))
        const q = BigInt(generateTestNumber(halfDigits, true))
        return new UniversalNumber((p * q).toString())
      })()
    ],
    // Numbers with many small factors
    manyFactors: [
      new UniversalNumber(2310),    // 2 * 3 * 5 * 7 * 11
      new UniversalNumber(30030),   // 2 * 3 * 5 * 7 * 11 * 13
      // Generate a highly composite number dynamically
      (() => {
        // Multiply first few primes to create a highly composite number
        // of appropriate size for the test configuration
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
        let product = 1n
        // Use enough primes to get close to the target size
        for (let i = 0; i < primes.length && product.toString().length < sizes.medium; i++) {
          product *= BigInt(primes[i])
        }
        return new UniversalNumber(product.toString())
      })()
    ],
    // Prime powers (dynamically adjusted for size)
    primePowers: [
      new UniversalNumber(2n ** 5n),  // 2^5 = 32
      new UniversalNumber(3n ** 4n),  // 3^4 = 81
      // Generate a power that's in the right size range
      new UniversalNumber(2n ** BigInt(Math.floor(sizes.small * 3.32))),  // 2^n where n gives ~size.small digits
      new UniversalNumber(3n ** BigInt(Math.floor(sizes.small * 2.1))),   // 3^n where n gives ~size.small digits
    ],
    // Very large numbers based on config (only generated when requested)
    veryLarge: sizes.large > 30 ? [
      new UniversalNumber(generateTestNumber(sizes.large)),
      new UniversalNumber(generateTestNumber(sizes.large, false, true))
    ] : []
  }
}

// Basic factorization benchmarks
suite.add('Basic Factorization (simple numbers)', (options) => {
  const numbers = createFactorizationTestNumbers(options).simple
  
  for (const num of numbers) {
    const factors = num.getFactorization()
  }
})

suite.add('Basic Factorization (medium numbers)', (options) => {
  const numbers = createFactorizationTestNumbers(options).medium
  
  for (const num of numbers) {
    const factors = num.getFactorization()
  }
})

// Test different factorization algorithms
suite.add('factorizeWithPrimes (many small factors)', (options) => {
  const values = createFactorizationTestNumbers(options).manyFactors.map(n => n.toBigInt())
  
  for (const num of values) {
    const factors = Factorization.factorizeWithPrimes(num)
  }
})

suite.add('factorizePollardsRho (semiprimes)', (options) => {
  const values = createFactorizationTestNumbers(options).semiprimes.map(n => n.toBigInt())
  
  for (const num of values) {
    const factors = Factorization.factorizePollardsRho(num, {
      // Pass current configuration values to the algorithm
      maxIterations: mathjs.config.factorization.maxIterations,
      timeLimit: mathjs.config.factorization.timeLimit
    })
  }
})

suite.add('factorizeOptimal (various numbers)', (options) => {
  const values = [
    ...createFactorizationTestNumbers(options).simple,
    ...createFactorizationTestNumbers(options).medium
  ].map(n => n.toBigInt())
  
  for (const num of values) {
    const factors = Factorization.factorizeOptimal(num, {
      // Use all the current configuration settings from math-js
      algorithm: mathjs.config.factorization.algorithm,
      lazy: mathjs.config.factorization.lazy,
      completeSizeLimit: mathjs.config.factorization.completeSizeLimit
    })
  }
})

// Test the effect of caching
suite.add('Factorization with caching', (options) => {
  // Clear cache first
  Factorization.factorizationCache.clear()
  
  const numbers = createFactorizationTestNumbers(options).manyFactors.map(n => n.toBigInt())
  
  // First run - should populate cache
  for (const num of numbers) {
    const factors = Factorization.factorizeOptimal(num, { useCache: true })
  }
  
  // Second run - should use cache
  for (const num of numbers) {
    const factors = Factorization.factorizeOptimal(num, { useCache: true })
  }
  
  // Report cache statistics
  return Factorization.factorizationCache.getStats()
})

suite.add('Factorization without caching', (options) => {
  // Clear cache first
  Factorization.factorizationCache.clear()
  
  const numbers = createFactorizationTestNumbers(options).manyFactors.map(n => n.toBigInt())
  
  // Both runs should recompute
  for (const num of numbers) {
    const factors = Factorization.factorizeOptimal(num, { useCache: false })
  }
  
  for (const num of numbers) {
    const factors = Factorization.factorizeOptimal(num, { useCache: false })
  }
})

// Primality testing benchmarks with configurable rounds
suite.add('Miller-Rabin Primality Test', (options = {}) => {
  // Create a mix of primes and composites, with size based on configuration
  const testSizes = options?.testSizes?.factorization || { small: 5, medium: 12 }
  
  // Basic small primes and composites
  const smallPrimes = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n]
  const smallComposites = [4n, 6n, 8n, 9n, 10n, 12n, 15n]
  
  // Generate larger primes and composites based on test size
  const smallDigits = testSizes.small || 5
  const mediumDigits = testSizes.medium || 12
  
  const mediumPrimes = [
    BigInt(generateTestNumber(smallDigits, true)),
    BigInt(generateTestNumber(smallDigits, true)),
    BigInt(generateTestNumber(Math.min(15, mediumDigits), true))
  ]
  
  const mediumComposites = [
    BigInt(generateTestNumber(smallDigits, false, true)),
    BigInt(generateTestNumber(smallDigits, false, true)),
    BigInt(generateTestNumber(Math.min(15, mediumDigits), false, true))
  ]
  
  const numbers = [...smallPrimes, ...smallComposites, ...mediumPrimes, ...mediumComposites]
  
  // Use the configured rounds from the library
  const rounds = mathjs.config.primalityTesting.millerRabinRounds
  
  for (const num of numbers) {
    const isPrime = Factorization.millerRabinTest(num, { rounds })
  }
})

// Test reconstruction from factors
suite.add('Reconstruction from Factors', (options = {}) => {
  const numbers = createFactorizationTestNumbers(options).manyFactors
  
  for (const num of numbers) {
    const factors = num.getFactorization()
    const reconstructed = Factorization.fromPrimeFactors(factors)
  }
})

// Test different number types
suite.add('Factorization - Prime Powers', (options = {}) => {
  const numbers = createFactorizationTestNumbers(options).primePowers
  
  for (const num of numbers) {
    const factors = num.getFactorization()
  }
})

// Export the suite
module.exports = suite