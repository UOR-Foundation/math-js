/**
 * Conversion module for the UOR Math-JS library
 * Provides utilities for converting between different number representations
 * Supports full interoperability between standard JavaScript number types and UniversalNumber
 * Implements the conversion utilities specified in the Prime Framework
 * 
 * @module Conversion
 */

const { PrimeMathError, toBigInt } = require('./Utils')
const { factorizeOptimal, fromPrimeFactors } = require('./Factorization')

/**
 * Helper function to safely extract error message
 * 
 * @param {unknown} error - Any error value
 * @returns {string} The error message
 */
function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error)
}

// Import for type checking, will be properly integrated when UniversalNumber is implemented
/** @type {any} */
let UniversalNumber
try {
  // @ts-ignore - Module may not exist yet
  UniversalNumber = require('./UniversalNumber')
} catch (e) {
  // UniversalNumber module not yet available
  UniversalNumber = null
}

/**
 * Validates if a string is a valid representation of a number in the given base
 * 
 * @param {string} str - The string to validate
 * @param {number} base - The base of the number representation (2-36)
 * @returns {boolean} True if the string is a valid representation
 */
function validateStringForBase(str, base) {
  if (typeof str !== 'string' || str.length === 0) {
    return false
  }

  // Handle negative sign
  let startIndex = 0
  if (str[0] === '-' || str[0] === '+') {
    startIndex = 1
    if (str.length === 1) {
      return false
    }
  }

  // Get valid digits for the base
  const validChars = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, base)
  
  // Check each character
  for (let i = startIndex; i < str.length; i++) {
    if (!validChars.includes(str[i].toLowerCase())) {
      return false
    }
  }
  
  return true
}

/**
 * Convert a number from one base to another
 * 
 * @param {string|number|BigInt} value - The value to convert
 * @param {number} [fromBase=10] - The base of the input (default is decimal)
 * @param {number} [toBase=10] - The base to convert to (default is decimal)
 * @returns {string} The converted value as a string
 * @throws {PrimeMathError} If the value cannot be converted or the base is invalid
 */
function convertBase(value, fromBase = 10, toBase = 10) {
  // Check validity of bases
  if (!Number.isInteger(fromBase) || fromBase < 2 || fromBase > 36) {
    throw new PrimeMathError(`Invalid fromBase: ${fromBase} (must be 2-36)`)
  }
  if (!Number.isInteger(toBase) || toBase < 2 || toBase > 36) {
    throw new PrimeMathError(`Invalid toBase: ${toBase} (must be 2-36)`)
  }

  // Handle string inputs
  if (typeof value === 'string') {
    if (!validateStringForBase(value, fromBase)) {
      throw new PrimeMathError(`Invalid characters in string for base-${fromBase}: ${value}`)
    }
    // Use BigInt for the conversion
    try {
      const negative = value.startsWith('-')
      const absValue = negative ? value.slice(1) : value
      
      // Parse the absolute value into BigInt
      let bigIntValue
      if (fromBase === 10) {
        // Use BigInt constructor directly for base 10
        bigIntValue = BigInt(absValue)
      } else {
        // Convert digit by digit for other bases
        bigIntValue = [...absValue].reduce((acc, digit) => {
          const digitValue = parseInt(digit, fromBase)
          return acc * BigInt(fromBase) + BigInt(digitValue)
        }, 0n)
      }
      
      // Apply the sign
      const signedValue = negative ? -bigIntValue : bigIntValue
      
      // Convert to the desired base
      if (toBase === 10) {
        return signedValue.toString()
      }
      
      // For other bases, convert the magnitude and add sign if needed
      return (negative ? '-' : '') + convertBigIntToBase(bigIntValue, toBase)
    } catch (error) {
      throw new PrimeMathError(`Failed to convert ${value} from base-${fromBase} to base-${toBase}: ${getErrorMessage(error)}`)
    }
  }
  
  // Handle numeric/BigInt inputs
  try {
    // Convert to BigInt first
    const bigIntValue = toBigInt(value)
    
    // Handle sign separately
    const negative = bigIntValue < 0n
    const absBigInt = negative ? -bigIntValue : bigIntValue
    
    // Convert to the target base
    if (toBase === 10) {
      return bigIntValue.toString()
    }
    
    return (negative ? '-' : '') + convertBigIntToBase(absBigInt, toBase)
  } catch (error) {
    if (error instanceof PrimeMathError) {
      throw error
    }
    throw new PrimeMathError(`Failed to convert ${value} to base-${toBase}: ${getErrorMessage(error)}`)
  }
}

