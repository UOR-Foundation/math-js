/**
 * UniversalNumber class for the UOR Math-JS library
 * Represents integers using their prime factorization (universal coordinates)
 * Implements the Prime Framework for lossless arithmetic
 * @module UniversalNumber
 */

const { PrimeMathError, toBigInt, isPrime } = require('./Utils')
// eslint-disable-next-line no-unused-vars
const { factorizeOptimal, factorArrayToMap, millerRabinTest, fromPrimeFactors } = require('./Factorization')
const Conversion = require('./Conversion')

/**
 * @typedef {Object} Coordinates
 * @property {Map<BigInt, BigInt>} factorization - Map where keys are prime factors and values are their exponents
 * @property {boolean} isNegative - Whether the number is negative
 * @property {boolean} [isZero] - Whether the number is zero
 */

/**
 * @typedef {Object} FiberAlgebra
 * @property {string} referencePoint - The reference point in manifold (default: "standard")
 * @property {Map<number, Array<number>>} gradedComponents - The graded components (by base) of the representation
 */

/**
 * @typedef {Object} ReferenceFrame
 * @property {string} id - Unique identifier for the reference frame
 * @property {Object} transformationRules - Rules for transforming between frames
 */

/**
 * Class representing a universal number in the Prime Framework
 * Stores numbers using their prime factorization (universal coordinates)
 * Provides exact arithmetic operations with no rounding errors
 * Ensures unique canonical representation through strict normalization
 */
class UniversalNumber {
  /**
   * Create a new UniversalNumber
   * 
   * @param {number|string|BigInt|Map<BigInt, BigInt>|UniversalNumber|{factorization: Map<BigInt, BigInt>, isNegative: boolean}} value - The value to initialize with
   * @throws {PrimeMathError} If value cannot be converted to a valid UniversalNumber
   */
  constructor(value) {
    // Initialize the private properties
    /** @private */
    this._factorization = new Map()
    /** @private */
    this._isNegative = false
    /** @private */
    this._isZero = false

    if (value === null || value === undefined) {
      throw new PrimeMathError('Value cannot be null or undefined')
    }

    // Handle special case for zero
    if ((typeof value === 'number' && value === 0) ||
        (typeof value === 'string' && /^[+-]?0+$/.test(value)) ||
        (typeof value === 'bigint' && value === 0n)) {
      this._isZero = true
      this._factorization = new Map()  // Zero has an empty factorization like 1, but is flagged as zero
      this._isNegative = false         // Zero is neither positive nor negative in this context
      return
    }

    // Special case for 1 - empty factorization per lib-spec.md line 101
    if ((typeof value === 'number' && value === 1) ||
        (typeof value === 'string' && /^[+]?1$/.test(value)) ||
        (typeof value === 'bigint' && value === 1n)) {
      this._factorization = new Map()  // Empty factorization represents 1
      this._isNegative = false
      return
    }

    // Handle UniversalNumber input (copy constructor)
    if (value instanceof UniversalNumber) {
      this._factorization = new Map(value._factorization)
      this._isNegative = value._isNegative
      this._isZero = value._isZero
      return
    }

    // Handle factorization directly as a Map
    if (value instanceof Map) {
      this._validateFactorization(value)
      this._factorization = new Map(value)
      this._normalizeFactorization()
      this._isNegative = false
      return
    }

    // Handle a factorization object with sign information
    if (value && typeof value === 'object' && 'factorization' in value) {
      if (!(value.factorization instanceof Map)) {
        throw new PrimeMathError('Factorization must be a Map of prime factors')
      }
      
      // Special case for explicit zero flag
      if (value.isZero === true) {
        this._isZero = true
        this._factorization = new Map()
        this._isNegative = false
        return
      }
      
      this._validateFactorization(value.factorization)
      this._factorization = new Map(value.factorization)
      this._normalizeFactorization()
      this._isNegative = !!value.isNegative
      this._isZero = false
      return
    }

    try {
      if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
          throw new PrimeMathError('Cannot convert infinite or NaN value to UniversalNumber')
        }
        
        if (!Number.isInteger(value)) {
          throw new PrimeMathError('UniversalNumber requires an integer value')
        }
        
        const result = Conversion.fromNumber(value)
        this._factorization = result.factorization
        this._isNegative = result.isNegative
      } else if (typeof value === 'string') {
        const result = Conversion.fromString(value)
        this._factorization = result.factorization
        this._isNegative = result.isNegative
      } else if (typeof value === 'bigint') {
        if (value === 0n) {
          throw new PrimeMathError('Universal coordinates are only defined for non-zero integers')
        }
        this._isNegative = value < 0n
        this._factorization = Conversion.fromBigInt(value < 0n ? -value : value)
      } else {
        throw new PrimeMathError(`Unsupported value type: ${typeof value}`)
      }
      
