// Example of using the math-js library for prime factorization
const { UniversalNumber, configure } = require('@uor-foundation/math-js')
const { 
  factorizeOptimal, 
  factorizeParallel, 
  factorizationCache,
  ellipticCurveMethod
} = require('@uor-foundation/math-js').internal.Factorization

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

console.log('\n=== Configurable ECM Factorization ===')

// Configure ECM parameters
configure({
  factorization: {
    ecm: {
      maxCurves: 150,        // Increase max curves
      defaultB1: 200000,     // Double the default B1 bound
      maxMemory: 200         // Double the memory limit
    }
  }
})

// Using ECM with a composite number
console.log('Factorizing using ECM with custom configuration:')
const composite = 7919n * 7927n // Product of two primes
console.time('ECM factorization')
const ecmFactor = ellipticCurveMethod(composite)
console.timeEnd('ECM factorization')

console.log(`Factor of ${composite}: ${ecmFactor}`)
console.log(`Verification: ${composite} % ${ecmFactor} = ${composite % ecmFactor}`)

// Try with different parameters
console.log('\nFactorizing using ECM with custom parameters:')
console.time('ECM with custom params')
const ecmFactor2 = ellipticCurveMethod(composite, { 
  curves: 10,       // Use fewer curves
  b1: 50000,        // Use smaller B1 bound
  b2: 100000,       // Use custom B2 bound
  maxMemory: 50     // Use less memory
})
console.timeEnd('ECM with custom params')

console.log(`Factor from custom parameters: ${ecmFactor2}`)
console.log(`Verification: ${composite} % ${ecmFactor2} = ${composite % ecmFactor2}`)

// Helper function to format factorization
function formatFactorization(factorMap) {
  if (factorMap.size === 0) return '1' // Empty factorization represents 1
  
  return [...factorMap.entries()]
    .map(([prime, exp]) => `${prime}^${exp}`)
    .join(' × ')
}