/**
 * Convert a BigInt to a string representation in the given base
 * 
 * @param {BigInt} value - The BigInt value to convert
 * @param {number} base - The base to convert to (2-36)
 * @returns {string} The string representation in the given base
 */
function convertBigIntToBase(value, base) {
  if (value === 0n) {
    return '0'
  }
  
  const digits = '0123456789abcdefghijklmnopqrstuvwxyz'
  let result = ''
  let remaining = value
  
  while (remaining > 0n) {
    const index = Number(remaining % BigInt(base))
    result = digits[index] + result
    remaining = remaining / BigInt(base)
  }
  
  return result
}

/**
 * Extract the digits of a number in a specific base
 * 
 * @param {number|string|BigInt} value - The value to extract digits from
 * @param {number} [base=10] - The base to use for extraction (default is decimal)
 * @param {boolean} [leastSignificantFirst=false] - If true, returns digits with least significant first
 * @returns {number[]} Array of digits in the specified base
 * @throws {PrimeMathError} If the value is invalid or the base is not supported
 */
function getDigits(value, base = 10, leastSignificantFirst = false) {
  // Validate base
  if (!Number.isInteger(base) || base < 2 || base > 36) {
    throw new PrimeMathError(`Invalid base: ${base} (must be 2-36)`)
  }
  
  try {
    // Convert value to BigInt
    const bigIntValue = toBigInt(value)
    
    // Handle negative values (we extract digits from absolute value)
    const absBigInt = bigIntValue < 0n ? -bigIntValue : bigIntValue
    
    // Handle zero specially
    if (absBigInt === 0n) {
      return [0]
    }
    
    // Extract digits
    const digits = []
    let remaining = absBigInt
    
    while (remaining > 0n) {
      const digit = Number(remaining % BigInt(base))
      digits.push(digit)
      remaining = remaining / BigInt(base)
    }
    
    // Digits are extracted least significant first
    // If most significant first is requested, reverse the array
    return leastSignificantFirst ? digits : digits.reverse()
  } catch (error) {
    if (error instanceof PrimeMathError) {
      throw error
    }
    throw new PrimeMathError(`Failed to extract digits from ${value}: ${getErrorMessage(error)}`)
  }
}

/**
 * Convert a number to a string representation in scientific notation
 * 
 * @param {number|string|BigInt} value - The value to convert
 * @param {number} [precision=6] - Number of significant digits to include
 * @returns {string} The number in scientific notation
 * @throws {PrimeMathError} If the value is invalid
 */
function toScientificNotation(value, precision = 6) {
  try {
    // For small enough numbers, use JavaScript's built-in method
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value.toExponential(precision)
    }
    
    // Try to convert to BigInt (will throw for floating-point strings)
    try {
      const bigIntValue = toBigInt(value)
      const isNegative = bigIntValue < 0n
      const absValue = isNegative ? -bigIntValue : bigIntValue
      
      // Convert to string in base 10
      const str = absValue.toString()
      
      if (str.length === 1) {
        // Single digit doesn't need scientific notation
        return (isNegative ? '-' : '') + str + '.0e+0'
      }
      
      // Format in scientific notation
      const firstDigit = str[0]
      const exponent = str.length - 1
      
      let fractionalPart = ''
      if (str.length > 1) {
        // Get enough digits for the requested precision
        fractionalPart = str.substring(1, Math.min(precision + 1, str.length))
        
        // Pad with zeros if needed
        if (fractionalPart.length < precision) {
          fractionalPart = fractionalPart.padEnd(precision, '0')
        }
      } else {
        fractionalPart = '0'.repeat(precision)
      }
      
      return (isNegative ? '-' : '') + `${firstDigit}.${fractionalPart}e+${exponent}`
    } catch (e) {
      // For floats (like "0.123"), use JavaScript's built-in handling
      if (typeof value === 'string' && value.includes('.')) {
        const floatValue = parseFloat(value)
        if (!isNaN(floatValue)) {
          return floatValue.toExponential(precision)
        }
      }
      throw e
    }
  } catch (error) {
    if (error instanceof PrimeMathError) {
      throw error
    }
    throw new PrimeMathError(`Failed to convert ${value} to scientific notation: ${getErrorMessage(error)}`)
  }
}

