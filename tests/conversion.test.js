const Conversion = require('../src/Conversion')
const { PrimeMathError } = require('../src/Utils')
const { asFactorizationMap } = require('./type-utils')

describe('Conversion', () => {
  describe('base conversion', () => {
    test('converts between different bases', () => {
      // Decimal to binary
      expect(Conversion.convertBase('42', 10, 2)).toBe('101010')
      
      // Binary to decimal
      expect(Conversion.convertBase('101010', 2, 10)).toBe('42')
      
      // Decimal to hexadecimal
      expect(Conversion.convertBase('255', 10, 16)).toBe('ff')
      
      // Hexadecimal to decimal
      expect(Conversion.convertBase('ff', 16, 10)).toBe('255')
      
      // Base 36 conversions (maximum supported)
      expect(Conversion.convertBase('hello', 36, 10)).toBe('29234652')
      expect(Conversion.convertBase('29234652', 10, 36)).toBe('hello')
    })
    
    test('handles negative numbers correctly', () => {
      expect(Conversion.convertBase('-42', 10, 2)).toBe('-101010')
      expect(Conversion.convertBase('-101010', 2, 10)).toBe('-42')
      expect(Conversion.convertBase('-ff', 16, 10)).toBe('-255')
    })
    
    test('handles BigInt inputs', () => {
      expect(Conversion.convertBase(42n, 10, 16)).toBe('2a')
      expect(Conversion.convertBase(-42n, 10, 2)).toBe('-101010')
    })
    
    test('validates input bases', () => {
      expect(() => Conversion.convertBase('42', 0, 10)).toThrow(PrimeMathError)
      expect(() => Conversion.convertBase('42', 37, 10)).toThrow(PrimeMathError)
      expect(() => Conversion.convertBase('42', 10, 1)).toThrow(PrimeMathError)
      expect(() => Conversion.convertBase('42', 10, 37)).toThrow(PrimeMathError)
    })
    
    test('validates input string format', () => {
      expect(() => Conversion.convertBase('2A', 10, 16)).toThrow(PrimeMathError)
      expect(() => Conversion.convertBase('101201', 2, 10)).toThrow(PrimeMathError)
      expect(() => Conversion.convertBase('XYZ', 16, 10)).toThrow(PrimeMathError)
    })
    
    test('handles very large numbers', () => {
      const largeNumber = '1234567890123456789012345678901234567890'
      const binary = Conversion.convertBase(largeNumber, 10, 2)
      expect(Conversion.convertBase(binary, 2, 10)).toBe(largeNumber)
    })
  })
  
  describe('digit extraction', () => {
    test('extracts digits in various bases', () => {
      // Base 10
      expect(Conversion.getDigits(123)).toEqual([1, 2, 3])
      
      // Base 2
      expect(Conversion.getDigits(42, 2)).toEqual([1, 0, 1, 0, 1, 0])
      
      // Base 16
      expect(Conversion.getDigits(255, 16)).toEqual([15, 15]) // (FF in hex)
    })
    
    test('handles least significant first option', () => {
      expect(Conversion.getDigits(123, 10, true)).toEqual([3, 2, 1])
      expect(Conversion.getDigits(42, 2, true)).toEqual([0, 1, 0, 1, 0, 1])
    })
    
    test('handles zero correctly', () => {
      expect(Conversion.getDigits(0)).toEqual([0])
      expect(Conversion.getDigits(0, 2)).toEqual([0])
      expect(Conversion.getDigits(0, 16)).toEqual([0])
    })
    
    test('validates base parameter', () => {
      expect(() => Conversion.getDigits(123, 1)).toThrow(PrimeMathError)
      expect(() => Conversion.getDigits(123, 37)).toThrow(PrimeMathError)
    })
    
    test('handles negative numbers correctly', () => {
      // Negative numbers should be processed as their absolute value
      expect(Conversion.getDigits(-123)).toEqual([1, 2, 3])
      expect(Conversion.getDigits(-42, 2)).toEqual([1, 0, 1, 0, 1, 0])
    })
    
    test('handles large numbers', () => {
      const bigNumber = 123456789012345678901234567890n
      const digits = Conversion.getDigits(bigNumber)
      expect(digits.length).toBe(String(bigNumber).length)
      expect(digits.join('')).toBe(String(bigNumber))
    })
  })
  
  describe('scientific notation', () => {
    test('converts numbers to scientific notation', () => {
      expect(Conversion.toScientificNotation(123)).toBe('1.230000e+2')
      expect(Conversion.toScientificNotation(0.123)).toMatch(/1.23.*e-1/)
    })
    
    test('handles custom precision', () => {
      // We're using JavaScript's built-in toExponential which may have slight differences
      // for floating-point numbers like 123456, so we'll test with a string that can be precisely represented
      expect(Conversion.toScientificNotation('100000', 3)).toBe('1.000e+5')
      expect(Conversion.toScientificNotation('100000', 6)).toBe('1.000000e+5')
    })
    
    test('handles negative numbers', () => {
      expect(Conversion.toScientificNotation(-123)).toBe('-1.230000e+2')
    })
    
    test('handles zero correctly', () => {
      expect(Conversion.toScientificNotation(0)).toBe('0.000000e+0')
    })
    
    test('handles single-digit numbers', () => {
      expect(Conversion.toScientificNotation(5)).toBe('5.000000e+0')
    })
    
    test('handles large BigInt values', () => {
      const bigNumber = 123456789012345678901234567890n
      expect(Conversion.toScientificNotation(bigNumber)).toMatch(/^1\.2345.*e\+29$/)
    })
  })
  
  describe('fraction conversion', () => {
    test('converts decimal strings to fractions', () => {
      const result = Conversion.toFraction('3.14159')
      expect(result.numerator).toBe(314159n)
      expect(result.denominator).toBe(100000n)
    })
    
    test('simplifies fractions to lowest terms', () => {
      const result = Conversion.toFraction('0.5')
      expect(result.numerator).toBe(1n)
      expect(result.denominator).toBe(2n)
    })
    
    test('handles integers correctly', () => {
      const result = Conversion.toFraction('42')
      expect(result.numerator).toBe(42n)
      expect(result.denominator).toBe(1n)
    })
    
    test('handles zeros correctly', () => {
      const result = Conversion.toFraction('0.0')
      expect(result.numerator).toBe(0n)
      expect(result.denominator).toBe(1n)
    })
    
    test('handles negative numbers', () => {
      const resultStr = Conversion.toFraction('-3.5')
      expect(resultStr.numerator).toBe(-7n)
      expect(resultStr.denominator).toBe(2n)
      
      // Test with JavaScript number negative value
      const resultNum = Conversion.toFraction(-10.5)
      expect(resultNum.numerator).toBe(-21n)
      expect(resultNum.denominator).toBe(2n)
      
      // Test with negative zero point fraction
      const resultNegZero = Conversion.toFraction('-0.25')
      expect(resultNegZero.numerator).toBe(-1n)
      expect(resultNegZero.denominator).toBe(4n)
    })
    
    test('handles BigInt inputs', () => {
      const result = Conversion.toFraction(42n)
      expect(result.numerator).toBe(42n)
      expect(result.denominator).toBe(1n)
    })
    
    test('throws error for invalid inputs', () => {
      expect(() => Conversion.toFraction('not.a.number')).toThrow(PrimeMathError)
    })
  })
  
  describe('factorization string conversion', () => {
    test('converts factorization to string representation', () => {
      // 360 = 2^3 × 3^2 × 5
      const factorization = new Map([
        [2n, 3n],
        [3n, 2n],
        [5n, 1n]
      ])
      
      expect(Conversion.factorizationToString(factorization)).toBe('2^3 × 3^2 × 5')
    })
    
    test('handles empty factorization (representing 1)', () => {
      expect(Conversion.factorizationToString(new Map())).toBe('1')
    })
    
    test('handles single factor with exponent 1', () => {
      const factorization = new Map([[7n, 1n]])
      expect(Conversion.factorizationToString(factorization)).toBe('7')
    })
    
    test('sorts factors in ascending order', () => {
      const factorization = new Map([
        [5n, 1n],
        [2n, 3n],
        [3n, 2n]
      ])
      
      expect(Conversion.factorizationToString(factorization)).toBe('2^3 × 3^2 × 5')
    })
  })
  
  describe('parsing factorization strings', () => {
    test('parses factorization in standard format', () => {
      const factorStr = '2^3 × 3^2 × 5'
      const factorization = Conversion.parseFactorization(factorStr)
      
      // Use the helper function to cast to Map for TypeScript
      const factorMap = asFactorizationMap(factorization)
      expect(factorMap.get(2n)).toBe(3n)
      expect(factorMap.get(3n)).toBe(2n)
      expect(factorMap.get(5n)).toBe(1n)
    })
    
    test('parses factorization with asterisk notation', () => {
      const factorStr = '2^3 * 3^2 * 5'
      const factorization = Conversion.parseFactorization(factorStr)
      
      // Use the helper function to cast to Map for TypeScript
      const factorMap = asFactorizationMap(factorization)
      expect(factorMap.get(2n)).toBe(3n)
      expect(factorMap.get(3n)).toBe(2n)
      expect(factorMap.get(5n)).toBe(1n)
    })
    
    test('parses expanded product notation', () => {
      // 2*2*2*3*3*5 = 2^3 * 3^2 * 5
      const factorStr = '2*2*2*3*3*5'
      const factorization = Conversion.parseFactorization(factorStr)
      
      // Use the helper function to cast to Map for TypeScript
      const factorMap = asFactorizationMap(factorization)
      expect(factorMap.get(2n)).toBe(3n)
      expect(factorMap.get(3n)).toBe(2n)
      expect(factorMap.get(5n)).toBe(1n)
    })
    
    test('ignores whitespace in input', () => {
      const factorStr = ' 2^3  ×  3^2  ×  5 '
      const factorization = Conversion.parseFactorization(factorStr)
      
      // Use the helper function to cast to Map for TypeScript
      const factorMap = asFactorizationMap(factorization)
      expect(factorMap.get(2n)).toBe(3n)
      expect(factorMap.get(3n)).toBe(2n)
      expect(factorMap.get(5n)).toBe(1n)
    })
    
    test('handles invalid factorization strings', () => {
      expect(() => Conversion.parseFactorization('2^3 x 3^2 x 5')).toThrow(PrimeMathError)
      expect(() => Conversion.parseFactorization('not a factorization')).toThrow(PrimeMathError)
    })
  })
  
  describe('JSON serialization and parsing', () => {
    test('serializes BigInt value to JSON', () => {
      const data = { value: 42n, isFactorization: false }
      const json = Conversion.toJSON(data)
      const parsed = JSON.parse(json)
      
      expect(parsed.type).toBe('BigInt')
      expect(parsed.value).toBe('42')
    })
    
    test('serializes factorization to JSON', () => {
      const factorization = new Map([
        [2n, 3n],
        [3n, 2n],
        [5n, 1n]
      ])
      
      const data = { value: factorization, isFactorization: true }
      const json = Conversion.toJSON(data)
      const parsed = JSON.parse(json)
      
      expect(parsed.type).toBe('Factorization')
      expect(parsed.factors['2']).toBe('3')
      expect(parsed.factors['3']).toBe('2')
      expect(parsed.factors['5']).toBe('1')
    })
    
    test('parses BigInt JSON back to original value', () => {
      const original = { value: 42n, isFactorization: false }
      const json = Conversion.toJSON(original)
      const result = Conversion.fromJSON(json)
      
      expect(result.value).toBe(42n)
      expect(result.isFactorization).toBe(false)
    })
    
    test('parses factorization JSON back to original map', () => {
      const factorization = new Map([
        [2n, 3n],
        [3n, 2n],
        [5n, 1n]
      ])
      
      const original = { value: factorization, isFactorization: true }
      const json = Conversion.toJSON(original)
      const result = Conversion.fromJSON(json)
      
      expect(result.isFactorization).toBe(true)
      
      // Add type assertion to properly handle result.value as Map
      const factorMap = /** @type {Map<BigInt, BigInt>} */ (result.value)
      expect(factorMap.get(2n)).toBe(3n)
      expect(factorMap.get(3n)).toBe(2n)
      expect(factorMap.get(5n)).toBe(1n)
    })
    
    test('handles malformed JSON strings', () => {
      expect(() => Conversion.fromJSON('{"malformed": true')).toThrow(PrimeMathError)
      expect(() => Conversion.fromJSON('{"type": "Unknown"}')).toThrow(PrimeMathError)
      expect(() => Conversion.fromJSON('{"type": "Factorization"}')).toThrow(PrimeMathError)
    })
  })
  
  describe('factorization conversion', () => {
    test('converts between number and factorization', () => {
      // 360 = 2^3 × 3^2 × 5
      const factorization = Conversion.toFactorization(360)
      
      // Use the helper function to cast to Map for TypeScript
      const factorMap = asFactorizationMap(factorization)
      expect(factorMap.get(2n)).toBe(3n)
      expect(factorMap.get(3n)).toBe(2n)
      expect(factorMap.get(5n)).toBe(1n)
      
      const value = Conversion.fromFactorization(factorization)
      expect(value).toBe(360n)
    })
    
    test('handles prime numbers', () => {
      const factorization = Conversion.toFactorization(17)
      const factorMap = asFactorizationMap(factorization)
      expect(factorMap.size).toBe(1)
      expect(factorMap.get(17n)).toBe(1n)
      
      const value = Conversion.fromFactorization(factorization)
      expect(value).toBe(17n)
    })
    
    test('handles powers of primes', () => {
      const factorization = Conversion.toFactorization(16) // 2^4
      const factorMap = asFactorizationMap(factorization)
      expect(factorMap.size).toBe(1)
      expect(factorMap.get(2n)).toBe(4n)
      
      const value = Conversion.fromFactorization(factorization)
      expect(value).toBe(16n)
    })
    
    test('handles 1 correctly (empty factorization)', () => {
      const factorization = Conversion.toFactorization(1)
      const factorMap = asFactorizationMap(factorization)
      expect(factorMap.size).toBe(0)
      
      const value = Conversion.fromFactorization(factorization)
      expect(value).toBe(1n)
    })
    
    test('round-trip conversion preserves value', () => {
      const testNumbers = [1, 2, 3, 10, 15, 16, 24, 97, 100, 360, 1234]
      
      for (const num of testNumbers) {
        const factorization = Conversion.toFactorization(num)
        const value = Conversion.fromFactorization(factorization)
        expect(value).toBe(BigInt(num))
      }
    })
    
    test('handles large numbers', () => {
      const largeNumber = 1234567890123456789n
      const factorization = Conversion.toFactorization(largeNumber)
      const value = Conversion.fromFactorization(factorization)
      expect(value).toBe(largeNumber)
    })
  })
  
  describe('round-trip conversions', () => {
    test('base conversions are reversible', () => {
      const originals = ['42', '1234', '9876543210', '-12345']
      
      for (const original of originals) {
        const binary = Conversion.convertBase(original, 10, 2)
        const decimal = Conversion.convertBase(binary, 2, 10)
        expect(decimal).toBe(original)
        
        const hex = Conversion.convertBase(original, 10, 16)
        const decimalFromHex = Conversion.convertBase(hex, 16, 10)
        expect(decimalFromHex).toBe(original)
      }
    })
    
    test('JSON serialization is reversible', () => {
      // BigInt value
      const bigIntData = { value: 9876543210n, isFactorization: false }
      const bigIntJson = Conversion.toJSON(bigIntData)
      const bigIntResult = Conversion.fromJSON(bigIntJson)
      expect(bigIntResult.value).toBe(bigIntData.value)
      
      // Factorization
      const factorization = new Map([
        [2n, 3n],
        [3n, 2n],
        [5n, 1n]
      ])
      const factorData = { value: factorization, isFactorization: true }
      const factorJson = Conversion.toJSON(factorData)
      const factorResult = Conversion.fromJSON(factorJson)
      
      for (const [prime, exponent] of factorization.entries()) {
        // Add type assertion to properly handle result.value as Map
        const factorMap = /** @type {Map<BigInt, BigInt>} */ (factorResult.value)
        expect(factorMap.get(prime)).toBe(exponent)
      }
    })
    
    test('factorization strings are parseable and reconstructable', () => {
      const original = '2^3 × 3^2 × 5'
      const factorization = Conversion.parseFactorization(original)
      const reconstructed = Conversion.factorizationToString(factorization)
      expect(reconstructed).toBe(original)
    })
    
    test('number to factorization to number is consistent', () => {
      const numbers = [2, 10, 16, 42, 100, 360, 1234, 9876] // Skip 1 since it's a special case
      
      for (const num of numbers) {
        const factorization = Conversion.toFactorization(num)
        const factorizationStr = Conversion.factorizationToString(factorization)
        const parsedFactor = Conversion.parseFactorization(factorizationStr)
        const result = Conversion.fromFactorization(parsedFactor)
        
        expect(result).toBe(BigInt(num))
      }
      
      // Test for 1 separately (empty factorization)
      const oneFactorization = Conversion.toFactorization(1)
      const oneFactorMap = asFactorizationMap(oneFactorization)
      expect(oneFactorMap.size).toBe(0)
      const oneStr = Conversion.factorizationToString(oneFactorization)
      expect(oneStr).toBe('1')
      // Note: we don't test full round-trip for 1 since the string '1' would be parsed as a number, not a factorization
    })
    
    test('universal coordinate conversions are consistent', () => {
      // Test fromNumber -> toBigInt
      const num = 42
      const factors = Conversion.fromNumber(num)
      const value = Conversion.fromFactorization(factors)
      expect(value).toBe(BigInt(num))
      
      // Test fromString -> toBigInt with different bases
      const hexStr = 'ff'
      const hexFactors = Conversion.fromString(hexStr, 16)
      const hexValue = Conversion.fromFactorization(hexFactors)
      expect(hexValue).toBe(255n)
      
      // Test binary
      const binStr = '101010'
      const binFactors = Conversion.fromString(binStr, 2)
      const binValue = Conversion.fromFactorization(binFactors)
      expect(binValue).toBe(42n)
      
      // Test conversion via universal coordinates
      const decimalStr = '42'
      const binaryViaUniversal = Conversion.convertBaseViaUniversal(decimalStr, 10, 2)
      expect(binaryViaUniversal).toBe('101010')
    })
  })
})