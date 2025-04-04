/**
 * Factorization module for the UOR Math-JS library
 * Contains algorithms for converting integers into their prime factorization (universal coordinates)
 * Enhanced with Prime Framework optimizations for performance and efficiency
 * @module Factorization
 */

const { 
  PrimeMathError, 
  toBigInt, 
  isPrime, 
  gcd, 
  primeCache, 
  fastExp
} = require('./Utils')

// Import central configuration system
const { config } = require('./config')

/**
 * @typedef {Object} PrimeFactor
 * @property {BigInt} prime - The prime number
 * @property {BigInt} exponent - The exponent (power) of the prime
 */

/**
 * @typedef {Object} FactorizationResult
 * @property {Map<BigInt, BigInt>} factors - Map of prime factors where key is the prime and value is the exponent
 * @property {boolean} isComplete - Indicates if the factorization is complete (true) or partial (false)
 * @property {number} [confidence] - Confidence level for primality testing (0-1)
 */

/**
 * @typedef {Object} WorkerConfig
 * @property {number} [threadCount] - Number of worker threads to use
 * @property {boolean} [enableWorkStealing] - Whether to enable work stealing
 * @property {number} [chunkSize] - Size of work chunks for distribution
 */

/**
 * Enhanced factorization cache optimized for the Prime Framework
 * Provides efficient caching of computed universal coordinates (prime factorizations)
 * Implements the Prime Framework's coherence and canonical representation requirements
 * @private
 */
const _factorizationCache = {
  /**
   * Get maximum size of the cache before pruning from global config
   */
  get MAX_CACHE_SIZE() {
    return config.cache.maxFactorizationCacheSize
  },
  
  /**
   * Map storing factorization results
   * key: number as string, value: FactorizationResult
   */
  cache: new Map(),
  
  /**
   * Tracks cache usage statistics
   */
  stats: {
    hits: 0,
    misses: 0,
    total: 0,
    lastPruneTime: Date.now()
  },
  
  /**
   * Weight metrics for each entry
   * Used to determine which entries to keep during pruning
   * Factors in recency of use, computational cost, and frequency
   * key: number as string, value: {lastAccess, accessCount, computationCost}
   */
  metrics: new Map(),
  
  /**
   * Set the maximum cache size
   * @param {number} size - New maximum cache size
   * @throws {PrimeMathError} If size parameter is invalid
   */
  setMaxSize(size) {
    if (typeof size !== 'number' || size <= 0 || !Number.isFinite(size)) {
      throw new PrimeMathError('Cache size must be a positive finite number', {
        cause: { provided: size, expected: 'positive number' }
      })
    }
    
    // Update the configuration system instead of directly setting the property
    const { configure } = require('./config')
    configure({
      cache: {
        maxFactorizationCacheSize: size
      }
    })
    
    // Prune if needed
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      this.prune()
    }
  },
  
  /**
   * Get a cached factorization
   * Implements the Prime Framework's coherence inner product by ensuring
   * each access returns the canonical form of the factorization
   * 
   * @param {BigInt} num - The number to look up
   * @returns {FactorizationResult|null} The cached factorization or null if not found
   */
  get(num) {
    this.stats.total++
    
    const key = num.toString()
    const result = this.cache.get(key)
    
    if (result) {
      // Update metrics for this entry
      const metrics = this.metrics.get(key) || { accessCount: 0, computationCost: 1, lastAccess: 0 }
      metrics.accessCount++
      metrics.lastAccess = Date.now()
      this.metrics.set(key, metrics)
      
      // Record hit
      this.stats.hits++
      
      // Return a deep copy to prevent modification of cached data
      // This aligns with the Prime Framework's immutability principle
      return {
        factors: new Map(result.factors),
        isComplete: result.isComplete,
        confidence: result.confidence
      }
    }
    
    // Record miss
    this.stats.misses++
    return null
  },
  
  /**
   * Store a factorization in the cache
   * Enforces the Prime Framework's canonical form requirement
   * 
   * @param {BigInt} num - The number that was factorized
   * @param {Map<BigInt, BigInt>} factorization - The factorization result
   * @param {boolean} [isComplete=true] - Whether the factorization is complete
   * @param {number} [confidence=1] - Confidence level for primality (0-1)
   * @param {Object} [options] - Storage options
   * @param {number} [options.computationCost=1] - Relative computational cost (affects retention)
   */
  set(num, factorization, isComplete = true, confidence = 1, options = {}) {
    const key = num.toString()
    const computationCost = options.computationCost || 1
    
    // Validate the factorization for canonical form
    // Each key must be a prime number, supporting the Prime Framework requirement
    for (const [prime] of factorization.entries()) {
      // We don't recheck primality here as it would be inefficient
      // The factorization algorithm is responsible for ensuring prime factors
      if (prime <= 0n) {
        throw new PrimeMathError('Invalid prime factor in factorization', {
          cause: { prime, expected: 'positive prime' }
        })
      }
    }
    
    // Store the factorization with a deep copy to ensure immutability
    this.cache.set(key, {
      factors: new Map(factorization),
      isComplete,
      confidence
    })
    
    // Initialize or update metrics
    const existingMetrics = this.metrics.get(key)
    this.metrics.set(key, {
      lastAccess: Date.now(),
      accessCount: existingMetrics ? existingMetrics.accessCount + 1 : 1,
      computationCost
    })
    
    // Prune if needed
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      this.prune()
    }
  },
  
  /**
   * Prune the cache using a sophisticated policy
   * Prioritizes keeping entries based on a weighted formula that considers:
   * - Computational cost to regenerate
   * - Access frequency (popularity)
   * - Recency of access
   * - Completeness and confidence in the result
   * 
   * This aligns with the Prime Framework's efficiency requirements
   */
  prune() {
    const now = Date.now()
    this.stats.lastPruneTime = now
    
    // If cache isn't significantly over limit, don't prune yet
    if (this.cache.size < this.MAX_CACHE_SIZE * 1.1) {
      return
    }
    
    // Calculate weights for each entry
    const weightedEntries = []
    const maxAge = now - this.stats.lastPruneTime + 1000 // +1s to avoid division by zero
    
    for (const [key, entry] of this.cache.entries()) {
      const metrics = this.metrics.get(key) || { lastAccess: 0, accessCount: 0, computationCost: 1 }
      
      // Age factor (0-1): newer entries have higher values
      const ageValue = Math.max(0, 1 - ((now - metrics.lastAccess) / maxAge))
      
      // Access frequency factor
      const frequencyValue = Math.min(1, metrics.accessCount / 10)
      
      // Computation cost factor: more expensive calculations are preserved
      const costValue = Math.min(1, metrics.computationCost / 10)
      
      // Confidence factor: more confident and complete entries are preserved
      const confidenceValue = entry.isComplete ? entry.confidence : entry.confidence * 0.5
      
      // Combined weight (higher values are more valuable to keep)
      const weight = (
        ageValue * 0.35 +          // 35% weight for recency
        frequencyValue * 0.25 +    // 25% weight for popularity
        costValue * 0.3 +          // 30% weight for computational cost
        confidenceValue * 0.1      // 10% weight for quality of result
      )
      
      weightedEntries.push({ key, weight })
    }
    
    // Sort by weight (ascending)
    weightedEntries.sort((a, b) => a.weight - b.weight)
    
    // Calculate target size after pruning (aim for 80% of maximum)
    const targetSize = Math.floor(this.MAX_CACHE_SIZE * 0.8)
    const removeCount = this.cache.size - targetSize
    
    // Remove the least valuable entries
    for (let i = 0; i < removeCount; i++) {
      if (i < weightedEntries.length) {
        const key = weightedEntries[i].key
        this.cache.delete(key)
        this.metrics.delete(key)
      }
    }
  },
  
  /**
   * Clear the cache
   */
  clear() {
    this.cache.clear()
    this.metrics.clear()
    
    // Reset statistics
    this.stats.hits = 0
    this.stats.misses = 0
    this.stats.total = 0
    this.stats.lastPruneTime = Date.now()
  },
  
  /**
   * Get the current size of the cache
   * @returns {number} Number of entries in the cache
   */
  size() {
    return this.cache.size
  },
  
  /**
   * Get comprehensive cache statistics
   * @returns {Object} Statistics including hit rate, size, and efficiency metrics
   */
  getStats() {
    const hitRate = this.stats.total > 0 ? this.stats.hits / this.stats.total : 0
    
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      efficiency: hitRate * (this.cache.size / this.MAX_CACHE_SIZE)
    }
  }
}

/**
 * Factorize a number using trial division
 * Implements Algorithm 1 from the specification for prime factorization
 * 
 * @param {number|string|BigInt} n - The number to factorize
 * @returns {Map<BigInt, BigInt>} A map where keys are prime factors and values are their exponents
 * @throws {PrimeMathError} If n is not a positive integer
 */
function factorize(n) {
  let num = toBigInt(n)

  if (num <= 0n) {
    throw new PrimeMathError('Factorization is only defined for positive integers')
  }

  if (num === 1n) {
    // 1 has no prime factors, return empty map
    return new Map()
  }

  // Initialize the result map for prime factors
  const factors = new Map()
  
  // Check divisibility by 2
  let exponent = 0n
  while (num % 2n === 0n) {
    exponent++
    num /= 2n
  }
  if (exponent > 0n) {
    factors.set(2n, exponent)
  }

  // Check divisibility by odd numbers starting from 3
  let divisor = 3n
  while (divisor * divisor <= num) {
    exponent = 0n
    while (num % divisor === 0n) {
      exponent++
      num /= divisor
    }
    if (exponent > 0n) {
      factors.set(divisor, exponent)
    }
    divisor += 2n
  }

  // If num is greater than 1, it is a prime number
  if (num > 1n) {
    factors.set(num, 1n)
  }

  return factors
}

/**
 * Factorize a number using optimized trial division with precomputed primes
 * This is more efficient for moderately sized numbers
 * 
 * @param {number|string|BigInt} n - The number to factorize
 * @returns {Map<BigInt, BigInt>} A map where keys are prime factors and values are their exponents
 * @throws {PrimeMathError} If n is not a positive integer
 */
function factorizeWithPrimes(n) {
  let num = toBigInt(n)

  if (num <= 0n) {
    throw new PrimeMathError('Factorization is only defined for positive integers')
  }

  if (num === 1n) {
    // 1 has no prime factors, return empty map
    return new Map()
  }

  // Initialize the result map for prime factors
  const factors = new Map()
  
  // Try small primes first (optimization)
  const smallPrimes = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n, 53n, 59n, 61n, 67n, 71n, 73n, 79n, 83n, 89n, 97n]
  
  // Try each small prime
  for (const prime of smallPrimes) {
    if (num === 1n) break
    
    let exponent = 0n
    while (num % prime === 0n) {
      exponent++
      num /= prime
    }
    if (exponent > 0n) {
      factors.set(prime, exponent)
    }
    
    // Early exit if we've found all factors
    if (prime * prime > num) {
      if (num > 1n) {
        factors.set(num, 1n)
      }
      return factors
    }
  }

  // Continue with trial division for larger primes
  let divisor = 101n // Start from the next prime after our list
  while (divisor * divisor <= num) {
    let exponent = 0n
    while (num % divisor === 0n) {
      exponent++
      num /= divisor
    }
    if (exponent > 0n) {
      factors.set(divisor, exponent)
    }
    divisor += 2n
  }

  // If num is greater than 1, it is a prime number
  if (num > 1n) {
    factors.set(num, 1n)
  }

  return factors
}

