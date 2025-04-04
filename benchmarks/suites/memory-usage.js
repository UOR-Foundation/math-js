/**
 * Benchmark Suite: Memory Usage
 * 
 * Measures the memory footprint of different operations and data structures.
 */

const { createSuite } = require('../benchmark-runner')
const mathjs = require('../../src')
const { UniversalNumber, configure } = mathjs

// Create the memory usage benchmark suite
const suite = createSuite('Memory Usage', {
  warmupRuns: 2,
  iterations: 3,
  verbose: true // More details for memory tests
})

// Helper to create a sequence of UniversalNumbers
function createSequence(start, end, step = 1) {
  const result = []
  for (let i = start; i <= end; i += step) {
    result.push(new UniversalNumber(i))
  }
  return result
}

// Helper to force garbage collection if available
function forceGC() {
  if (global.gc) {
    global.gc()
  } else {
    console.warn('⚠️ For accurate memory benchmarks, run with --expose-gc flag')
  }
}

// Test memory usage for creating UniversalNumbers
suite.add('Create 1000 small UniversalNumbers', () => {
  forceGC()
  
  // Measure baseline
  const baseline = process.memoryUsage().heapUsed
  
  // Create numbers
  const numbers = createSequence(1, 1000)
  
  // Measure after creation
  const afterCreation = process.memoryUsage().heapUsed
  
  return {
    usedMemory: afterCreation - baseline,
    perNumber: (afterCreation - baseline) / 1000,
    count: numbers.length
  }
})

suite.add('Create 100 large UniversalNumbers', () => {
  forceGC()
  
  // Measure baseline
  const baseline = process.memoryUsage().heapUsed
  
  // Create large numbers
  const numbers = []
  for (let i = 0; i < 100; i++) {
    const value = BigInt('1' + '0'.repeat(i % 50 + 20))
    numbers.push(new UniversalNumber(value))
  }
  
  // Measure after creation
  const afterCreation = process.memoryUsage().heapUsed
  
  return {
    usedMemory: afterCreation - baseline,
    perNumber: (afterCreation - baseline) / 100,
    count: numbers.length
  }
})

// Test memory usage for factorization
suite.add('Memory impact of factorization cache', () => {
  forceGC()
  
  // Measure baseline
  const baseline = process.memoryUsage().heapUsed
  
  // Clear factorization cache
  mathjs.internal.Factorization.factorizationCache.clear()
  
  // Factorize numbers
  const numbers = createSequence(1, 1000)
  for (const num of numbers) {
    num.getFactorization()
  }
  
  // Measure after factorization
  const afterFactorization = process.memoryUsage().heapUsed
  
  // Get cache stats
  const cacheStats = mathjs.internal.Factorization.factorizationCache.getStats()
  
  return {
    usedMemory: afterFactorization - baseline,
    cacheSize: cacheStats.size,
    entriesPerMB: (cacheStats.size * 1024 * 1024) / (afterFactorization - baseline)
  }
})

// Compare memory usage of different representations
suite.add('Memory footprint comparison', () => {
  forceGC()
  
  // Create a medium-sized number with large number of factors
  const start = process.memoryUsage().heapUsed
  
  // 2^10 * 3^8 * 5^6 * 7^4 * 11^2
  const factors = new Map([
    [BigInt(2), BigInt(10)],
    [BigInt(3), BigInt(8)],
    [BigInt(5), BigInt(6)],
    [BigInt(7), BigInt(4)],
    [BigInt(11), BigInt(2)],
  ])
  
  // Create from factors
  const fromFactors = new UniversalNumber(
    mathjs.internal.Factorization.fromPrimeFactors(factors)
  )
  
  const afterFromFactors = process.memoryUsage().heapUsed
  
  // Create from BigInt
  const asBigInt = fromFactors.toBigInt()
  const fromBigInt = new UniversalNumber(asBigInt)
  
  const afterFromBigInt = process.memoryUsage().heapUsed
  
  // Create from string
  const asString = fromFactors.toString()
  const fromString = new UniversalNumber(asString)
  
  const afterFromString = process.memoryUsage().heapUsed
  
  return {
    number: fromFactors.toString(),
    factorsSize: afterFromFactors - start,
    bigIntSize: afterFromBigInt - afterFromFactors,
    stringSize: afterFromString - afterFromBigInt,
    factorCount: factors.size
  }
})

