/**
 * Example demonstrating the configurable segmented sieve functionality
 */

const { getPrimeRange, isPrime } = require('../src/Utils')
const { configure, getConfig, resetConfig } = require('../src/config')

// Example 1: Using default configuration
console.log('Example 1: Default configuration')
console.log('--------------------------------')

// Generate primes from 1,000,000 to 1,000,100
const primes1 = getPrimeRange(1000000n, 1000100n)
console.log(`Found ${primes1.length} primes between 1,000,000 and 1,000,100`)
console.log(`First few: ${primes1.slice(0, 5).join(', ')}`)
console.log()

// Example 2: Configuring the segment size globally
console.log('Example 2: Global configuration')
console.log('-------------------------------')

// Configure a smaller segment size globally
configure({
  primalityTesting: {
    segmentedSieveSize: 10000,
    dynamicSegmentSizing: false
  }
})

console.log('Current configuration:')
console.log(`- Segment size: ${getConfig().primalityTesting.segmentedSieveSize}`)
console.log(`- Dynamic sizing: ${getConfig().primalityTesting.dynamicSegmentSizing}`)
console.log()

// Generate primes with the new configuration
const primes2 = getPrimeRange(500000n, 500100n)
console.log(`Found ${primes2.length} primes between 500,000 and 500,100`)
console.log(`First few: ${primes2.slice(0, 5).join(', ')}`)
console.log()

// Example 3: Overriding configuration per operation
console.log('Example 3: Per-operation configuration')
console.log('-------------------------------------')

// Override the segment size just for this operation
const primes3 = getPrimeRange(100000n, 100100n, {
  segmentSize: 500,
  dynamic: true
})

console.log(`Found ${primes3.length} primes between 100,000 and 100,100`)
console.log(`First few: ${primes3.slice(0, 5).join(', ')}`)
console.log()

// Reset configuration back to defaults
resetConfig()

// Example 4: Dynamic segment sizing
console.log('Example 4: Dynamic segment sizing')
console.log('--------------------------------')

// Small range
const smallRange = getPrimeRange(10000n, 10100n, { 
  dynamic: true 
})

// Medium range
const mediumRange = getPrimeRange(100000n, 100100n, { 
  dynamic: true 
})

// Verify all results are correct
const validatePrimes = (primes, start, end) => {
  // Count manually using isPrime for verification
  let count = 0
  for (let n = start; n <= end; n++) {
    if (isPrime(n)) count++
  }
  
  return {
    found: primes.length,
    expected: count,
    correct: primes.length === count
  }
}

console.log('Validation:')
console.log(`- Small range: ${JSON.stringify(validatePrimes(smallRange, 10000n, 10100n))}`)
console.log(`- Medium range: ${JSON.stringify(validatePrimes(mediumRange, 100000n, 100100n))}`)