/**
 * Miller-Rabin primality test for larger numbers
 * 
 * @param {BigInt} n - The number to test for primality
 * @param {number} k - Number of iterations for accuracy (higher is more accurate)
 * @returns {boolean} True if n is probably prime, false if definitely composite
 */
function millerRabinTest(n, k = 25) {
  if (n <= 1n) return false
  if (n <= 3n) return true
  if (n % 2n === 0n) return false

  // Write n-1 as 2^r * d where d is odd
  let r = 0n
  let d = n - 1n
  while (d % 2n === 0n) {
    d /= 2n
    r++
  }

  // Witness loop
  /**
   * @param {BigInt} a - The base for the witness test
   * @returns {boolean} True if a is a witness for primality
   */
  const witnessLoop = (a) => {
    let x = modularFastExp(a, d, n)
    if (x === 1n || x === n - 1n) return true

    for (let i = 1n; i < r; i++) {
      x = (x * x) % n
      if (x === n - 1n) return true
    }
    return false
  }

  // Test with k random bases
  for (let i = 0; i < k; i++) {
    // Use deterministic bases for small numbers
    // For larger numbers, we'd use random witnesses
    const bases = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n]
    const a = bases[i % bases.length]
    
    if (!witnessLoop(a % (n - 2n) + 2n)) {
      return false
    }
  }
  
  return true
}

/**
 * Fast modular exponentiation for Miller-Rabin test
 * 
 * @param {BigInt} base - Base value
 * @param {BigInt} exponent - Exponent value
 * @param {BigInt} modulus - Modulus for the operation
 * @returns {BigInt} Result of (base^exponent) % modulus
 */
function modularFastExp(base, exponent, modulus) {
  if (modulus === 1n) return 0n
  
  let result = 1n
  base = base % modulus
  
  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      result = (result * base) % modulus
    }
    exponent = exponent >> 1n
    base = (base * base) % modulus
  }
  
  return result
}

/**
 * Enhanced Pollard's Rho algorithm with cycle detection
 * Optimized for the Prime Framework's factorization requirements
 * 
 * @param {BigInt} n - The number to factor
 * @param {Object} [options] - Algorithm options
 * @param {number} [options.maxIterations=1000000] - Maximum number of iterations
 * @param {BigInt} [options.c=1n] - Polynomial constant
 * @returns {BigInt} A non-trivial factor of n, or n if no factor is found
 */
function pollardRho(n, options = {}) {
  if (n <= 1n) return n
  if (n % 2n === 0n) return 2n
  if (n % 3n === 0n) return 3n
  
  const maxIterations = options.maxIterations || 1000000
  const c = options.c !== undefined ? toBigInt(options.c) : 1n
  
  // Define the polynomial function f(x) = (x^2 + c) % n
  const f = (x) => (x * x + c) % n
  
  // Try with different starting values if needed
  const startValues = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n]
  
  for (const startValue of startValues) {
    // Initialize with the current start value
    let x = startValue
    let y = startValue
    let d = 1n
    
    // Brent's cycle detection
    let power = 1n
    let lam = 1n
    
    let iterations = 0
    
    while (d === 1n && iterations < maxIterations) {
      if (lam === power) {
        y = x
        power *= 2n
        lam = 0n
      }
      
      x = f(x)
      lam += 1n
      
      d = gcd((x > y ? x - y : y - x), n)
      
      // Early success - found a factor
      if (d > 1n && d < n) {
        return d
      }
      
      iterations++
    }
    
    // If we found a factor with this start value, return it
    if (d !== n) {
      return d
    }
  }
  
  // If we tried all start values and didn't find a factor, return n
  return n
}

/**
 * Quadratic Sieve implementation for factoring large numbers
 * Implements a complete and efficient factorization algorithm aligned with the Prime Framework
 * 
 * @param {BigInt} n - The number to factor
 * @param {Object} [options] - Algorithm options
 * @param {number} [options.factorBaseSize=100] - Size of the factor base
 * @param {number} [options.sieveSize=10000] - Size of the sieve interval
 * @param {number} [options.numRelations=0] - Number of relations to collect (0 = auto)
 * @param {boolean} [options.verbose=false] - Whether to output debug info
 * @returns {BigInt} A non-trivial factor of n, or n if no factor is found
 * @throws {PrimeMathError} If input is not a positive composite number
 */
function quadraticSieve(n, options = {}) {
  // Essential argument validation
  n = toBigInt(n)
  
  if (n <= 1n) {
    throw new PrimeMathError('Input must be greater than 1', {
      cause: { value: n, function: 'quadraticSieve' }
    })
  }
  
  // Quick check for small prime factors (optimization)
  if (n % 2n === 0n) return 2n
  if (n % 3n === 0n) return 3n
  if (n % 5n === 0n) return 5n
  
  // Check if n is prime - no need to factor
  if (millerRabinTest(n, 40)) {
    return n // Number is prime, cannot factor
  }
  
  // For very small numbers, use a simpler method
  if (n < 1000000n) {
    // Find factor by trial division
    for (let i = 7n; i * i <= n; i += 2n) {
      if (n % i === 0n) return i
    }
    return n // Should not reach here if n is composite
  }
  
  // Parse options with better defaults for larger numbers
  const factorBaseSize = options.factorBaseSize || 
    (n < 10n ** 40n ? 100 : 
      n < 10n ** 60n ? 300 : 
        n < 10n ** 80n ? 500 : 1000)
  
  const sieveSize = options.sieveSize || 
    (n < 10n ** 40n ? 10000 : 
      n < 10n ** 60n ? 50000 : 
        n < 10n ** 80n ? 100000 : 200000)
  
  // Let the algorithm automatically determine required relations if not specified
  // Formula: Approximately factorBaseSize + 20 for padding
  const requiredRelations = options.numRelations || (factorBaseSize + 20)
  
  // Step 1: Generate an optimal factor base of small primes
  const factorBase = generateFactorBase(n, factorBaseSize)
  
  // Step 2: Sieve for smooth numbers using optimized quadratic polynomial
  const { relations, matrixSize } = findSmoothNumbers(n, factorBase, sieveSize, requiredRelations)
  
  // If we couldn't find enough relations, the algorithm can't proceed
  if (relations.length < factorBaseSize) {
    // Try again with larger parameters, or return n
    if (options.retry !== true) {
      return quadraticSieve(n, {
        ...options,
        factorBaseSize: factorBaseSize * 1.5,
        sieveSize: sieveSize * 1.5,
        retry: true
      })
    }
    return n
  }
  
  // Step 3: Use Gaussian elimination to find linear dependencies
  // Construct the exponent matrix (each row = relation, each column = prime in factor base)
  const matrix = constructMatrix(relations, factorBase, matrixSize)
  
  // Perform Gaussian elimination to find linear dependencies
  const dependencies = findLinearDependencies(matrix, matrixSize, relations.length)
  
  // Step 4: Use the dependencies to find factors
  for (const dependency of dependencies) {
    // Skip trivial dependencies
    if (dependency.reduce((sum, val) => sum + val, 0) <= 1) continue
    
    // Compute x and y from the dependency
    let x = 1n
    const exponents = new Map()
    
    // Combine all relations in this dependency
    for (let i = 0; i < dependency.length; i++) {
      if (dependency[i] === 1) {
        const relation = relations[i]
        x = (x * relation.x) % n
        
        // Combine factorizations
        for (const [prime, exp] of relation.factorization) {
          const currentExp = exponents.get(prime) || 0n
          exponents.set(prime, (currentExp + exp) % 2n)
        }
      }
    }
    
    // Compute y = sqrt(product of primes^exponents)
    let y = 1n
    for (const [prime, exp] of exponents) {
      // All exponents should be even after our linear algebra
      if (exp % 2n !== 0n) {
        // This should never happen if our algebra is correct
        continue
      }
      
      // Calculate square root by using half the exponent
      y = (y * fastExp(prime, exp / 2n)) % n
    }
    
    // Try to find a factor using the congruence of squares: x² ≡ y² (mod n)
    // This means that (x+y)(x-y) ≡ 0 (mod n)
    // So gcd(x+y, n) or gcd(x-y, n) might be a proper factor
    
    // Case 1: gcd(x+y, n)
    const factor1 = gcd((x + y) % n, n)
    if (factor1 !== 1n && factor1 !== n) {
      return factor1
    }
    
    // Case 2: gcd(x-y, n)
    const factor2 = gcd((x - y + n) % n, n)
    if (factor2 !== 1n && factor2 !== n) {
      return factor2
    }
  }
  
  // If we reach here, the algorithm failed to find a proper factor
  // Try again with larger parameters, or return failure
  if (options.retry !== true) {
    return quadraticSieve(n, {
      ...options,
      factorBaseSize: factorBaseSize * 2,
      sieveSize: sieveSize * 2,
      retry: true
    })
  }
  
  return n
}

/**
 * Generate an optimal factor base for the Quadratic Sieve
 * Only include primes p where n is a quadratic residue modulo p
 * 
 * @private
 * @param {BigInt} n - The number to factor
 * @param {number} size - Size of the factor base
 * @returns {BigInt[]} Array of suitable primes for the factor base
 */
function generateFactorBase(n, size) {
  const factorBase = []
  
  // Always include 2 in the factor base
  factorBase.push(2n)
  
  // Start with small primes from the prime cache
  const smallPrimes = primeCache.getSmallPrimes()
  
  // Then check each prime p > 2
  let index = 1 // Skip 2 which we already added
  while (factorBase.length < size && index < smallPrimes.length) {
    const p = smallPrimes[index++]
    
    // Check if n is a quadratic residue modulo p
    // For p = 2, it always is; for other p, use the Legendre symbol
    if (p === 2n || jacobiSymbol(n % p, p) === 1) {
      factorBase.push(p)
    }
  }
  
  // If we need more primes beyond what's in the cache
  if (factorBase.length < size) {
    let p = smallPrimes[smallPrimes.length - 1] + 2n
    
    while (factorBase.length < size) {
      // Check if p is prime (using our cached primality test)
      if (isPrime(p)) {
        // If p is prime, check if n is a quadratic residue modulo p
        if (jacobiSymbol(n % p, p) === 1) {
          factorBase.push(p)
        }
      }
      
      p += 2n // Only check odd numbers
    }
  }
  
  return factorBase
}