// Test compact vs regular representation
suite.add('Compact vs regular representation', () => {
  // Save original config
  const originalConfig = JSON.parse(JSON.stringify(mathjs.config))
  
  forceGC()
  
  // Test with regular representation
  configure({
    memory: {
      useCompactRepresentation: false
    }
  })
  
  const baselineRegular = process.memoryUsage().heapUsed
  
  // Create numbers with regular representation
  const numbersRegular = []
  for (let i = 0; i < 1000; i++) {
    numbersRegular.push(new UniversalNumber(i * 1000))
  }
  
  const afterRegular = process.memoryUsage().heapUsed
  const regularSize = afterRegular - baselineRegular
  
  forceGC()
  
  // Test with compact representation
  configure({
    memory: {
      useCompactRepresentation: true
    }
  })
  
  const baselineCompact = process.memoryUsage().heapUsed
  
  // Create numbers with compact representation
  const numbersCompact = []
  for (let i = 0; i < 1000; i++) {
    numbersCompact.push(new UniversalNumber(i * 1000))
  }
  
  const afterCompact = process.memoryUsage().heapUsed
  const compactSize = afterCompact - baselineCompact
  
  // Restore original configuration
  configure(originalConfig)
  
  return {
    regularSize,
    compactSize,
    difference: regularSize - compactSize,
    percentSaved: ((regularSize - compactSize) / regularSize) * 100
  }
})

// Test memory usage with performance profiles
suite.add('Memory impact of performance profiles', () => {
  // Save original config
  const originalConfig = JSON.parse(JSON.stringify(mathjs.config))
  
  // Create a reference workload
  const workload = () => {
    const nums = []
    for (let i = 0; i < 100; i++) {
      const a = new UniversalNumber(i * 100)
      const b = new UniversalNumber(i * 200)
      nums.push(a.multiply(b))
    }
    return nums
  }
  
  const results = {}
  
  // Test with different profiles
  for (const profile of ['balanced', 'speed', 'precision']) {
    forceGC()
    
    configure({
      performanceProfile: profile
    })
    
    const baseline = process.memoryUsage().heapUsed
    
    // Run workload
    const nums = workload()
    
    const after = process.memoryUsage().heapUsed
    results[profile] = after - baseline
  }
  
  // Restore original configuration
  configure(originalConfig)
  
  return {
    balanced: results.balanced,
    speed: results.speed,
    precision: results.precision,
    speedVsBalanced: ((results.speed - results.balanced) / results.balanced) * 100,
    precisionVsBalanced: ((results.precision - results.balanced) / results.balanced) * 100
  }
})

// Measure memory for different operations
suite.add('Memory usage by operation', () => {
  const operations = [
    {
      name: 'Addition',
      execute: () => {
        const a = new UniversalNumber('123456789012345')
        const b = new UniversalNumber('987654321012345')
        return a.add(b)
      }
    },
    {
      name: 'Multiplication',
      execute: () => {
        const a = new UniversalNumber('123456789012345')
        const b = new UniversalNumber('987654321012345')
        return a.multiply(b)
      }
    },
    {
      name: 'Exponentiation',
      execute: () => {
        const a = new UniversalNumber(123)
        return a.pow(20)
      }
    },
    {
      name: 'Factorization',
      execute: () => {
        const a = new UniversalNumber(1234567)
        return a.getFactorization()
      }
    },
    {
      name: 'Base Conversion',
      execute: () => {
        const a = new UniversalNumber('123456789012345')
        return a.toString(16)
      }
    }
  ]
  
  const memoryByOperation = {}
  
  for (const op of operations) {
    forceGC()
    
    const baseline = process.memoryUsage().heapUsed
    
    // Execute the operation
    const result = op.execute()
    
    const after = process.memoryUsage().heapUsed
    memoryByOperation[op.name] = after - baseline
  }
  
  return memoryByOperation
})

// Export the suite
module.exports = suite