/**
 * Convert a number, string, or BigInt to a fraction (numerator/denominator)
 * This is useful for exact representation of decimal values
 * 
 * @param {string|number|BigInt} value - The value to convert (eg. "3.14159", 3.14159, or BigInt)
 * @returns {{numerator: BigInt, denominator: BigInt}} Object with numerator and denominator as BigInt values
 * @throws {PrimeMathError} If the value is not a valid number
 */
function toFraction(value) {
  // Handle BigInt directly
  if (typeof value === 'bigint') {
    return {
      numerator: value,
      denominator: 1n
    }
  }
  
  // Handle JavaScript number
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new PrimeMathError('Cannot convert infinite or NaN value to fraction')
    }
    
    // Handle negative numbers explicitly
    const isNegative = value < 0
    const absValue = Math.abs(value)
    
    // Convert to fraction
    const str = absValue.toString()
    const decimalIndex = str.indexOf('.')
    
    if (decimalIndex === -1) {
      // Integer value
      return {
        numerator: isNegative ? -BigInt(str) : BigInt(str),
        denominator: 1n
      }
    }
    
    // Handle decimal part
    const integerPart = str.substring(0, decimalIndex) || '0'
    const fractionalPart = str.substring(decimalIndex + 1)
    
    if (fractionalPart.length === 0) {
      // No fractional part, just integer
      return {
        numerator: isNegative ? -BigInt(integerPart) : BigInt(integerPart),
        denominator: 1n
      }
    }
    
    // Convert to fraction
    const numerator = BigInt(integerPart + fractionalPart)
    const denominator = 10n ** BigInt(fractionalPart.length)
    
    // Calculate GCD to simplify the fraction
    const gcd = calculateGCD(numerator, denominator)
    
    return {
      numerator: isNegative ? -numerator / gcd : numerator / gcd,
      denominator: denominator / gcd
    }
  }
  
  try {
    // Handle string representation of a decimal
    if (typeof value === 'string') {
      // For string inputs, we can safely parse as a JavaScript number first
      // This handles all the parsing details for us, including negative values,
      // and is more consistent with the way the Number constructor handles strings
      if (value.includes('.')) {
        const numValue = parseFloat(value)
        if (isNaN(numValue)) {
          throw new PrimeMathError(`Invalid decimal string: ${value}`)
        }
        
        // Now call toFraction with the numeric value (reuse existing implementation)
        return toFraction(numValue)
      } else {
        // No decimal point, just convert to BigInt
        return {
          numerator: toBigInt(value),
          denominator: 1n
        }
      }
    }
    
    // For other types, try to convert to string first
    return toFraction(String(value))
  } catch (error) {
    if (error instanceof PrimeMathError) {
      throw error
    }
    throw new PrimeMathError(`Failed to convert ${value} to fraction: ${getErrorMessage(error)}`)
  }
}

/**
 * Calculate the greatest common divisor (GCD) for fraction simplification
 * 
 * @param {BigInt} a - First number
 * @param {BigInt} b - Second number
 * @returns {BigInt} The GCD
 */
function calculateGCD(a, b) {
  a = a < 0n ? -a : a
  b = b < 0n ? -b : b
  
  if (b === 0n) {
    return a
  }
  
  return calculateGCD(b, a % b)
}

/**
 * Create a string representation of a prime factorization
 * 
 * @param {Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>, isNegative: boolean}} factorsInput - Map of prime factors or object with factorization and sign
 * @returns {string} Human-readable representation of the factorization (with optional negative sign)
 */
function factorizationToString(factorsInput) {
  // Extract the factorization and sign flag
  let factors
  let isNegative = false
  
  if (factorsInput && typeof factorsInput === 'object' && 'factorization' in factorsInput) {
    factors = factorsInput.factorization
    isNegative = !!factorsInput.isNegative
  } else if (factorsInput instanceof Map) {
    factors = factorsInput
  } else {
    throw new PrimeMathError('Invalid factorization format')
  }
  
  if (factors.size === 0) {
    return isNegative ? '-1' : '1' // Empty factorization represents 1
  }
  
  const terms = []
  
  // Sort factors by prime value for consistent output
  const sortedFactors = [...factors.entries()]
    .sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)
  
  for (const [prime, exponent] of sortedFactors) {
    if (exponent === 1n) {
      terms.push(`${prime}`)
    } else {
      terms.push(`${prime}^${exponent}`)
    }
  }
  
  const result = terms.join(' × ')
  return isNegative ? '-(' + result + ')' : result
}

