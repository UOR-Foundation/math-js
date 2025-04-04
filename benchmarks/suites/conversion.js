/**
 * Benchmark Suite: Conversion Operations
 * 
 * Tests the performance of conversions between UniversalNumber and other formats,
 * including string, BigInt, and different bases.
 */

const { createSuite } = require('../benchmark-runner')
const mathjs = require('../../src')
const { UniversalNumber } = mathjs
const Conversion = require('../../src/Conversion')

// Create the conversion benchmark suite
const suite = createSuite('Conversion Operations', {
  warmupRuns: 3,
  iterations: 5
})

// Helper to create test numbers of different sizes
function createConversionTestNumbers() {
  return {
    // Small numbers (< 32 bits)
    small: [
      12,
      42,
      255,
      1234,
      9999,
    ],
    // Medium numbers (32-64 bits)
    medium: [
      1000000,
      2147483647, // 2^31 - 1
      9007199254740991, // 2^53 - 1 (max safe integer)
    ],
    // Large numbers (>64 bits)
    large: [
      '123456789012345678901',
      '987654321098765432109',
      '10000000000000000000', // 10^19
    ],
    // Binary-friendly numbers
    binary: [
      255, // 2^8 - 1
      65535, // 2^16 - 1
      4294967295, // 2^32 - 1
      BigInt('18446744073709551615'), // 2^64 - 1
    ],
    // Numbers with specific base representation patterns
    baseSpecific: {
      binary: '1010101010101010', // Binary pattern
      octal: '76543210', // Octal digits
      hex: 'DEADBEEF', // Hex pattern
      base36: 'CLAUDE123' // Base36 (alphanumeric)
    }
  }
}

// Conversion from native types to UniversalNumber
suite.add('Number to UniversalNumber (small)', () => {
  const numbers = createConversionTestNumbers().small
  
  let results = []
  for (const num of numbers) {
    results.push(new UniversalNumber(num))
  }
  
  return results
})

suite.add('Number to UniversalNumber (medium)', () => {
  const numbers = createConversionTestNumbers().medium
  
  let results = []
  for (const num of numbers) {
    results.push(new UniversalNumber(num))
  }
  
  return results
})

suite.add('String to UniversalNumber (large)', () => {
  const numbers = createConversionTestNumbers().large
  
  let results = []
  for (const num of numbers) {
    results.push(new UniversalNumber(num))
  }
  
  return results
})

suite.add('BigInt to UniversalNumber', () => {
  const numbers = createConversionTestNumbers().binary
    .map(n => typeof n === 'bigint' ? n : BigInt(n))
  
  let results = []
  for (const num of numbers) {
    results.push(new UniversalNumber(num))
  }
  
  return results
})

// Conversion from UniversalNumber to native types
suite.add('UniversalNumber to BigInt (small)', () => {
  const numbers = createConversionTestNumbers().small
    .map(n => new UniversalNumber(n))
  
  let results = []
  for (const num of numbers) {
    results.push(num.toBigInt())
  }
  
  return results
})

suite.add('UniversalNumber to BigInt (large)', () => {
  const numbers = createConversionTestNumbers().large
    .map(n => new UniversalNumber(n))
  
  let results = []
  for (const num of numbers) {
    results.push(num.toBigInt())
  }
  
  return results
})

suite.add('UniversalNumber to String (decimal)', () => {
  const numbers = [
    ...createConversionTestNumbers().small,
    ...createConversionTestNumbers().medium,
  ].map(n => new UniversalNumber(n))
  
  let results = []
  for (const num of numbers) {
    results.push(num.toString())
  }
  
  return results
})

// Base conversion benchmarks
suite.add('UniversalNumber to String (binary)', () => {
  const numbers = createConversionTestNumbers().binary
    .map(n => typeof n === 'bigint' ? new UniversalNumber(n.toString()) : new UniversalNumber(n))
  
  let results = []
  for (const num of numbers) {
    results.push(num.toString(2))
  }
  
  return results
})

suite.add('UniversalNumber to String (hex)', () => {
  const numbers = createConversionTestNumbers().binary
    .map(n => typeof n === 'bigint' ? new UniversalNumber(n.toString()) : new UniversalNumber(n))
  
  let results = []
  for (const num of numbers) {
    results.push(num.toString(16))
  }
  
  return results
})

suite.add('String to UniversalNumber (various bases)', () => {
  const tests = [
    { value: createConversionTestNumbers().baseSpecific.binary, base: 2 },
    { value: createConversionTestNumbers().baseSpecific.octal, base: 8 },
    { value: createConversionTestNumbers().baseSpecific.hex, base: 16 },
    { value: createConversionTestNumbers().baseSpecific.base36, base: 36 }
  ]
  
  let results = []
  for (const test of tests) {
    results.push(UniversalNumber.fromString(test.value, test.base))
  }
  
  return results
})

// Comparison with native conversion
suite.add('UniversalNumber vs Native (toString decimal)', () => {
  const univNumber = new UniversalNumber('123456789012345678901')
  const bigintNumber = BigInt('123456789012345678901')
  
  // UniversalNumber toString
  const univResult = univNumber.toString()
  
  // BigInt toString
  const bigintResult = bigintNumber.toString()
  
  return { univResult, bigintResult }
})

suite.add('UniversalNumber vs Native (base conversion)', () => {
  const univNumber = new UniversalNumber('123456789')
  const bigintNumber = BigInt('123456789')
  
  // UniversalNumber to binary
  const univBinary = univNumber.toString(2)
  
  // BigInt to binary
  const bigintBinary = bigintNumber.toString(2)
  
  // UniversalNumber to hex
  const univHex = univNumber.toString(16)
  
  // BigInt to hex
  const bigintHex = bigintNumber.toString(16)
  
  return { univBinary, bigintBinary, univHex, bigintHex }
})

// Digit extraction performance
suite.add('getDigits Performance (base 10)', () => {
  const numbers = [
    new UniversalNumber(12345),
    new UniversalNumber(9876543),
    new UniversalNumber('123456789012345')
  ]
  
  let results = []
  for (const num of numbers) {
    results.push(Conversion.getDigits(num.toBigInt(), 10))
  }
  
  return results
})

suite.add('getDigits Performance (base 2)', () => {
  const numbers = [
    new UniversalNumber(255),
    new UniversalNumber(65535),
    new UniversalNumber(16777216)
  ]
  
  let results = []
  for (const num of numbers) {
    results.push(Conversion.getDigits(num.toBigInt(), 2))
  }
  
  return results
})

// Round-trip conversion benchmarks
suite.add('Round-trip Conversion (String→UniversalNumber→String)', () => {
  const stringValues = [
    '12345',
    '9876543210',
    '123456789012345678901'
  ]
  
  let results = []
  for (const str of stringValues) {
    const num = new UniversalNumber(str)
    results.push(num.toString())
  }
  
  return results
})

suite.add('Round-trip Conversion (BigInt→UniversalNumber→BigInt)', () => {
  const values = [
    BigInt('12345'),
    BigInt('9876543210'),
    BigInt('123456789012345678901')
  ]
  
  let results = []
  for (const val of values) {
    const num = new UniversalNumber(val)
    results.push(num.toBigInt())
  }
  
  return results
})

// Export the suite
module.exports = suite