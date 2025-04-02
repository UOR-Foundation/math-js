const {
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
} = require('../src/Utils')

describe('Utils Module', () => {
  describe('PrimeMathError', () => {
    test('should create custom error with correct name and message', () => {
      const error = new PrimeMathError('Test error message')
      expect(error.name).toBe('PrimeMathError')
      expect(error.message).toBe('Test error message')
    })
  })

  describe('fastExp', () => {
    test('should correctly compute exponentiation', () => {
      expect(fastExp(2n, 0n)).toBe(1n)
      expect(fastExp(2n, 1n)).toBe(2n)
      expect(fastExp(2n, 10n)).toBe(1024n)
      expect(fastExp(3n, 4n)).toBe(81n)
      expect(fastExp(5n, 3n)).toBe(125n)
    })

    test('should throw error for negative exponents', () => {
      expect(() => fastExp(2n, -1n)).toThrow(PrimeMathError)
    })
  })

  describe('isDivisible', () => {
    test('should correctly check divisibility', () => {
      expect(isDivisible(10n, 2n)).toBe(true)
      expect(isDivisible(10n, 3n)).toBe(false)
      expect(isDivisible(100n, 25n)).toBe(true)
      expect(isDivisible(100n, 30n)).toBe(false)
      expect(isDivisible(0n, 5n)).toBe(true)
    })

    test('should throw error when divisor is zero', () => {
      expect(() => isDivisible(10n, 0n)).toThrow(PrimeMathError)
    })
  })

  describe('exactDivide', () => {
    test('should correctly perform exact division', () => {
      expect(exactDivide(10n, 2n)).toBe(5n)
      expect(exactDivide(100n, 25n)).toBe(4n)
      expect(exactDivide(0n, 5n)).toBe(0n)
    })

    test('should throw error when division is not exact', () => {
      expect(() => exactDivide(10n, 3n)).toThrow(PrimeMathError)
    })

    test('should throw error when divisor is zero', () => {
      expect(() => exactDivide(10n, 0n)).toThrow(PrimeMathError)
    })
  })

  describe('gcd', () => {
    test('should correctly compute GCD', () => {
      expect(gcd(12n, 8n)).toBe(4n)
      expect(gcd(17n, 5n)).toBe(1n)
      expect(gcd(0n, 5n)).toBe(5n)
      expect(gcd(5n, 0n)).toBe(5n)
      expect(gcd(-12n, 8n)).toBe(4n)
      expect(gcd(12n, -8n)).toBe(4n)
    })
  })

  describe('lcm', () => {
    test('should correctly compute LCM', () => {
      expect(lcm(12n, 8n)).toBe(24n)
      expect(lcm(17n, 5n)).toBe(85n)
      expect(lcm(0n, 5n)).toBe(0n)
      expect(lcm(5n, 0n)).toBe(0n)
      expect(lcm(-12n, 8n)).toBe(24n)
      expect(lcm(12n, -8n)).toBe(24n)
    })
  })

  describe('toBigInt', () => {
    test('should correctly convert values to BigInt', () => {
      expect(toBigInt(123)).toBe(123n)
      expect(toBigInt('456')).toBe(456n)
      expect(toBigInt(789n)).toBe(789n)
    })

    test('should throw error for non-integer numbers', () => {
      expect(() => toBigInt(12.34)).toThrow(PrimeMathError)
    })

    test('should throw error for unsafe integers', () => {
      expect(() => toBigInt(Number.MAX_SAFE_INTEGER + 1)).toThrow(PrimeMathError)
    })

    test('should throw error for values that cannot be converted', () => {
      expect(() => toBigInt('invalid')).toThrow(PrimeMathError)
    })
  })

  describe('isPrime', () => {
    test('should correctly identify prime numbers', () => {
      expect(isPrime(2n)).toBe(true)
      expect(isPrime(3n)).toBe(true)
      expect(isPrime(5n)).toBe(true)
      expect(isPrime(7n)).toBe(true)
      expect(isPrime(11n)).toBe(true)
      expect(isPrime(17n)).toBe(true)
      expect(isPrime(19n)).toBe(true)
      expect(isPrime(23n)).toBe(true)
    })

    test('should correctly identify non-prime numbers', () => {
      expect(isPrime(1n)).toBe(false)
      expect(isPrime(4n)).toBe(false)
      expect(isPrime(6n)).toBe(false)
      expect(isPrime(8n)).toBe(false)
      expect(isPrime(9n)).toBe(false)
      expect(isPrime(10n)).toBe(false)
      expect(isPrime(15n)).toBe(false)
      expect(isPrime(25n)).toBe(false)
    })
  })

  describe('nextPrime', () => {
    test('should find the next prime number', () => {
      expect(nextPrime(0n)).toBe(2n)
      expect(nextPrime(1n)).toBe(2n)
      expect(nextPrime(2n)).toBe(3n)
      expect(nextPrime(3n)).toBe(5n)
      expect(nextPrime(4n)).toBe(5n)
      expect(nextPrime(5n)).toBe(7n)
      expect(nextPrime(10n)).toBe(11n)
      expect(nextPrime(18n)).toBe(19n)
      expect(nextPrime(19n)).toBe(23n)
      expect(nextPrime(100n)).toBe(101n)
    })
  })

  describe('factorial', () => {
    test('should correctly compute factorial', () => {
      expect(factorial(0n)).toBe(1n)
      expect(factorial(1n)).toBe(1n)
      expect(factorial(2n)).toBe(2n)
      expect(factorial(3n)).toBe(6n)
      expect(factorial(4n)).toBe(24n)
      expect(factorial(5n)).toBe(120n)
      expect(factorial(10n)).toBe(3628800n)
    })

    test('should throw error for negative numbers', () => {
      expect(() => factorial(-1n)).toThrow(PrimeMathError)
    })
  })
})