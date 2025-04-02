const PrimeMath = require('../src/PrimeMath')
const { PrimeMathError } = require('../src/Utils')

describe('PrimeMath', () => {
  describe('basic arithmetic operations', () => {
    test('add should correctly add two numbers', () => {
      expect(PrimeMath.add(5, 3)).toBe(8n)
      expect(PrimeMath.add(0, 0)).toBe(0n)
      expect(PrimeMath.add(-5, 3)).toBe(-2n)
      expect(PrimeMath.add('1234567890123456789', '9876543210987654321')).toBe(11111111101111111110n)
    })

    test('subtract should correctly subtract two numbers', () => {
      expect(PrimeMath.subtract(5, 3)).toBe(2n)
      expect(PrimeMath.subtract(3, 5)).toBe(-2n)
      expect(PrimeMath.subtract(0, 0)).toBe(0n)
      expect(PrimeMath.subtract('9876543210987654321', '1234567890123456789')).toBe(8641975320864197532n)
    })

    test('multiply should correctly multiply two numbers', () => {
      expect(PrimeMath.multiply(5, 3)).toBe(15n)
      expect(PrimeMath.multiply(0, 5)).toBe(0n)
      expect(PrimeMath.multiply(-5, 3)).toBe(-15n)
      expect(PrimeMath.multiply(-5, -3)).toBe(15n)
      expect(PrimeMath.multiply('1234567890', '9876543210')).toBe(12193263111263526900n)
    })

    test('divide should correctly perform exact division', () => {
      expect(PrimeMath.divide(15, 3)).toBe(5n)
      expect(PrimeMath.divide(0, 5)).toBe(0n)
      expect(PrimeMath.divide(-15, 3)).toBe(-5n)
      expect(PrimeMath.divide(-15, -3)).toBe(5n)
      expect(PrimeMath.divide(12193263111263526900n, 1234567890n)).toBe(9876543210n)
    })

    test('divide should throw error for non-exact division', () => {
      expect(() => PrimeMath.divide(5, 2)).toThrow(PrimeMathError)
      expect(() => PrimeMath.divide(7, 3)).toThrow(PrimeMathError)
    })

    test('divide should throw error for division by zero', () => {
      expect(() => PrimeMath.divide(5, 0)).toThrow(PrimeMathError)
    })

    test('pow should correctly calculate power', () => {
      expect(PrimeMath.pow(2, 3)).toBe(8n)
      expect(PrimeMath.pow(3, 4)).toBe(81n)
      expect(PrimeMath.pow(5, 0)).toBe(1n)
      expect(PrimeMath.pow(0, 5)).toBe(0n)
      expect(PrimeMath.pow(10, 10)).toBe(10000000000n)
    })

    test('pow should throw error for negative exponents', () => {
      expect(() => PrimeMath.pow(2, -1)).toThrow(PrimeMathError)
    })
  })

  describe('GCD and LCM functions', () => {
    test('gcd should correctly calculate greatest common divisor', () => {
      expect(PrimeMath.gcd(12, 8)).toBe(4n)
      expect(PrimeMath.gcd(17, 5)).toBe(1n)
      expect(PrimeMath.gcd(0, 5)).toBe(5n)
      expect(PrimeMath.gcd(5, 0)).toBe(5n)
      expect(PrimeMath.gcd(48, 18)).toBe(6n)
      expect(PrimeMath.gcd(-12, 8)).toBe(4n)
      expect(PrimeMath.gcd(12, -8)).toBe(4n)
    })

    test('lcm should correctly calculate least common multiple', () => {
      expect(PrimeMath.lcm(12, 8)).toBe(24n)
      expect(PrimeMath.lcm(17, 5)).toBe(85n)
      expect(PrimeMath.lcm(0, 5)).toBe(0n)
      expect(PrimeMath.lcm(5, 0)).toBe(0n)
      expect(PrimeMath.lcm(48, 18)).toBe(144n)
      expect(PrimeMath.lcm(-12, 8)).toBe(24n)
      expect(PrimeMath.lcm(12, -8)).toBe(24n)
    })
  })

  describe('primality testing', () => {
    test('isPrime should correctly identify prime numbers', () => {
      expect(PrimeMath.isPrime(2)).toBe(true)
      expect(PrimeMath.isPrime(3)).toBe(true)
      expect(PrimeMath.isPrime(5)).toBe(true)
      expect(PrimeMath.isPrime(7)).toBe(true)
      expect(PrimeMath.isPrime(11)).toBe(true)
      expect(PrimeMath.isPrime(13)).toBe(true)
      expect(PrimeMath.isPrime(17)).toBe(true)
      expect(PrimeMath.isPrime(19)).toBe(true)
      expect(PrimeMath.isPrime(23)).toBe(true)
      expect(PrimeMath.isPrime(997)).toBe(true)
    })

    test('isPrime should correctly identify non-prime numbers', () => {
      expect(PrimeMath.isPrime(1)).toBe(false)
      expect(PrimeMath.isPrime(0)).toBe(false)
      expect(PrimeMath.isPrime(-5)).toBe(false)
      expect(PrimeMath.isPrime(4)).toBe(false)
      expect(PrimeMath.isPrime(6)).toBe(false)
      expect(PrimeMath.isPrime(8)).toBe(false)
      expect(PrimeMath.isPrime(9)).toBe(false)
      expect(PrimeMath.isPrime(10)).toBe(false)
      expect(PrimeMath.isPrime(25)).toBe(false)
      expect(PrimeMath.isPrime(100)).toBe(false)
    })

    test('nextPrime should find the next prime number', () => {
      expect(PrimeMath.nextPrime(0)).toBe(2n)
      expect(PrimeMath.nextPrime(1)).toBe(2n)
      expect(PrimeMath.nextPrime(2)).toBe(3n)
      expect(PrimeMath.nextPrime(3)).toBe(5n)
      expect(PrimeMath.nextPrime(5)).toBe(7n)
      expect(PrimeMath.nextPrime(11)).toBe(13n)
      expect(PrimeMath.nextPrime(97)).toBe(101n)
      expect(PrimeMath.nextPrime(900)).toBe(907n)
    })
  })

  describe('advanced number theory functions', () => {
    test('primorial should compute the product of all primes <= n', () => {
      expect(PrimeMath.primorial(1)).toBe(1n)
      expect(PrimeMath.primorial(2)).toBe(2n)
      expect(PrimeMath.primorial(3)).toBe(6n)
      expect(PrimeMath.primorial(5)).toBe(30n)
      expect(PrimeMath.primorial(6)).toBe(30n) // 6 is not prime, so same as primorial(5)
      expect(PrimeMath.primorial(7)).toBe(210n)
      expect(PrimeMath.primorial(11)).toBe(2310n)
    })

    test('modInverse should find the modular inverse', () => {
      expect(PrimeMath.modInverse(3, 11)).toBe(4n) // 3 * 4 = 12 ≡ 1 (mod 11)
      expect(PrimeMath.modInverse(7, 15)).toBe(13n) // 7 * 13 = 91 ≡ 1 (mod 15)
    })

    test('modInverse should return null if inverse does not exist', () => {
      expect(PrimeMath.modInverse(2, 4)).toBeNull()
      expect(PrimeMath.modInverse(4, 8)).toBeNull()
      expect(PrimeMath.modInverse(0, 5)).toBeNull()
    })

    test('modInverse should throw error for non-positive modulus', () => {
      expect(() => PrimeMath.modInverse(5, 0)).toThrow(PrimeMathError)
      expect(() => PrimeMath.modInverse(5, -10)).toThrow(PrimeMathError)
    })

    test('modPow should correctly calculate modular exponentiation', () => {
      expect(PrimeMath.modPow(2, 5, 13)).toBe(6n) // 2^5 = 32 ≡ 6 (mod 13)
      expect(PrimeMath.modPow(5, 3, 13)).toBe(8n) // 5^3 = 125 ≡ 8 (mod 13)
      expect(PrimeMath.modPow(4, 13, 497)).toBe(445n)
      
      // Test with modulus 1 (always results in 0)
      expect(PrimeMath.modPow(5, 3, 1)).toBe(0n)
    })

    test('modPow should handle negative exponents', () => {
      expect(PrimeMath.modPow(3, -1, 11)).toBe(4n) // 3^(-1) ≡ 4 (mod 11)
      expect(PrimeMath.modPow(7, -2, 15)).toBe(4n) // 7^(-2) ≡ 4 (mod 15)
    })

    test('modPow should throw error for invalid negative exponents', () => {
      expect(() => PrimeMath.modPow(4, -1, 8)).toThrow(PrimeMathError)
      expect(() => PrimeMath.modPow(6, -1, 9)).toThrow(PrimeMathError)
    })

    test('modPow should throw error for non-positive modulus', () => {
      expect(() => PrimeMath.modPow(5, 3, 0)).toThrow(PrimeMathError)
      expect(() => PrimeMath.modPow(5, 3, -10)).toThrow(PrimeMathError)
    })

    test('isPerfectPower should identify perfect powers', () => {
      expect(PrimeMath.isPerfectPower(4)).toEqual({ base: 2n, exponent: 2n }) // 2^2
      expect(PrimeMath.isPerfectPower(8)).toEqual({ base: 2n, exponent: 3n }) // 2^3
      expect(PrimeMath.isPerfectPower(9)).toEqual({ base: 3n, exponent: 2n }) // 3^2
      expect(PrimeMath.isPerfectPower(16)).toEqual({ base: 2n, exponent: 4n }) // 2^4
      expect(PrimeMath.isPerfectPower(25)).toEqual({ base: 5n, exponent: 2n }) // 5^2
      expect(PrimeMath.isPerfectPower(27)).toEqual({ base: 3n, exponent: 3n }) // 3^3
      expect(PrimeMath.isPerfectPower(32)).toEqual({ base: 2n, exponent: 5n }) // 2^5
      expect(PrimeMath.isPerfectPower(36)).toEqual({ base: 6n, exponent: 2n }) // 6^2
    })

    test('isPerfectPower should return null for non-perfect powers', () => {
      expect(PrimeMath.isPerfectPower(2)).toBeNull()
      expect(PrimeMath.isPerfectPower(3)).toBeNull()
      expect(PrimeMath.isPerfectPower(5)).toBeNull()
      expect(PrimeMath.isPerfectPower(6)).toBeNull()
      expect(PrimeMath.isPerfectPower(7)).toBeNull()
      expect(PrimeMath.isPerfectPower(10)).toBeNull()
      expect(PrimeMath.isPerfectPower(11)).toBeNull()
      expect(PrimeMath.isPerfectPower(12)).toBeNull()
      expect(PrimeMath.isPerfectPower(1)).toBeNull()
      expect(PrimeMath.isPerfectPower(0)).toBeNull()
    })

    test('totient should correctly calculate Euler\'s totient function', () => {
      expect(PrimeMath.totient(1)).toBe(1n)
      expect(PrimeMath.totient(2)).toBe(1n)
      expect(PrimeMath.totient(3)).toBe(2n)
      expect(PrimeMath.totient(4)).toBe(2n)
      expect(PrimeMath.totient(6)).toBe(2n)
      expect(PrimeMath.totient(8)).toBe(4n)
      expect(PrimeMath.totient(9)).toBe(6n)
      expect(PrimeMath.totient(10)).toBe(4n)
      expect(PrimeMath.totient(12)).toBe(4n)
      expect(PrimeMath.totient(36)).toBe(12n)
    })

    test('totient should throw error for non-positive integers', () => {
      expect(() => PrimeMath.totient(0)).toThrow(PrimeMathError)
      expect(() => PrimeMath.totient(-5)).toThrow(PrimeMathError)
    })

    test('getDivisors should find all divisors of a number', () => {
      expect(PrimeMath.getDivisors(1)).toEqual([1n])
      expect(PrimeMath.getDivisors(6)).toEqual([1n, 2n, 3n, 6n])
      expect(PrimeMath.getDivisors(12)).toEqual([1n, 2n, 3n, 4n, 6n, 12n])
      expect(PrimeMath.getDivisors(36)).toEqual([1n, 2n, 3n, 4n, 6n, 9n, 12n, 18n, 36n])
    })

    test('getDivisors should throw error for non-positive integers', () => {
      expect(() => PrimeMath.getDivisors(0)).toThrow(PrimeMathError)
      expect(() => PrimeMath.getDivisors(-5)).toThrow(PrimeMathError)
    })

    test('isPerfectNumber should identify perfect numbers', () => {
      expect(PrimeMath.isPerfectNumber(6)).toBe(true) // 1 + 2 + 3 = 6
      expect(PrimeMath.isPerfectNumber(28)).toBe(true) // 1 + 2 + 4 + 7 + 14 = 28
    })

    test('isPerfectNumber should identify non-perfect numbers', () => {
      expect(PrimeMath.isPerfectNumber(1)).toBe(false)
      expect(PrimeMath.isPerfectNumber(2)).toBe(false)
      expect(PrimeMath.isPerfectNumber(3)).toBe(false)
      expect(PrimeMath.isPerfectNumber(4)).toBe(false)
      expect(PrimeMath.isPerfectNumber(5)).toBe(false)
      expect(PrimeMath.isPerfectNumber(10)).toBe(false)
      expect(PrimeMath.isPerfectNumber(12)).toBe(false)
      expect(PrimeMath.isPerfectNumber(18)).toBe(false)
      expect(PrimeMath.isPerfectNumber(20)).toBe(false)
    })

    test('radical should compute the product of distinct prime factors', () => {
      expect(PrimeMath.radical(1)).toBe(1n)
      expect(PrimeMath.radical(6)).toBe(6n) // rad(6) = rad(2*3) = 2*3 = 6
      expect(PrimeMath.radical(8)).toBe(2n) // rad(8) = rad(2^3) = 2
      expect(PrimeMath.radical(12)).toBe(6n) // rad(12) = rad(2^2*3) = 2*3 = 6
      expect(PrimeMath.radical(36)).toBe(6n) // rad(36) = rad(2^2*3^2) = 2*3 = 6
      expect(PrimeMath.radical(45)).toBe(15n) // rad(45) = rad(3^2*5) = 3*5 = 15
      expect(PrimeMath.radical(100)).toBe(10n) // rad(100) = rad(2^2*5^2) = 2*5 = 10
    })

    test('radical should throw error for non-positive integers', () => {
      expect(() => PrimeMath.radical(0)).toThrow(PrimeMathError)
      expect(() => PrimeMath.radical(-5)).toThrow(PrimeMathError)
    })

    test('sumOfDivisors should calculate sum of divisors correctly', () => {
      expect(PrimeMath.sumOfDivisors(1)).toBe(1n)
      expect(PrimeMath.sumOfDivisors(6)).toBe(12n) // 1 + 2 + 3 + 6 = 12
      expect(PrimeMath.sumOfDivisors(12)).toBe(28n) // 1 + 2 + 3 + 4 + 6 + 12 = 28
      expect(PrimeMath.sumOfDivisors(28)).toBe(56n) // 1 + 2 + 4 + 7 + 14 + 28 = 56
    })

    test('sumOfDivisors should handle different powers k', () => {
      expect(PrimeMath.sumOfDivisors(6, 0)).toBe(4n) // 1^0 + 2^0 + 3^0 + 6^0 = 1 + 1 + 1 + 1 = 4
      expect(PrimeMath.sumOfDivisors(6, 1)).toBe(12n) // 1^1 + 2^1 + 3^1 + 6^1 = 1 + 2 + 3 + 6 = 12
      expect(PrimeMath.sumOfDivisors(6, 2)).toBe(50n) // 1^2 + 2^2 + 3^2 + 6^2 = 1 + 4 + 9 + 36 = 50
    })

    test('sumOfDivisors should throw error for non-positive integers', () => {
      expect(() => PrimeMath.sumOfDivisors(0)).toThrow(PrimeMathError)
      expect(() => PrimeMath.sumOfDivisors(-5)).toThrow(PrimeMathError)
    })

    test('sumOfDivisors should throw error for negative power k', () => {
      expect(() => PrimeMath.sumOfDivisors(6, -1)).toThrow(PrimeMathError)
    })
  })
})