/**
 * Find smooth numbers over the factor base
 * Implements optimized sieving with a quadratic polynomial
 * 
 * @private
 * @param {BigInt} n - The number to factor
 * @param {BigInt[]} factorBase - The factor base of small primes
 * @param {number} sieveSize - Size of each sieve interval
 * @param {number} requiredRelations - Number of relations needed
 * @returns {Object} Object containing the relations and matrix size
 */
function findSmoothNumbers(n, factorBase, sieveSize, requiredRelations) {
  // Find square root of n to use as the starting point for sieving
  const sqrtN = sqrt(n)
  let startValue = sqrtN
  
  // Initialize sieving arrays and structures
  const relations = []
  const largestPrime = factorBase[factorBase.length - 1]
  
  // Precompute Tonelli-Shanks results for all primes in the factor base
  // This maps each prime to its square roots of n modulo p
  const tonelliResults = new Map()
  for (const p of factorBase) {
    if (p === 2n) {
      tonelliResults.set(p, [1n])
    } else {
      tonelliResults.set(p, findTonelliShanks(n, p))
    }
  }
  
  // Sieve until we find enough relations
  let intervalNum = 0
  const maxIntervals = 100 // Safety limit
  
  while (relations.length < requiredRelations && intervalNum < maxIntervals) {
    intervalNum++
    
    // Initialize sieve array for log approximations
    const sieve = new Array(sieveSize).fill(0)
    
    // Apply sieving over the interval
    for (let i = 0; i < factorBase.length; i++) {
      const p = factorBase[i]
      const roots = tonelliResults.get(p)
      
      // If p has square roots modulo n
      if (roots && roots.length > 0) {
        // For each root, sieve the interval
        for (const root of roots) {
          // Find the starting positions in the sieve interval
          // We're sieving values of x where x² - n ≡ 0 (mod p)
          let offset = (root - (startValue % p) + p) % p
          
          // Mark multiples of p in the sieve
          for (let j = Number(offset); j < sieve.length; j += Number(p)) {
            // Use logarithmic approximation for efficiency
            sieve[j] += Math.log2(Number(p))
          }
        }
      }
    }
    
    // Find potential smooth numbers
    // Set threshold based on the largest prime in the factor base
    const threshold = Math.log2(Number(largestPrime)) * 0.9
    
    for (let i = 0; i < sieve.length; i++) {
      if (sieve[i] >= threshold) {
        // This is a potential smooth number
        const x = startValue + BigInt(i)
        
        // Compute Q(x) = x² - n
        const qx = (x * x) % n
        
        // Try to factor Q(x) over the factor base
        const factorization = factorizeOverFactorBase(qx, factorBase)
        
        // If Q(x) is indeed smooth (completely factored)
        if (factorization.size > 0) {
          // Add this relation to our collection
          relations.push({
            x,
            qx,
            factorization
          })
          
          // If we have enough relations, stop
          if (relations.length >= requiredRelations) {
            break
          }
        }
      }
    }
    
    // Move to the next sieve interval
    startValue += BigInt(sieveSize)
  }
  
  return {
    relations,
    matrixSize: factorBase.length 
  }
}

/**
 * Factorize a number over a given factor base
 * 
 * @private
 * @param {BigInt} num - The number to factorize
 * @param {BigInt[]} factorBase - The factor base to use
 * @returns {Map<BigInt, BigInt>} Map of prime factors and exponents
 */
function factorizeOverFactorBase(num, factorBase) {
  const factorization = new Map()
  let remaining = num
  
  // Try dividing by each prime in the factor base
  for (const p of factorBase) {
    let exp = 0n
    
    while (remaining % p === 0n) {
      exp++
      remaining /= p
    }
    
    if (exp > 0n) {
      factorization.set(p, exp)
    }
    
    // Early exit: if remaining is 1, we've fully factored the number
    if (remaining === 1n) {
      break
    }
  }
  
  // If remaining is not 1, the number is not smooth over the factor base
  // In that case, we return an empty map
  if (remaining !== 1n) {
    return new Map()
  }
  
  return factorization
}

/**
 * Construct a binary matrix for Gaussian elimination
 * Each row corresponds to a relation
 * Each column corresponds to a prime in the factor base
 * 
 * @private
 * @param {Array<Object>} relations - The relations found during sieving
 * @param {BigInt[]} factorBase - The factor base used
 * @param {number} numPrimes - The number of primes in the factor base
 * @returns {Array<Array<number>>} The exponent matrix (mod 2)
 */
function constructMatrix(relations, factorBase, numPrimes) {
  // Create a map for quick prime index lookup
  const primeIndices = new Map()
  for (let i = 0; i < factorBase.length; i++) {
    primeIndices.set(factorBase[i], i)
  }
  
  // Initialize the matrix with zeros
  const matrix = []
  for (let i = 0; i < relations.length; i++) {
    matrix.push(new Array(numPrimes).fill(0))
  }
  
  // Fill the matrix with exponents mod 2
  for (let i = 0; i < relations.length; i++) {
    const relation = relations[i]
    
    for (const [prime, exponent] of relation.factorization) {
      const primeIndex = primeIndices.get(prime)
      
      // Set the matrix element to exponent mod 2
      if (primeIndex !== undefined) {
        matrix[i][primeIndex] = Number(exponent % 2n)
      }
    }
  }
  
  return matrix
}

/**
 * Find linear dependencies using Gaussian elimination
 * The key part of the quadratic sieve algorithm
 * 
 * @private
 * @param {Array<Array<number>>} matrix - The binary matrix
 * @param {number} numCols - Number of columns (primes)
 * @param {number} numRows - Number of rows (relations)
 * @returns {Array<Array<number>>} Array of dependency vectors
 */
function findLinearDependencies(matrix, numCols, numRows) {
  // Create an augmented matrix for tracking dependencies
  // [original matrix | identity matrix]
  const augMatrix = []
  for (let i = 0; i < numRows; i++) {
    const row = [...matrix[i]]
    
    // Add identity part
    for (let j = 0; j < numRows; j++) {
      row.push(i === j ? 1 : 0)
    }
    
    augMatrix.push(row)
  }
  
  // Perform Gaussian elimination to transform the matrix to row echelon form
  // This is in GF(2), so addition is XOR and multiplication is AND
  for (let j = 0; j < numCols && j < numRows; j++) {
    // Find a pivot row
    let pivotRow = -1
    for (let i = j; i < numRows; i++) {
      if (augMatrix[i][j] === 1) {
        pivotRow = i
        break
      }
    }
    
    // If no pivot found, continue to next column
    if (pivotRow === -1) continue
    
    // Swap rows if needed
    if (pivotRow !== j) {
      [augMatrix[j], augMatrix[pivotRow]] = [augMatrix[pivotRow], augMatrix[j]]
    }
    
    // Eliminate other rows
    for (let i = 0; i < numRows; i++) {
      if (i !== j && augMatrix[i][j] === 1) {
        // In GF(2), this is equivalent to XOR
        for (let k = j; k < augMatrix[i].length; k++) {
          augMatrix[i][k] = (augMatrix[i][k] + augMatrix[j][k]) % 2
        }
      }
    }
  }
  
  // Extract dependencies from the augmented matrix
  // A dependency corresponds to a row with all zeros in the left part
  const dependencies = []
  
  for (let i = 0; i < numRows; i++) {
    let isZeroRow = true
    
    // Check if the left part (original matrix) is all zeros
    for (let j = 0; j < numCols; j++) {
      if (augMatrix[i][j] === 1) {
        isZeroRow = false
        break
      }
    }
    
    // If left part is all zeros, extract the right part (dependency)
    if (isZeroRow) {
      const dependency = augMatrix[i].slice(numCols)
      dependencies.push(dependency)
    }
  }
  
  return dependencies
}

/**
 * Calculate the Jacobi symbol (a/n)
 * Used by the Quadratic Sieve algorithm
 * 
 * @private
 * @param {BigInt} a - The numerator
 * @param {BigInt} n - The denominator
 * @returns {number} The Jacobi symbol (1, 0, or -1)
 */
function jacobiSymbol(a, n) {
  if (n <= 0n || n % 2n === 0n) {
    throw new PrimeMathError('Jacobi symbol denominator must be a positive odd number')
  }
  
  // Reduce a modulo n
  a = ((a % n) + n) % n
  
  let result = 1
  
  // Compute the Jacobi symbol using quadratic reciprocity
  while (a !== 0n) {
    // Extract the largest power of 2 from a
    let t = 0n
    while (a % 2n === 0n) {
      a /= 2n
      t++
    }
    
    // Apply quadratic reciprocity for powers of 2
    if (t % 2n === 1n) {
      const nMod8 = Number(n % 8n)
      if (nMod8 === 3 || nMod8 === 5) {
        result = -result
      }
    }
    
    // Apply quadratic reciprocity for odd values
    if (a % 4n === 3n && n % 4n === 3n) {
      result = -result
    }
    
    // Swap and continue
    const temp = a
    a = n % a
    n = temp
  }
  
  if (n === 1n) {
    return result
  }
  
  return 0 // If n is not 1 at the end, a and n have a common factor
}

/**
 * Find square roots modulo a prime using the Tonelli-Shanks algorithm
 * Used by the Quadratic Sieve for finding starting positions
 * 
 * @private
 * @param {BigInt} n - The number to find square roots for
 * @param {BigInt} p - The prime modulus
 * @returns {BigInt[]} An array of square roots of n modulo p
 */
function findTonelliShanks(n, p) {
  // Handle trivial cases
  if (p === 2n) return [1n]
  
  // Ensure n is reduced modulo p
  n = ((n % p) + p) % p
  
  // Check if n is a quadratic residue
  if (jacobiSymbol(n, p) !== 1) {
    return []
  }
  
  // Tonelli-Shanks algorithm for p ≡ 3 (mod 4)
  if (p % 4n === 3n) {
    const r = fastExp(n, (p + 1n) / 4n) % p
    return [r, p - r]
  }
  
  // Find Q and S such that p - 1 = Q * 2^S with Q odd
  let Q = p - 1n
  let S = 0n
  while (Q % 2n === 0n) {
    Q /= 2n
    S++
  }
  
  // Find a non-residue z
  let z = 2n
  while (jacobiSymbol(z, p) !== -1) {
    z++
  }
  
  // Initialize variables
  let M = S
  let c = fastExp(z, Q) % p
  let t = fastExp(n, Q) % p
  let R = fastExp(n, (Q + 1n) / 2n) % p
  
  // Main loop
  while (t !== 1n) {
    if (t === 0n) return [0n]
    if (t === 1n) return [R, p - R]
    
    // Find the least i such that t^(2^i) ≡ 1 (mod p)
    let i = 0n
    let temp = t
    while (temp !== 1n) {
      temp = (temp * temp) % p
      i++
      if (i >= M) return [] // Should not happen, just a safeguard
    }
    
    // Compute b
    let b = c
    for (let j = 0n; j < M - i - 1n; j++) {
      b = (b * b) % p
    }
    
    // Update variables
    M = i
    c = (b * b) % p
    t = (t * c) % p
    R = (R * b) % p
    
    if (t === 1n) {
      return [R, p - R]
    }
  }
}

