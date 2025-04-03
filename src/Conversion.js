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

// Import UniversalNumber - strict dependency according to Prime Framework
const UniversalNumber = require('./UniversalNumber')

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
 * Advanced serialization format options
 * Provides different serialization strategies for universal coordinates
 * @typedef {'standard'|'compact'|'binary'|'streaming'} SerializationFormat
 */

/**
 * @typedef {Object} FactorizationMetadata
 * @property {string} format - The format used (standard, compact, binary, streaming)
 * @property {number} primeCount - Number of prime factors
 * @property {string} timestamp - ISO timestamp of serialization
 * 
 * @typedef {Object} StandardFactorizationResult
 * @property {string} type - Always 'Factorization'
 * @property {Record<string, string>} factors - Object mapping prime factors to exponents
 * @property {FactorizationMetadata} [metadata] - Optional metadata
 * 
 * @typedef {Object} CompactFactorizationResult
 * @property {string} type - Always 'CompactFactorization'
 * @property {string[]} primes - Array of prime factors as strings
 * @property {string[]} exponents - Array of exponents as strings
 * @property {FactorizationMetadata} [metadata] - Optional metadata
 * 
 * @typedef {Object} BinaryFactorizationResult
 * @property {string} type - Always 'BinaryFactorization'
 * @property {string} encoding - Encoding type (e.g., 'base64')
 * @property {string} data - Encoded data
 * @property {FactorizationMetadata} [metadata] - Optional metadata
 * 
 * @typedef {Object} StreamingFactorizationResult
 * @property {string} type - Always 'StreamingFactorization'
 * @property {number} chunkCount - Number of chunks
 * @property {Array<{primes: string[], exponents: string[]}>} chunks - Array of chunks
 * @property {FactorizationMetadata} [metadata] - Optional metadata
 * 
 * @typedef {Object} BigIntResult
 * @property {string} type - Always 'BigInt'
 * @property {string} value - String representation of the BigInt value
 * @property {Object} [metadata] - Optional metadata
 */

/**
 * Serializes number data to JSON format with advanced options
 * 
 * @param {Object} data - The number data to serialize
 * @param {BigInt|Map<BigInt, BigInt>} data.value - The numeric value or prime factorization
 * @param {boolean} [data.isFactorization=false] - If true, value is treated as factorization
 * @param {Object} [options] - Serialization options
 * @param {SerializationFormat} [options.format='standard'] - Format to use for serialization
 * @param {boolean} [options.includeMetadata=false] - Whether to include additional metadata
 * @returns {string} JSON string representation
 */
function toJSON(data, options = {}) {
  const { 
    value, 
    isFactorization = false 
  } = data
  
  const {
    format = 'standard',
    includeMetadata = false
  } = options
  
  try {
    if (isFactorization) {
      // Serialize factorization
      /** @type {Record<string, string>} */
      const factorObj = {}
      
      // Ensure value is a Map and not a BigInt
      if (!(value instanceof Map)) {
        throw new PrimeMathError('Value is not a valid factorization Map')
      }
      
      // Standard format serialization
      if (format === 'standard') {
        for (const [prime, exponent] of value.entries()) {
          const primeKey = prime.toString()
          factorObj[primeKey] = exponent.toString()
        }
        
        /** @type {StandardFactorizationResult} */
        const result = {
          type: 'Factorization',
          factors: factorObj
        }
        
        // Include metadata if requested
        if (includeMetadata) {
          result.metadata = {
            format: 'standard',
            primeCount: value.size,
            timestamp: new Date().toISOString()
          }
        }
        
        return JSON.stringify(result)
      } 
      // Compact format serialization - optimizes for storage size
      else if (format === 'compact') {
        // Sort factors by prime to ensure consistent serialization
        const sortedFactors = [...value.entries()]
          .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
        
        // Use more compact arrays instead of objects
        const primes = []
        const exponents = []
        
        for (const [prime, exponent] of sortedFactors) {
          primes.push(prime.toString())
          exponents.push(exponent.toString())
        }
        
        /** @type {CompactFactorizationResult} */
        const result = {
          type: 'CompactFactorization',
          primes,
          exponents
        }
        
        // Include metadata if requested
        if (includeMetadata) {
          result.metadata = {
            format: 'compact',
            primeCount: primes.length,
            timestamp: new Date().toISOString()
          }
        }
        
        return JSON.stringify(result)
      }
      // Binary format serialization - most compact representation
      else if (format === 'binary') {
        // For binary format, we would implement a custom encoding for maximum efficiency
        // This would encode the primes and exponents in a binary format 
        // As a placeholder, we'll use a base64-encoded version of the compact format
        
        // Sort factors by prime to ensure consistent serialization
        const sortedFactors = [...value.entries()]
          .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
        
        // Create compact arrays for binary encoding
        const primes = []
        const exponents = []
        
        for (const [prime, exponent] of sortedFactors) {
          primes.push(prime.toString())
          exponents.push(exponent.toString())
        }
        
        // Placeholder for binary encoding - would be implemented with actual binary serialization
        // Instead, we're using a stringified version that would be replaced with true binary encoding
        const binaryData = JSON.stringify({ p: primes, e: exponents })
        
        // In JavaScript environments with different capabilities (browser vs node),
        // we need to handle base64 encoding appropriately
        let base64Data
        
        // Use safe conversion that works in different JavaScript environments
        try {
          // In Node.js environments
          if (typeof Buffer !== 'undefined') {
            const buffer = Buffer.from(binaryData, 'utf8')
            base64Data = buffer.toString('base64')
          } else {
            // In browser environments 
            base64Data = btoa(unescape(encodeURIComponent(binaryData)))
          }
        } catch (e) {
          // Fallback implementation using simple object serialization
          base64Data = JSON.stringify(binaryData)
        }
        
        /** @type {BinaryFactorizationResult} */
        const result = {
          type: 'BinaryFactorization',
          encoding: 'base64',
          data: base64Data
        }
        
        // Include metadata if requested
        if (includeMetadata) {
          result.metadata = {
            format: 'binary',
            primeCount: primes.length,
            timestamp: new Date().toISOString()
          }
        }
        
        return JSON.stringify(result)
      }
      // Streaming format - designed for very large numbers
      else if (format === 'streaming') {
        // Streaming format would normally split large factorizations into chunks
        // This is a placeholder implementation that demonstrates the API
        const chunkSize = 100
        const sortedFactors = [...value.entries()]
          .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
        
        const chunks = []
        let currentChunk = { primes: [], exponents: [] }
        let count = 0
        
        for (const [prime, exponent] of sortedFactors) {
          currentChunk.primes.push(prime.toString())
          currentChunk.exponents.push(exponent.toString())
          count++
          
          if (count % chunkSize === 0) {
            chunks.push(currentChunk)
            currentChunk = { primes: [], exponents: [] }
          }
        }
        
        // Add the last chunk if not empty
        if (currentChunk.primes.length > 0) {
          chunks.push(currentChunk)
        }
        
        /** @type {StreamingFactorizationResult} */
        const result = {
          type: 'StreamingFactorization',
          chunkCount: chunks.length,
          chunks
        }
        
        // Include metadata if requested
        if (includeMetadata) {
          result.metadata = {
            format: 'streaming',
            primeCount: sortedFactors.length,
            timestamp: new Date().toISOString()
          }
        }
        
        return JSON.stringify(result)
      }
      else {
        throw new PrimeMathError(`Unsupported serialization format: ${format}`)
      }
    } else {
      // Serialize BigInt value
      if (typeof value !== 'bigint') {
        throw new PrimeMathError('Value is not a valid BigInt')
      }
      
      /** @type {BigIntResult} */
      const result = {
        type: 'BigInt',
        value: value.toString()
      }
      
      // Include metadata if requested
      if (includeMetadata) {
        result.metadata = {
          format: format,
          digits: value.toString().length,
          timestamp: new Date().toISOString()
        }
      }
      
      return JSON.stringify(result)
    }
  } catch (error) {
    throw new PrimeMathError(`Failed to serialize to JSON: ${getErrorMessage(error)}`)
  }
}

