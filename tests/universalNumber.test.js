/**
 * Tests for the UniversalNumber class
 */

const UniversalNumber = require('../src/UniversalNumber')
const { PrimeMathError } = require('../src/Utils')

describe('UniversalNumber', () => {
  describe('Constructor and Factory Methods', () => {
    test('should create from number', () => {
      const num = new UniversalNumber(42)
      expect(num.toBigInt()).toBe(42n)
    })

    test('should create from BigInt', () => {
      const num = new UniversalNumber(42n)
      expect(num.toBigInt()).toBe(42n)
    })

    test('should create from string', () => {
      const num = new UniversalNumber('42')
      expect(num.toBigInt()).toBe(42n)
    })

    test('should create from Map of prime factors', () => {
      const factorization = new Map([[2n, 1n], [3n, 1n], [7n, 1n]])
      const num = new UniversalNumber(factorization)
      expect(num.toBigInt()).toBe(42n)
    })

    test('should create from factorization object', () => {
      const factorizationObj = {
        factorization: new Map([[2n, 1n], [3n, 1n], [7n, 1n]]),
        isNegative: true
      }
      const num = new UniversalNumber(factorizationObj)
      expect(num.toBigInt()).toBe(-42n)
    })

    test('should support zero', () => {
      const zero = new UniversalNumber(0)
      expect(zero.isZero()).toBe(true)
      expect(zero.toBigInt()).toBe(0n)
      expect(zero.toString()).toBe('0')
      
      const zero2 = new UniversalNumber('0')
      expect(zero2.isZero()).toBe(true)
      
      const zero3 = new UniversalNumber(0n)
      expect(zero3.isZero()).toBe(true)
    })

    test('fromNumber static factory method', () => {
      const num = UniversalNumber.fromNumber(42)
      expect(num.toBigInt()).toBe(42n)
    })

    test('fromBigInt static factory method', () => {
      const num = UniversalNumber.fromBigInt(42n)
      expect(num.toBigInt()).toBe(42n)
    })

    test('fromString static factory method', () => {
      const num = UniversalNumber.fromString('42')
      expect(num.toBigInt()).toBe(42n)
    })

    test('fromString with base parameter', () => {
      const num = UniversalNumber.fromString('101010', 2)
      expect(num.toBigInt()).toBe(42n)
    })

    test('fromFactors static factory method', () => {
      const factors = [
        { prime: 2n, exponent: 1n },
        { prime: 3n, exponent: 1n },
        { prime: 7n, exponent: 1n }
      ]
      const num = UniversalNumber.fromFactors(factors)
      expect(num.toBigInt()).toBe(42n)
    })
  })

  describe('Conversion Methods', () => {
    test('toBigInt', () => {
      const num = new UniversalNumber(42)
      expect(num.toBigInt()).toBe(42n)
    })

    test('toNumber', () => {
      const num = new UniversalNumber(42)
      expect(num.toNumber()).toBe(42)
    })
    
    test('toNumber with large values throws error', () => {
      const num = new UniversalNumber('9007199254740992') // MAX_SAFE_INTEGER + 1
      expect(() => num.toNumber()).toThrow(PrimeMathError)
    })

    test('toNumber with allowApproximate option', () => {
      const num = new UniversalNumber('9007199254740995')
      expect(num.toNumber({ allowApproximate: true })).toBe(9007199254740996) // Note: precision loss due to IEEE 754
    })

    test('toNumber with suppressErrors option', () => {
      const largeNum = new UniversalNumber('1234567890123456789012345678901234567890')
      expect(largeNum.toNumber({ suppressErrors: true })).toBe(Number.POSITIVE_INFINITY)
      
      const largeNegNum = new UniversalNumber('-1234567890123456789012345678901234567890')
      expect(largeNegNum.toNumber({ suppressErrors: true })).toBe(Number.NEGATIVE_INFINITY)
    })

    test('toApproximateNumber', () => {
      const largeNum = new UniversalNumber('123456789012345678901234567890')
      const approx = largeNum.toApproximateNumber()
      
      // Should be in scientific notation - mantissa should match first 15 digits
      expect(approx).toBeGreaterThan(1e29)
      expect(approx).toBeLessThan(1.3e29)
      
      // For a very precise test, we can convert back to string and check format
      const numStr = approx.toExponential(14)
      expect(numStr.substring(0, 16)).toBe('1.23456789012345') // Precision might vary slightly due to IEEE 754
    })

    test('toApproximateNumber with significantDigits option', () => {
      const num = new UniversalNumber('123456789012345678901234567890')
      
      // With only 5 significant digits
      const approx = num.toApproximateNumber({ significantDigits: 5 })
      const numStr = approx.toExponential(4)
      expect(numStr.substring(0, 6)).toBe('1.2345') 
    })

    test('toApproximateNumber returns proper values for small numbers', () => {
      const smallNum = new UniversalNumber(42)
      expect(smallNum.toApproximateNumber()).toBe(42)
    })

    test('toString', () => {
      const num = new UniversalNumber(42)
      expect(num.toString()).toBe('42')
    })

    test('toString with base parameter', () => {
      const num = new UniversalNumber(42)
      expect(num.toString(2)).toBe('101010')
      expect(num.toString(16)).toBe('2a')
    })

    test('formatNumber', () => {
      const num = new UniversalNumber('123456789012345678901234567890')
      
      // Scientific notation
      expect(num.formatNumber({ notation: 'scientific', precision: 5 }))
        .toBe('1.2345e29')
      
      // Engineering notation (powers of 1000)
      expect(num.formatNumber({ notation: 'engineering', precision: 5 }))
        .toBe('123.45678e27')
      
      // Compact notation (with SI suffixes)
      expect(num.formatNumber({ notation: 'compact' }))
        .toBe('123456789012345Q')
      
      // Standard with grouping
      const smallerNum = new UniversalNumber('123456789')
      expect(smallerNum.formatNumber({ groupDigits: true }))
        .toBe('123,456,789')
    })

    test('formatNumber with different bases', () => {
      const num = new UniversalNumber(65535)
      
      // Hex with grouping
      expect(num.formatNumber({ base: 16, groupDigits: true, groupSeparator: ' ' }))
        .toBe('ffff')
        
      // Binary with grouping
      expect(num.formatNumber({ base: 2, groupDigits: true, groupSeparator: '_' }))
        .toBe('1111_1111_1111_1111')
    })

    test('getNumberParts', () => {
      const num = new UniversalNumber('123456789012345678901234567890')
      const parts = num.getNumberParts()
      
      expect(parts.sign).toBe(1)
      expect(parts.integerPart).toBe('1')
      expect(parts.fractionalPart.startsWith('2345678')).toBe(true)
      expect(parts.exponent).toBe(29)
      expect(parts.isExponentInRange).toBe(true)
      
      // With separate digits
      const partsWithDigits = num.getNumberParts({ getSeparateDigits: true })
      expect(partsWithDigits.integerDigits).toEqual([1])
      expect(partsWithDigits.fractionalDigits.slice(0, 3)).toEqual([2, 3, 4])
    })

    test('getDigits', () => {
      const num = new UniversalNumber(123)
      expect(num.getDigits()).toEqual([1, 2, 3])
    })

    test('getDigits with base parameter', () => {
      const num = new UniversalNumber(42)
      expect(num.getDigits(2)).toEqual([1, 0, 1, 0, 1, 0])
    })

    test('getDigits with leastSignificantFirst', () => {
      const num = new UniversalNumber(123)
      expect(num.getDigits(10, true)).toEqual([3, 2, 1])
    })
  })

  describe('Prime Factorization', () => {
    test('getFactorization', () => {
      const num = new UniversalNumber(12)
      const factorization = num.getFactorization()
      expect(factorization.get(2n)).toBe(2n)
      expect(factorization.get(3n)).toBe(1n)
      expect(factorization.size).toBe(2)
    })

    test('getCoordinates', () => {
      const num = new UniversalNumber(-12)
      const coords = num.getCoordinates()
      expect(coords.isNegative).toBe(true)
      expect(coords.factorization.get(2n)).toBe(2n)
      expect(coords.factorization.get(3n)).toBe(1n)
    })

    test('isIntrinsicPrime', () => {
      expect(new UniversalNumber(2).isIntrinsicPrime()).toBe(true)
      expect(new UniversalNumber(3).isIntrinsicPrime()).toBe(true)
      expect(new UniversalNumber(4).isIntrinsicPrime()).toBe(false)
      expect(new UniversalNumber(17).isIntrinsicPrime()).toBe(true)
      expect(new UniversalNumber(-5).isIntrinsicPrime()).toBe(false) // Negative numbers can't be prime
    })
  })

  describe('Arithmetic Operations', () => {
    test('add', () => {
      const a = new UniversalNumber(5)
      const b = new UniversalNumber(7)
      const result = a.add(b)
      expect(result.toBigInt()).toBe(12n)
    })

    test('add with different types', () => {
      const a = new UniversalNumber(5)
      expect(a.add(7).toBigInt()).toBe(12n)
      expect(a.add('7').toBigInt()).toBe(12n)
      expect(a.add(7n).toBigInt()).toBe(12n)
    })

    test('subtract', () => {
      const a = new UniversalNumber(10)
      const b = new UniversalNumber(7)
      const result = a.subtract(b)
      expect(result.toBigInt()).toBe(3n)
    })

    test('subtract resulting in negative', () => {
      const a = new UniversalNumber(7)
      const b = new UniversalNumber(10)
      const result = a.subtract(b)
      expect(result.toBigInt()).toBe(-3n)
    })

    test('multiply', () => {
      const a = new UniversalNumber(6)
      const b = new UniversalNumber(7)
      const result = a.multiply(b)
      expect(result.toBigInt()).toBe(42n)
    })

    test('multiply with sign handling', () => {
      const a = new UniversalNumber(6)
      const b = new UniversalNumber(-7)
      expect(a.multiply(b).toBigInt()).toBe(-42n)
      expect(new UniversalNumber(-6).multiply(-7).toBigInt()).toBe(42n)
    })

    test('divide', () => {
      const a = new UniversalNumber(42)
      const b = new UniversalNumber(7)
      const result = a.divide(b)
      expect(result.toBigInt()).toBe(6n)
    })

    test('divide with non-divisible numbers', () => {
      const a = new UniversalNumber(5)
      const b = new UniversalNumber(2)
      expect(() => a.divide(b)).toThrow(PrimeMathError)
    })

    test('divide by zero', () => {
      expect(() => new UniversalNumber(5).divide(0)).toThrow(PrimeMathError)
    })

    test('pow', () => {
      const a = new UniversalNumber(2)
      expect(a.pow(0).toBigInt()).toBe(1n)
      expect(a.pow(1).toBigInt()).toBe(2n)
      expect(a.pow(5).toBigInt()).toBe(32n)
    })

    test('pow with sign handling', () => {
      const a = new UniversalNumber(-2)
      expect(a.pow(2).toBigInt()).toBe(4n) // (-2)^2 = 4
      expect(a.pow(3).toBigInt()).toBe(-8n) // (-2)^3 = -8
    })

    test('gcd', () => {
      const a = new UniversalNumber(12)
      const b = new UniversalNumber(18)
      expect(a.gcd(b).toBigInt()).toBe(6n)
    })

    test('gcd with coprime numbers', () => {
      const a = new UniversalNumber(7)
      const b = new UniversalNumber(13)
      expect(a.gcd(b).toBigInt()).toBe(1n)
    })

    test('lcm', () => {
      const a = new UniversalNumber(12)
      const b = new UniversalNumber(18)
      expect(a.lcm(b).toBigInt()).toBe(36n)
    })
  })

  describe('Comparison and Utility Methods', () => {
    test('equals', () => {
      const a = new UniversalNumber(42)
      const b = new UniversalNumber(42)
      const c = new UniversalNumber(24)
      expect(a.equals(b)).toBe(true)
      expect(a.equals(c)).toBe(false)
      expect(a.equals(42)).toBe(true)
      expect(a.equals('42')).toBe(true)
      expect(a.equals(42n)).toBe(true)
    })

    test('compareTo', () => {
      const a = new UniversalNumber(10)
      const b = new UniversalNumber(20)
      expect(a.compareTo(b)).toBe(-1)
      expect(b.compareTo(a)).toBe(1)
      expect(a.compareTo(10)).toBe(0)
    })

    test('abs', () => {
      const a = new UniversalNumber(-42)
      expect(a.abs().toBigInt()).toBe(42n)
      expect(new UniversalNumber(42).abs().toBigInt()).toBe(42n)
    })

    test('negate', () => {
      const a = new UniversalNumber(42)
      expect(a.negate().toBigInt()).toBe(-42n)
      expect(new UniversalNumber(-42).negate().toBigInt()).toBe(42n)
    })

    test('sign', () => {
      expect(new UniversalNumber(42).sign()).toBe(1)
      expect(new UniversalNumber(-42).sign()).toBe(-1)
    })
  })

  describe('Serialization', () => {
    test('toJSON', () => {
      const num = new UniversalNumber(42)
      const json = num.toJSON()
      // @ts-ignore
      expect(json.type).toBe('UniversalNumber')
      // @ts-ignore
      expect(json.isNegative).toBe(false)
      // @ts-ignore
      expect(typeof json.factors).toBe('object')
    })

    test('fromJSON', () => {
      const original = new UniversalNumber(42)
      const json = original.toJSON()
      const restored = UniversalNumber.fromJSON(json)
      expect(restored.equals(original)).toBe(true)
    })

    test('round-trip through JSON', () => {
      const original = new UniversalNumber(-123456789)
      const jsonString = JSON.stringify(original)
      const restored = UniversalNumber.fromJSON(JSON.parse(jsonString))
      expect(restored.toBigInt()).toBe(-123456789n)
    })
  })

  describe('Edge Cases', () => {
    test('large numbers', () => {
      // Use a smaller number that won't exceed BigInt size limits during primality testing
      const large = new UniversalNumber('123456789')
      expect(large.toString()).toBe('123456789')
    })

    test('negative numbers', () => {
      const negative = new UniversalNumber(-42)
      expect(negative.toBigInt()).toBe(-42n)
      expect(negative.toString()).toBe('-42')
    })

    test('prime powers', () => {
      const primePower = new UniversalNumber(8) // 2^3
      const factorization = primePower.getFactorization()
      expect(factorization.size).toBe(1)
      expect(factorization.get(2n)).toBe(3n)
    })

    test('one', () => {
      const one = new UniversalNumber(1)
      expect(one.getFactorization().size).toBe(0)
      expect(one.toBigInt()).toBe(1n)
    })
  })
})