/**
 * Parses a string representation of a prime factorization
 * Accepts formats like "2^3 × 3^2 × 5", "2^3 * 3^2 * 5", "2*2*2*3*3*5", a single term like "2^4"
 * Also handles negative representations like "-(2^3 × 3)" or "-1"
 * 
 * @param {string} str - The string representation of the factorization
 * @param {Object} [options] - Optional parameters for parsing
 * @param {boolean} [options.withSignFlag=false] - Whether to include a sign flag in the result
 * @returns {Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>, isNegative: boolean}} Map of prime factors (or with sign flag if requested)
 * @throws {PrimeMathError} If the string is not a valid factorization
 */
function parseFactorization(str, options = {}) {
  const { withSignFlag = false } = options
  
  try {
    // Check for negative sign
    const isNegative = str.trim().startsWith('-')
    let contentStr = str.trim()
    
    if (isNegative) {
      // Remove the negative sign and any enclosing parentheses if present
      contentStr = contentStr.substring(1).trim()
      if (contentStr.startsWith('(') && contentStr.endsWith(')')) {
        contentStr = contentStr.substring(1, contentStr.length - 1).trim()
      }
    }
    
    // Special case for "1" or "-1" which represents the empty factorization
    if (contentStr === '1') {
      const emptyMap = new Map()
      
      return withSignFlag ? 
        {
          factorization: emptyMap,
          isNegative
        } : 
        emptyMap
    }
    
    // Remove all whitespace
    const cleanStr = contentStr.replace(/\s+/g, '')
    
    // Match one of the common factorization formats
    const factors = new Map()
    
    // Check if it's in the format like "2^3 × 3^2 × 5"
    if (cleanStr.includes('×') || cleanStr.includes('*')) {
      // Split by multiplication symbols
      const terms = cleanStr.split(/[×*]/)
      
      for (const term of terms) {
        if (term.includes('^')) {
          // Term has an exponent
          const [primeStr, exponentStr] = term.split('^')
          const prime = toBigInt(primeStr)
          const exponent = toBigInt(exponentStr)
          
          // Update the factor map
          const currentExponent = factors.get(prime) || 0n
          factors.set(prime, currentExponent + exponent)
        } else if (term) {
          // Term is just a prime
          const prime = toBigInt(term)
          
          // Update the factor map
          const currentExponent = factors.get(prime) || 0n
          factors.set(prime, currentExponent + 1n)
        }
      }
    } else if (cleanStr.includes('^')) {
      // Handle a single term with an exponent like "2^4"
      const [primeStr, exponentStr] = cleanStr.split('^')
      const prime = toBigInt(primeStr)
      const exponent = toBigInt(exponentStr)
      
      factors.set(prime, exponent)
    } else {
      // Try parsing as a product of primes (if it contains multiplication dots)
      // or as a single prime number
      if (cleanStr.includes('·')) {
        const terms = cleanStr.split('·')
        
        for (const term of terms) {
          if (term) {
            const prime = toBigInt(term)
            
            // Update the factor map
            const currentExponent = factors.get(prime) || 0n
            factors.set(prime, currentExponent + 1n)
          }
        }
      } else {
        // Single number - treat as a single prime with exponent 1
        const value = toBigInt(cleanStr)
        if (value > 1n) {
          factors.set(value, 1n)
        }
      }
    }
    
    // Return the factorization with or without sign flag based on the option
    return withSignFlag ? 
      {
        factorization: factors,
        isNegative
      } : 
      factors
  } catch (error) {
    throw new PrimeMathError(`Invalid factorization string: ${str}`)
  }
}

/**
 * Serializes number data to JSON format
 * 
 * @param {Object} data - The number data to serialize
 * @param {BigInt|Map<BigInt, BigInt>} data.value - The numeric value or prime factorization
 * @param {boolean} [data.isFactorization=false] - If true, value is treated as factorization
 * @returns {string} JSON string representation
 */
