/**
 * Utils module - Helper functions for the UOR Math-JS library
 * @module Utils
 */

/**
 * Custom error class for Prime Math-related errors
 * @class PrimeMathError
 * @extends Error
 */
class PrimeMathError extends Error {
  /**
   * Create a new PrimeMathError
   * @param {string} message - Error message
   */
  constructor(message) {
    super(message)
    this.name = 'PrimeMathError'
  }
}

/**
 * Fast exponentiation algorithm (exponentiation by squaring)
 * Efficiently computes base^exponent in O(log n) time
 * 
 * @param {BigInt} base - The base value
 * @param {BigInt} exponent - The exponent value (must be non-negative)
 * @returns {BigInt} base raised to the power of exponent
 * @throws {PrimeMathError} If exponent is negative
 */
function fastExp(base, exponent) {
  if (exponent < 0n) {
    throw new PrimeMathError('Exponent must be non-negative')
  }
  
  if (exponent === 0n) {
    return 1n
  }
  
  let result = 1n
  let currentBase = base
  let currentExponent = exponent
  
  while (currentExponent > 0n) {
    if (currentExponent % 2n === 1n) {
      // If the current exponent is odd, multiply the result by the current base
      result *= currentBase
    }
    // Square the base and halve the exponent
    currentBase *= currentBase
    currentExponent /= 2n
  }
  
  return result
}

/**
 * Check if a number is divisible by another
 * 
 * @param {BigInt} num - The number to check
 * @param {BigInt} divisor - The potential divisor
 * @returns {boolean} True if num is divisible by divisor, false otherwise
 * @throws {PrimeMathError} If divisor is zero
 */
function isDivisible(num, divisor) {
  if (divisor === 0n) {
    throw new PrimeMathError('Division by zero is not allowed')
  }
  
  return num % divisor === 0n
}

/**
 * Perform exact division, ensuring the result is an integer
 * 
 * @param {BigInt} dividend - The number to divide
 * @param {BigInt} divisor - The divisor
 * @returns {BigInt} The result of the division
 * @throws {PrimeMathError} If the division is not exact or if divisor is zero
 */
function exactDivide(dividend, divisor) {
  if (divisor === 0n) {
    throw new PrimeMathError('Division by zero is not allowed')
  }
  
  if (!isDivisible(dividend, divisor)) {
    throw new PrimeMathError(`${dividend} is not divisible by ${divisor}`)
  }
  
  return dividend / divisor
}

/**
 * Calculate the greatest common divisor (GCD) of two numbers using the Euclidean algorithm
 * 
 * @param {BigInt} a - First number
 * @param {BigInt} b - Second number
 * @returns {BigInt} The GCD of a and b
 */
function gcd(a, b) {
  a = a < 0n ? -a : a
  b = b < 0n ? -b : b
  
  if (b === 0n) {
    return a
  }
  
  return gcd(b, a % b)
}

/**
 * Calculate the least common multiple (LCM) of two numbers
 * 
 * @param {BigInt} a - First number
 * @param {BigInt} b - Second number
 * @returns {BigInt} The LCM of a and b
 */
function lcm(a, b) {
  if (a === 0n || b === 0n) {
    return 0n
  }
  
  a = a < 0n ? -a : a
  b = b < 0n ? -b : b
  
  return (a / gcd(a, b)) * b
}

/**
 * Safely convert a value to BigInt
 * 
 * @param {number|string|BigInt} value - The value to convert
 * @returns {BigInt} The value as a BigInt
 * @throws {PrimeMathError} If the value cannot be converted to BigInt
 */
function toBigInt(value) {
  try {
    if (typeof value === 'number') {
      if (!Number.isInteger(value)) {
        throw new PrimeMathError('Cannot convert non-integer number to BigInt')
      }
      if (!Number.isSafeInteger(value)) {
        throw new PrimeMathError('Number exceeds safe integer range')
      }
    }
    return BigInt(value)
  } catch (error) {
    if (error instanceof PrimeMathError) {
      throw error
    }
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new PrimeMathError(`Cannot convert value to BigInt: ${errorMessage}`)
  }
}

/**
 * Check if a number is prime using a simple primality test
 * Note: This is a basic implementation for small numbers.
 * For large numbers, more sophisticated algorithms should be used.
 * 
 * @param {BigInt} n - The number to check
 * @returns {boolean} True if n is prime, false otherwise
 */
function isPrime(n) {
  if (n <= 1n) {
    return false
  }
  if (n <= 3n) {
    return true
  }
  if (n % 2n === 0n || n % 3n === 0n) {
    return false
  }
  
  // Check divisibility by numbers of form 6k�1 up to sqrt(n)
  let i = 5n
  while (i * i <= n) {
    if (n % i === 0n || n % (i + 2n) === 0n) {
      return false
    }
    i += 6n
  }
  
  return true
}

/**
 * Get the next prime number after a given number
 * 
 * @param {BigInt} n - The starting number
 * @returns {BigInt} The next prime number after n
 */
function nextPrime(n) {
  if (n < 2n) {
    return 2n
  }
  
  let candidate = n + 1n
  if (candidate % 2n === 0n) {
    candidate += 1n
  }
  
  while (!isPrime(candidate)) {
    candidate += 2n
  }
  
  return candidate
}

/**
 * Factorial function
 * 
 * @param {BigInt} n - The number to calculate factorial for
 * @returns {BigInt} n!
 * @throws {PrimeMathError} If n is negative
 */
function factorial(n) {
  if (n < 0n) {
    throw new PrimeMathError('Factorial is not defined for negative numbers')
  }
  
  if (n === 0n) {
    return 1n
  }
  
  let result = 1n
  for (let i = 1n; i <= n; i++) {
    result *= i
  }
  
  return result
}

module.exports = {
  PrimeMathError,
  fastExp,
  isDivisible,
  exactDivide,
  gcd,
  lcm,
  toBigInt,
  isPrime,
  nextPrime,
  factorial
}