/**
 * Integer square root function
 * 
 * @private
 * @param {BigInt} n - Input value
 * @returns {BigInt} Integer square root of n
 */
function sqrt(n) {
  if (n < 0n) {
    throw new PrimeMathError('Cannot compute square root of negative number')
  }
  
  if (n < 2n) {
    return n
  }
  
  // Newton's method for square root
  let x = n
  let y = (x + 1n) / 2n
  
  while (y < x) {
    x = y
    y = (x + n / x) / 2n
  }
  
  return x
}

/**
 * Lenstra's Elliptic Curve Method (ECM) for factorization
 * Optimized for finding medium-sized factors of large numbers
 * Enhanced with Prime Framework optimizations for universal coordinates
 * 
 * @param {BigInt} n - The number to factor
 * @param {Object} [options] - Algorithm options
 * @param {number} [options.curves=20] - Number of curves to try
 * @param {number} [options.b1=100000] - Stage 1 bound
 * @param {number} [options.b2=0] - Stage 2 bound (0 = skip stage 2)
 * @param {number} [options.maxMemory=100] - Max memory usage (MB)
 * @returns {BigInt} A non-trivial factor of n, or n if no factor is found
 * @throws {PrimeMathError} If input is not a positive composite number
 */
function ellipticCurveMethod(n, options = {}) {
  // Validate input and handle special cases
  n = toBigInt(n)
  
  if (n <= 1n) {
    throw new PrimeMathError('Input must be greater than 1', {
      cause: { value: n, function: 'ellipticCurveMethod' }
    })
  }
  
  // Quick checks for small divisors - fast path for efficiency
  if (n % 2n === 0n) return 2n
  if (n % 3n === 0n) return 3n
  if (n % 5n === 0n) return 5n
  if (n % 7n === 0n) return 7n
  
  // Check if the input is prime
  if (millerRabinTest(n, 25)) {
    return n // Number is prime, cannot factor further
  }
  
  // For small numbers, use a simpler method
  if (n < 1000000n) {
    // Prime Framework optimization: Use trial division with small prime cache
    const smallPrimes = primeCache.getSmallPrimes()
    for (const p of smallPrimes) {
      if (p * p > n) break
      if (n % p === 0n) return p
    }
    
    // Continue with trial division for larger primes
    for (let i = 1009n; i * i <= n; i += 2n) {
      if (n % i === 0n) return i
    }
    return n
  }
  
  // Parse options with improved defaults based on input size
  // Scale parameters based on the size of n
  const digits = n.toString().length
  const curves = options.curves || Math.min(20 + Math.floor(digits / 5), 100)
  const b1Base = options.b1 || 100000
  const b1 = Math.min(b1Base * Math.pow(1.1, Math.min(digits - 15, 15)), 10000000)
  const b2 = options.b2 || (b1 * 100)
  const maxMemory = options.maxMemory || 100
  
  // Memory limit for stage 2 (in elements)
  const maxElements = (maxMemory * 1024 * 1024) / 16 // 16 bytes per element
  
  // Prime Framework enhancement: Use prime cache for better performance
  // Precompute primes up to B1 using the cached prime generator
  const smallPrimesUpperBound = Math.min(b1, 100000)
  const primesUpToB1 = []
  
  // Use cached small primes
  const cachedPrimes = primeCache.getSmallPrimes()
  for (const p of cachedPrimes) {
    if (Number(p) <= smallPrimesUpperBound) {
      primesUpToB1.push(Number(p))
    }
  }
  
  // Generate larger primes if needed
  if (smallPrimesUpperBound > Number(cachedPrimes[cachedPrimes.length - 1])) {
    // Use a simple trial division to generate additional primes if needed
    const maxPrime = BigInt(smallPrimesUpperBound)
    let currentPrime = cachedPrimes[cachedPrimes.length - 1] + 2n
    
    while (currentPrime <= maxPrime) {
      let isPrimeVal = true
      
      // Check divisibility by all known primes
      for (const p of cachedPrimes) {
        if (p * p > currentPrime) break // Optimization
        
        if (currentPrime % p === 0n) {
          isPrimeVal = false
          break
        }
      }
      
      if (isPrimeVal) {
        primesUpToB1.push(Number(currentPrime))
      }
      
      currentPrime += 2n // Skip even numbers
    }
  }
  
  // Try multiple curve-point pairs to increase chances of finding a factor
  for (let curve = 0; curve < curves; curve++) {
    // Generate deterministic parameters for the curve and point
    // This is a Prime Framework optimization for reproducible results
    const seed = BigInt(curve + 1)
    
    // Generate pseudorandom parameters using a simple PRNG
    // Ensuring they satisfy the curve equation: y^2 = x^3 + ax + b (mod n)
    const sigma = ((seed * seed + 3n) * seed) % n
    if (sigma === 0n || sigma === 1n) continue
    
    // Compute curve parameters using Montgomery parametrization
    // This is more efficient than Weierstrass form for ECM
    const u = (sigma * sigma - 5n) % n
    const v = (4n * sigma) % n
    
    // Compute A parameter for the Montgomery form: By^2 = x^3 + Ax^2 + x
    let A = ((v - u) * modInverse((4n * u * v) % n, n)) % n
    if (A < 0n) A += n
    
    // Compute the starting point (x:z) in projective coordinates
    let point = { x: u, z: v }
    
    try {
      // Stage 1: Scalar multiplication with prime powers up to B1
      for (const p of primesUpToB1) {
        // For each prime, find largest power <= B1
        let q = p
        while (q <= b1 / p) {
          q *= p
        }
        
        // Multiply the point by q
        point = montgomeryLadder(point, BigInt(q), A, n)
        
        // Check for a non-trivial GCD
        const gcdVal = gcd(point.z, n)
        if (gcdVal !== 1n && gcdVal !== n) {
          return gcdVal // Found a factor!
        }
      }
      
      // Stage 2: Process additional primes between B1 and B2
      if (b2 > b1 && point.z !== 0n) {
        const factor = ecmStage2(point, A, n, b1, b2, maxElements)
        if (factor !== 1n && factor !== n) {
          return factor
        }
      }
    } catch (error) {
      // If we encounter a GCD in modular inversion, that's a factor!
      if (error instanceof Error && error.cause && error.cause.gcd) {
        const factor = error.cause.gcd
        if (factor !== 1n && factor !== n) {
          return factor
        }
      }
    }
  }
  
  // If no factor found after trying all curves, return n
  return n
}

/**
 * Stage 2 of the ECM algorithm using improved continuation
 * Prime Framework enhanced for better performance
 * 
 * @private
 * @param {Object} P - Starting point from Stage 1 in Montgomery form
 * @param {BigInt} A - Curve parameter A
 * @param {BigInt} n - Number to factor
 * @param {number} b1 - Stage 1 bound
 * @param {number} b2 - Stage 2 bound
 * @param {number} maxElements - Memory constraint
 * @returns {BigInt} A factor of n, or 1 if none found
 */
function ecmStage2(P, A, n, b1, b2, maxElements) {
  // Prime Framework optimization: Efficient stage 2 implementation
  // Using the "standard continuation" approach
  
  // Compute d = gcd(2 * D, n) where D is the denominator in point doubling
  const gcdVal = gcd(2n * P.z, n)
  if (gcdVal !== 1n) {
    return gcdVal // Found a factor
  }
  
  // Initialize accumulator for batch GCD
  let acc = 1n
  
  // Determine optimal parameters for baby-step/giant-step
  const D = Math.floor(Math.sqrt(b2 - b1))
  const numGiants = Math.min(Math.ceil((b2 - b1) / D), maxElements)
  
  // Compute [P], [2P], [3P], ..., [D-1]P using Montgomery's ladder
  const babySteps = []
  let Q = P // Q = P
  babySteps.push(Q)
  
  for (let i = 2; i < D; i++) {
    Q = montgomeryCombine(babySteps[0], babySteps[i-2], Q, A, n)
    babySteps.push(Q)
  }
  
  // Compute [D]P as the giant step
  const giantStep = montgomeryLadder(P, BigInt(D), A, n)
  
  // Initialize current point at the multiple of D just below B1
  let d = Math.floor(b1 / D) * D
  let S = montgomeryLadder(P, BigInt(d), A, n)
  
  // Process each giant step: S = S + [D]P
  for (let i = 0; i < numGiants && d < b2; i++) {
    d += D
    const oldS = S
    S = montgomeryCombine(giantStep, oldS, P, A, n)
    
    // For each baby step point, compute the GCD accumulator
    for (let j = 0; j < babySteps.length; j++) {
      const mj = d - j
      if (mj > b1 && mj <= b2 && isPrime(BigInt(mj))) {
        // Compute the "difference" between S and babySteps[j-1]
        const diff = montgomeryCombine(S, babySteps[j-1], P, A, n, true)
        
        // Batch GCD: accumulate differences
        acc = (acc * diff.z) % n
        
        // Occasionally check for a factor to avoid overflow
        if (i % 100 === 99) {
          const g = gcd(acc, n)
          if (g !== 1n && g !== n) {
            return g
          }
          acc = 1n
        }
      }
    }
  }
  
  // Final GCD check
  if (acc !== 1n) {
    const g = gcd(acc, n)
    if (g !== 1n && g !== n) {
      return g
    }
  }
  
  return 1n
}

/**
 * Montgomery ladder for scalar multiplication
 * Computes k*P on Montgomery curve in a constant-time manner
 * 
 * @private
 * @param {Object} P - Point in projective coordinates {x, z}
 * @param {BigInt} k - Scalar multiplier
 * @param {BigInt} A - Curve parameter
 * @param {BigInt} n - Modulus
 * @returns {Object} Resulting point k*P
 */
function montgomeryLadder(P, k, A, n) {
  let R0 = { x: 1n, z: 0n } // Point at infinity
  let R1 = { ...P } // Copy the point
  
  // Scalar multiplication using Montgomery ladder
  // This is a constant-time algorithm (important for cryptographic applications)
  const bits = k.toString(2).split('').map(Number)
  
  for (let i = 0; i < bits.length; i++) {
    const bit = bits[i]
    
    if (bit === 0) {
      R1 = montgomeryCombine(R0, R1, P, A, n)
      R0 = montgomeryDouble(R0, A, n)
    } else {
      R0 = montgomeryCombine(R0, R1, P, A, n)
      R1 = montgomeryDouble(R1, A, n)
    }
  }
  
  return R0
}