      // Ensure the factorization is in canonical form
      this._normalizeFactorization()
    } catch (error) {
      if (error instanceof PrimeMathError) {
        throw error
      }
      throw new PrimeMathError(`Failed to create UniversalNumber: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Validate that the factorization is correct
   * Checks that all factors are prime and all exponents are positive
   * @private
   * 
   * @param {Map<BigInt, BigInt>} factorization - The factorization to validate
   * @throws {PrimeMathError} If the factorization is invalid
   */
  _validateFactorization(factorization) {
    if (!(factorization instanceof Map)) {
      throw new PrimeMathError('Factorization must be a Map of prime factors')
    }

    for (const [prime, exponent] of factorization.entries()) {
      // Check that keys are prime numbers
      if (typeof prime !== 'bigint') {
        throw new PrimeMathError(`Prime factor ${prime} must be a BigInt`)
      }
      
      if (prime <= 1n) {
        throw new PrimeMathError(`Prime factor ${prime} must be greater than 1`)
      }
      
      // Verify primality for smaller numbers
      if (prime < 1000000n && !isPrime(prime)) {
        throw new PrimeMathError(`Factor ${prime} is not a prime number`)
      }
      
      // Use Miller-Rabin test for larger numbers
      if (prime >= 1000000n && !millerRabinTest(prime)) {
        throw new PrimeMathError(`Factor ${prime} is not a prime number`)
      }

      // Check that exponents are positive
      if (typeof exponent !== 'bigint') {
        throw new PrimeMathError(`Exponent for prime ${prime} must be a BigInt`)
      }
      
      if (exponent <= 0n) {
        throw new PrimeMathError(`Exponent for prime ${prime} must be positive`)
      }
    }
  }

  /**
   * Normalize the factorization to ensure canonical form
   * Removes any factors with zero exponents and sorts by prime
   * @private
   */
  _normalizeFactorization() {
    // Remove any factors with zero exponents
    for (const [prime, exponent] of this._factorization.entries()) {
      if (exponent <= 0n) {
        this._factorization.delete(prime)
      }
    }
    
    // The Map maintains insertion order, so we need to recreate it if we want sorted keys
    // This isn't strictly necessary for correctness but makes debugging and comparison easier
    if (this._factorization.size > 1) {
      const sortedEntries = [...this._factorization.entries()]
        .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
      
      this._factorization = new Map(sortedEntries)
    }
  }

  /**
   * Verify that this UniversalNumber has been properly normalized
   * Used to check that operations maintain canonical representation
   * @private
   * 
   * @returns {boolean} True if the factorization is in canonical form
   */
  _verifyNormalization() {
    // Check that all exponents are positive
    for (const exponent of this._factorization.values()) {
      if (exponent <= 0n) return false
    }
    
    // Check that all factors are in ascending order (to ensure unique representation)
    let lastPrime = 0n
    for (const prime of this._factorization.keys()) {
      if (prime <= lastPrime) return false
      lastPrime = prime
    }
    
    return true
  }

  /**
   * Create a UniversalNumber from a regular number
   * 
   * @param {number} n - The JavaScript Number to convert
   * @returns {UniversalNumber} A new UniversalNumber instance
   * @throws {PrimeMathError} If n is not a safe integer or is not finite
   */
  static fromNumber(n) {
    if (!Number.isFinite(n)) {
      throw new PrimeMathError('Cannot convert infinite or NaN value to UniversalNumber')
    }
    
    if (!Number.isInteger(n)) {
      throw new PrimeMathError('UniversalNumber requires an integer value')
    }
    
    return new UniversalNumber(n)
  }

  /**
   * Create a UniversalNumber from a BigInt
   * 
   * @param {BigInt} n - The BigInt to convert
   * @returns {UniversalNumber} A new UniversalNumber instance
   */
  static fromBigInt(n) {
    return new UniversalNumber(n)
  }

  /**
   * Create a UniversalNumber from a string representation
   * 
   * @param {string} str - The string to parse
   * @param {number} [base=10] - The base of the input string (2-36)
   * @returns {UniversalNumber} A new UniversalNumber instance
   * @throws {PrimeMathError} If str cannot be parsed in the given base
   */
  static fromString(str, base = 10) {
    if (typeof str !== 'string' || str.trim() === '') {
      throw new PrimeMathError('Input must be a non-empty string')
    }
    
    if (!Number.isInteger(base) || base < 2 || base > 36) {
      throw new PrimeMathError(`Invalid base: ${base} (must be 2-36)`)
    }
    
    // Special case for zero
    if (/^[+-]?0+$/.test(str)) {
      return new UniversalNumber(0)
    }
    
    const result = Conversion.fromString(str, base)
    return new UniversalNumber({
      factorization: result.factorization,
      isNegative: result.isNegative,
      isZero: result.isZero || false
    })
  }

  /**
   * Create a UniversalNumber from its prime factorization
   * 
   * @param {Array<{prime: BigInt|number|string, exponent: BigInt|number|string}>|Map<BigInt, BigInt>} factors - Prime factorization
   * @param {boolean} [isNegative=false] - Whether the number is negative
   * @returns {UniversalNumber} A new UniversalNumber instance
   * @throws {PrimeMathError} If the factorization is invalid
   */
  static fromFactors(factors, isNegative = false) {
    if (!factors || (Array.isArray(factors) && factors.length === 0) || 
        (factors instanceof Map && factors.size === 0)) {
      // Empty factorization represents 1
      return new UniversalNumber(isNegative ? -1n : 1n)
    }
    
    // Convert array format to Map if necessary
    const factorMap = factors instanceof Map ? 
      factors : 
      factorArrayToMap(factors.map(f => ({
        prime: typeof f.prime === 'bigint' ? f.prime : toBigInt(f.prime),
        exponent: typeof f.exponent === 'bigint' ? f.exponent : toBigInt(f.exponent)
      })))
    
    return new UniversalNumber({
      factorization: factorMap,
      isNegative
    })
  }

  /**
   * Factorize a number into its UniversalNumber representation with prime factorization
   * 
   * @param {number|string|BigInt} n - The number to factorize
   * @param {Object} [options] - Options for factorization
   * @param {boolean} [options.advanced=false] - Whether to use advanced factorization algorithms
   * @returns {UniversalNumber} A new UniversalNumber instance
   */
  static factorize(n, options = {}) {
    // Special case for zero
    if ((typeof n === 'number' && n === 0) ||
        (typeof n === 'string' && /^[+-]?0+$/.test(n)) ||
        (typeof n === 'bigint' && n === 0n)) {
      return new UniversalNumber({
        factorization: new Map(),
        isNegative: false,
        isZero: true
      })
    }
    
    const isNegative = (typeof n === 'number' && n < 0) ||
      (typeof n === 'string' && n.startsWith('-')) ||
      (typeof n === 'bigint' && n < 0n)
    
    const absValue = typeof n === 'bigint' ? (n < 0n ? -n : n) :
      typeof n === 'number' ? Math.abs(n) :
        typeof n === 'string' && n.startsWith('-') ? n.substring(1) : n
    
    const factorization = factorizeOptimal(absValue, options)
    
    return new UniversalNumber({
      factorization,
      isNegative,
      isZero: false
    })
  }

  /**
   * Check if the UniversalNumber represents an intrinsic prime
   * A number is intrinsically prime if its prime factorization consists of a single prime with exponent 1
   * 
   * @returns {boolean} True if the number is an intrinsic prime, false otherwise
   */
  isIntrinsicPrime() {
    // Only unsigned numbers can be prime per mathematical definition
    if (this._isNegative) return false
    
    // An intrinsic prime has exactly one prime factor with exponent 1
    return this._factorization.size === 1 && [...this._factorization.values()][0] === 1n
  }

  /**
   * Get the prime factorization of the UniversalNumber
   * 
   * @returns {Map<BigInt, BigInt>} A Map where keys are prime factors and values are their exponents
   */
  getFactorization() {
    // Return a copy of the factorization to prevent external modification
    return new Map(this._factorization)
  }

  /**
   * Get the universal coordinates (prime factorization and sign)
   * 
   * @returns {Coordinates} Object containing the factorization and sign information
   */
  getCoordinates() {
    return {
      factorization: new Map(this._factorization),
      isNegative: Boolean(this._isNegative)
    }
  }

  /**
   * Convert the UniversalNumber to a BigInt
   * 
   * @returns {BigInt} The BigInt representation of the number
   */
  toBigInt() {
    // Special case for zero
    if (this._isZero) {
      return 0n
    }
    
    // Special case for 1 (empty factorization)
    if (this._factorization.size === 0) {
      return this._isNegative ? -1n : 1n
    }
    
    const value = Conversion.toBigInt(this._factorization)
    return this._isNegative ? -value : value
  }

  /**
   * Convert the UniversalNumber to a JavaScript Number
   * 
   * @returns {number} The Number representation of the number
   * @throws {PrimeMathError} If the value is too large to be represented as a Number
   */
  toNumber() {
    const value = this.toBigInt()
    
    if (value > BigInt(Number.MAX_SAFE_INTEGER) || 
        value < BigInt(Number.MIN_SAFE_INTEGER)) {
      throw new PrimeMathError('Value is too large to be represented as a JavaScript Number')
    }
    
    return Number(value)
  }

  /**
   * Convert the UniversalNumber to a string representation in the given base
   * 
   * @param {number} [base=10] - The base for the output representation (2-36)
   * @returns {string} The string representation in the specified base
   * @throws {PrimeMathError} If the base is invalid
   */
  toString(base = 10) {
    if (!Number.isInteger(base) || base < 2 || base > 36) {
      throw new PrimeMathError(`Invalid base: ${base} (must be 2-36)`)
    }
    
    // Special case for zero
    if (this._isZero) {
      return '0'
    }
    
    // Special case for 1 (empty factorization)
    if (this._factorization.size === 0) {
      return this._isNegative ? '-1' : '1'
    }
    
    const absStr = Conversion.toString(this._factorization, base)
    return this._isNegative ? '-' + absStr : absStr
  }

  /**
   * Get the digit representation of the number in a specific base
   * 
   * @param {number} [base=10] - The base to use (2-36)
   * @param {boolean} [leastSignificantFirst=false] - Order of digits
   * @returns {number[]} Array of digits in the specified base
   * @throws {PrimeMathError} If the base is invalid
   */
  getDigits(base = 10, leastSignificantFirst = false) {
    if (!Number.isInteger(base) || base < 2 || base > 36) {
      throw new PrimeMathError(`Invalid base: ${base} (must be 2-36)`)
    }
    
    // Special case for zero
    if (this._isZero) {
      return [0]
    }
    
    const result = Conversion.getDigitsFromValue(
      { 
        factorization: this._factorization, 
        isNegative: Boolean(this._isNegative) 
      },
      base,
      { leastSignificantFirst }
    )
    return result.digits
  }

  /**
   * Add another number to this UniversalNumber
   * 
   * @param {number|string|BigInt|UniversalNumber} other - The number to add
   * @returns {UniversalNumber} A new UniversalNumber representing the sum
   */
  add(other) {
    // Special case for zero (more generalized handling)
    if (this._isZero) {
      // If this is zero, return other
      return other instanceof UniversalNumber ? 
        new UniversalNumber(other) : 
        new UniversalNumber(other)
    }
    
    // Special case for adding 0
    if ((other === 0 || other === 0n || other === '0') || 
        (other instanceof UniversalNumber && other._isZero)) {
      return new UniversalNumber(this)
    }
    
    // Special case for adding to 1 (empty factorization)
    if (this._factorization.size === 0 && !this._isNegative) {
      return other instanceof UniversalNumber ? 
        other.add(1) : 
        new UniversalNumber(other).add(1)
    }
    
    // Convert this to BigInt
    const thisValue = this.toBigInt()
    
    // Convert other to UniversalNumber if it's not already
    const otherNum = other instanceof UniversalNumber ? 
      other : 
      new UniversalNumber(other)
    
    // Convert other to BigInt
    const otherValue = otherNum.toBigInt()
    
    // Perform addition
    const sum = thisValue + otherValue
    
    // Create a new UniversalNumber from the result
    return new UniversalNumber(sum)
  }

  /**
   * Subtract another number from this UniversalNumber
   * 
   * @param {number|string|BigInt|UniversalNumber} other - The number to subtract
   * @returns {UniversalNumber} A new UniversalNumber representing the difference
   */
  subtract(other) {
    // Special case for this being zero
    if (this._isZero) {
      // If both this and other are zero, return zero
      if ((other === 0 || other === 0n || other === '0') || 
          (other instanceof UniversalNumber && other._isZero)) {
        return new UniversalNumber(0)
      }
      
      const otherNum = other instanceof UniversalNumber ? 
        other : 
        new UniversalNumber(other)
      return otherNum.negate()
    }
    
    // Special case for subtracting 0
    if ((other === 0 || other === 0n || other === '0') || 
        (other instanceof UniversalNumber && other._isZero)) {
      return new UniversalNumber(this)
    }
    
    // Special case for subtracting from 1 (empty factorization)
    if (this._factorization.size === 0 && !this._isNegative) {
      const otherNum = other instanceof UniversalNumber ? 
        other : 
        new UniversalNumber(other)
        
      return otherNum.negate().add(1)
    }
    
    // Convert this to BigInt
    const thisValue = this.toBigInt()
    
    // Convert other to UniversalNumber if it's not already
    const otherNum = other instanceof UniversalNumber ? 
      other : 
      new UniversalNumber(other)
    
    // Convert other to BigInt
    const otherValue = otherNum.toBigInt()
    
    // Perform subtraction
    const difference = thisValue - otherValue
    
    // Create a new UniversalNumber from the result
    return new UniversalNumber(difference)
  }

  /**
   * Multiply this UniversalNumber by another number
   * For factorized numbers, multiplication is performed by combining prime exponents
   * 
   * @param {number|string|BigInt|UniversalNumber} other - The number to multiply by
   * @returns {UniversalNumber} A new UniversalNumber representing the product
   */
  multiply(other) {
    // Special case for zero
    if (this._isZero) {
      return new UniversalNumber(0)
    }
    
    // Special case for multiplying by 0
    if ((other === 0 || other === 0n || other === '0') || 
        (other instanceof UniversalNumber && other._isZero)) {
      return new UniversalNumber(0)
    }
    
    // Special case for multiplying by 1
    if ((other === 1 || other === 1n || other === '1')) {
      return new UniversalNumber(this)
    }
    
    // Special case for multiplying by -1
    if ((other === -1 || other === -1n || other === '-1')) {
      return this.negate()
    }
    
    // Special case for multiplying 1 (empty factorization)
    if (this._factorization.size === 0 && !this._isZero) {
      const result = other instanceof UniversalNumber ? 
        new UniversalNumber(other) : 
        new UniversalNumber(other)
        
      return this._isNegative ? result.negate() : result
    }
    
    // Convert other to UniversalNumber if it's not already
    const otherNum = other instanceof UniversalNumber ? 
      other : 
      new UniversalNumber(other)
    
    // Create a new factorization map by combining the exponents
    const resultFactorization = new Map(this._factorization)
    
    // Calculate the sign of the result
    const resultIsNegative = this._isNegative !== otherNum._isNegative
    
    // Combine the prime factors by adding exponents
    for (const [prime, exponent] of otherNum._factorization.entries()) {
      const currentExponent = resultFactorization.get(prime) || 0n
      resultFactorization.set(prime, currentExponent + exponent)
    }
    
    // Create a new UniversalNumber from the result
    return new UniversalNumber({
      factorization: resultFactorization,
      isNegative: Boolean(resultIsNegative)
    })
  }

  /**
   * Divide this UniversalNumber by another number
   * Only succeeds if the division is exact (no remainder)
   * For factorized numbers, division is performed by subtracting prime exponents
   * 
   * @param {number|string|BigInt|UniversalNumber} other - The divisor
   * @returns {UniversalNumber} A new UniversalNumber representing the quotient
   * @throws {PrimeMathError} If the division is not exact or divisor is zero
   */
  divide(other) {
    // Special case for dividing by 0
    if ((other === 0 || other === 0n || other === '0') || 
        (other instanceof UniversalNumber && other._isZero)) {
      throw new PrimeMathError('Division by zero is not allowed')
    }
    
    // Special case for zero divided by anything non-zero
    if (this._isZero) {
      return new UniversalNumber(0)
    }
    
    // Special case for dividing by 1
    if ((other === 1 || other === 1n || other === '1')) {
      return new UniversalNumber(this)
    }
    
    // Special case for dividing by -1
    if ((other === -1 || other === -1n || other === '-1')) {
      return this.negate()
    }
    
    // Special case for 1 (empty factorization) divided by something
    if (this._factorization.size === 0 && !this._isZero) {
      // 1 divided by anything other than 1 or -1 can't be exact in natural numbers
      const otherNum = other instanceof UniversalNumber ? 
        other : 
        new UniversalNumber(other)
        
      if (otherNum._factorization.size > 0) {
        throw new PrimeMathError(`1 is not divisible by ${otherNum.toString()} in the natural numbers`)
      }
    }
    
    // Convert other to UniversalNumber if it's not already
    const otherNum = other instanceof UniversalNumber ? 
      other : 
      new UniversalNumber(other)
    
    // Calculate the sign of the result
    const resultIsNegative = this._isNegative !== otherNum._isNegative
    
    // Create a new factorization map by subtracting the exponents
    const resultFactorization = new Map(this._factorization)
    let isExact = true
    
    // Subtract the prime factors by subtracting exponents
    for (const [prime, exponent] of otherNum._factorization.entries()) {
      const currentExponent = resultFactorization.get(prime) || 0n
      if (currentExponent < exponent) {
        isExact = false
        break
      }
      const newExponent = currentExponent - exponent
      if (newExponent > 0n) {
        resultFactorization.set(prime, newExponent)
      } else {
        resultFactorization.delete(prime)
      }
    }
    
    if (!isExact) {
      throw new PrimeMathError(`${this.toString()} is not divisible by ${otherNum.toString()} in the natural numbers`)
    }
    
    // Create a new UniversalNumber from the result
    return new UniversalNumber({
      factorization: resultFactorization,
      isNegative: Boolean(resultIsNegative)
    })
  }

  /**
   * Raise this UniversalNumber to a power
   * For factorized numbers, exponentiation is performed by multiplying prime exponents
   * 
   * @param {number|string|BigInt} exponent - The exponent
   * @returns {UniversalNumber} A new UniversalNumber representing the result of the exponentiation
   * @throws {PrimeMathError} If exponent is negative
   */
  pow(exponent) {
    const exp = toBigInt(exponent)
    
    if (exp < 0n) {
      throw new PrimeMathError('Negative exponents are not supported in the natural numbers')
    }
    
    // Special case for zero
    if (this._isZero) {
      // 0^0 = 1 (mathematical convention), 0^n = 0 for n > 0
      return exp === 0n ? new UniversalNumber(1n) : new UniversalNumber(0n)
    }
    
    if (exp === 0n) {
      // Any number raised to the power of 0 is 1
      return new UniversalNumber(1n)
    }
    
    if (exp === 1n) {
      // Any number raised to the power of 1 is the number itself
      return new UniversalNumber(this)
    }
    
    // Special case for 1 (empty factorization)
    if (this._factorization.size === 0 && !this._isZero) {
      return new UniversalNumber(this)
    }
    
    // For even exponents, the result is always positive
    // For odd exponents, the result has the same sign as the base
    const resultIsNegative = this._isNegative && exp % 2n === 1n
    
    // Create a new factorization map by multiplying all exponents
    const resultFactorization = new Map()
    for (const [prime, exponent] of this._factorization.entries()) {
      resultFactorization.set(prime, exponent * exp)
    }
    
    // Create a new UniversalNumber from the result
    return new UniversalNumber({
      factorization: resultFactorization,
      isNegative: Boolean(resultIsNegative)
    })
  }

  /**
   * Find the greatest common divisor (GCD) of this UniversalNumber and another number
   * For factorized numbers, GCD is computed by taking the minimum of each prime's exponents
   * 
   * @param {number|string|BigInt|UniversalNumber} other - The other number
   * @returns {UniversalNumber} A new UniversalNumber representing the GCD
   * @throws {PrimeMathError} If both inputs are zero
   */
  gcd(other) {
    // Get UniversalNumber version of other
    const otherNum = other instanceof UniversalNumber ? 
      other : 
      new UniversalNumber(other)
      
    // Handle zero inputs
    if (this._isZero && otherNum._isZero) {
      throw new PrimeMathError('GCD of zero with zero is undefined')
    }
    
    // Per mathematical definition: gcd(0, n) = gcd(n, 0) = |n|
    if (this._isZero) {
      return otherNum.abs()
    }
    
    if (otherNum._isZero) {
      return this.abs()
    }
    
    // Special case for 1 (empty factorization)
    if (this._factorization.size === 0 && !this._isZero) {
      return new UniversalNumber(1)
    }
    
    // Special case: if other is 1, GCD is 1
    if (otherNum._factorization.size === 0) {
      return new UniversalNumber(1)
    }
    
    // Create a new factorization map by taking the minimum exponent for each prime
    const resultFactorization = new Map()
    
    // Find all primes that appear in both factorizations
    const commonPrimes = new Set()
    for (const prime of this._factorization.keys()) {
      if (otherNum._factorization.has(prime)) {
        commonPrimes.add(prime)
      }
    }
    
    // Take the minimum exponent for each common prime
    for (const prime of commonPrimes) {
      const thisExponent = this._factorization.get(prime) || 0n
      const otherExponent = otherNum._factorization.get(prime) || 0n
      const minExponent = thisExponent < otherExponent ? thisExponent : otherExponent
      
      if (minExponent > 0n) {
        resultFactorization.set(prime, minExponent)
      }
    }
    
    // Create a new UniversalNumber from the result
    return new UniversalNumber({
      factorization: resultFactorization,
      isNegative: false // GCD is always positive
    })
  }

  /**
   * Find the least common multiple (LCM) of this UniversalNumber and another number
   * For factorized numbers, LCM is computed by taking the maximum of each prime's exponents
   * 
   * @param {number|string|BigInt|UniversalNumber} other - The other number
   * @returns {UniversalNumber} A new UniversalNumber representing the LCM
   * @throws {PrimeMathError} If either input is zero
   */
  lcm(other) {
    // Get other as UniversalNumber
    const otherNum = other instanceof UniversalNumber ? 
      other : 
      new UniversalNumber(other)
    
    // Check for zero inputs (lcm(0, n) = lcm(n, 0) = 0 by mathematical convention)
    if (this._isZero || otherNum._isZero) {
      return new UniversalNumber(0)
    }
    
    // Special case for 1 (empty factorization)
    if (this._factorization.size === 0 && !this._isZero) {
      return new UniversalNumber(otherNum.abs())
    }
    
    // Special case: if other is 1, LCM is this number
    if (otherNum._factorization.size === 0) {
      return this.abs()
    }
    
    // Create a new factorization map by taking the maximum exponent for each prime
    const resultFactorization = new Map()
    
    // Find all primes that appear in either factorization
    const allPrimes = new Set([
      ...this._factorization.keys(),
      ...otherNum._factorization.keys()
    ])
    
    // Take the maximum exponent for each prime
    for (const prime of allPrimes) {
      const thisExponent = this._factorization.get(prime) || 0n
      const otherExponent = otherNum._factorization.get(prime) || 0n
      const maxExponent = thisExponent > otherExponent ? thisExponent : otherExponent
      
      if (maxExponent > 0n) {
        resultFactorization.set(prime, maxExponent)
      }
    }
    
    // Create a new UniversalNumber from the result
    return new UniversalNumber({
      factorization: resultFactorization,
      isNegative: false // LCM is always positive
    })
  }

  /**
   * Calculate the radical of the number (product of distinct prime factors)
   * 
   * @returns {UniversalNumber} A new UniversalNumber with all exponents set to 1
   */
  radical() {
    // The radical of 1 is 1
    if (this._factorization.size === 0) {
      return new UniversalNumber(1n)
    }
    
    // Create a new factorization map with all exponents set to 1
    const resultFactorization = new Map()
    for (const prime of this._factorization.keys()) {
      resultFactorization.set(prime, 1n)
    }
    
    return new UniversalNumber({
      factorization: resultFactorization,
      isNegative: false // Radical is always positive
    })
  }

  /**
   * Check if this number is divisible by another
   * 
   * @param {number|string|BigInt|UniversalNumber} other - The potential divisor
   * @returns {boolean} True if this number is divisible by other, false otherwise
   * @throws {PrimeMathError} If divisor is zero
   */
  isDivisibleBy(other) {
    // Check for zero divisor
    if ((other === 0 || other === 0n || other === '0')) {
      throw new PrimeMathError('Division by zero is not allowed')
    }
    
    // Everything is divisible by 1
    if ((other === 1 || other === 1n || other === '1') ||
        (other === -1 || other === -1n || other === '-1')) {
      return true
    }
    
    // 1 is only divisible by 1 or -1
    if (this._factorization.size === 0) {
      return false
    }
    
    // Convert other to UniversalNumber if it's not already
    const otherNum = other instanceof UniversalNumber ? 
      other : 
      new UniversalNumber(other)
    
    // Special case: if other is 1, everything is divisible by 1
    if (otherNum._factorization.size === 0) {
      return true
    }
    
    // Check if all prime factors in other are present in this with sufficient exponents
    for (const [prime, exponent] of otherNum._factorization.entries()) {
      const thisExponent = this._factorization.get(prime) || 0n
      if (thisExponent < exponent) {
        return false
      }
    }
    
    return true
  }

  /**
   * Calculate the modular inverse (a^-1 mod m) if it exists
   * 
   * @param {number|string|BigInt|UniversalNumber} modulus - The modulus
   * @returns {UniversalNumber|null} The modular inverse, or null if it doesn't exist
   * @throws {PrimeMathError} If modulus is not positive
   */
  modInverse(modulus) {
    // Convert modulus to UniversalNumber if it's not already
    const modulusNum = modulus instanceof UniversalNumber ? 
      modulus : 
      new UniversalNumber(modulus)
    
    // Modulus must be positive
    if (modulusNum._isNegative) {
      throw new PrimeMathError('Modulus must be positive')
    }
    
    // Handle special case for modulus 1
    if (modulusNum._factorization.size === 0) {
      return new UniversalNumber(0n)
    }
    
    // Extended Euclidean Algorithm to find modular inverse
    /**
     * @param {BigInt} a - First number
     * @param {BigInt} b - Second number
     * @returns {{ gcd: BigInt, x: BigInt, y: BigInt }} GCD and Bézout coefficients
     */
    const extendedGcd = (a, b) => {
      if (a === 0n) {
        return { gcd: b, x: 0n, y: 1n }
      }
      
      const { gcd, x, y } = extendedGcd(b % a, a)
      return { 
        gcd, 
        x: y - (b / a) * x, 
        y: x 
      }
    }
    
    const thisValue = this.toBigInt()
    const modulusValue = modulusNum.toBigInt()
    
    // Ensure a is positive and within the range of the modulus
    const a = ((thisValue % modulusValue) + modulusValue) % modulusValue
    
    if (a === 0n) {
      return null // No inverse exists for 0
    }
    
    const { gcd, x } = extendedGcd(a, modulusValue)
    
    if (gcd !== 1n) {
      return null // No inverse exists if gcd(a, m) is not 1
    }
    
    const result = (x % modulusValue + modulusValue) % modulusValue
    return new UniversalNumber(result)
  }

  /**
   * Compute modular exponentiation (a^b mod n)
   * 
   * @param {number|string|BigInt} expValue - The exponent
   * @param {number|string|BigInt|UniversalNumber} modulus - The modulus
   * @returns {UniversalNumber} Result of (this^expValue) mod modulus
   * @throws {PrimeMathError} If modulus is not positive
   */
  modPow(expValue, modulus) {
    // Convert exponent to BigInt
    const exp = toBigInt(expValue)
    
    // Convert modulus to UniversalNumber if it's not already
    const modulusNum = modulus instanceof UniversalNumber ? 
      modulus : 
      new UniversalNumber(modulus)
    
    // Modulus must be positive
    if (modulusNum._isNegative) {
      throw new PrimeMathError('Modulus must be positive')
    }
    
    // Handle special case for modulus 1
    if (modulusNum._factorization.size === 0) {
      return new UniversalNumber(0n)
    }
    
    // Handle special cases for exponent
    if (exp === 0n) {
      return new UniversalNumber(1n)
    }
    
    if (exp === 1n) {
      return this.mod(modulusNum)
    }
    
    // For negative exponents, we need the modular inverse
    if (exp < 0n) {
      const inverse = this.modInverse(modulusNum)
      if (inverse === null) {
        throw new PrimeMathError(`${this.toString()} has no modular inverse modulo ${modulusNum.toString()}`)
      }
      return inverse.modPow(-exp, modulusNum)
    }
    
    // Standard modular exponentiation algorithm
    const modulusValue = modulusNum.toBigInt()
    const thisValue = this.toBigInt()
    const a = ((thisValue % modulusValue) + modulusValue) % modulusValue
    
    // Fast modular exponentiation algorithm
    let result = 1n
    let base = a
    let expCounter = exp
    
    while (expCounter > 0n) {
      if (expCounter % 2n === 1n) {
        result = (result * base) % modulusValue
      }
      base = (base * base) % modulusValue
      expCounter = expCounter >> 1n
    }
    
    return new UniversalNumber(result)
  }

  /**
   * Compute the modulo (remainder after division)
   * 
   * @param {number|string|BigInt|UniversalNumber} modulus - The modulus
   * @returns {UniversalNumber} This value modulo the given modulus
   * @throws {PrimeMathError} If modulus is not positive
   */
  mod(modulus) {
    // Convert modulus to UniversalNumber if it's not already
    const modulusNum = modulus instanceof UniversalNumber ? 
      modulus : 
      new UniversalNumber(modulus)
    
    // Modulus must be positive
    if (modulusNum._isNegative) {
      throw new PrimeMathError('Modulus must be positive')
    }
    
    // Handle special case for modulus 1
    if (modulusNum._factorization.size === 0) {
      return new UniversalNumber(0n)
    }
    
    // Compute the modulo
    const thisValue = this.toBigInt()
    const modulusValue = modulusNum.toBigInt()
    
    // Ensure the result is positive (canonical representation for modular arithmetic)
    const result = ((thisValue % modulusValue) + modulusValue) % modulusValue
    
    return new UniversalNumber(result)
  }

  /**
   * Compare this UniversalNumber with another number for equality
   * 
   * @param {number|string|BigInt|UniversalNumber} other - The number to compare with
   * @returns {boolean} True if the numbers are equal, false otherwise
   */
  equals(other) {
    if (!(other instanceof UniversalNumber)) {
      try {
        other = new UniversalNumber(other)
      } catch (error) {
        return false
      }
    }
    
    // Different signs mean numbers are not equal
    if (this._isNegative !== other._isNegative) {
      return false
    }
    
    // Special case for 1 (empty factorization)
    if (this._factorization.size === 0 && other._factorization.size === 0) {
      return true
    }
    
    // Different number of prime factors mean numbers are not equal
    if (this._factorization.size !== other._factorization.size) {
      return false
    }
    
    // Check if all prime factors and their exponents match
    for (const [prime, exponent] of this._factorization.entries()) {
      if (!other._factorization.has(prime) || other._factorization.get(prime) !== exponent) {
        return false
      }
    }
    
    return true
  }

  /**
   * Compare this UniversalNumber with another number
   * 
   * @param {number|string|BigInt|UniversalNumber} other - The number to compare with
   * @returns {number} -1 if this < other, 0 if this === other, 1 if this > other
   */
  compareTo(other) {
    // Convert to UniversalNumber if necessary
    const otherNum = other instanceof UniversalNumber ? 
      other : 
      new UniversalNumber(other)
    
    // Special cases for 1 and -1
    if (this._factorization.size === 0 && otherNum._factorization.size === 0) {
      if (this._isNegative === otherNum._isNegative) {
        return 0
      }
      return this._isNegative ? -1 : 1
    }
    
    // Negative numbers are always less than positive numbers
    if (this._isNegative && !otherNum._isNegative) {
      return -1
    }
    
    if (!this._isNegative && otherNum._isNegative) {
      return 1
    }
    
    // Convert both to BigInt for comparison
    const thisValue = this.toBigInt()
    const otherValue = otherNum.toBigInt()
    
    // For negative numbers, the comparison is reversed
    if (this._isNegative) {
      if (thisValue < otherValue) {
        return 1
      } else if (thisValue > otherValue) {
        return -1
      } else {
        return 0
      }
    } else {
      if (thisValue < otherValue) {
        return -1
      } else if (thisValue > otherValue) {
        return 1
      } else {
        return 0
      }
    }
  }

  /**
   * Get the absolute value of this UniversalNumber
   * 
   * @returns {UniversalNumber} A new UniversalNumber with the same magnitude but positive sign
   */
  abs() {
    if (!this._isNegative) {
      return new UniversalNumber(this)
    }
    
    return new UniversalNumber({
      factorization: this._factorization,
      isNegative: false
    })
  }

  /**
   * Negate this UniversalNumber
   * 
   * @returns {UniversalNumber} A new UniversalNumber with the same magnitude but opposite sign
   */
  negate() {
    return new UniversalNumber({
      factorization: this._factorization,
      isNegative: !this._isNegative
    })
  }

  /**
   * Get the sign of this UniversalNumber
   * 
   * @returns {number} -1 if negative, 1 if positive
   */
  sign() {
    return this._isNegative ? -1 : 1
  }

  /**
   * Check if this UniversalNumber is 1
   * 
   * @returns {boolean} True if this number is 1, false otherwise
   */
  isOne() {
    return this._factorization.size === 0 && !this._isNegative && !this._isZero
  }
  
  /**
   * Check if this UniversalNumber is 0
   * 
   * @returns {boolean} True if this number is 0, false otherwise
   */
  isZero() {
    return this._isZero
  }

  /**
   * Convert the UniversalNumber to a native JavaScript primitive
   * Used for automatic conversion in expressions
   * 
   * @returns {BigInt} The BigInt representation of the number
   */
  valueOf() {
    return this.toBigInt()
  }

  /**
   * Convert the UniversalNumber to a serializable object
   * For use with JSON.stringify
   * 
   * @returns {Object} Object with type, factors, and sign information
   */
  toJSON() {
    const factorObj = {}
    
    for (const [prime, exponent] of this._factorization.entries()) {
      // @ts-ignore
      factorObj[prime.toString()] = exponent.toString()
    }
    
    return {
      type: 'UniversalNumber',
      factors: factorObj,
      isNegative: this._isNegative
    }
  }

  /**
   * Create a UniversalNumber from a JSON representation
   * 
   * @param {Object} json - The JSON object
   * @returns {UniversalNumber} A new UniversalNumber
   * @throws {PrimeMathError} If the JSON is invalid
   */
  static fromJSON(json) {
    if (typeof json !== 'object' || json === null) {
      throw new PrimeMathError('Invalid JSON: must be an object')
    }
    
    // @ts-ignore
    const jsonObj = json
    
    // @ts-ignore
    if (jsonObj.type !== 'UniversalNumber') {
      // @ts-ignore
      throw new PrimeMathError(`Invalid type: ${jsonObj.type}`)
    }
    
    // @ts-ignore
    if (typeof jsonObj.factors !== 'object' || jsonObj.factors === null) {
      throw new PrimeMathError('Invalid factors: must be an object')
    }
    
    const factorization = new Map()
    
    // @ts-ignore
    for (const [primeStr, exponentStr] of Object.entries(jsonObj.factors)) {
      try {
        const prime = BigInt(primeStr)
        const exponent = BigInt(exponentStr)
        if (prime <= 1n) {
          throw new PrimeMathError(`Prime factor ${prime} must be greater than 1`)
        }
        if (exponent <= 0n) {
          throw new PrimeMathError(`Exponent for prime ${prime} must be positive`)
        }
        factorization.set(prime, exponent)
      } catch (error) {
        if (error instanceof PrimeMathError) {
          throw error
        }
        throw new PrimeMathError(`Invalid factor: ${primeStr}^${exponentStr}`)
      }
    }
    
    return new UniversalNumber({
      factorization,
      // @ts-ignore
      isNegative: !!jsonObj.isNegative
    })
  }

  /**
   * Verify round-trip consistency between UniversalNumber and standard number formats
   * This is used to ensure that conversions don't lose information
   * 
   * @param {number|string|BigInt} value - The value to test for round-trip consistency
   * @returns {boolean} True if conversions are consistent, false otherwise
   */
  static verifyRoundTrip(value) {
    try {
      // Convert to UniversalNumber
      const univNum = new UniversalNumber(value)
      
      // Convert back to original format
      let roundTrip
      if (typeof value === 'number') {
        roundTrip = univNum.toNumber()
      } else if (typeof value === 'string') {
        roundTrip = univNum.toString()
      } else if (typeof value === 'bigint') {
        roundTrip = univNum.toBigInt()
      } else {
        return false
      }
      
      // Check if the round-trip conversion is consistent
      return value == roundTrip // Use loose equality to handle string/number conversions
    } catch (error) {
      return false
    }
  }
}

/**
 * Calculate the coherence inner product between two UniversalNumber instances
 * The coherence inner product is a positive-definite inner product that measures 
 * consistency between different representations of the same abstract number
 * 
 * @param {UniversalNumber} a - First UniversalNumber
 * @param {UniversalNumber} b - Second UniversalNumber
 * @returns {UniversalNumber} The coherence inner product value
 */
UniversalNumber.innerProduct = function(a, b) {
  if (!(a instanceof UniversalNumber) || !(b instanceof UniversalNumber)) {
    throw new PrimeMathError('Both arguments must be UniversalNumber instances')
  }

  // Start with the base component (always present)
  let result = new Map()
  
  // Combine the prime factors from both numbers to calculate inner product
  const allPrimes = new Set([
    ...a._factorization.keys(),
    ...b._factorization.keys()
  ])

  // The coherence inner product is defined as the sum of products of corresponding components
  // For prime factorization representation, we use the product of matching exponents
  for (const prime of allPrimes) {
    const aExp = a._factorization.get(prime) || 0n
    const bExp = b._factorization.get(prime) || 0n
    
    // Only add to result if both have this prime factor
    if (aExp > 0n && bExp > 0n) {
      // Inner product component is the product of the exponents
      result.set(prime, aExp * bExp)
    }
  }

  // Return a UniversalNumber with the inner product components
  return new UniversalNumber({
    factorization: result,
    isNegative: false // Inner product is always positive by definition
  })
}

/**
 * Calculate the coherence norm of a UniversalNumber
 * The coherence norm measures how consistent a number's representation is
 * A minimal-norm representation is the canonical form in the Prime Framework
 * 
 * @returns {UniversalNumber} The coherence norm value
 */
UniversalNumber.prototype.coherenceNorm = function() {
  // The norm is the square root of the inner product with itself
  const innerProduct = UniversalNumber.innerProduct(this, this)
  
  // For prime factorization, the norm-squared is the sum of squares of exponents
  // We return the inner product directly as the squared norm value
  return innerProduct
}

/**
 * Check if this UniversalNumber is in minimal-norm canonical form
 * In the Prime Framework, the minimal-norm representation is the unique canonical form
 * 
 * @returns {boolean} True if the number is in minimal-norm form
 */
UniversalNumber.prototype.isMinimalNorm = function() {
  // In our implementation, UniversalNumbers are always normalized to canonical form
  // So this is equivalent to checking if the normalization is correct
  return this._verifyNormalization()
}

/**
 * Calculate the coherence distance between this UniversalNumber and another
 * The coherence distance measures how "far apart" two numbers are in the fiber algebra
 * 
 * @param {UniversalNumber} other - The other UniversalNumber
 * @returns {UniversalNumber} The coherence distance
 */
UniversalNumber.prototype.coherenceDistance = function(other) {
  if (!(other instanceof UniversalNumber)) {
    throw new PrimeMathError('Argument must be a UniversalNumber instance')
  }
  
  // The coherence distance is defined as the norm of the difference
  const difference = this.subtract(other)
  return difference.coherenceNorm()
}

/**
 * Reference frame registry for the Prime Framework's algebraic structure
 * Stores and manages the different reference frames in which numbers can be represented
 * @private
 */
const _referenceFrameRegistry = {
  /**
   * The currently active reference frame
   */
  currentFrame: 'standard',
  
  /**
   * Registry of all available reference frames
   */
  frames: new Map([
    ['standard', {
      id: 'standard',
      transformationRules: {},
      description: 'Standard reference frame for the Prime Framework'
    }]
  ]),
  
  /**
   * Get the active reference frame
   * @returns {ReferenceFrame} The active reference frame
   */
  getActiveFrame() {
    return this.frames.get(this.currentFrame)
  },
  
  /**
   * Register a new reference frame
   * @param {ReferenceFrame} frame - The frame to register
   */
  registerFrame(frame) {
    if (!frame.id) {
      throw new PrimeMathError('Reference frame must have an id')
    }
    this.frames.set(frame.id, frame)
  },
  
  /**
   * Set the active reference frame
   * @param {string} frameId - The id of the frame to set as active
   */
  setActiveFrame(frameId) {
    if (!this.frames.has(frameId)) {
      throw new PrimeMathError(`Reference frame "${frameId}" not found`)
    }
    this.currentFrame = frameId
  }
}

/**
 * Get the currently active reference frame in the fiber algebra
 * In the Prime Framework, numbers exist at a point on a smooth manifold M
 * 
 * @returns {string} The identifier of the active reference frame
 */
UniversalNumber.getActiveReferenceFrame = function() {
  return _referenceFrameRegistry.currentFrame
}

/**
 * Set the active reference frame for Prime Framework operations
 * All numbers are interpreted relative to the current reference
 * 
 * @param {string} frameId - The identifier of the reference frame to activate
 * @throws {PrimeMathError} If the reference frame doesn't exist
 */
UniversalNumber.setActiveReferenceFrame = function(frameId) {
  _referenceFrameRegistry.setActiveFrame(frameId)
}

/**
 * Register a new reference frame in the fiber algebra
 * Used for advanced geometric interpretations of the Prime Framework
 * 
 * @param {ReferenceFrame} frame - The reference frame to register
 * @throws {PrimeMathError} If the frame is invalid
 */
UniversalNumber.registerReferenceFrame = function(frame) {
  _referenceFrameRegistry.registerFrame(frame)
}

/**
 * Get this number's graded components in the fiber algebra (Clifford algebra)
 * The graded components represent the number's digit expansions in various bases
 * 
 * @param {Object} options - Options for retrieving graded components
 * @param {number[]} [options.bases=[2,10]] - The bases to include in the graded components
 * @param {string} [options.referenceFrame] - Optional reference frame (defaults to active frame)
 * @returns {Map<number, number[]>} Map of base to array of digits 
 */
UniversalNumber.prototype.getGradedComponents = function(options = {}) {
  const bases = options.bases || [2, 10]
  const refFrame = options.referenceFrame || _referenceFrameRegistry.currentFrame
  
  // Verify the reference frame exists
  if (!_referenceFrameRegistry.frames.has(refFrame)) {
    throw new PrimeMathError(`Reference frame "${refFrame}" not found`)
  }
  
  // Get the digits in each requested base
  const components = new Map()
  for (const base of bases) {
    if (base < 2 || base > 36) {
      throw new PrimeMathError(`Base ${base} is not supported (must be 2-36)`)
    }
    
    // Get the digit expansion in this base
    components.set(base, this.getDigits(base, true))
  }
  
  return components
}

/**
 * Transform this UniversalNumber to a different reference frame
 * Implements symmetry group action (G-action) on the reference manifold
 * 
 * @param {string} targetFrame - The reference frame to transform to
 * @returns {UniversalNumber} The number transformed to the new reference frame
 * @throws {PrimeMathError} If the target frame doesn't exist
 */
UniversalNumber.prototype.transformToFrame = function(targetFrame) {
  // In the default implementation, the factorization remains the same
  // regardless of the reference frame, as it's already canonical
  // This is consistent with the Prime Framework invariance principle
  
  // Verify the target frame exists
  if (!_referenceFrameRegistry.frames.has(targetFrame)) {
    throw new PrimeMathError(`Reference frame "${targetFrame}" not found`)
  }
  
  // The canonical prime factorization is invariant under reference frame transformations
  // So we simply return a copy of the current UniversalNumber
  return new UniversalNumber(this)
}

/**
 * Implement lazy evaluation for arithmetic operations
 * 
 * @private
 * @property {boolean} _isLazy - Whether this UniversalNumber uses lazy evaluation
 * @property {Function|null} _lazyOperation - Function to execute when the value is needed
 * @property {boolean} _isFactorizationComputed - Whether the factorization has been computed
 */
Object.defineProperties(UniversalNumber.prototype, {
  '_isLazy': {
    value: false,
    writable: true,
    enumerable: false,
    configurable: false
  },
  '_lazyOperation': {
    value: null,
    writable: true,
    enumerable: false,
    configurable: false
  },
  '_isFactorizationComputed': {
    value: true,
    writable: true,
    enumerable: false, 
    configurable: false
  }
})

/**
 * Create a UniversalNumber with lazy evaluation
 * 
 * @param {Function} operation - Function to execute when the value is needed
 * @returns {UniversalNumber} A lazily evaluated UniversalNumber
 */
UniversalNumber.lazy = function(operation) {
  if (typeof operation !== 'function') {
    throw new PrimeMathError('Lazy evaluation requires a function')
  }
  
  const result = new UniversalNumber(1) // Placeholder value
  result._isLazy = true
  result._lazyOperation = operation
  result._isFactorizationComputed = false
  return result
}

/**
 * Ensure the factorization is computed for a lazy UniversalNumber
 * @private
 */
UniversalNumber.prototype._ensureComputed = function() {
  if (this._isLazy && !this._isFactorizationComputed) {
    const result = this._lazyOperation()
    if (!(result instanceof UniversalNumber)) {
      throw new PrimeMathError('Lazy operation must return a UniversalNumber')
    }
    
    // Copy the computed value
    this._factorization = result._factorization
    this._isNegative = result._isNegative
    this._isFactorizationComputed = true
  }
}

// Override key methods to support lazy evaluation
const originalToBigInt = UniversalNumber.prototype.toBigInt
UniversalNumber.prototype.toBigInt = function() {
  this._ensureComputed()
  return originalToBigInt.call(this)
}

const originalToString = UniversalNumber.prototype.toString
UniversalNumber.prototype.toString = function(base) {
  this._ensureComputed()
  return originalToString.call(this, base)
}

const originalGetFactorization = UniversalNumber.prototype.getFactorization
UniversalNumber.prototype.getFactorization = function() {
  this._ensureComputed()
  return originalGetFactorization.call(this)
}

/**
 * Apply operation fusion to a sequence of operations
 * This optimizes computation by eliminating intermediate results
 * 
 * @param {Array<Function>} operations - Array of functions to compose
 * @param {UniversalNumber} initialValue - Starting value
 * @returns {UniversalNumber} Result of all operations combined
 */
UniversalNumber.fuse = function(operations, initialValue) {
  if (!Array.isArray(operations) || operations.length === 0) {
    throw new PrimeMathError('Operations array must not be empty')
  }
  
  if (!(initialValue instanceof UniversalNumber)) {
    initialValue = new UniversalNumber(initialValue)
  }
  
  // Create a lazily evaluated universal number
  return UniversalNumber.lazy(() => {
    let result = initialValue
    for (const operation of operations) {
      result = operation(result)
    }
    return result
  })
}

/**
 * Create a compacted representation of this UniversalNumber
 * Memory-optimized representation for very large numbers
 * 
 * @returns {Object} Compact serializable representation
 */
UniversalNumber.prototype.toCompact = function() {
  this._ensureComputed()
  
  // Simple compression: only store non-zero exponents
  const compactFactors = {}
  
  for (const [prime, exponent] of this._factorization.entries()) {
    if (exponent > 0n) {
      compactFactors[prime.toString()] = exponent.toString()
    }
  }
  
  return {
    type: 'CompactUniversalNumber',
    sign: this._isNegative ? -1 : 1,
    factors: compactFactors
  }
}

/**
 * Create a UniversalNumber from a compact representation
 * 
 * @param {Object} compact - Compact representation created by toCompact()
 * @returns {UniversalNumber} The reconstructed UniversalNumber
 */
UniversalNumber.fromCompact = function(compact) {
  if (typeof compact !== 'object' || compact === null) {
    throw new PrimeMathError('Invalid compact representation')
  }
  
  if (compact.type !== 'CompactUniversalNumber') {
    throw new PrimeMathError('Invalid compact representation type')
  }
  
  const factorization = new Map()
  
  // Reconstruct the factorization map
  for (const [primeStr, exponentStr] of Object.entries(compact.factors)) {
    const prime = BigInt(primeStr)
    const exponent = BigInt(exponentStr)
    factorization.set(prime, exponent)
  }
  
  return new UniversalNumber({
    factorization,
    isNegative: compact.sign < 0
  })
}

/**
 * Support for partial factorization of very large numbers
 * 
 * @typedef {Object} PartialFactorization
 * @property {Map<BigInt, BigInt>} knownFactors - Factors that have been found
 * @property {BigInt} remainingPart - Part that hasn't been factorized yet
 */

/**
 * Create a UniversalNumber with partially known factorization
 * Useful for very large numbers where complete factorization is impractical
 * 
 * @param {Object} params - Parameters for partial factorization
 * @param {Array<{prime: BigInt|number|string, exponent: BigInt|number|string}>|Map<BigInt, BigInt>} params.knownFactors - Known prime factors
 * @param {BigInt|number|string} params.remainingPart - The unfactorized part (must be > 1)
 * @param {boolean} [params.isNegative=false] - Whether the number is negative
 * @returns {UniversalNumber} A new UniversalNumber with partial factorization
 */
UniversalNumber.fromPartialFactorization = function(params) {
  if (!params || typeof params !== 'object') {
    throw new PrimeMathError('Invalid partial factorization parameters')
  }
  
  const { knownFactors, remainingPart, isNegative = false } = params
  
  // Convert remainingPart to BigInt
  const remaining = toBigInt(remainingPart)
  
  if (remaining <= 1n) {
    throw new PrimeMathError('Remaining part must be greater than 1')
  }
  
  // Process known factors
  const factorsMap = knownFactors instanceof Map ?
    new Map(knownFactors) :
    factorArrayToMap(knownFactors.map(f => ({
      prime: typeof f.prime === 'bigint' ? f.prime : toBigInt(f.prime),
      exponent: typeof f.exponent === 'bigint' ? f.exponent : toBigInt(f.exponent)
    })))
  
  // If the remaining part is prime, add it directly to the factorization
  if (isPrime(remaining)) {
    const currentExp = factorsMap.get(remaining) || 0n
    factorsMap.set(remaining, currentExp + 1n)
    
    return new UniversalNumber({
      factorization: factorsMap,
      isNegative: !!isNegative
    })
  }
  
  // Otherwise, create a lazy UniversalNumber that will factor the remaining part when needed
  return UniversalNumber.lazy(() => {
    // Factorize the remaining part
    const remainingFactors = factorizeOptimal(remaining)
    
    // Combine with known factors
    const combined = new Map(factorsMap)
    
    for (const [prime, exponent] of remainingFactors.entries()) {
      const currentExp = combined.get(prime) || 0n
      combined.set(prime, currentExp + exponent)
    }
    
    return new UniversalNumber({
      factorization: combined,
      isNegative: !!isNegative
    })
  })
}

/**
 * Calculate modular square root if it exists
 * Finds x such that x^2 ≡ this (mod n)
 * 
 * @param {UniversalNumber|BigInt|number|string} modulus - The modulus
 * @returns {UniversalNumber|null} The modular square root if it exists, null otherwise
 */
UniversalNumber.prototype.modSqrt = function(modulus) {
  const modulusNum = modulus instanceof UniversalNumber ?
    modulus :
    new UniversalNumber(modulus)
  
  const a = this.mod(modulusNum).toBigInt()
  const m = modulusNum.toBigInt()
  
  // Handle special cases
  if (a === 0n) return new UniversalNumber(0n)
  if (m === 2n) return new UniversalNumber(a % 2n)
  
  // Check if a is a quadratic residue modulo m using Euler's criterion
  if (!quadraticResidue(a, m)) {
    return null // No square root exists
  }
  
  // If m ≡ 3 (mod 4), we can use the formula r = a^((m+1)/4) mod m
  if (m % 4n === 3n) {
    const exp = (m + 1n) / 4n
    return this.modPow(exp, modulusNum)
  }
  
  // For m ≡ 1 (mod 4), use Tonelli-Shanks algorithm
  // (This is a simplified implementation)
  let q = m - 1n
  let s = 0n
  
  // Factor out powers of 2 from q
  while (q % 2n === 0n) {
    q /= 2n
    s++
  }
  
  // Find a non-residue modulo m
  let z = 2n
  while (quadraticResidue(z, m)) {
    z++
  }
  
  // Initialize variables for the algorithm
  let c = fastExp(z, q, m)
  let r = fastExp(a, (q + 1n) / 2n, m)
  let t = fastExp(a, q, m)
  let m2 = m
  
  while (t !== 1n) {
    // Find the lowest i, 0 < i < s, such that t^(2^i) ≡ 1 (mod m)
    let i = 0n
    let temp = t
    while (temp !== 1n) {
      temp = (temp * temp) % m2
      i++
      if (i >= s) return null // Should not happen if a is a QR
    }
    
    // Update variables
    const b = fastExp(c, fastExp(2n, s - i - 1n, m2 - 1n), m2)
    r = (r * b) % m2
    c = (b * b) % m2
    t = (t * c) % m2
    s = i
  }
  
  return new UniversalNumber(r)
  
  // Helper function for modular exponentiation
  function fastExp(base, exp, mod) {
    let result = 1n
    base = base % mod
    
    while (exp > 0n) {
      if (exp % 2n === 1n) {
        result = (result * base) % mod
      }
      base = (base * base) % mod
      exp = exp / 2n
    }
    
    return result
  }
  
  // Helper function to check if a is a quadratic residue modulo p
  function quadraticResidue(a, p) {
    // Use Euler's criterion: a^((p-1)/2) ≡ 1 (mod p) if a is a QR
    const power = (p - 1n) / 2n
    return fastExp(a, power, p) === 1n
  }
}

/**
 * Perform fast multiplication when operands have many small prime factors
 * Optimized for the Prime Framework's universal coordinates
 * 
 * @param {UniversalNumber} a - First number
 * @param {UniversalNumber} b - Second number
 * @returns {UniversalNumber} Product a × b
 */
UniversalNumber.fastMultiply = function(a, b) {
  if (!(a instanceof UniversalNumber) || !(b instanceof UniversalNumber)) {
    throw new PrimeMathError('Both arguments must be UniversalNumber instances')
  }
  
  // Use lazy evaluation to defer the actual computation
  return UniversalNumber.lazy(() => {
    // Ensure both a and b have their factorizations computed
    a._ensureComputed()
    b._ensureComputed()
    
    // Create a new factorization map by merging prime exponents
    const resultFactorization = new Map(a._factorization)
    
    // Calculate the sign of the result
    const resultIsNegative = a._isNegative !== b._isNegative
    
    // Combine prime factors by adding exponents (core of factorization-based multiplication)
    for (const [prime, exponent] of b._factorization.entries()) {
      const currentExponent = resultFactorization.get(prime) || 0n
      resultFactorization.set(prime, currentExponent + exponent)
    }
    
    // Create a new UniversalNumber with the combined factorization
    return new UniversalNumber({
      factorization: resultFactorization,
      isNegative: resultIsNegative
    })
  })
}

module.exports = UniversalNumber