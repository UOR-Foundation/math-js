/**
 * Benchmark Suite: Arithmetic Operations
 * 
 * This suite tests the performance of basic arithmetic operations on UniversalNumbers
 * of various sizes, comparing them with native BigInt operations where appropriate.
 */

const { createSuite } = require('../benchmark-runner')
const mathjs = require('../../src')
const { UniversalNumber } = mathjs

// Create the arithmetic operations benchmark suite
const suite = createSuite('Arithmetic Operations', {
  warmupRuns: 5,
  iterations: 10
})

// Helper to create numbers of different sizes
function createTestNumbers() {
  return {
    // Small numbers (< 32 bits)
    small: [
      new UniversalNumber(12),
      new UniversalNumber(25),
      new UniversalNumber(42),
      new UniversalNumber(123),
      new UniversalNumber(999),
    ],
    // Medium numbers (32-64 bits)
    medium: [
      new UniversalNumber(12345678),
      new UniversalNumber(987654321),
      new UniversalNumber(2147483647), // 2^31 - 1
      new UniversalNumber(9007199254740991), // 2^53 - 1 (max safe integer)
    ],
    // Large numbers (>64 bits)
    large: [
      new UniversalNumber('123456789012345678901'),
      new UniversalNumber('987654321098765432109'),
      new UniversalNumber('10000000000000000000'), // 10^19
    ],
    // Power of 2 numbers
    powers2: [
      new UniversalNumber(2).pow(10), // 1024
      new UniversalNumber(2).pow(16), // 65536
      new UniversalNumber(2).pow(32), // 4,294,967,296
      new UniversalNumber(2).pow(64), // 2^64
    ],
    // Composite numbers with many factors
    composites: [
      new UniversalNumber(360), // 2^3 * 3^2 * 5
      new UniversalNumber(2310), // 2 * 3 * 5 * 7 * 11
      new UniversalNumber(720720), // 2^4 * 3^2 * 5 * 11 * 13
    ],
    // Prime numbers
    primes: [
      new UniversalNumber(101),
      new UniversalNumber(10007),
      new UniversalNumber('10000000019'), // 10-digit prime
    ]
  }
}

// Addition benchmarks
suite.add('Addition (small numbers)', () => {
  const numbers = createTestNumbers().small
  let result
  
  for (let i = 0; i < numbers.length - 1; i++) {
    result = numbers[i].add(numbers[i + 1])
  }
  
  return result
})

suite.add('Addition (medium numbers)', () => {
  const numbers = createTestNumbers().medium
  let result
  
  for (let i = 0; i < numbers.length - 1; i++) {
    result = numbers[i].add(numbers[i + 1])
  }
  
  return result
})

suite.add('Addition (large numbers)', () => {
  const numbers = createTestNumbers().large
  let result
  
  for (let i = 0; i < numbers.length - 1; i++) {
    result = numbers[i].add(numbers[i + 1])
  }
  
  return result
})

// Multiplication benchmarks
suite.add('Multiplication (small numbers)', () => {
  const numbers = createTestNumbers().small
  let result
  
  for (let i = 0; i < numbers.length - 1; i++) {
    result = numbers[i].multiply(numbers[i + 1])
  }
  
  return result
})

suite.add('Multiplication (medium numbers)', () => {
  const numbers = createTestNumbers().medium
  let result
  
  for (let i = 0; i < numbers.length - 1; i++) {
    result = numbers[i].multiply(numbers[i + 1])
  }
  
  return result
})

suite.add('Multiplication (large numbers)', () => {
  const numbers = createTestNumbers().large
  let result
  
  for (let i = 0; i < numbers.length - 1; i++) {
    result = numbers[i].multiply(numbers[i + 1])
  }
  
  return result
})

// Multiplication with prime factorization optimization
suite.add('Multiplication (composite numbers)', () => {
  const numbers = createTestNumbers().composites
  let result
  
  for (let i = 0; i < numbers.length - 1; i++) {
    result = numbers[i].multiply(numbers[i + 1])
  }
  
  return result
})

// Exponentiation benchmarks
suite.add('Exponentiation (small numbers, small powers)', () => {
  const numbers = createTestNumbers().small
  let result
  
  for (let i = 0; i < numbers.length; i++) {
    result = numbers[i].pow(5)
  }
  
  return result
})

suite.add('Exponentiation (medium numbers, medium powers)', () => {
  const numbers = createTestNumbers().medium
  let result
  
  for (let i = 0; i < numbers.length; i++) {
    result = numbers[i].pow(10)
  }
  
  return result
})

suite.add('Exponentiation (powers of 2, doubling)', () => {
  const numbers = createTestNumbers().powers2
  let result
  
  for (let i = 0; i < numbers.length; i++) {
    result = numbers[i].pow(2)
  }
  
  return result
})

// GCD benchmarks
suite.add('GCD (small numbers)', () => {
  const pairs = [
    [new UniversalNumber(12), new UniversalNumber(18)],
    [new UniversalNumber(35), new UniversalNumber(49)],
    [new UniversalNumber(24), new UniversalNumber(36)],
    [new UniversalNumber(101), new UniversalNumber(103)],
  ]
  
  let result
  for (const [a, b] of pairs) {
    result = a.gcd(b)
  }
  
  return result
})

suite.add('GCD (large numbers)', () => {
  const pairs = [
    [new UniversalNumber('123456789'), new UniversalNumber('987654321')],
    [new UniversalNumber('1000000000'), new UniversalNumber('10000000000')],
    [new UniversalNumber('1234567890'), new UniversalNumber('9876543210')],
  ]
  
  let result
  for (const [a, b] of pairs) {
    result = a.gcd(b)
  }
  
  return result
})

// Comparison with native BigInt
suite.add('UniversalNumber vs BigInt (addition)', () => {
  const a = new UniversalNumber('1234567890')
  const b = new UniversalNumber('9876543210')
  
  // UniversalNumber addition
  const univResult = a.add(b)
  
  // BigInt addition
  const bigA = BigInt('1234567890')
  const bigB = BigInt('9876543210')
  const bigResult = bigA + bigB
  
  // Verify they're equal
  return { univResult, bigIntValue: bigResult }
})

suite.add('UniversalNumber vs BigInt (multiplication)', () => {
  const a = new UniversalNumber('1234567890')
  const b = new UniversalNumber('9876543210')
  
  // UniversalNumber multiplication
  const univResult = a.multiply(b)
  
  // BigInt multiplication
  const bigA = BigInt('1234567890')
  const bigB = BigInt('9876543210')
  const bigResult = bigA * bigB
  
  // Verify they're equal
  return { univResult, bigIntValue: bigResult }
})

// Export the suite
module.exports = suite