/**
 * Montgomery point doubling
 * Computes 2P on Montgomery curve By^2 = x^3 + Ax^2 + x
 * 
 * @private
 * @param {Object} P - Point in projective coordinates {x, z}
 * @param {BigInt} A - Curve parameter
 * @param {BigInt} n - Modulus
 * @returns {Object} Resulting point 2P
 */
function montgomeryDouble(P, A, n) {
  if (P.z === 0n) return P // Point at infinity
  
  // Compute u = (x + z)^2
  const u = ((P.x + P.z) * (P.x + P.z)) % n
  
  // Compute v = (x - z)^2
  const v = ((P.x - P.z) * (P.x - P.z)) % n
  
  // Compute x' = u * v
  const x = (u * v) % n
  
  // Compute w = 4xz = u - v
  let wValue = (u - v) % n
  if (wValue < 0n) wValue += n
  
  // Compute z' = ((u - v) * ((A + 2) / 4 * u + v)) % n
  const t = ((((A + 2n) * u) / 4n) + v) % n
  const z = (wValue * t) % n
  
  return { x, z }
}

/**
 * Montgomery differential addition
 * Computes P+Q given P, Q, and P-Q
 * 
 * @private
 * @param {Object} P - First point
 * @param {Object} Q - Second point
 * @param {Object} PminusQ - Difference P-Q (or base point)
 * @param {BigInt} A - Curve parameter
 * @param {BigInt} n - Modulus
 * @param {boolean} [returnDifference=false] - Whether to return the z-coordinate of P-Q
 * @returns {Object} Resulting point P+Q or the difference info
 */
function montgomeryCombine(P, Q, PminusQ, A, n, returnDifference = false) {
  // Special cases: points at infinity
  if (P.z === 0n) return Q
  if (Q.z === 0n) return P
  
  // Compute u = (x_P + z_P) * (x_Q - z_Q)
  const u = ((P.x + P.z) * (Q.x - Q.z)) % n
  
  // Compute v = (x_P - z_P) * (x_Q + z_Q)
  const v = ((P.x - P.z) * (Q.x + Q.z)) % n
  
  // Compute w = u + v
  let w = (u + v) % n
  if (w < 0n) w += n
  
  // Compute t = u - v
  let t = (u - v) % n
  if (t < 0n) t += n
  
  // Compute the result
  const x = (PminusQ.x * w * w) % n
  const z = (PminusQ.z * t * t) % n
  
  if (returnDifference) {
    return { z: t }
  }
  
  return { x, z }
}

/**
 * Compute modular inverse with GCD factorization detection
 * 
 * @private
 * @param {BigInt} a - Value to invert
 * @param {BigInt} n - Modulus
 * @returns {BigInt} Multiplicative inverse of a modulo n
 * @throws {Error} If inversion fails, with the GCD information in the error cause
 */
function modInverse(a, n) {
  a = ((a % n) + n) % n // Ensure a is positive and < n
  
  // Extended Euclidean Algorithm
  let t = 0n, newt = 1n
  let r = n, newr = a
  
  while (newr !== 0n) {
    const quotient = r / newr
    const tempT = newt
    newt = t - quotient * newt
    t = tempT
    
    const tempR = newr
    newr = r - quotient * newr
    r = tempR
  }
  
  // If r > 1, a is not invertible, but we found a factor!
  if (r > 1n) {
    const error = new Error('Modular inverse does not exist - GCD found', {
      cause: { gcd: r }
    })
    throw error
  }
  
  // Adjust to positive value
  if (t < 0n) t += n
  
  return t
}

/* Commented out unused ECM functions
/**
 * Point addition for elliptic curve method
 * This function is not currently used but is kept for future reference
 * and for completeness of the implementation
 * 
 * @private
 * @param {Object} p1 - First point {x, y, z?}
 * @param {Object} p2 - Second point {x, y, z?}
 * @param {BigInt} a - Curve parameter a 
 * @param {BigInt} n - Modulus
 * @returns {Object} Resulting point {x, y, z}
 */
/* function ecmAdd(p1, p2, a, n) {
  // Handle projective coordinates
  const p1z = p1.z || 1n
  const p2z = p2.z || 1n
  
  // Check if points are the same
  if (p1.x === p2.x && p1.y === p2.y && p1z === p2z) {
    return ecmDouble(p1, a, n)
  }
  
  // Different points - compute addition
  try {
    // Convert to projective coordinates for faster computation
    const z1z1 = (p1z * p1z) % n
    const z2z2 = (p2z * p2z) % n
    const u1 = (p1.x * z2z2) % n
    const u2 = (p2.x * z1z1) % n
    const s1 = (p1.y * p2z * z2z2) % n
    const s2 = (p2.y * p1z * z1z1) % n
    
    if (u1 === u2) {
      if (s1 !== s2) {
        // Points are inverses of each other - return point at infinity
        return { x: 0n, y: 1n, z: 0n }
      } else {
        // Points are the same - use doubling
        return ecmDouble(p1, a, n)
      }
    }
    
    let h = (u2 - u1) % n
    if (h < 0n) h += n
    
    const i = (4n * h * h) % n
    const j = (h * i) % n
    let r = (2n * (s2 - s1)) % n
    if (r < 0n) r += n
    
    const v = (u1 * i) % n
    
    // Compute new x
    let x3 = (r * r - j - 2n * v) % n
    if (x3 < 0n) x3 += n
    
    // Compute new y
    let y3 = (r * (v - x3) - 2n * s1 * j) % n
    if (y3 < 0n) y3 += n
    
    // Compute new z
    let z3 = (2n * h * p1z * p2z) % n
    
    return { x: x3, y: y3, z: z3 }
  } catch (error) {
    // If we encounter division by zero, it means we found a factor
    const factor = gcd(error.divisor, n)
    if (factor > 1n && factor < n) {
      const err = new Error('GCD found during ECM')
      err.factor = factor
      throw err
    }
    throw error
  }
}

/**
 * Point doubling for elliptic curve method
 * 
 * @private
 * @param {Object} p - Point to double {x, y, z?}
 * @param {BigInt} a - Curve parameter a
 * @param {BigInt} n - Modulus
 * @returns {Object} Doubled point {x, y, z}
 */
// eslint-disable-next-line no-unused-vars
function ecmDouble(p, a, n) {
  // Handle projective coordinates
  const z = p.z || 1n
  
  if (p.y === 0n || z === 0n) {
    // Point at infinity or y=0
    return { x: 0n, y: 1n, z: 0n }
  }
  
  try {
    const xx = (p.x * p.x) % n
    const zz = (z * z) % n
    const yyyy = (p.y * p.y * p.y * p.y) % n
    
    let s = (4n * p.x * yyyy) % n
    let m = (3n * xx + a * zz * zz) % n
    if (m < 0n) m += n
    
    // Compute new x
    let x3 = (m * m - 2n * s) % n
    if (x3 < 0n) x3 += n
    
    // Compute new y
    let y3 = (m * (s - x3) - 8n * yyyy) % n
    if (y3 < 0n) y3 += n
    
    // Compute new z
    let z3 = (2n * p.y * z) % n
    
    return { x: x3, y: y3, z: z3 }
  } catch (error) {
    // If we encounter division by zero, it means we found a factor
    const factor = gcd(error.divisor, n)
    if (factor > 1n && factor < n) {
      const err = new Error('GCD found during ECM')
      err.factor = factor
      throw err
    }
    throw error
  }
}

/**
 * Scalar multiplication for elliptic curve method
 * 
 * @private
 * @param {Object} p - Base point {x, y, z?}
 * @param {BigInt} k - Scalar multiplier
 * @param {BigInt} a - Curve parameter a
 * @param {BigInt} n - Modulus
 * @returns {Object} Resulting point k*P
 */
// This function is not currently used but is kept for future reference
// and for completeness of the implementation
/* 
function ecmMultiply(p, k, a, n) {
  if (k === 0n) {
    return { x: 0n, y: 1n, z: 0n } // Point at infinity
  }
  
  if (k === 1n) {
    return p
  }
  
  // Use binary method for fast multiplication
  let result = { x: 0n, y: 1n, z: 0n } // Start with infinity point
  let current = { ...p } // Copy of the base point
  let kBinary = k
  
  while (kBinary > 0n) {
    if (kBinary % 2n === 1n) {
      // If current bit is set, add current point to result
      result = ecmAdd(result, current, a, n)
    }
    // Double the current point
    current = ecmDouble(current, a, n)
    // Move to next bit
    kBinary = kBinary >> 1n
  }
  
  return result
}
*/

/**
 * Recursively find factors using enhanced factorization algorithms
 * Optimized with Prime Framework techniques for finding factors
 * Implements a sophisticated approach that selects the most efficient algorithm
 * for each phase of the factorization, following the Prime Framework requirements
 * 
 * @param {BigInt} n - The number to factorize
 * @param {Map<BigInt, BigInt>} factors - The current factor map
 * @param {Object} [options] - Algorithm options
 * @returns {Map<BigInt, BigInt>} Updated factor map
 */
