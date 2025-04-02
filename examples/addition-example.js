// Example of using the math-js library for addition
const { UniversalNumber } = require('../src')

// Create two numbers
const a = new UniversalNumber(123)
const b = new UniversalNumber(789)

// Perform addition
const sum = a.add(b)

console.log(`${a} + ${b} = ${sum}`)
// Output: 123 + 789 = 912

// Example using the Utils module for fast exponentiation
const { internal: { Utils } } = require('../src')

const base = 2n
const exponent = 10n
const result = Utils.fastExp(base, exponent)

console.log(`${base}^${exponent} = ${result}`)
// Output: 2^10 = 1024