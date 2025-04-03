// Example of using the math-js library for prime factorization
const { UniversalNumber } = require('../src')
const { factorizeOptimal, factorizeParallel, factorizationCache } = require('../src').internal.Factorization

console.log('=== Basic Factorization with UniversalNumber ===')

// Create a number with factory methods
const num1 = UniversalNumber.fromNumber(360)
const num2 = UniversalNumber.fromNumber(123456789)

// Get the prime factorization
console.log(`Prime factorization of 360: ${formatFactorization(num1.getFactorization())}`)
// Output: Prime factorization of 360: 2^3 × 3^2 × 5^1

console.log(`Prime factorization of 123456789: ${formatFactorization(num2.getFactorization())}`)
// Output: Prime factorization of 123456789: 3^2 × 3607^1 × 3803^1

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

console.log('\n=== Advanced Factorization Algorithms ===')

// Using the enhanced factorizationOptimal function with advanced options
console.log('Factorizing with advanced options:')
const factors1 = factorizeOptimal(12345, { advanced: true, useCache: true })
console.log(`Factors of 12345: ${formatFactorization(factors1)}`)

// Using the cache for better performance
factorizationCache.clear() // Clear the cache first
console.log('\nFactorization cache demonstration:')
console.log('Cache size before factorization:', factorizationCache.size())

// Time the first factorization (uncached)
console.time('First factorization')
const largeNumber = 104729 // A medium-sized prime number
const factors2 = factorizeOptimal(largeNumber)
console.timeEnd('First factorization')
console.log('Cache size after first factorization:', factorizationCache.size())

// Time the second factorization (should use cache)
console.time('Cached factorization')
const factors3 = factorizeOptimal(largeNumber)
console.timeEnd('Cached factorization')

console.log(`Factors of ${largeNumber}: ${formatFactorization(factors2)}`)

// Show cache statistics
const cacheStats = factorizationCache.getStats()
console.log('\nCache statistics:', cacheStats)

// Helper function to format factorization
function formatFactorization(factorMap) {
  if (factorMap.size === 0) return '1' // Empty factorization represents 1
  
  return [...factorMap.entries()]
    .map(([prime, exp]) => `${prime}^${exp}`)
    .join(' × ')
}
