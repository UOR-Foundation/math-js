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

    test('should reject zero', () => {
      expect(() => new UniversalNumber(0)).toThrow(PrimeMathError)
      expect(() => new UniversalNumber('0')).toThrow(PrimeMathError)
      expect(() => new UniversalNumber(0n)).toThrow(PrimeMathError)
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

    test('toString', () => {
      const num = new UniversalNumber(42)
      expect(num.toString()).toBe('42')
    })

    test('toString with base parameter', () => {
      const num = new UniversalNumber(42)
      expect(num.toString(2)).toBe('101010')
      expect(num.toString(16)).toBe('2a')
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
      const large = new UniversalNumber('12345678901234567890')
      expect(large.toString()).toBe('12345678901234567890')
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