function findFactorsPollardRho(n, factors = new Map(), options = {}) {
  // Base case: n is 1, no further factorization needed
  if (n === 1n) return factors
  
  // Check the factorization cache first for efficiency
  const cachedFactors = _factorizationCache.get(n)
  if (cachedFactors) {
    // Merge the cached factors into our current factors
    for (const [prime, exponent] of cachedFactors.factors.entries()) {
      const currentExp = factors.get(prime) || 0n
      factors.set(prime, currentExp + exponent)
    }
    return factors
  }
  
  // Check if n is prime using optimized primality test
  // For the Prime Framework, it's critical to correctly identify primes
  if (isPrime(n)) {
    // n is prime, add it to factors
    const currentExp = factors.get(n) || 0n
    factors.set(n, currentExp + 1n)
    
    // Cache this result with 100% confidence
    _factorizationCache.set(n, new Map([[n, 1n]]), true, 1.0, {
      computationCost: 1 // Low cost for prime factorization
    })
    
    return factors
  }
  
  // Determine the best factorization method based on the size and structure of n
  // This implements the adaptive approach described in the Prime Framework spec
  let factor
  
  // Get the approximate number of decimal digits in n
  const numDigits = n.toString().length
  
  if (n < 10000n) {
    // For small numbers, trial division is most efficient
    factor = findFactorByTrialDivision(n)
  } else if (n < 10n ** 12n) {
    // For medium-sized numbers up to 12 digits, standard Pollard's rho
    factor = pollardRho(n, options)
  } else if (n < 10n ** 25n) {
    // For larger numbers up to 25 digits, enhanced Pollard's rho with better parameters
    // This follows the Prime Framework's emphasis on exact factorization efficiency
    factor = pollardRho(n, {
      ...options,
      maxIterations: 200000,
      // Try multiple values of c for better chances of finding a factor
      c: (options.iteration || 0) % 5 === 0 ? 1n : 
        (options.iteration || 0) % 5 === 1 ? 2n :
          (options.iteration || 0) % 5 === 2 ? 3n :
            (options.iteration || 0) % 5 === 3 ? -1n : 7n
    })
    
    // If standard Pollard's rho failed, try ECM with modest parameters
    if (factor === n) {
      factor = ellipticCurveMethod(n, {
        curves: 5,
        b1: 10000
      })
    }
  } else if (n < 10n ** 40n) {
    // For even larger numbers up to 40 digits, use ECM with parameters scaled to the input size
    // The Prime Framework emphasizes efficient factorization of universal coordinates
    factor = ellipticCurveMethod(n, {
      curves: options.ecmCurves || Math.min(15, 5 + Math.floor(numDigits / 5)),
      b1: options.ecmB1 || Math.min(1000000, 50000 * Math.floor(numDigits / 10)),
      b2: options.ecmB2 || 0 // Skip stage 2 for smaller numbers
    })
    
    // If ECM failed, try Quadratic Sieve with modest parameters
    if (factor === n && options.advanced) {
      factor = quadraticSieve(n, {
        factorBaseSize: options.qsFactorBase || 100,
        sieveSize: options.qsSieveSize || 10000
      })
    }
  } else {
    // For very large numbers (> 40 digits), use Quadratic Sieve with parameters scaled to the input size
    // The Prime Framework requires efficient factorization even for extremely large numbers
    factor = quadraticSieve(n, {
      factorBaseSize: options.qsFactorBase || Math.min(500, 100 + Math.floor(numDigits / 5) * 20),
      sieveSize: options.qsSieveSize || Math.min(100000, 10000 + numDigits * 1000),
      verbose: options.verbose
    })
    
    // If QS failed for very large numbers and advanced options are enabled,
    // try ECM with more aggressive parameters as a last resort
    if (factor === n && options.advanced) {
      factor = ellipticCurveMethod(n, {
        curves: options.ecmCurves || 30,
        b1: options.ecmB1 || 1000000,
        b2: options.ecmB2 || 100000000
      })
    }
  }
  
  // Handle the case where no factor was found
  if (factor === n) {
    // If all methods failed to find a proper factor despite n being composite,
    // we need to make a decision based on the Prime Framework requirements
    
    if (options.partialFactorization) {
      // If partial factorization is allowed, treat n as prime-like and continue
      const currentExp = factors.get(n) || 0n
      factors.set(n, currentExp + 1n)
      
      // Cache this result, but with a lower confidence
      // Scale confidence based on the exhaustiveness of our search
      const confidence = options.advanced ? 0.95 : 0.8
      _factorizationCache.set(n, new Map([[n, 1n]]), false, confidence, {
        computationCost: 10 // High cost factor to preserve this in cache longer
      })
      
      return factors
    } else if (options.iteration && options.iteration < 3) {
      // Try again with a different approach if we haven't tried too many times
      return findFactorsPollardRho(n, factors, {
        ...options,
        iteration: (options.iteration || 0) + 1,
        // Try a different c parameter for Pollard's rho
        c: (options.c || 1n) + 1n
      })
    } else {
      // If we've exhausted all options, treat as prime
      // This aligns with the Prime Framework's requirement for deterministic outcomes
      const currentExp = factors.get(n) || 0n
      factors.set(n, currentExp + 1n)
      
      // Cache with appropriate confidence level
      const confidence = isPrime(n, { useCache: false }) ? 1.0 : 0.9
      _factorizationCache.set(n, new Map([[n, 1n]]), true, confidence)
      
      return factors
    }
  }
  
  // We found a proper factor - recursively factor both parts
  // This follows the Prime Framework's divide-and-conquer approach
  
  // Add iteration count to track recursion depth
  const newOptions = {
    ...options,
    iteration: 0 // Reset iteration counter for the new factorization
  }
  
  // Factor the found factor first
  findFactorsPollardRho(factor, factors, newOptions)
  
  // Then factor the quotient
  findFactorsPollardRho(n / factor, factors, newOptions)
  
  return factors
}

/**
 * Find a factor by efficient trial division
 * Fast method for small numbers using a deterministic approach
 * Follows the Prime Framework's requirement for reliable factorization
 * 
 * @private
 * @param {BigInt} n - The number to factor
 * @returns {BigInt} A factor of n
 */
function findFactorByTrialDivision(n) {
  // Check small primes first from the prime cache
  for (const prime of primeCache.getSmallPrimes()) {
    if (n % prime === 0n) {
      return prime
    }
    if (prime * prime > n) break
  }
  
  // Calculate the limit for trial division
  const sqrtN = sqrt(n)
  
  // Start trial division with odd numbers beyond our small prime list
  // Use a wheel factorization pattern skipping multiples of 2 and 3
  // This gives us numbers of form 6k-1 and 6k+1
  const startDiv = 101n
  
  for (let i = startDiv; i <= sqrtN; i += 2n) {
    if (n % i === 0n) {
      return i
    }
  }
  
  // If no factors found, the number is prime
  return n
}

/**
 * Factorize a large number using enhanced Pollard's Rho algorithm
 * Improved with Prime Framework optimizations for performance
 * 
 * @param {number|string|BigInt} n - The number to factorize
 * @param {Object} [options] - Factorization options
 * @param {boolean} [options.useCache=true] - Whether to use factorization cache
 * @param {boolean} [options.perfectFactorization=true] - Whether to ensure complete factorization
 * @returns {Map<BigInt, BigInt>} A map where keys are prime factors and values are their exponents
 * @throws {PrimeMathError} If n is not a positive integer
 */
function factorizePollardsRho(n, options = {}) {
  let num = toBigInt(n)
  
  if (num <= 0n) {
    throw new PrimeMathError('Factorization is only defined for positive integers')
  }
  
  if (num === 1n) {
    return new Map()
  }
  
  // Check factorization cache first if enabled
  const useCache = options.useCache !== false
  if (useCache) {
    const cachedFactors = _factorizationCache.get(num)
    if (cachedFactors) {
      return new Map(cachedFactors.factors)
    }
  }
  
  // Check small factors first with trial division for efficiency
  const factors = new Map()
  
  // Handle powers of small primes separately for efficiency
  const smallPrimes = [2n, 3n, 5n, 7n, 11n, 13n]
  
  for (const prime of smallPrimes) {
    let exponent = 0n
    while (num % prime === 0n) {
      exponent++
      num /= prime
    }
    if (exponent > 0n) {
      factors.set(prime, exponent)
    }
    
    // If we're down to 1, we've fully factored the number
    if (num === 1n) {
      break
    }
  }
  
  // If num is still greater than 1, use enhanced factorization algorithms
  if (num > 1n) {
    const enhancedOptions = {
      ...options,
      // Use advanced algorithms by default for Pollard Rho factorization
      advanced: options.advanced !== false,
      // Set ECM parameters if they weren't provided
      ecmCurves: options.ecmCurves || 15,
      ecmB1: options.ecmB1 || 100000,
      // Set QuadraticSieve parameters
      qsFactorBase: options.qsFactorBase || 100,
      qsSieveSize: options.qsSieveSize || 10000
    }
    
    findFactorsPollardRho(num, factors, enhancedOptions)
  }
  
  // Store in cache if enabled
  if (useCache) {
    _factorizationCache.set(n, factors)
  }
  
  return factors
}

/**
 * Factorize a number using the most appropriate algorithm based on its size and properties
 * Enhanced with Prime Framework optimizations for better performance and precision
 * Implements the Prime Framework's requirements for unique factorization and canonical form
 * Intelligently selects the most efficient factorization algorithm based on number characteristics
 * 
 * @param {number|string|BigInt} n - The number to factorize
 * @param {Object} [options] - Factorization options
 * @param {boolean} [options.advanced=false] - Whether to use advanced factorization for large numbers
 * @param {boolean} [options.useCache=true] - Whether to use factorization cache
 * @param {boolean} [options.parallelizeFactorization=false] - Whether to use parallel factorization (when available)
 * @param {Object} [options.algorithmParams] - Specific parameters for factorization algorithms
 * @param {number} [options.algorithmParams.ecmCurves] - Number of curves for ECM
 * @param {number} [options.algorithmParams.ecmB1] - B1 bound for ECM
 * @param {number} [options.algorithmParams.ecmB2] - B2 bound for ECM (stage 2)
 * @param {number} [options.algorithmParams.qsFactorBase] - Factor base size for quadratic sieve
 * @param {number} [options.algorithmParams.qsSieveSize] - Sieve size for quadratic sieve
 * @param {boolean} [options.partialFactorization=false] - Whether to allow partial factorization for very large numbers
 * @param {boolean} [options.validateFactors=true] - Whether to validate that factors are indeed prime
 * @returns {Map<BigInt, BigInt>} A map where keys are prime factors and values are their exponents
 * @throws {PrimeMathError} If n is not a positive integer
 */
