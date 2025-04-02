// Example of using the math-js library for prime factorization
const { UniversalNumber } = require('../src')

// Create a number with factory methods
const num1 = UniversalNumber.fromNumber(360)
const num2 = UniversalNumber.fromString('12345678901234567890')

// Get the prime factorization
console.log(`Prime factorization of 360: ${formatFactorization(num1.getFactorization())}`)
// Output: Prime factorization of 360: 2^3 × 3^2 × 5^1

console.log(`Prime factorization of 12345678901234567890: ${formatFactorization(num2.getFactorization())}`)
// Output depends on the factors of this large number

// Create a number directly from its prime factorization
const num3 = UniversalNumber.fromFactors([
  { prime: 2, exponent: 3 },  // 2^3
  { prime: 3, exponent: 2 },  // 3^2
  { prime: 5, exponent: 1 }   // 5^1
])

console.log(`Number created from factors: ${num3}`)
// Output: Number created from factors: 360

// Check if a number is an intrinsic prime
const primeNum = new UniversalNumber(17)
console.log(`Is 17 an intrinsic prime? ${primeNum.isIntrinsicPrime()}`)
// Output: Is 17 an intrinsic prime? true

// Helper function to format factorization
function formatFactorization(factorMap) {
  if (factorMap.size === 0) return '1' // Empty factorization represents 1
  
  return [...factorMap.entries()]
    .map(([prime, exp]) => `${prime}^${exp}`)
    .join(' × ')
}