function toJSON(data) {
  const { value, isFactorization = false } = data
  
  try {
    if (isFactorization) {
      // Serialize factorization
      /** @type {Record<string, string>} */
      const factorObj = {}
      
      // Ensure value is a Map and not a BigInt
      if (!(value instanceof Map)) {
        throw new PrimeMathError('Value is not a valid factorization Map')
      }
      
      for (const [prime, exponent] of value.entries()) {
        const primeKey = prime.toString()
        factorObj[primeKey] = exponent.toString()
      }
      
      return JSON.stringify({
        type: 'Factorization',
        factors: factorObj
      })
    } else {
      // Serialize BigInt value
      if (typeof value !== 'bigint') {
        throw new PrimeMathError('Value is not a valid BigInt')
      }
      
      return JSON.stringify({
        type: 'BigInt',
        value: value.toString()
      })
    }
  } catch (error) {
    throw new PrimeMathError(`Failed to serialize to JSON: ${getErrorMessage(error)}`)
  }
}

/**
 * Parses a JSON string back to number data
 * 
 * @param {string} json - The JSON string to parse
 * @returns {ParsedJSONResult} The parsed data (either BigInt value or prime factorization)
 * @throws {PrimeMathError} If the JSON is invalid or cannot be parsed
 * @typedef {Object} ParsedJSONResult
 * @property {BigInt|Map<BigInt, BigInt>} value - The numeric value or prime factorization
 * @property {boolean} isFactorization - Whether the value is a factorization (true) or BigInt (false)
 */
function fromJSON(json) {
  try {
    const data = JSON.parse(json)
    
    if (!data.type) {
      throw new Error('Missing type field')
    }
    
    if (data.type === 'BigInt') {
      /** @type {ParsedJSONResult} */
      const result = {
        value: toBigInt(data.value),
        isFactorization: false
      }
      return result
    } else if (data.type === 'Factorization') {
      if (!data.factors) {
        throw new Error('Missing factors field')
      }
      
      const factorMap = new Map()
      
      for (const [prime, exponent] of Object.entries(data.factors)) {
        factorMap.set(toBigInt(prime), toBigInt(exponent))
      }
      
      /** @type {ParsedJSONResult} */
      const result = {
        value: factorMap,
        isFactorization: true
      }
      return result
    } else {
      throw new Error(`Unknown type: ${data.type}`)
    }
  } catch (error) {
    throw new PrimeMathError(`Failed to parse JSON: ${getErrorMessage(error)}`)
  }
}

/**
 * Convert a JavaScript Number to a factorized universal representation
 * Floors the number if it's not an integer, throws an error if not safe (above 2^53)
 * 
 * @param {number} n - The JavaScript Number to convert
 * @returns {{factorization: Map<BigInt, BigInt>, isNegative: boolean}} The prime factorization (universal coordinates) and sign flag
 * @throws {PrimeMathError} If the number is not safe or is not finite
 */
function fromNumber(n) {
  if (!Number.isFinite(n)) {
    throw new PrimeMathError('Cannot convert infinite or NaN value to universal coordinates')
  }
  
  if (!Number.isSafeInteger(n) && n !== Math.floor(n)) {
    throw new PrimeMathError(`Number ${n} is not a safe integer (exceeds 2^53)`)
  }
  
  // Floor the number if it's not an integer
  const intValue = Math.floor(n)
  
  // Check if negative
  const isNegative = intValue < 0
  
  // Convert to BigInt and factorize, using absolute value
  const factorization = fromBigInt(BigInt(isNegative ? -intValue : intValue))
  
  // Return factorization with sign flag
  return {
    factorization,
    isNegative
  }
}

/**
 * Convert a BigInt to a factorized universal representation
 * 
 * @param {BigInt} b - The BigInt value to convert
 * @returns {Map<BigInt, BigInt>} The prime factorization (universal coordinates)
 * @throws {PrimeMathError} If the value is zero
 */
function fromBigInt(b) {
  // Handle negative numbers by returning a sign flag with the factorization
  if (b === 0n) {
    throw new PrimeMathError('Universal coordinates are only defined for non-zero integers')
  }
  
  // Use absolute value for factorization
  const absValue = b < 0n ? -b : b
  
  return factorizeOptimal(absValue)
}

