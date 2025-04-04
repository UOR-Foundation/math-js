/**
 * Benchmark Suite: Configuration Performance Profiles
 * 
 * Tests the performance impact of different configuration settings.
 */

const { createSuite } = require('../benchmark-runner')
const mathjs = require('../../src')
const { UniversalNumber, configure } = mathjs

// Create the configuration benchmark suite
const suite = createSuite('Configuration Performance Profiles', {
  warmupRuns: 3,
  iterations: 5
})

// Helper to create test operations for configuration testing
function createBenchmarkOperations() {
  // Standard set of operations to test under different configurations
  return {
    // Create a complex expression that exercises multiple aspects of the library
    complexExpression: () => {
      // Medium-sized multiplication
      const a = new UniversalNumber('1234567890')
      const b = new UniversalNumber('9876543210')
      const product = a.multiply(b)
      
      // Exponentiation
      const c = new UniversalNumber(7)
      const exp = c.pow(10)
      
      // Addition of results
      const sum = product.add(exp)
      
      // GCD
      const gcd = product.gcd(exp)
      
      return { product, exp, sum, gcd }
    },
    
    // Factorization-heavy workload
    factorizationWorkload: () => {
      const numbers = [
        new UniversalNumber(2310), // 2 * 3 * 5 * 7 * 11
        new UniversalNumber(1234),
        new UniversalNumber(10000), // 2^4 * 5^4
      ]
      
      let results = []
      for (const num of numbers) {
        results.push(num.getFactorization())
      }
      
      return results
    },
    
    // Conversion-heavy workload
    conversionWorkload: () => {
      const a = new UniversalNumber(BigInt('1234567890123456789012345678901234567890'))
      
      // Convert to different bases
      const asBinary = a.toString(2)
      const asHex = a.toString(16)
      const asBase36 = a.toString(36)
      
      // Convert back
      const fromBinary = UniversalNumber.fromString(asBinary, 2)
      const fromHex = UniversalNumber.fromString(asHex, 16)
      const fromBase36 = UniversalNumber.fromString(asBase36, 36)
      
      return { fromBinary, fromHex, fromBase36 }
    }
  }
}

// Save original configuration
const originalConfig = JSON.parse(JSON.stringify(mathjs.config))

// Test different performance profiles
suite.add('Default Profile', () => {
  // Reset to original configuration
  configure(originalConfig)
  
  // Run benchmark operations
  const ops = createBenchmarkOperations()
  return {
    complex: ops.complexExpression(),
    factorization: ops.factorizationWorkload(),
    conversion: ops.conversionWorkload()
  }
})

suite.add('Speed Profile', () => {
  // Configure for speed
  configure({
    performanceProfile: 'speed',
    factorization: {
      lazy: true,
      algorithm: 'auto'
    },
    cache: {
      enabled: true,
      maxSize: 1024 * 1024 * 20 // 20MB cache
    },
    memory: {
      optimizeMemory: false
    }
  })
  
  // Run benchmark operations
  const ops = createBenchmarkOperations()
  return {
    complex: ops.complexExpression(),
    factorization: ops.factorizationWorkload(),
    conversion: ops.conversionWorkload()
  }
})

suite.add('Precision Profile', () => {
  // Configure for precision
  configure({
    performanceProfile: 'precision',
    factorization: {
      lazy: false,
      algorithm: 'auto',
      completeSizeLimit: 200 // Higher size limit for complete factorization
    },
    cache: {
      enabled: true
    },
    memory: {
      optimizeMemory: true
    }
  })
  
  // Run benchmark operations
  const ops = createBenchmarkOperations()
  return {
    complex: ops.complexExpression(),
    factorization: ops.factorizationWorkload(),
    conversion: ops.conversionWorkload()
  }
})

suite.add('Memory-Optimized Profile', () => {
  // Configure for memory efficiency
  configure({
    performanceProfile: 'balanced',
    factorization: {
      lazy: true
    },
    cache: {
      enabled: false // Disable caching
    },
    memory: {
      optimizeMemory: true,
      useCompactRepresentation: true
    }
  })
  
  // Run benchmark operations
  const ops = createBenchmarkOperations()
  return {
    complex: ops.complexExpression(),
    factorization: ops.factorizationWorkload(),
    conversion: ops.conversionWorkload()
  }
})

suite.add('Lazy Evaluation Profile', () => {
  // Configure with heavy use of lazy evaluation
  configure({
    performanceProfile: 'balanced',
    factorization: {
      lazy: true
    },
    cache: {
      enabled: true
    }
  })
  
  // Create operations that benefit from lazy evaluation
  const a = new UniversalNumber('1234567890')
  const b = new UniversalNumber('9876543210')
  
  // Create a chain of operations without immediately computing the result
  const chain = UniversalNumber.lazy(() => {
    const p1 = a.multiply(b)
    const p2 = p1.add(a)
    const p3 = p2.subtract(b)
    return p3
  })
  
  // Force computation
  const result = chain.toBigInt()
  
  return result
})

// Reset to original configuration after tests
suite.add('Cleanup', () => {
  // Restore original configuration
  configure(originalConfig)
  return true
})

// Export the suite
module.exports = suite