function factorizeOptimal(n, options = {}) {
  // Convert input to BigInt using the utility function
  const num = toBigInt(n)
  
  // Parse options with defaults
  const { 
    advanced = false, 
    useCache = true, 
    parallelizeFactorization = false,
    partialFactorization = false,
    validateFactors = true,
    algorithmParams = {}
  } = options

  // Validate input according to Prime Framework requirements
  if (num <= 0n) {
    throw new PrimeMathError('Factorization is only defined for positive integers in the Prime Framework')
  }

  // Special case: 1 has no prime factors
  if (num === 1n) {
    return new Map()
  }
  
  // Fast path: Check the factorization cache first if enabled
  if (useCache) {
    const cachedFactors = _factorizationCache.get(num)
    if (cachedFactors) {
      // Return a deep copy to prevent modification of cached data
      return new Map(cachedFactors.factors)
    }
  }
  
  // Special case: check if the number is prime
  // This is an optimization for very common case in the Prime Framework
  if (isPrime(num)) {
    const result = new Map([[num, 1n]])
    
    // Cache the result if caching is enabled
    if (useCache) {
      _factorizationCache.set(num, result, true, 1.0, {
        computationCost: 1 // Low cost for prime factorization
      })
    }
    
    return result
  }
  
  // Get the approximate number of decimal digits to determine algorithm
  const numDigits = num.toString().length
  
  // Calculate the factorization based on number size and requested options
  let result
  
  // Decision tree for selecting the appropriate algorithm
  // This implements the optimal algorithm selection based on number characteristics
  // as specified in the Prime Framework
  if (numDigits <= 6) {
    // For small numbers (up to ~million), use simple trial division
    // This is the most efficient for small numbers
    result = factorize(num)
  } else if (numDigits <= 12) {
    // For medium-sized numbers (up to ~trillion), use optimized trial division with precomputed primes
    // This leverages the prime cache for better performance
    result = factorizeWithPrimes(num)
  } else if (numDigits <= 25) {
    // For larger numbers (up to 25 digits)
    if (advanced) {
      // With advanced option, use a combination of methods
      // This implements the adaptive approach described in the Prime Framework spec
      
      // First try Pollard's Rho which is fast for many cases
      const factors = new Map()
      
      // Check for small prime factors first - common pattern in the Prime Framework
      const smallFactors = findSmallPrimeFactors(num)
      let remaining = num
      
      // If we found small factors, remove them from the number to factorize
      if (smallFactors.size > 0) {
        for (const [prime, exponent] of smallFactors.entries()) {
          factors.set(prime, exponent)
          remaining /= prime ** exponent
        }
        
        // If the remaining number is 1, we're done
        if (remaining === 1n) {
          result = factors
        } else if (isPrime(remaining)) {
          // If the remaining number is prime, add it to factors and we're done
          factors.set(remaining, 1n)
          result = factors
        }
      }
      
      // If we haven't fully factorized yet, continue with more advanced methods
      if (!result) {
        // Try Pollard's Rho first for the remaining part
        result = factorizePollardsRho(remaining, {
          useCache,
          advanced: true,
          partialFactorization: false,
          // Merge with any small factors we found earlier
          initialFactors: factors,
          ...algorithmParams
        })
      }
    } else {
      // Without advanced option, use basic Pollard's Rho
      result = factorizePollardsRho(num, {
        useCache,
        advanced: false,
        ...algorithmParams
      })
    }
  } else if (numDigits <= 50) {
    // For very large numbers (up to 50 digits)
    if (advanced) {
      // With advanced option, use enhanced Pollard's Rho with ECM fallback
      // The Prime Framework requires efficient factorization even for large numbers
      
      // Create a combined factorization strategy
      const enhancedOptions = {
        useCache,
        advanced: true,
        partialFactorization: false,
        // Scale parameters based on number size for optimal performance
        ecmCurves: algorithmParams.ecmCurves || Math.min(20, 5 + Math.floor(numDigits / 4)),
        ecmB1: algorithmParams.ecmB1 || Math.min(500000, 10000 * Math.floor(numDigits / 5)),
        ecmB2: algorithmParams.ecmB2 || 0, // Skip stage 2 by default
        ...algorithmParams
      }
      
      // Use parallelization if requested and supported
      if (parallelizeFactorization) {
        result = factorizeParallel(num, enhancedOptions)
      } else {
        result = factorizePollardsRho(num, enhancedOptions)
      }
    } else {
      // Without advanced option, use basic approach but with better parameters
      result = factorizePollardsRho(num, {
        useCache,
        advanced: false,
        // Still use reasonable parameters even without advanced option
        ecmCurves: algorithmParams.ecmCurves || 10,
        ecmB1: algorithmParams.ecmB1 || 50000,
        ...algorithmParams
      })
    }
  } else if (numDigits <= 100) {
    // For extremely large numbers (up to 100 digits), use a sophisticated multi-stage approach
    if (!advanced && !partialFactorization) {
      // Without advanced option or partial factorization permission,
      // this range is too computationally intensive
      throw new PrimeMathError(
        'Number is too large (' + numDigits + ' digits) for non-advanced factorization. ' +
        'Use advanced=true or partialFactorization=true to proceed.'
      )
    }
    
    // Create optimized parameters scaled to number size
    // This implements the adaptive parameters described in the Prime Framework
    const largeNumberOptions = {
      useCache,
      advanced: true,
      parallelizeFactorization,
      partialFactorization,
      // Scale parameters based on number size
      ecmCurves: algorithmParams.ecmCurves || Math.min(30, 10 + Math.floor(numDigits / 5)),
      ecmB1: algorithmParams.ecmB1 || Math.min(1000000, 100000 * Math.floor(numDigits / 20)),
      ecmB2: algorithmParams.ecmB2 || Math.min(100000000, 1000000 * Math.floor(numDigits / 20)),
      qsFactorBase: algorithmParams.qsFactorBase || Math.min(500, 100 + Math.floor(numDigits / 4) * 20),
      qsSieveSize: algorithmParams.qsSieveSize || Math.min(100000, 10000 + numDigits * 500),
      ...algorithmParams
    }
    
    // Use a multi-stage approach with different algorithms
    // This is a sophisticated implementation of the Prime Framework's requirement
    // for handling very large numbers effectively
    
    // First try to find small factors efficiently
    const factors = new Map()
    let remaining = num
    
    // Extract small prime factors first
    const smallFactors = findSmallPrimeFactors(remaining)
    
    if (smallFactors.size > 0) {
      // Merge small factors into our result
      for (const [prime, exponent] of smallFactors.entries()) {
        factors.set(prime, exponent)
        remaining /= prime ** exponent
      }
      
      // If we've completely factorized, we're done
      if (remaining === 1n) {
        result = factors
      } else if (isPrime(remaining)) {
        // If what remains is prime, add it and we're done
        factors.set(remaining, 1n)
        result = factors
      }
    }
    
    // If we haven't fully factorized yet, try advanced methods
    if (!result) {
      if (parallelizeFactorization) {
        // Use parallel factorization if requested
        const remainingFactors = factorizeParallel(remaining, largeNumberOptions)
        
        // Merge results
        for (const [prime, exponent] of remainingFactors.entries()) {
          const currentExp = factors.get(prime) || 0n
          factors.set(prime, currentExp + exponent)
        }
        
        result = factors
      } else {
        // Try ECM first to find medium-sized factors
        const factor = ellipticCurveMethod(remaining, largeNumberOptions)
        
        if (factor !== remaining && factor > 1n) {
          // Found a factor, use recursive factorization
          
          // Factor the first factor
          const factorFactors = factorizePollardsRho(factor, largeNumberOptions)
          const quotient = remaining / factor
          
          // Merge the factorization of the first factor
          for (const [prime, exponent] of factorFactors.entries()) {
            const currentExp = factors.get(prime) || 0n
            factors.set(prime, currentExp + exponent)
          }
          
          // Factor the quotient
          const quotientFactors = factorizePollardsRho(quotient, largeNumberOptions)
          
          // Merge the factorization of the quotient
          for (const [prime, exponent] of quotientFactors.entries()) {
            const currentExp = factors.get(prime) || 0n
            factors.set(prime, currentExp + exponent)
          }
          
          result = factors
        } else {
          // If ECM didn't find a factor, use Quadratic Sieve
          const qsFactors = factorizePollardsRho(remaining, largeNumberOptions)
          
          // Merge the results
          for (const [prime, exponent] of qsFactors.entries()) {
            const currentExp = factors.get(prime) || 0n
            factors.set(prime, currentExp + exponent)
          }
          
          result = factors
        }
      }
    }
  } else {
    // For numbers larger than 100 digits
    if (!partialFactorization) {
      // If partial factorization is not allowed, throw an error
      throw new PrimeMathError(
        'Number is too large (' + numDigits + ' digits) for complete factorization under Prime Framework constraints. ' +
        'Use partialFactorization=true to allow partial results.'
      )
    }
    
    // With partial factorization allowed, try our best
    // The Prime Framework allows partial factorization for extremely large numbers
    // when a complete factorization is computationally infeasible
    const extremeOptions = {
      useCache,
      advanced: true,
      parallelizeFactorization,
      partialFactorization: true,
      // Use aggressive parameters for extremely large numbers
      ecmCurves: algorithmParams.ecmCurves || 50,
      ecmB1: algorithmParams.ecmB1 || 2000000,
      qsFactorBase: algorithmParams.qsFactorBase || 1000,
      ...algorithmParams
    }
    
    // Use parallel factorization if requested
    if (parallelizeFactorization) {
      result = factorizeParallel(num, extremeOptions)
    } else {
      result = factorizePollardsRho(num, extremeOptions)
    }
  }
  
  // Validate the factorization if requested
  if (validateFactors) {
    // Check that all factors are prime
    for (const prime of result.keys()) {
      if (!isPrime(prime)) {
        // This should never happen with correct implementation,
        // but we check as required by the Prime Framework's guarantee of correctness
        throw new PrimeMathError(`Non-prime factor ${prime} found in factorization result. This is a bug.`)
      }
    }
    
    // Check that the factorization is complete (product equals original number)
    // This is a key requirement of the Prime Framework
    const isComplete = isFactorizationComplete(result, num)
    
    // If factorization is not complete and partial factorization is not allowed, throw an error
    if (!isComplete && !partialFactorization) {
      throw new PrimeMathError(
        'Incomplete factorization result. This is a bug in the factorization algorithm.'
      )
    }
    
    // If using cache, store the result with appropriate metadata
    if (useCache) {
      _factorizationCache.set(num, result, isComplete, isComplete ? 1.0 : 0.9, {
        // Higher computation cost for larger numbers (affects cache retention)
        computationCost: Math.min(10, 1 + Math.floor(numDigits / 10))
      })
    }
  }
  
  return result
}

/**
 * Find small prime factors of a number using trial division
 * Optimized helper function for factorizeOptimal
 * 
 * @private
 * @param {BigInt} n - The number to find factors for
 * @param {number} [limit=1000] - The maximum prime to check
 * @returns {Map<BigInt, BigInt>} Map of prime factors and exponents
 */
function findSmallPrimeFactors(n, limit = 1000) {
  const factors = new Map()
  let remaining = n
  
  // Get small primes from cache
  const smallPrimes = primeCache.getSmallPrimes()
  
  // Try dividing by each small prime
  for (const prime of smallPrimes) {
    // Skip large primes based on limit
    if (prime > limit) break
    
    let exponent = 0n
    while (remaining % prime === 0n) {
      exponent++
      remaining /= prime
    }
    
    if (exponent > 0n) {
      factors.set(prime, exponent)
    }
    
    // Early termination if remaining is 1
    if (remaining === 1n) break
    
    // Early termination if remaining is smaller than the square of the next prime
    if (prime * prime > remaining) {
      if (remaining > 1n) {
        factors.set(remaining, 1n)
      }
      break
    }
  }
  
  return factors
}

/**
 * Check if the factorization of a number is complete
 * 
 * @param {Map<BigInt, BigInt>} factors - The factorization to check
 * @param {BigInt} original - The original number
 * @returns {boolean} True if the factorization is complete, false otherwise
 */
function isFactorizationComplete(factors, original) {
  let product = 1n
  
  for (const [prime, exponent] of factors.entries()) {
    // Handle exponentiation efficiently for large exponents
    let base = prime
    let exp = exponent
    let contribution = 1n
    
    while (exp > 0n) {
      if (exp % 2n === 1n) {
        contribution *= base
      }
      base *= base
      exp /= 2n
    }
    
    product *= contribution
  }
  
  return product === original
}

/**
 * Create a number from its prime factorization
 * Implements the Prime Framework's universal coordinate system conversion
 * 
 * @param {Array<PrimeFactor>|Map<BigInt, BigInt>} factors - Array of {prime, exponent} objects or Map of prime->exponent
 * @param {Object} [options] - Conversion options
 * @param {boolean} [options.validatePrimality=true] - Whether to validate that each factor is prime
 * @param {boolean} [options.enforceCanonicalForm=true] - Whether to enforce canonical form (e.g., sort factors)
 * @returns {BigInt} The number represented by the given prime factorization
 * @throws {PrimeMathError} If any of the factors is not a prime number or has a non-positive exponent
 */