/**
 * Parse a string representing a number in a given base and convert to universal coordinates
 * 
 * @param {string} str - The string representing a number
 * @param {number} [base=10] - The base of the input string (2-36)
 * @returns {{factorization: Map<BigInt, BigInt>, isNegative: boolean}} The prime factorization (universal coordinates) and sign flag
 * @throws {PrimeMathError} If the string cannot be parsed or is zero
 */
function fromString(str, base = 10) {
  if (!validateStringForBase(str, base)) {
    throw new PrimeMathError(`Invalid characters in string for base-${base}: ${str}`)
  }
  
  try {
    // Check for negative sign
    const isNegative = str.startsWith('-')
    const absStr = isNegative ? str.slice(1) : str
    
    // Convert to BigInt based on the base
    let bigIntValue
    
    if (base === 10) {
      bigIntValue = BigInt(absStr)
    } else {
      // Convert digit by digit for other bases
      bigIntValue = [...absStr].reduce((acc, digit) => {
        const digitValue = parseInt(digit, base)
        return acc * BigInt(base) + BigInt(digitValue)
      }, 0n)
    }
    
    if (bigIntValue === 0n) {
      throw new PrimeMathError('Universal coordinates are only defined for non-zero integers')
    }
    
    // Factorize to get universal coordinates
    const factorization = factorizeOptimal(bigIntValue)
    
    // Return factorization with sign flag
    return {
      factorization,
      isNegative
    }
  } catch (error) {
    if (error instanceof PrimeMathError) {
      throw error
    }
    throw new PrimeMathError(`Failed to parse "${str}" in base ${base}: ${getErrorMessage(error)}`)
  }
}

/**
 * Get the digit representation of a number in a specific base
 * This extracts digits directly from the value
 * 
 * @param {number|string|BigInt|Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>, isNegative: boolean}} value - The value or its factorization
 * @param {number} [base=10] - The base to use (2-36)
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.leastSignificantFirst=false] - Order of digits
 * @param {boolean} [options.includeSign=false] - Whether to include sign information in the output
 * @returns {{digits: number[], isNegative?: boolean}} Array of digits in the specified base and sign info if requested
 * @typedef {Object} DigitResult
 * @property {number[]} digits - Array of digits in the specified base
 * @property {boolean} [isNegative] - Whether the value is negative (only included if includeSign is true)
 */
function getDigitsFromValue(value, base = 10, options = {}) {
  const { leastSignificantFirst = false, includeSign = false } = options
  
  // Validate base
  if (!Number.isInteger(base) || base < 2 || base > 36) {
    throw new PrimeMathError(`Invalid base: ${base} (must be 2-36)`)
  }
  
  let bigIntValue
  let isNegative = false
  
  // Handle factorization map or factorization object
  if (value instanceof Map) {
    bigIntValue = fromPrimeFactors(value)
  } else if (value && typeof value === 'object' && 'factorization' in value) {
    // Handle {factorization, isNegative} format
    if (!(value.factorization instanceof Map)) {
      throw new PrimeMathError('Invalid factorization format')
    }
    
    bigIntValue = fromPrimeFactors(value.factorization)
    isNegative = !!value.isNegative
    
    // Apply sign
    if (isNegative) {
      bigIntValue = -bigIntValue
    }
  } else {
    // Try to convert to BigInt
    try {
      bigIntValue = toBigInt(value)
    } catch (error) {
      throw new PrimeMathError(`Cannot extract digits: ${getErrorMessage(error)}`)
    }
  }
  
  // Handle negative values
  if (bigIntValue < 0n) {
    isNegative = true
    bigIntValue = -bigIntValue
  }
  
  // Handle zero specially
  if (bigIntValue === 0n) {
    /** @type {DigitResult} */
    const zeroResult = { digits: [0] }
    if (includeSign) {
      zeroResult.isNegative = false
    }
    return zeroResult
  }
  
  // Extract digits
  const digits = []
  let remaining = bigIntValue
  
  while (remaining > 0n) {
    const digit = Number(remaining % BigInt(base))
    digits.push(digit)
    remaining = remaining / BigInt(base)
  }
  
  // Digits are extracted least significant first
  // If most significant first is requested, reverse the array
  /** @type {DigitResult} */
  const result = { 
    digits: leastSignificantFirst ? digits : digits.reverse() 
  }
  
  // Include sign information if requested
  if (includeSign) {
    result.isNegative = isNegative
  }
  
  return result
}

