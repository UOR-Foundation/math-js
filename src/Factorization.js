/**
 * Factorization module for the UOR Math-JS library
 * Contains algorithms for converting integers into their prime factorization (universal coordinates)
 * @module Factorization
 */

const { PrimeMathError, toBigInt, isPrime, gcd } = require('./Utils')

/**
 * @typedef {Object} PrimeFactor
 * @property {BigInt} prime - The prime number
 * @property {BigInt} exponent - The exponent (power) of the prime
 */

/**
 * @typedef {Object} FactorizationResult
 * @property {Map<BigInt, BigInt>} factors - Map of prime factors where key is the prime and value is the exponent
 * @property {boolean} isComplete - Indicates if the factorization is complete (true) or partial (false)
 */

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
 * Pollard's Rho algorithm for factoring large numbers
 * 
 * @param {BigInt} n - The number to factor
 * @returns {BigInt} A non-trivial factor of n, or n if no factor is found
 */
function pollardRho(n) {
  if (n <= 1n) return n
  if (n % 2n === 0n) return 2n
  
  // Define the polynomial function f(x) = (x^2 + c) % n
  // where c is a small constant, typically 1
  const c = 1n
  /**
   * @param {BigInt} x - Input value
   * @returns {BigInt} Result of the polynomial function
   */
  const f = (x) => (x * x + c) % n
  
  // Initialize with arbitrary values
  let x = 2n
  let y = 2n
  let d = 1n
  
  // Maximum iterations to prevent infinite loops
  const maxIterations = 1000000
  let iterations = 0
  
  // Find a non-trivial factor
  while (d === 1n && iterations < maxIterations) {
    x = f(x)
    y = f(f(y))
    d = gcd((x > y ? x - y : y - x), n)
    iterations++
  }
  
  return d === n ? n : d
}

/**
 * Recursively find factors using Pollard's Rho algorithm
 * 
 * @param {BigInt} n - The number to factorize
 * @param {Map<BigInt, BigInt>} factors - The current factor map
 * @returns {Map<BigInt, BigInt>} Updated factor map
 */
function findFactorsPollardRho(n, factors = new Map()) {
  if (n === 1n) return factors
  
  if (millerRabinTest(n)) {
    // n is prime, add it to factors
    const currentExp = factors.get(n) || 0n
    factors.set(n, currentExp + 1n)
    return factors
  }
  
  // Find a factor using Pollard's Rho
  const factor = pollardRho(n)
  
  if (factor === n) {
    // If we couldn't find a proper factor, treat n as prime
    const currentExp = factors.get(n) || 0n
    factors.set(n, currentExp + 1n)
    return factors
  }
  
  // Recursively factor both parts
  findFactorsPollardRho(factor, factors)
  findFactorsPollardRho(n / factor, factors)
  
  return factors
}

/**
 * Factorize a large number using Pollard's Rho algorithm
 * 
 * @param {number|string|BigInt} n - The number to factorize
 * @returns {Map<BigInt, BigInt>} A map where keys are prime factors and values are their exponents
 * @throws {PrimeMathError} If n is not a positive integer
 */
function factorizePollardsRho(n) {
  let num = toBigInt(n)
  
  if (num <= 0n) {
    throw new PrimeMathError('Factorization is only defined for positive integers')
  }
  
  if (num === 1n) {
    return new Map()
  }
  
  // Check small factors first with trial division for efficiency
  const factors = new Map()
  
  // Handle powers of 2 separately for efficiency
  let exponent = 0n
  while (num % 2n === 0n) {
    exponent++
    num /= 2n
  }
  if (exponent > 0n) {
    factors.set(2n, exponent)
  }
  
  // Handle powers of 3
  exponent = 0n
  while (num % 3n === 0n) {
    exponent++
    num /= 3n
  }
  if (exponent > 0n) {
    factors.set(3n, exponent)
  }
  
  // If num is still greater than 1, use Pollard's Rho for the rest
  if (num > 1n) {
    findFactorsPollardRho(num, factors)
  }
  
  return factors
}

/**
 * Factorize a number using an appropriate algorithm based on its size
 * Uses trial division for small numbers and more advanced methods for larger ones
 * 
 * @param {number|string|BigInt} n - The number to factorize
 * @param {Object} [options] - Optional parameters
 * @param {boolean} [options.advanced=false] - Whether to use advanced factorization for large numbers
 * @returns {Map<BigInt, BigInt>} A map where keys are prime factors and values are their exponents
 * @throws {PrimeMathError} If n is not a positive integer
 */
function factorizeOptimal(n, options = {}) {
  const num = toBigInt(n)
  const { advanced = false } = options

  if (num <= 0n) {
    throw new PrimeMathError('Factorization is only defined for positive integers')
  }

  if (num === 1n) {
    return new Map()
  }

  // For small numbers, use simple trial division
  if (num < 1000000n) {
    return factorize(num)
  }

  // For medium-sized numbers, use optimized trial division with precomputed primes
  if (num < 1000000000000n) {
    return factorizeWithPrimes(num)
  }

  // For very large numbers, use Pollard's Rho if advanced option is enabled
  if (advanced) {
    return factorizePollardsRho(num)
  }
  
  // Default for large numbers when advanced is false
  return factorizeWithPrimes(num)
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
 * 
 * @param {Array<PrimeFactor>|Map<BigInt, BigInt>} factors - Array of {prime, exponent} objects or Map of prime->exponent
 * @returns {BigInt} The number represented by the given prime factorization
 * @throws {PrimeMathError} If any of the factors is not a prime number or has a non-positive exponent
 */
function fromPrimeFactors(factors) {
  let result = 1n
  
  // Convert to Map if array was provided
  const factorMap = factors instanceof Map ? 
    factors : 
    new Map(factors.map(f => [toBigInt(f.prime), toBigInt(f.exponent)]))
  
  for (const [prime, exponent] of factorMap.entries()) {
    if (exponent <= 0n) {
      throw new PrimeMathError('Exponents must be positive integers')
    }
    
    if (!isPrime(prime)) {
      throw new PrimeMathError(`Factor ${prime} is not a prime number`)
    }
    
    // Compute prime^exponent efficiently and multiply to result
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
    
    result *= contribution
  }
  
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

// Export all functions
module.exports = {
  factorize,
  factorizeWithPrimes,
  factorizePollardsRho,
  factorizeOptimal,
  millerRabinTest,
  pollardRho,
  isFactorizationComplete,
  fromPrimeFactors,
  getPrimeFactors,
  factorMapToArray,
  factorArrayToMap,
  getRadical,
  getPrimeSignature
}