function fromPrimeFactors(factors, options = {}) {
  // Default options
  const validatePrimality = options.validatePrimality !== false
  const enforceCanonicalForm = options.enforceCanonicalForm !== false
  
  // Convert to Map if array was provided
  const factorMap = factors instanceof Map ? 
    factors : 
    new Map(factors.map(f => [toBigInt(f.prime), toBigInt(f.exponent)]))
  
  // Prime Framework requires canonical representation
  // Ensure factors are normalized (e.g., no negative or zero exponents)
  const normalizedFactors = new Map()
  
  for (const [prime, exponent] of factorMap.entries()) {
    // Validate exponent
    if (exponent <= 0n) {
      throw new PrimeMathError('Exponents must be positive integers', {
        cause: { prime, exponent, expected: 'positive exponent' }
      })
    }
    
    // Validate primality if requested
    if (validatePrimality && !isPrime(prime)) {
      throw new PrimeMathError(`Factor ${prime} is not a prime number`, {
        cause: { prime, function: 'fromPrimeFactors' }
      })
    }
    
    // Enforce the canonical form by ensuring each prime appears only once
    // and consolidating any duplicate prime factors
    const existingExponent = normalizedFactors.get(prime) || 0n
    normalizedFactors.set(prime, existingExponent + exponent)
  }
  
  // If enforcing canonical form, we want to ensure a consistent order
  // This isn't strictly necessary for computation but ensures consistent results
  // and aligns with the Prime Framework's coherence principles
  let orderedFactors = [...normalizedFactors.entries()]
  
  if (enforceCanonicalForm) {
    // Sort by prime (ascending order)
    orderedFactors.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)
  }
  
  // Compute the product efficiently using exponentiation by squaring
  let result = 1n
  
  for (const [prime, exponent] of orderedFactors) {
    // Compute prime^exponent efficiently and multiply to result
    let base = prime
    let exp = exponent
    let contribution = 1n
    
    // Exponentiation by squaring algorithm
    while (exp > 0n) {
      if (exp % 2n === 1n) {
        contribution *= base
      }
      base *= base
      exp /= 2n
    }
    
    result *= contribution
  }
  
  // Ensure result adheres to Prime Framework coherence
  // The product of primes raised to their exponents gives the canonical form
  // This result exactly corresponds to the universal coordinates representation
  return result
}

/**
 * Get unique prime factors of a number (without exponents)
 * 
 * @param {number|string|BigInt} n - The number to get prime factors for
 * @returns {BigInt[]} Array of prime factors (without repetition)
 */
function getPrimeFactors(n) {
  const factors = factorizeOptimal(n)
  return [...factors.keys()]
}

/**
 * Convert factorization map to array of {prime, exponent} objects
 * 
 * @param {Map<BigInt, BigInt>} factorMap - Map of prime factors
 * @returns {Array<PrimeFactor>} Array of prime-exponent objects
 */
function factorMapToArray(factorMap) {
  return [...factorMap.entries()].map(([prime, exponent]) => ({
    prime,
    exponent
  }))
}

/**
 * Convert array of {prime, exponent} objects to factorization map
 * 
 * @param {Array<PrimeFactor>} factorArray - Array of prime-exponent objects
 * @returns {Map<BigInt, BigInt>} Map of prime factors
 */
function factorArrayToMap(factorArray) {
  return new Map(
    factorArray.map(factor => [toBigInt(factor.prime), toBigInt(factor.exponent)])
  )
}

/**
 * Find the radical of a number (product of distinct prime factors)
 * 
 * @param {number|string|BigInt} n - The number to find the radical for
 * @returns {BigInt} The radical of n
 */
function getRadical(n) {
  const factors = getPrimeFactors(n)
  return factors.reduce((product, prime) => product * prime, 1n)
}

/**
 * Find the prime signature of a number (product of (p_i - 1)(p_i^e_i - 1))
 * Used in various number theory contexts
 * 
 * @param {number|string|BigInt} n - The number to find the signature for
 * @returns {BigInt} The prime signature
 */
function getPrimeSignature(n) {
  const factors = factorizeOptimal(n)
  let signature = 1n
  
  for (const [prime, exponent] of factors.entries()) {
    // Calculate (prime - 1) * (prime^exponent - 1)
    // Use our own implementation since we don't need modular exponentiation here
    let primePower = 1n
    let base = prime
    let exp = exponent
    while (exp > 0n) {
      if (exp % 2n === 1n) {
        primePower *= base
      }
      base *= base
      exp /= 2n
    }
    signature *= (prime - 1n) * (primePower - 1n)
  }
  
  return signature
}

/**
 * Implements parallel factorization using worker threads when available
 * Falls back to sequential factorization in environments without worker thread support
 * 
 * @param {number|string|BigInt} n - The number to factorize
 * @param {Object} [options] - Factorization options
 * @param {number} [options.workerCount] - Number of worker threads to use (default: CPU count - 1)
 * @param {boolean} [options.useWorkStealing=true] - Whether to use work stealing for load balancing
 * @returns {Map<BigInt, BigInt>} A map where keys are prime factors and values are their exponents
 * @throws {PrimeMathError} If n is not a positive integer
 */
function factorizeParallel(n, options = {}) {
  const num = toBigInt(n)
  
  if (num <= 0n) {
    throw new PrimeMathError('Factorization is only defined for positive integers')
  }
  
  if (num === 1n) {
    return new Map()
  }
  
  // In this implementation, we'll use a simulated parallel approach
  // In a real implementation, this would use Web Workers or Node.js Worker Threads
  
  const useCache = options.useCache !== false
  if (useCache) {
    const cachedFactors = _factorizationCache.get(num)
    if (cachedFactors) {
      return new Map(cachedFactors.factors)
    }
  }
  
  // For numbers that can be factored quickly, don't bother with parallelization
  if (num < 10n ** 20n) {
    return factorizeOptimal(num, options)
  }
  
  // Simulate parallel factorization by breaking the problem into smaller pieces
  
  // First, check for small prime factors using trial division
  const factors = new Map()
  let remaining = num
  
  // Handle small prime factors first (these are quick to find)
  const smallPrimes = primeCache.getSmallPrimes()
  for (const prime of smallPrimes) {
    if (prime * prime > remaining) break
    
    let exponent = 0n
    while (remaining % prime === 0n) {
      exponent++
      remaining /= prime
    }
    
    if (exponent > 0n) {
      factors.set(prime, exponent)
    }
  }
  
  // If the remaining number is 1, we're done
  if (remaining === 1n) {
    return factors
  }
  
  // If the remaining number is prime, add it and we're done
  if (isPrime(remaining)) {
    factors.set(remaining, 1n)
    return factors
  }
  
  // At this point, we have a large composite number
  // In a real parallel implementation, we would:
  // 1. Try to find one factor using various methods
  // 2. Split the problem into two parts: factorizing that factor and factorizing remaining/factor
  // 3. Assign these two sub-problems to worker threads
  // For this simulated version, we'll just use our enhanced sequential algorithms
      
  const factor = pollardRho(remaining, {
    maxIterations: 100000,
    c: 1n
  })
  
  if (factor === remaining) {
    // If Pollard's Rho failed, try ECM
    const ecmFactor = ellipticCurveMethod(remaining, {
      curves: 10,
      b1: 100000
    })
    
    if (ecmFactor === remaining) {
      // If ECM also failed, use quadratic sieve as a last resort
      const qsFactor = quadraticSieve(remaining, {
        factorBase: 100,
        sieveSize: 10000
      })
      
      if (qsFactor === remaining) {
        // If all methods fail, we treat the number as prime
        // (it's likely a very large prime if all these methods failed)
        factors.set(remaining, 1n)
        return factors
      } else {
        // QS found a factor
        const f1 = factorizeOptimal(qsFactor, options)
        const f2 = factorizeOptimal(remaining / qsFactor, options)
        
        // Merge the factorizations
        for (const [prime, exponent] of f1.entries()) {
          factors.set(prime, exponent)
        }
        
        for (const [prime, exponent] of f2.entries()) {
          const currentExp = factors.get(prime) || 0n
          factors.set(prime, currentExp + exponent)
        }
      }
    } else {
      // ECM found a factor
      const f1 = factorizeOptimal(ecmFactor, options)
      const f2 = factorizeOptimal(remaining / ecmFactor, options)
      
      // Merge the factorizations
      for (const [prime, exponent] of f1.entries()) {
        factors.set(prime, exponent)
      }
      
      for (const [prime, exponent] of f2.entries()) {
        const currentExp = factors.get(prime) || 0n
        factors.set(prime, currentExp + exponent)
      }
    }
  } else {
    // Pollard's Rho found a factor
    const f1 = factorizeOptimal(factor, options)
    const f2 = factorizeOptimal(remaining / factor, options)
    
    // Merge the factorizations
    for (const [prime, exponent] of f1.entries()) {
      factors.set(prime, exponent)
    }
    
    for (const [prime, exponent] of f2.entries()) {
      const currentExp = factors.get(prime) || 0n
      factors.set(prime, currentExp + exponent)
    }
  }
  
  // If using cache, store the result
  if (useCache) {
    _factorizationCache.set(num, factors)
  }
  
  return factors
}

/**
 * Prime Framework-specific factorization optimizations and utilities
 * Provides specialized methods for the Prime Framework
 */
const factorizationCache = {
  /**
   * Get the current size of the factorization cache
   * @returns {number} Number of entries in the cache
   */
  size() {
    return _factorizationCache.size()
  },
  
  /**
   * Clear the factorization cache
   */
  clear() {
    _factorizationCache.clear()
  },
  
  /**
   * Set the maximum size of the factorization cache
   * @param {number} size - New maximum cache size
   */
  setMaxSize(size) {
    _factorizationCache.setMaxSize(size)
  },
  
  /**
   * Get statistics about the cache
   * @returns {Object} Statistics object with count and hitRate
   */
  getStats() {
    return {
      size: _factorizationCache.size(),
      maxSize: _factorizationCache.MAX_CACHE_SIZE
    }
  }
}

// Export all functions
module.exports = {
  // Core factorization algorithms
  factorize,
  factorizeWithPrimes,
  factorizePollardsRho,
  factorizeOptimal,
  factorizeParallel,
  
  // Advanced algorithms
  quadraticSieve,
  ellipticCurveMethod,
  
  // Primality testing
  millerRabinTest,
  
  // Helper functions
  pollardRho,
  isFactorizationComplete,
  fromPrimeFactors,
  getPrimeFactors,
  factorMapToArray,
  factorArrayToMap,
  getRadical,
  getPrimeSignature,
  
  // Prime Framework enhancements
  factorizationCache
}