/**
 * Standardized base conversion utility
 * Converts a number between different bases using universal coordinates
 * 
 * @param {number|string|BigInt|Map<BigInt, BigInt>} value - The value to convert
 * @param {number} fromBase - Base of the input (2-36)
 * @param {number} toBase - Base for the output (2-36)
 * @returns {string} The value in the target base
 */
function convertBaseViaUniversal(value, fromBase, toBase) {
  // Special case: if value is already a factorization map
  if (value instanceof Map) {
    // Convert directly to the target base
    const bigIntValue = fromPrimeFactors(value)
    return convertBigIntToBase(bigIntValue, toBase)
  }
  
  // Convert to universal coordinates and then to target base
  let factorization
  let isNegative = false
  
  if (typeof value === 'string') {
    const result = fromString(value, fromBase)
    isNegative = result.isNegative
    factorization = result.factorization
  } else if (typeof value === 'number') {
    const result = fromNumber(value)
    isNegative = result.isNegative
    factorization = result.factorization
  } else if (typeof value === 'bigint') {
    isNegative = value < 0n
    factorization = fromBigInt(isNegative ? -value : value)
  } else {
    throw new PrimeMathError(`Unsupported value type: ${typeof value}`)
  }
  
  // Convert from universal coordinates to target base
  const bigIntValue = fromPrimeFactors(factorization)
  
  // Apply sign if necessary
  return isNegative ? 
    '-' + convertBigIntToBase(bigIntValue, toBase) : 
    convertBigIntToBase(bigIntValue, toBase)
}

/**
 * Convert a prime factorization to a BigInt value
 * This is a standalone version of the method for converting a factorization to its numeric value
 * 
 * @param {Map<BigInt, BigInt>} factorization - The prime factorization to convert
 * @returns {BigInt} The numeric value represented by the factorization
 * @throws {PrimeMathError} If the factorization is invalid
 */
function factorizationToBigInt(factorization) {
  if (!(factorization instanceof Map)) {
    throw new PrimeMathError('Factorization must be a Map of prime factors')
  }
  
  return fromPrimeFactors(factorization)
}

/**
 * Convert a prime factorization to a string representation in the given base
 * 
 * @param {Map<BigInt, BigInt>} factorization - The prime factorization to convert
 * @param {number} [base=10] - The base for the output representation (2-36)
 * @returns {string} The string representation in the specified base
 * @throws {PrimeMathError} If the factorization is invalid or the base is not supported
 */
function factorizationToBaseString(factorization, base = 10) {
  if (!(factorization instanceof Map)) {
    throw new PrimeMathError('Factorization must be a Map of prime factors')
  }
  
  // Validate base
  if (!Number.isInteger(base) || base < 2 || base > 36) {
    throw new PrimeMathError(`Invalid base: ${base} (must be 2-36)`)
  }
  
  // Convert to BigInt first
  const bigIntValue = fromPrimeFactors(factorization)
  
  // Convert to the desired base
  return base === 10 ? 
    bigIntValue.toString() : 
    convertBigIntToBase(bigIntValue, base)
}

/**
 * Combine all conversion utilities into a single module
 */
