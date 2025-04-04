// Example of using the math-js library for arithmetic operations
const { UniversalNumber } = require('@uor-foundation/math-js')

// Create numbers
const a = new UniversalNumber(42)
const b = new UniversalNumber(18)

// Basic arithmetic operations
const sum = a.add(b)
const difference = a.subtract(b)
const product = a.multiply(b)

console.log(`${a} + ${b} = ${sum}`)
// Output: 42 + 18 = 60

console.log(`${a} - ${b} = ${difference}`)
// Output: 42 - 18 = 24

console.log(`${a} * ${b} = ${product}`)
// Output: 42 * 18 = 756

// Division only works if result is exact
try {
  const quotient = a.divide(b)
  console.log(`${a} / ${b} = ${quotient}`)
} catch (error) {
  console.log(`${a} is not exactly divisible by ${b}: ${error.message}`)
  // Output: 42 is not exactly divisible by 18: 42 is not divisible by 18 in the natural numbers
}

// Exact division with compatible numbers
const c = new UniversalNumber(756)
const d = new UniversalNumber(12)
const exactQuotient = c.divide(d)

console.log(`${c} / ${d} = ${exactQuotient}`)
// Output: 756 / 12 = 63

// Exponentiation
const base = new UniversalNumber(3)
const result = base.pow(4)

console.log(`${base}^4 = ${result}`)
// Output: 3^4 = 81

// GCD and LCM
const num1 = new UniversalNumber(48)
const num2 = new UniversalNumber(18)

const gcd = num1.gcd(num2)
const lcm = num1.lcm(num2)

console.log(`GCD of ${num1} and ${num2} is ${gcd}`)
// Output: GCD of 48 and 18 is 6

console.log(`LCM of ${num1} and ${num2} is ${lcm}`)
// Output: LCM of 48 and 18 is 144