/**
 * Parses a JSON string back to number data with advanced options
 * 
 * @param {string} json - The JSON string to parse
 * @param {Object} [options] - Parsing options
 * @param {boolean} [options.validateMetadata=false] - Whether to validate included metadata
 * @returns {ParsedJSONResult} The parsed data (either BigInt value or prime factorization)
 * @throws {PrimeMathError} If the JSON is invalid or cannot be parsed
 * @typedef {Object} ParsedJSONResult
 * @property {BigInt|Map<BigInt, BigInt>} value - The numeric value or prime factorization
 * @property {boolean} isFactorization - Whether the value is a factorization (true) or BigInt (false)
 * @property {Object} [metadata] - Additional metadata if present and validated
 */
function fromJSON(json, options = {}) {
  const { validateMetadata = false } = options
  
  try {
    const data = JSON.parse(json)
    
    if (!data.type) {
      throw new Error('Missing type field')
    }
    
    // Extract and validate metadata if present and requested
    let metadata = null
    if (validateMetadata && data.metadata) {
      metadata = data.metadata
      
      // Perform basic validation
      if (metadata.timestamp) {
        // Verify timestamp is valid ISO format
        const timestamp = new Date(metadata.timestamp)
        if (isNaN(timestamp.getTime())) {
          throw new Error('Invalid timestamp in metadata')
        }
      }
    }
    
    // Handle BigInt data
    if (data.type === 'BigInt') {
      /** @type {ParsedJSONResult} */
      const result = {
        value: toBigInt(data.value),
        isFactorization: false
      }
      
      if (metadata) {
        result.metadata = metadata
      }
      
      return result
    } 
    // Handle standard factorization format
    else if (data.type === 'Factorization') {
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
      
      if (metadata) {
        result.metadata = metadata
      }
      
      return result
    }
    // Handle compact factorization format
    else if (data.type === 'CompactFactorization') {
      if (!data.primes || !data.exponents || !Array.isArray(data.primes) || !Array.isArray(data.exponents)) {
        throw new Error('Invalid CompactFactorization format')
      }
      
      if (data.primes.length !== data.exponents.length) {
        throw new Error('Primes and exponents arrays must have the same length')
      }
      
      const factorMap = new Map()
      
      for (let i = 0; i < data.primes.length; i++) {
        const prime = toBigInt(data.primes[i])
        const exponent = toBigInt(data.exponents[i])
        factorMap.set(prime, exponent)
      }
      
      /** @type {ParsedJSONResult} */
      const result = {
        value: factorMap,
        isFactorization: true
      }
      
      if (metadata) {
        result.metadata = metadata
      }
      
      return result
    }
    // Handle binary factorization format
    else if (data.type === 'BinaryFactorization') {
      if (!data.encoding || !data.data) {
        throw new Error('Invalid BinaryFactorization format')
      }
      
      // Properly decode the base64 data 
      let decoded
      try {
        let decodedString
        
        // Handle different environments (Node.js vs browser)
        if (typeof Buffer !== 'undefined') {
          // In Node.js
          const buffer = Buffer.from(data.data, 'base64')
          decodedString = buffer.toString('utf8')
        } else {
          // In browser environments
          decodedString = decodeURIComponent(escape(atob(data.data)))
        }
        
        // Parse the JSON data
        decoded = JSON.parse(decodedString)
      } catch (e) {
        if (e instanceof Error) {
          throw new Error(`Failed to decode binary data: ${e.message}`)
        } else {
          throw new Error(`Failed to decode binary data: ${String(e)}`)
        }
      }
      
      if (!decoded.p || !decoded.e || !Array.isArray(decoded.p) || !Array.isArray(decoded.e)) {
        throw new Error('Invalid binary data format')
      }
      
      const factorMap = new Map()
      
      for (let i = 0; i < decoded.p.length; i++) {
        const prime = toBigInt(decoded.p[i])
        const exponent = toBigInt(decoded.e[i])
        factorMap.set(prime, exponent)
      }
      
      /** @type {ParsedJSONResult} */
      const result = {
        value: factorMap,
        isFactorization: true
      }
      
      if (metadata) {
        result.metadata = metadata
      }
      
      return result
    }
    // Handle streaming factorization format
    else if (data.type === 'StreamingFactorization') {
      if (!data.chunks || !Array.isArray(data.chunks)) {
        throw new Error('Invalid StreamingFactorization format')
      }
      
      const factorMap = new Map()
      
      // Combine all chunks into a single factorization
      for (const chunk of data.chunks) {
        if (!chunk.primes || !chunk.exponents || 
            !Array.isArray(chunk.primes) || !Array.isArray(chunk.exponents) ||
            chunk.primes.length !== chunk.exponents.length) {
          throw new Error('Invalid chunk format in StreamingFactorization')
        }
        
        for (let i = 0; i < chunk.primes.length; i++) {
          const prime = toBigInt(chunk.primes[i])
          const exponent = toBigInt(chunk.exponents[i])
          factorMap.set(prime, exponent)
        }
      }
      
      /** @type {ParsedJSONResult} */
      const result = {
        value: factorMap,
        isFactorization: true
      }
      
      if (metadata) {
        result.metadata = metadata
      }
      
      return result
    }
    else {
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
 * Optimized direct base conversion utility
 * Converts a number between different bases using universal coordinates
 * Implements efficient algorithms that leverage prime factorization properties
 * 
 * @param {number|string|BigInt|Map<BigInt, BigInt>} value - The value to convert
 * @param {number} fromBase - Base of the input (2-36)
 * @param {number} toBase - Base for the output (2-36)
 * @param {Object} [options] - Additional options for the conversion
 * @param {boolean} [options.useFactorizationShortcuts=true] - Whether to use factorization shortcuts for speed
 * @param {boolean} [options.useDirectComputation=true] - Whether to use direct digit computation where possible
 * @returns {string} The value in the target base
 */
function convertBaseViaUniversal(value, fromBase, toBase, options = {}) {
  // Extract options with defaults
  const { 
    useFactorizationShortcuts = true, 
    useDirectComputation = true
  } = options

  // Validate bases
  if (!Number.isInteger(fromBase) || fromBase < 2 || fromBase > 36) {
    throw new PrimeMathError(`Invalid fromBase: ${fromBase} (must be 2-36)`)
  }
  if (!Number.isInteger(toBase) || toBase < 2 || toBase > 36) {
    throw new PrimeMathError(`Invalid toBase: ${toBase} (must be 2-36)`)
  }

  // If bases are the same, no conversion needed
  if (fromBase === toBase) {
    if (typeof value === 'string') return value
    if (typeof value === 'number') return value.toString(toBase)
    if (typeof value === 'bigint') return value.toString(toBase)
    if (value instanceof Map) {
      const bigIntValue = fromPrimeFactors(value)
      return convertBigIntToBase(bigIntValue, toBase)
    }
  }

  // Special case: if value is already a factorization map
  if (value instanceof Map) {
    // Convert directly to the target base
    const bigIntValue = fromPrimeFactors(value)
    return convertBigIntToBase(bigIntValue, toBase)
  }
  
  // Check for special conversion shortcuts between common bases
  if (useFactorizationShortcuts) {
    const shortcutResult = tryBaseConversionShortcut(value, fromBase, toBase)
    if (shortcutResult !== null) {
      return shortcutResult
    }
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
  
  // For certain bases, use specialized direct digit computation
  if (useDirectComputation) {
    const directResult = computeDigitsFromFactorization(factorization, toBase)
    if (directResult !== null) {
      return isNegative ? '-' + directResult : directResult
    }
  }
  
  // Fall back to standard conversion
  const bigIntValue = fromPrimeFactors(factorization)
  
  // Apply sign if necessary
  return isNegative ? 
    '-' + convertBigIntToBase(bigIntValue, toBase) : 
    convertBigIntToBase(bigIntValue, toBase)
}

/**
 * Try optimized base conversion shortcuts for common bases
 * Provides fast conversion paths for common base combinations like binary ↔ hexadecimal
 * 
 * @param {string|number|BigInt} value - The value to convert
 * @param {number} fromBase - The base of the input
 * @param {number} toBase - The base to convert to
 * @returns {string|null} The converted value or null if no shortcut is available
 */
function tryBaseConversionShortcut(value, fromBase, toBase) {
  // Binary to hexadecimal direct conversion (4 bits per hex digit)
  if (fromBase === 2 && toBase === 16) {
    if (typeof value === 'string') {
      // Process binary string to hex
      let binString = value
      const isNegative = binString.startsWith('-')
      if (isNegative) binString = binString.substring(1)
      
      // Pad to multiple of 4 bits
      const paddingNeeded = (4 - (binString.length % 4)) % 4
      binString = '0'.repeat(paddingNeeded) + binString
      
      // Convert 4 bits at a time
      let hexResult = ''
      for (let i = 0; i < binString.length; i += 4) {
        const chunk = binString.substring(i, i + 4)
        const decimalValue = parseInt(chunk, 2)
        hexResult += decimalValue.toString(16).toLowerCase()
      }
      
      // Remove leading zeros (but keep at least one digit)
      hexResult = hexResult.replace(/^0+(?=\S)/, '')
      
      return isNegative ? '-' + hexResult : hexResult
    }
  }
  
  // Hexadecimal to binary direct conversion
  if (fromBase === 16 && toBase === 2) {
    if (typeof value === 'string') {
      // Process hex string to binary
      let hexString = value
      const isNegative = hexString.startsWith('-')
      if (isNegative) hexString = hexString.substring(1)
      
      // Convert each hex digit to 4 binary digits
      let binResult = ''
      for (let i = 0; i < hexString.length; i++) {
        const decimalValue = parseInt(hexString[i], 16)
        // Convert to 4-digit binary and pad with zeros
        const binaryChunk = decimalValue.toString(2).padStart(4, '0')
        binResult += binaryChunk
      }
      
      // Remove leading zeros (but keep at least one digit)
      binResult = binResult.replace(/^0+(?=\S)/, '')
      if (binResult === '') binResult = '0'
      
      return isNegative ? '-' + binResult : binResult
    }
  }

  // Binary to octal direct conversion (3 bits per octal digit)
  if (fromBase === 2 && toBase === 8) {
    if (typeof value === 'string') {
      // Process binary string to octal
      let binString = value
      const isNegative = binString.startsWith('-')
      if (isNegative) binString = binString.substring(1)
      
      // Pad to multiple of 3 bits
      const paddingNeeded = (3 - (binString.length % 3)) % 3
      binString = '0'.repeat(paddingNeeded) + binString
      
      // Convert 3 bits at a time
      let octalResult = ''
      for (let i = 0; i < binString.length; i += 3) {
        const chunk = binString.substring(i, i + 3)
        const decimalValue = parseInt(chunk, 2)
        octalResult += decimalValue.toString(8)
      }
      
      // Remove leading zeros (but keep at least one digit)
      octalResult = octalResult.replace(/^0+(?=\S)/, '')
      if (octalResult === '') octalResult = '0'
      
      return isNegative ? '-' + octalResult : octalResult
    }
  }
  
  // Octal to binary direct conversion
  if (fromBase === 8 && toBase === 2) {
    if (typeof value === 'string') {
      // Process octal string to binary
      let octalString = value
      const isNegative = octalString.startsWith('-')
      if (isNegative) octalString = octalString.substring(1)
      
      // Convert each octal digit to 3 binary digits
      let binResult = ''
      for (let i = 0; i < octalString.length; i++) {
        const decimalValue = parseInt(octalString[i], 8)
        // Convert to 3-digit binary and pad with zeros
        const binaryChunk = decimalValue.toString(2).padStart(3, '0')
        binResult += binaryChunk
      }
      
      // Remove leading zeros (but keep at least one digit)
      binResult = binResult.replace(/^0+(?=\S)/, '')
      if (binResult === '') binResult = '0'
      
      return isNegative ? '-' + binResult : binResult
    }
  }
  
  // Decimal to binary/hex/octal for small numbers, use native JS
  if (fromBase === 10 && (toBase === 2 || toBase === 8 || toBase === 16)) {
    if (typeof value === 'number' && Number.isInteger(value) && Number.isSafeInteger(value)) {
      return Math.abs(value).toString(toBase)
    } else if (typeof value === 'string') {
      // Try to convert the string to a number first
      try {
        const num = Number(value)
        if (Number.isInteger(num) && Number.isSafeInteger(num)) {
          const absValue = Math.abs(num).toString(toBase)
          return value.startsWith('-') ? '-' + absValue : absValue
        }
      } catch (e) {
        // Fall through to other conversion methods
      }
    }
  }
  
  // No shortcut found
  return null
}

/**
 * Compute digits directly from prime factorization for certain bases
 * This is faster than going through BigInt for some special cases
 * 
 * @param {Map<BigInt, BigInt>} factorization - The prime factorization
 * @param {number} base - The target base
 * @returns {string|null} The digits in the target base, or null if direct computation not possible
 */
function computeDigitsFromFactorization(factorization, base) {
  // Per Prime Framework specs, we can derive digits directly for powers of primes
  
  // Check if the base is a power of 2
  const isPowerOfTwo = (base & (base - 1)) === 0 && base > 0
  
  // For powers of 2 bases (2, 4, 8, 16, 32), implement direct computation
  if (isPowerOfTwo) {
    // Check if this is a power of 2
    if (factorization.size === 1 && factorization.has(2n)) {
      const exponent = factorization.get(2n)
      
      // For base 2, a power of 2 is simply 1 followed by zeros
      if (base === 2) {
        return '1' + '0'.repeat(Number(exponent))
      }
      
      // For other power-of-2 bases, we can compute the digits directly
      const bitsPerDigit = Math.log2(base)
      const fullDigits = Math.floor(Number(exponent) / bitsPerDigit)
      const remainingBits = Number(exponent) % bitsPerDigit
      
      let result = ''
      
      // Add the highest digit if there are remaining bits
      if (remainingBits > 0) {
        result += (1 << remainingBits).toString(base)
      }
      
      // Add zeros for full digits
      if (fullDigits > 0) {
        result += '0'.repeat(fullDigits)
      }
      
      return result
    }
    
    // Check if this is a simple factorization with only small primes
    // For small factorizations, direct computation might be faster
    if (factorization.size <= 3) {
      // Calculate the actual value using prime factorization
      let value = 1n
      for (const [prime, exp] of factorization.entries()) {
        if (prime > 1000n) return null // Too large for direct computation
        value *= prime ** exp
      }
      
      // Convert the value to the target base
      return value.toString(base)
    }
  }
  
  // Check if the base is a power of another prime
  // e.g., base 9 = 3^2, base 25 = 5^2, base 27 = 3^3
  if (base > 2) {
    // First check if base is a power of a prime
    let basePrime = null
    let basePrimeExp = 0
    
    for (let p = 2; p <= Math.sqrt(base); p++) {
      if (base % p === 0) {
        let exp = 0
        let testBase = base
        while (testBase % p === 0) {
          testBase /= p
          exp++
        }
        
        if (testBase === 1) {
          basePrime = BigInt(p)
          basePrimeExp = exp
          break
        }
      }
    }
    
    // If base is a power of prime and our number is also a power of that prime
    if (basePrime !== null && factorization.size === 1 && factorization.has(basePrime)) {
      const exponent = factorization.get(basePrime)
      
      // Direct computation for powers of the base prime
      // For example, if base=9 (3^2) and number=27 (3^3), the result is "30" in base 9
      const digitCount = Number(exponent) / basePrimeExp
      const fullDigits = Math.floor(digitCount)
      const remainder = Number(exponent) % basePrimeExp
      
      let result = ''
      
      // Add the highest digit if there's a remainder
      if (remainder > 0) {
        result += basePrime.toString()
      } else {
        result += '1'
      }
      
      // Add zeros for full digits
      if (fullDigits > 0) {
        result += '0'.repeat(fullDigits)
      }
      
      return result
    }
  }
  
  // Fall back to standard conversion for other cases
  return null
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
 * High-Efficiency Conversion Pipeline
 * Implements a streaming and batch conversion system for optimal performance
 */

/**
 * Conversion pipeline configuration options
 * 
 * @typedef {Object} ConversionPipelineOptions
 * @property {boolean} [parallel=false] - Whether to process items in parallel (when supported)
 * @property {number} [batchSize=100] - Size of batches for batch processing
 * @property {boolean} [preserveFactorization=true] - Whether to preserve factorization between steps
 * @property {boolean} [streamingOutput=false] - Whether to stream output or return all at once
 */

/**
 * Conversion pipeline step definition
 * 
 * @typedef {Object} ConversionStep
 * @property {string} type - Type of conversion step ('format', 'transform', 'compute')
 * @property {Function} process - Function to process a value in the pipeline
 * @property {Object} [options] - Step-specific options
 */

/**
 * Creates a conversion pipeline for processing large sets of numbers
 * This allows efficient batch processing with minimal intermediate transformations
 * 
 * @param {ConversionStep[]} steps - Array of conversion steps to apply
 * @param {ConversionPipelineOptions} [options] - Pipeline configuration options
 * @returns {function(Array<*>): Array<*>|function(Array<*>, function(*): void): void} Pipeline function
 */
function createConversionPipeline(steps, options = {}) {
  // Default options
  const {
    parallel = false,
    batchSize = 100,
    preserveFactorization = true,
    streamingOutput = false
  } = options
  
  /**
   * Processes a batch of items through the pipeline
   * 
   * @template T
   * @param {T[]} items - Items to process
   * @param {function(T): void} [callback] - Callback for streaming output
   * @returns {T[]|undefined} Processed items or undefined if streaming
   */
  function processBatch(items, callback) {
    // Process in batches if needed
    if (items.length > batchSize) {
      const batches = []
      for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize))
      }
      
      // Process each batch
      if (streamingOutput && callback) {
        // Streaming mode - process batches and call callback with results
        batches.forEach(batch => {
          const results = applyPipeline(batch)
          results.forEach(result => callback(result))
        })
        return undefined
      } else {
        // Collect all results
        /** @type {any[]} */
        const results = []
        batches.forEach(batch => {
          results.push(...applyPipeline(batch))
        })
        return results
      }
    } else {
      // Process single batch
      const results = applyPipeline(items)
      
      if (streamingOutput && callback) {
        results.forEach(result => callback(result))
        return undefined
      } else {
        return results
      }
    }
  }
  
  /**
   * Apply pipeline steps to a batch of items
   * 
   * @template T
   * @param {T[]} batch - Batch of items to process
   * @returns {T[]} Processed items
   */
  function applyPipeline(batch) {
    // Initialize results with the input items
    let currentBatch = [...batch]
    
    // Apply each step in sequence
    for (const step of steps) {
      if (parallel && step.options && step.options.parallelizable !== false) {
        // Process items in parallel (if supported and not explicitly disabled)
        currentBatch = currentBatch.map(item => step.process(item, step.options))
      } else {
        // Process items sequentially
        currentBatch = currentBatch.map(item => step.process(item, step.options))
      }
      
      // Handle special case for preserving factorization
      if (preserveFactorization && step.type === 'format' && step.options && 
      /** @type {any} */ (step.options).maintainFactorization) {
        // Ensure we keep factorization data through transformation steps
        currentBatch = currentBatch.map(item => {
          if (item && typeof item === 'object' && 'originalFactorization' in 
          /** @type {Record<string, any>} */ (item)) {
            return {
              ...item,
              // Keep original factorization if present
              factorization: /** @type {Record<string, any>} */ (item).originalFactorization
            }
          }
          return item
        })
      }
    }
    
    return currentBatch
  }
  
  // Return the pipeline function
  /**
   * @param {any[]} items - Items to process
   * @param {function(any): void} [callback] - Optional callback for processing items
   * @returns {any[] | undefined} Processed items or undefined if using callback
   */
  return (items, callback) => processBatch(items, callback)
}

/**
 * Common conversion step: convert to universal coordinates
 * 
 * @param {Object} [options] - Step-specific options
 * @returns {ConversionStep} A conversion step for the pipeline
 */
function convertToUniversalStep(options = {}) {
  return {
    type: 'transform',
    options: {
      ...options,
      maintainFactorization: true
    },
    process: (value) => {
      let factorization
      let isNegative = false
      
      if (value instanceof Map) {
        factorization = value
      } else if (value && typeof value === 'object' && 'factorization' in value) {
        factorization = value.factorization
        isNegative = !!value.isNegative
      } else {
        // Convert different types to factorization
        if (typeof value === 'string') {
          const result = fromString(value)
          factorization = result.factorization
          isNegative = result.isNegative
        } else if (typeof value === 'number') {
          const result = fromNumber(value)
          factorization = result.factorization
          isNegative = result.isNegative
        } else if (typeof value === 'bigint') {
          isNegative = value < 0n
          factorization = fromBigInt(isNegative ? -value : value)
        } else {
          throw new PrimeMathError(`Unsupported value type: ${typeof value}`)
        }
      }
      
      return {
        factorization: new Map(factorization),
        originalFactorization: new Map(factorization), // Store for pipeline steps
        isNegative,
        originalValue: value // Keep original for reference
      }
    }
  }
}

/**
 * Common conversion step: base conversion
 * 
 * @param {number} toBase - Target base for conversion
 * @param {Object} [options] - Additional options
 * @returns {ConversionStep} A conversion step for the pipeline
 */
function baseConversionStep(toBase, options = {}) {
  return {
    type: 'format',
    options: {
      toBase,
      ...options,
      maintainFactorization: true,
      parallelizable: true
    },
    /**
     * @param {any} value - Value to process
     * @param {Object} stepOptions - Step options
     * @returns {any} Processed value
     */
    process: (value, stepOptions) => {
      const { toBase } = stepOptions
      
      // Extract factorization if available
      let factorization
      let isNegative = false
      
      if (value && typeof value === 'object') {
        if ('factorization' in value) {
          factorization = value.factorization
          isNegative = !!value.isNegative
        } else if (value instanceof Map) {
          factorization = value
        }
      }
      
      // If we have factorization, use it directly
      if (factorization) {
        const result = factorizationToBaseString(factorization, toBase)
        return isNegative ? '-' + result : result
      }
      
      // Otherwise, try to convert as is (using BigInt conversion)
      try {
        const bigIntValue = toBigInt(value)
        const absValue = bigIntValue < 0n ? -bigIntValue : bigIntValue
        const result = convertBigIntToBase(absValue, toBase)
        return bigIntValue < 0n ? '-' + result : result
      } catch (error) {
        throw new PrimeMathError(`Failed to convert value to base ${toBase}: ${getErrorMessage(error)}`)
      }
    }
  }
}

/**
 * Prime Framework coordinate transformation functions
 * Implements the reference frame transformations described in the Prime Framework
 * As per lib-spec.md section on Topological and Geometric Framework
 */

/**
 * Represents a reference frame in the Prime Framework
 * A reference frame defines a specific algebraic context for universal coordinates
 * This corresponds to a point on the smooth reference manifold M described in lib-spec.md
 * 
 * @typedef {Object} ReferenceFrame
 * @property {string} id - Unique identifier for the reference frame
 * @property {Map<string, any>} parameters - Parameters defining the specific reference geometry
 * @property {function} transform - Function to transform coordinates between frames
 * @property {function} getCliffAlgebra - Gets the Clifford algebra at this reference point
 */

/**
 * Determines if a given number is a valid prime
 * This ensures the factorization contains only actual primes as required by the Prime Framework
 * 
 * @param {BigInt} value - The value to check for primality
 * @returns {boolean} Whether the value is prime
 */
function isPrime(value) {
  if (value <= 1n) return false
  if (value <= 3n) return true
  if (value % 2n === 0n || value % 3n === 0n) return false
  
  // Use 6k±1 optimization
  let i = 5n
  while (i * i <= value) {
    if (value % i === 0n || value % (i + 2n) === 0n) return false
    i += 6n
  }
  return true
}

/**
 * Create a new reference frame for the Prime Framework
 * Each reference frame corresponds to a fiber in the Prime Framework's algebraic geometry
 * 
 * @param {Object} options - Options for creating the reference frame
 * @param {string} [options.id='canonical'] - Identifier for the reference frame
 * @param {Map<string, any>|Object} [options.parameters={}] - Parameters for the reference geometry
 * @returns {ReferenceFrame} A new reference frame object
 */
function createReferenceFrame(options = {}) {
  const { 
    id = 'canonical',
    parameters = {}
  } = options
  
  // Convert parameters object to Map if it's not already a Map
  const paramMap = parameters instanceof Map ? 
    parameters : 
    new Map(Object.entries(parameters))
  
  // Create the frame with its Clifford algebra structure as described in lib-spec.md
  return {
    id,
    parameters: paramMap,
    
    /**
     * Get the Clifford algebra at this reference point
     * In the Prime Framework, the fiber at each point is modeled as a Clifford algebra Cx
     * 
     * @returns {Object} The Clifford algebra object
     */
    getCliffAlgebra() {
      // Create a representation of the Clifford algebra at this point
      // This aligns with the Prime Framework which places each number in a geometric context
      return {
        // The grade structure of the algebra (as described in lib-spec.md)
        gradeStructure: new Map([
          [0, { dimension: 1, description: 'Scalar part' }],
          [1, { dimension: Infinity, description: 'Vector part - corresponds to prime powers' }]
        ]),
        
        // The product operation (simplified for this implementation)
        product(a, b) {
          // For universal numbers, the Clifford product on factorizations
          // is equivalent to combining the prime exponent maps
          if (a instanceof Map && b instanceof Map) {
            const result = new Map(a)
            for (const [prime, exp] of b.entries()) {
              const currentExp = result.get(prime) || 0n
              result.set(prime, currentExp + exp)
            }
            return result
          }
          throw new PrimeMathError('Invalid inputs for Clifford product')
        }
      }
    },
    
    /**
     * Transform coordinates from this frame to another
     * This implements the G-action on M that carries representations between fibers
     * As described in lib-spec.md's section on Topological and Geometric Framework
     * 
     * @param {Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>, isNegative: boolean}} coordinates - Universal coordinates to transform
     * @param {ReferenceFrame} _targetFrame - The target reference frame (used for conforming to abstract interface)
     * @returns {Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>, isNegative: boolean}} Transformed coordinates
     */
    transform(coordinates, _targetFrame) {
      // Extract factorization and sign flag
      let factorization, isNegative = false
      
      if (coordinates instanceof Map) {
        factorization = coordinates
      } else if (coordinates && typeof coordinates === 'object' && 'factorization' in coordinates) {
        factorization = coordinates.factorization
        isNegative = !!coordinates.isNegative
      } else {
        throw new PrimeMathError('Invalid coordinates format')
      }
      
      // Ensure coordinates are in canonical form before transformation
      // This is a requirement of the Prime Framework for consistent representation
      for (const [prime, exponent] of factorization.entries()) {
        if (exponent <= 0n) {
          throw new PrimeMathError('Coordinates must be in canonical form for transformation')
        }
        
        // Verify primality for small primes
        if (prime <= 1000n && !isPrime(prime)) {
          throw new PrimeMathError(`Factor ${prime} is not a valid prime number`)
        }
      }
      
      // In the current implementation, all reference frames share the same universal coordinate
      // system with a fixed reference point as allowed by lib-spec.md line 378-380:
      // "The implementation can assume a fixed reference point (and thus a fixed algebra Cx) 
      // for all numbers, since all operations occur within the same global context."
      
      // Apply the transformation parameters between frames
      // In practice, this maintains the same coordinates as they're invariant under transformation
      // This follows from the Prime Framework's principle that the abstract value doesn't change
      // under transformation - only the coordinate representation might
      const transformedFactorization = new Map(factorization)
      
      // Create immutable copies to ensure consistency
      // For backwards compatibility, return the same format as the input
      return coordinates instanceof Map ? 
        transformedFactorization : 
        { 
          factorization: transformedFactorization, 
          isNegative 
        }
    }
  }
}

/**
 * Default canonical reference frame used for standard computations
 * In the Prime Framework, this represents the fixed reference point x ∈ M
 */
const canonicalFrame = createReferenceFrame({ id: 'canonical' })

/**
 * Compute the coherence inner product between two universal coordinate representations
 * This function implements the positive-definite inner product ⟨·,·⟩c defined in the Prime Framework
 * 
 * @param {Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>, isNegative: boolean}} a - First universal coordinates
 * @param {Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>, isNegative: boolean}} b - Second universal coordinates
 * @param {Object} [options] - Options for computing the inner product
 * @param {ReferenceFrame} [options.referenceFrame=canonicalFrame] - Reference frame to use
 * @returns {BigInt} The coherence inner product value
 */
function coherenceInnerProduct(a, b, options = {}) {
  // Note: Options for referenceFrame support future expansion
  // Using destructuring would cause a linting error, so we access options directly if needed
  
  // Extract factorizations
  let factorizationA, factorizationB
  
  if (a instanceof Map) {
    factorizationA = a
  } else if (a && typeof a === 'object' && 'factorization' in a) {
    factorizationA = a.factorization
  } else {
    throw new PrimeMathError('Invalid coordinates format for first argument')
  }
  
  if (b instanceof Map) {
    factorizationB = b
  } else if (b && typeof b === 'object' && 'factorization' in b) {
    factorizationB = b.factorization
  } else {
    throw new PrimeMathError('Invalid coordinates format for second argument')
  }
  
  // Get all primes from both factorizations
  const allPrimes = new Set([
    ...factorizationA.keys(),
    ...factorizationB.keys()
  ])
  
  // Compute the inner product as the sum of products of corresponding components
  let product = 0n
  for (const prime of allPrimes) {
    const exponentA = factorizationA.get(prime) || 0n
    const exponentB = factorizationB.get(prime) || 0n
    
    // Multiply the corresponding components and add to the result
    product += exponentA * exponentB
  }
  
  return product
}

/**
 * Compute the coherence norm of universal coordinates
 * This implements the norm derived from the coherence inner product
 * 
 * @param {Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>, isNegative: boolean}} coordinates - Universal coordinates
 * @param {Object} [options] - Options for computing the norm
 * @param {ReferenceFrame} [options.referenceFrame=canonicalFrame] - Reference frame to use
 * @returns {BigInt} The coherence norm value
 */
function coherenceNorm(coordinates, options = {}) {
  return coherenceInnerProduct(coordinates, coordinates, options)
}

/**
 * Check if universal coordinates are in canonical (minimal norm) form
 * This implements the coherence criteria from the Prime Framework specification
 * as detailed in lib-spec.md section "Coherence Inner Product and Norm"
 * 
 * @param {Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>, isNegative: boolean}} coordinates - Universal coordinates
 * @param {Object} [options] - Options for checking canonical form
 * @param {ReferenceFrame} [options.referenceFrame=canonicalFrame] - Reference frame to use
 * @returns {boolean} Whether the coordinates are in canonical form
 */
function isCanonicalForm(coordinates, options = {}) {
  // We can use referenceFrame when needed
  // const referenceFrame = options.referenceFrame || canonicalFrame
  
  // Extract factorization
  let factorization
  
  if (coordinates instanceof Map) {
    factorization = coordinates
  } else if (coordinates && typeof coordinates === 'object' && 'factorization' in coordinates) {
    factorization = coordinates.factorization
  } else {
    throw new PrimeMathError('Invalid coordinates format')
  }
  
  // In the Prime Framework, canonical form means:
  // 1. All exponents are positive
  // 2. All factors are prime
  // 3. Factorization is minimal-norm representation (per lib-spec.md lines 952-953)
  
  // Check basic validity conditions first
  for (const [prime, exponent] of factorization.entries()) {
    // Check that exponents are positive
    if (exponent <= 0n) return false
    
    // Check that keys are actually prime 
    // For smaller primes we can check directly
    if (prime <= 1000n) {
      if (!isPrime(prime)) return false
    } 
    // For larger primes, use probabilistic primality test
    else {
      // Simple Miller-Rabin implementation for large primes
      // This satisfies the Prime Framework requirement for intrinsic primality
      /**
       * @param {bigint} n - Number to test for primality
       * @param {number} [k=5] - Number of iterations for the test
       * @returns {boolean} True if n is probably prime, false otherwise
       */
      const millerRabinTest = (n, k = 5) => {
        if (n <= 1n) return false
        if (n <= 3n) return true
        if (n % 2n === 0n) return false
        
        // Write n-1 as 2^r * d
        let r = 0n
        let d = n - 1n
        while (d % 2n === 0n) {
          d /= 2n
          r++
        }
        
        // Witness loop
        const witnesses = k
        for (let i = 0; i < witnesses; i++) {
          // Choose random a in [2, n-2]
          const a = 2n + BigInt(Math.floor(Math.random() * Number(n - 4n)))
          
          let x = modPow(a, d, n)
          if (x === 1n || x === n - 1n) continue
          
          let continueWitness = false
          for (let j = 0n; j < r - 1n; j++) {
            x = (x * x) % n
            if (x === n - 1n) {
              continueWitness = true
              break
            }
          }
          
          if (continueWitness) continue
          return false
        }
        
        return true
      }
      
      // Fast modular exponentiation
      /**
       * @param {bigint} base - Base value
       * @param {bigint} exponent - Exponent value
       * @param {bigint} modulus - Modulus value
       * @returns {bigint} Result of base^exponent mod modulus
       */
      const modPow = (base, exponent, modulus) => {
        if (modulus === 1n) return 0n
        let result = 1n
        let baseCopy = base % modulus
        let exponentCopy = exponent
        while (exponentCopy > 0n) {
          if (exponentCopy % 2n === 1n) 
            result = (result * baseCopy) % modulus
          exponentCopy = exponentCopy >> 1n
          baseCopy = (baseCopy * baseCopy) % modulus
        }
        return result
      }
      
      if (!millerRabinTest(prime)) return false
    }
  }
  
  // Check coherence properties - ensuring this is minimal norm representation
  // For the Prime Framework, this means there can't be redundant or simplified representation
  
  // 1. There shouldn't be any common factors that could be combined
  const primes = [...factorization.keys()]
  for (let i = 0; i < primes.length; i++) {
    for (let j = i + 1; j < primes.length; j++) {
      // If there's any mathematical relationship between factors that could be simplified
      // the representation isn't canonical
      const gcd = calculateGCD(primes[i], primes[j])
      if (gcd > 1n) return false
    }
  }
  
  // 2. If we're in the reference frame's domain, the representation should be optimal
  // (This is a simplified test - in a full implementation we would check more conditions)
  // Support for more advanced checks using Clifford algebra is planned for future releases
  if (factorization.size > 0) {
    // In the canonical form, the number of prime factors should be minimal
    // For example, 4 should be represented as 2^2, not as 2*2
    const sortedFactors = [...factorization.entries()]
      .sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)
    
    // Check that exponents are optimized
    for (const [prime, exponent] of sortedFactors) {
      // For a canonical representation, the exponent should always be
      // the exact power - not representable as a sum of other exponents
      if (exponent > 1n) {
        // In a simplified check, we just ensure the exponent is a single value
        // A more comprehensive check would ensure it's not representable as a 
        // combination of other factors
      }
    }
  }
  
  return true
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
  
  // Prime Framework coordinate transformations
  createReferenceFrame,
  canonicalFrame,
  coherenceInnerProduct,
  coherenceNorm,
  isCanonicalForm,
  
  /**
   * Transform universal coordinates between reference frames
   * 
   * @param {Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>, isNegative: boolean}} coordinates - Universal coordinates to transform
   * @param {ReferenceFrame} sourceFrame - Source reference frame
   * @param {ReferenceFrame} targetFrame - Target reference frame
   * @returns {Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>, isNegative: boolean}} Transformed coordinates
   */
  transformCoordinates(coordinates, sourceFrame, targetFrame) {
    return sourceFrame.transform(coordinates, targetFrame)
  },
  
  // High-efficiency conversion pipeline
  createConversionPipeline,
  convertToUniversalStep,
  baseConversionStep,
  
  /**
   * Perform batch conversion of an array of values from one base to another
   * Uses the high-efficiency conversion pipeline
   * 
   * @param {Array<number|string|BigInt>} values - Values to convert
   * @param {number} fromBase - Base of the input values
   * @param {number} toBase - Base for the output
   * @param {Object} [options] - Conversion options
   * @param {boolean} [options.parallel=false] - Whether to process in parallel
   * @param {boolean} [options.useFactorization=true] - Whether to use factorization for conversion
   * @returns {string[]} Converted values in the target base
   */
  batchConvertBase(values, fromBase, toBase, options = {}) {
    const { 
      parallel = false,
      useFactorization = true
    } = options
    
    const pipeline = createConversionPipeline([
      convertToUniversalStep(),
      baseConversionStep(toBase)
    ], {
      parallel,
      batchSize: 100,
      preserveFactorization: useFactorization
    })
    
    // TypeScript needs explicit casting for the pipeline return type
    /** @type {string[]} */
    const results = pipeline(values)
    return results
  },
  
  /**
   * Stream conversion of values from one base to another
   * Processes values incrementally to minimize memory usage
   * 
   * @param {Array<number|string|BigInt>} values - Values to convert
   * @param {number} fromBase - Base of the input values
   * @param {number} toBase - Base for the output
   * @param {function(string): void} callback - Function to call with each converted value
   * @param {Object} [options] - Conversion options
   * @param {boolean} [options.parallel=false] - Whether to process in parallel
   * @param {boolean} [options.useFactorization=true] - Whether to use factorization for conversion
   */
  streamConvertBase(values, fromBase, toBase, callback, options = {}) {
    const { 
      parallel = false,
      useFactorization = true
    } = options
    
    const pipeline = createConversionPipeline([
      convertToUniversalStep(),
      baseConversionStep(toBase)
    ], {
      parallel,
      batchSize: 100,
      preserveFactorization: useFactorization,
      streamingOutput: true
    })
    
    // Execute the pipeline with the callback
    pipeline(values, callback)
  },
  
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
   * Get the prime factorization of a number with validation
   * Ensures all factors are prime and representation is canonical per Prime Framework
   * 
   * @param {number|string|BigInt} value - The value to factorize
   * @param {Object} [options] - Optional parameters for factorization
   * @param {boolean} [options.withSignFlag=false] - Whether to include a sign flag in the result
   * @param {boolean} [options.validatePrimality=true] - Whether to validate all factors are prime
   * @param {boolean} [options.enforceCanonical=true] - Whether to enforce canonical form
   * @returns {Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>, isNegative: boolean}} The prime factorization (or with sign flag if requested)
   */
  toFactorization(value, options = {}) {
    const { 
      withSignFlag = false, 
      validatePrimality = true,
      enforceCanonical = true,
      ...factorizationOptions 
    } = options
    
    let isNegative = false
    let absValue = value
    
    // Handle different input types for negative value detection
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        throw new PrimeMathError('Cannot factorize infinite or NaN values')
      }
      isNegative = value < 0
      absValue = Math.abs(value)
    } else if (typeof value === 'bigint') {
      isNegative = value < 0n
      absValue = value < 0n ? -value : value
    } else if (typeof value === 'string') {
      isNegative = value.startsWith('-')
      absValue = isNegative ? value.substring(1) : value
    } else {
      throw new PrimeMathError(`Unsupported value type for factorization: ${typeof value}`)
    }
    
    // Special case for zero - reject according to lib-spec.md
    if ((typeof absValue === 'number' && absValue === 0) ||
        (typeof absValue === 'string' && /^0+$/.test(absValue)) ||
        (typeof absValue === 'bigint' && absValue === 0n)) {
      throw new PrimeMathError('Universal coordinates are only defined for non-zero integers')
    }
    
    // Factorize the absolute value
    const factorization = factorizeOptimal(absValue, factorizationOptions)
    
    // Validate that all factors are prime if requested
    if (validatePrimality) {
      for (const [prime, exponent] of factorization.entries()) {
        // Check that exponents are positive
        if (exponent <= 0n) {
          throw new PrimeMathError(`Invalid exponent ${exponent} for prime ${prime}`)
        }
        
        // Verify primality for small primes
        if (prime <= 1000n) {
          if (!isPrime(prime)) {
            throw new PrimeMathError(`Factor ${prime} is not a valid prime number`)
          }
        } else {
          // For larger primes, use Miller-Rabin test
          /**
           * @param {bigint} n - Number to test for primality
           * @param {number} [k=7] - Number of iterations for the test
           * @returns {boolean} True if n is probably prime, false otherwise
           */
          const millerRabinTest = (n, k = 7) => {
            if (n <= 1n) return false
            if (n <= 3n) return true
            if (n % 2n === 0n) return false
            
            // Find r and d such that n-1 = 2^r * d
            let r = 0n
            let d = n - 1n
            while (d % 2n === 0n) {
              d /= 2n
              r++
            }
            
            // Witness loop
            for (let i = 0; i < k; i++) {
              // Choose a random witness between 2 and n-2
              // Generate a random witness in a safe range
              const maxRand = (n - 4n) < BigInt(Number.MAX_SAFE_INTEGER) ? Number(n - 4n) : Number.MAX_SAFE_INTEGER;
              const a = 2n + BigInt(Math.floor(Math.random() * maxRand))
              
              let x = modPow(a, d, n)
              if (x === 1n || x === n - 1n) continue
              
              let isProbablePrime = false
              for (let j = 0n; j < r - 1n; j++) {
                x = (x * x) % n
                if (x === n - 1n) {
                  isProbablePrime = true
                  break
                }
              }
              
              if (!isProbablePrime) return false
            }
            
            return true
          }
          
          // Modular exponentiation
          /**
       * @param {bigint} base - Base value
       * @param {bigint} exponent - Exponent value
       * @param {bigint} modulus - Modulus value
       * @returns {bigint} Result of base^exponent mod modulus
       */
      const modPow = (base, exponent, modulus) => {
            if (modulus === 1n) return 0n
            let result = 1n
            let baseCopy = base % modulus
            let exponentCopy = exponent
            while (exponentCopy > 0n) {
              if (exponentCopy % 2n === 1n) {
                result = (result * baseCopy) % modulus
              }
              exponentCopy = exponentCopy >> 1n
              baseCopy = (baseCopy * baseCopy) % modulus
            }
            return result
          }
          
          if (!millerRabinTest(prime)) {
            throw new PrimeMathError(`Factor ${prime} is not a valid prime number`)
          }
        }
      }
    }
    
    // Ensure canonical form if requested
    // This checks the representation against coherence principles
    if (enforceCanonical) {
      // Verify the factorization is in canonical form according to Prime Framework
      const result = withSignFlag ? 
        { factorization, isNegative } : 
        factorization
      
      if (!isCanonicalForm(result)) {
        // If not in canonical form, normalize it
        // Sort factors by prime (though the map should already maintain this)
        const sortedFactors = [...factorization.entries()]
          .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
        
        // Create a new map with the sorted factors
        const normalizedFactorization = new Map(sortedFactors)
        
        // Return the normalized factorization
        return withSignFlag ? 
          { factorization: normalizedFactorization, isNegative } : 
          normalizedFactorization
      }
    }
    
    // Return with sign flag if requested, otherwise just the factorization Map for backward compatibility
    return withSignFlag ? 
      {
        factorization,
        isNegative
      } : 
      factorization
  },
  
  /**
   * Creates a UniversalNumber instance from the factorization
   * This implements the core of the Prime Framework by creating universal coordinate representations
   * 
   * @param {Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>, isNegative: boolean}} factorizationParam - The prime factorization or object with factorization and sign
   * @returns {UniversalNumber} A proper UniversalNumber instance according to Prime Framework specification
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
    
    // Validate that all factors are prime numbers
    // This ensures that the representation adheres to the Prime Framework's requirement
    // for unique canonical factorization as the universal coordinate system
    for (const [prime, exponent] of factorization.entries()) {
      // Check that exponents are positive
      if (exponent <= 0n) {
        throw new PrimeMathError(`Invalid exponent ${exponent} for prime ${prime}`)
      }
      
      // Check primality for small primes
      if (prime <= 1000n && !isPrime(prime)) {
        throw new PrimeMathError(`Factor ${prime} is not a valid prime number`)
      }
    }
    
    // Ensure the factorization is in canonical form per Prime Framework
    // This is essential for the coherence inner product to work correctly
    if (!isCanonicalForm(factorizationParam)) {
      // If not in canonical form, normalize it by sorting and validating
      const sortedFactors = [...factorization.entries()]
        .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
      
      factorization = new Map(sortedFactors)
    }
    
    // Create a copy of the factorization to ensure immutability
    const immutableFactorization = new Map(factorization)
    
    // Use the UniversalNumber class directly
    const universalValue = {
      factorization: immutableFactorization,
      isNegative
    }
    
    return new UniversalNumber(universalValue)
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