const Conversion = {
  // Core conversion functions
  convertBase,
  getDigits,
  
  // Standard-to-Universal conversions
  fromNumber,
  fromBigInt,
  fromString,
  
  // Universal-to-Standard conversions (using factorizations)
  toBigInt: factorizationToBigInt,
  toString: factorizationToBaseString,
  getDigitsFromValue,
  convertBaseViaUniversal,
  
  // Advanced utilities
  toScientificNotation,
  toFraction,
  factorizationToString,
  parseFactorization,
  toJSON,
  fromJSON,
  
  /**
   * Calculate the numeric value from a prime factorization
   * 
   * @param {Map<BigInt, BigInt>|Array<{prime: BigInt, exponent: BigInt}>|{factorization: Map<BigInt, BigInt>, isNegative: boolean}} factorization - The prime factorization or factorization with sign
   * @returns {BigInt} The numeric value
   */
  fromFactorization(factorization) {
    let value
    let isNegative = false
    
    if (factorization && typeof factorization === 'object' && 'factorization' in factorization) {
      // Handle {factorization, isNegative} format
      value = fromPrimeFactors(factorization.factorization)
      isNegative = !!factorization.isNegative
    } else {
      // Handle direct Map format (backward compatibility)
      value = fromPrimeFactors(factorization)
    }
    
    return isNegative ? -value : value
  },
  
  /**
   * Get the prime factorization of a number
   * 
   * @param {number|string|BigInt} value - The value to factorize
   * @param {Object} [options] - Optional parameters for factorization
   * @param {boolean} [options.withSignFlag=false] - Whether to include a sign flag in the result
   * @returns {Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>, isNegative: boolean}} The prime factorization (or with sign flag if requested)
   */
  toFactorization(value, options = {}) {
    const { withSignFlag = false, ...factorizationOptions } = options
    
    let isNegative = false
    let absValue = value
    
    // Handle different input types for negative value detection
    if (typeof value === 'number') {
      isNegative = value < 0
      absValue = Math.abs(value)
    } else if (typeof value === 'bigint') {
      isNegative = value < 0n
      absValue = value < 0n ? -value : value
    } else if (typeof value === 'string') {
      isNegative = value.startsWith('-')
      absValue = isNegative ? value.substring(1) : value
    }
    
    // Factorize the absolute value
    const factorization = factorizeOptimal(absValue, factorizationOptions)
    
    // Return with sign flag if requested, otherwise just the factorization Map for backward compatibility
    return withSignFlag ? 
      {
        factorization,
        isNegative
      } : 
      factorization
  },
  
  /**
   * Creates a placeholder UniversalNumber instance using the factorization
   * Used for forward compatibility until UniversalNumber is implemented
   * 
   * @param {Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>, isNegative: boolean}} factorizationParam - The prime factorization or object with factorization and sign
   * @returns {{value: BigInt, factorization: Map<BigInt, BigInt>, isNegative: boolean, toBigInt: Function, toString: Function, getCoordinates: Function, toJSON: Function}} A simplified UniversalNumber-compatible object
   */
  createUniversalNumber(factorizationParam) {
    // Extract factorization and sign flag
    let factorization, isNegative = false
    
    if (factorizationParam instanceof Map) {
      factorization = factorizationParam
    } else if (factorizationParam && typeof factorizationParam === 'object' && 'factorization' in factorizationParam) {
      factorization = factorizationParam.factorization
      isNegative = !!factorizationParam.isNegative
    } else {
      throw new PrimeMathError('Invalid factorization format')
    }
    
    if (UniversalNumber) {
      // Calculate the numeric value with sign
      const value = fromPrimeFactors(factorization)
      const signedValue = isNegative ? -value : value
      
      // @ts-ignore - UniversalNumber constructor is properly implemented
      return new UniversalNumber(signedValue)
    }
    
    // Create a basic placeholder with factorization data
    const value = fromPrimeFactors(factorization)
    const signedValue = isNegative ? -value : value
    
    return {
      value: signedValue,
      factorization: new Map(factorization), // Ensure we return a copy for immutability
      isNegative,
      
      // Basic methods
      toBigInt() {
        const value = fromPrimeFactors(factorization)
        return isNegative ? -value : value
      },
      
      toString(base = 10) {
        const bigIntValue = this.toBigInt()
        const absValue = bigIntValue < 0n ? -bigIntValue : bigIntValue
        const baseStr = base === 10 ? 
          absValue.toString() : 
          convertBigIntToBase(absValue, base)
            
        return isNegative ? '-' + baseStr : baseStr
      },
      
      getCoordinates() {
        return {
          factorization: new Map(factorization), // Return a copy to prevent modification
          isNegative
        }
      },
      
      // Add toJSON method for proper serialization
      toJSON() {
        return toJSON({
          value: this.toBigInt(),
          isFactorization: false
        })
      }
    }
  },
  
  /**
   * Utility function to handle optional parameters and validate for base conversion
   * Used internally by the module
   * 
   * @private
   * @param {Object} options - The options object
   * @param {number} [options.base=10] - The base to use
   * @param {boolean} [options.validate=true] - Whether to validate the base
   * @returns {number} The validated base
   */
  _validateBase(options = {}) {
    const { base = 10, validate = true } = options
    
    if (validate && (!Number.isInteger(base) || base < 2 || base > 36)) {
      throw new PrimeMathError(`Invalid base: ${base} (must be 2-36)`)
    }
    
    return base
  }
}

module.exports = Conversion