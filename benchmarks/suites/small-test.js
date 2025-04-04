/**
 * Benchmark Suite: Small Test
 * 
 * A minimal test suite for verifying the benchmark system functionality.
 * Uses only very small numbers to avoid any size limitations.
 */

const { createSuite } = require('../benchmark-runner')
const mathjs = require('../../src')
const { UniversalNumber } = mathjs

// Create a simple benchmark suite
const suite = createSuite('Small Test', {
  warmupRuns: 1,
  iterations: 2
})

// Simple addition benchmark
suite.add('Small number addition', () => {
  const a = new UniversalNumber(12)
  const b = new UniversalNumber(34)
  return a.add(b)
})

// Simple multiplication benchmark
suite.add('Small number multiplication', () => {
  const a = new UniversalNumber(12)
  const b = new UniversalNumber(34)
  return a.multiply(b)
})

// Simple factorization benchmark
suite.add('Factorization of small composite', () => {
  const a = new UniversalNumber(360)  // 2^3 * 3^2 * 5
  return a.getFactorization()
})

// Simple prime test
suite.add('Primality testing', () => {
  const numbers = [
    new UniversalNumber(2),
    new UniversalNumber(3),
    new UniversalNumber(4),
    new UniversalNumber(5),
    new UniversalNumber(6),
    new UniversalNumber(7)
  ]
  
  const results = []
  for (const num of numbers) {
    results.push(num.isIntrinsicPrime())
  }
  
  return results
})

// Simple conversion test
suite.add('Base conversion', () => {
  const a = new UniversalNumber(123)
  
  return {
    binary: a.toString(2),
    octal: a.toString(8),
    decimal: a.toString(10),
    hex: a.toString(16)
  }
})

// Export the suite
module.exports = suite