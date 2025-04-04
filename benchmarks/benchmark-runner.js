/**
 * Universal Benchmark Runner for math-js
 * 
 * This module provides a framework for running benchmarks against the math-js library.
 * It supports various configurations, metrics collection, and reporting.
 */

const fs = require('fs')
const path = require('path')
const mathjs = require('../src')
const { performance } = require('perf_hooks')

// Metrics storage - accumulates benchmark results
const benchmarkResults = {
  suites: {},
  system: {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    cpuCores: require('os').cpus().length,
    totalMemory: require('os').totalmem()
  },
  timestamp: new Date().toISOString(),
  libraryVersion: require('../package.json').version,
  globalConfig: {}
}

/**
 * Benchmark Suite class for organizing related benchmark cases
 */
class BenchmarkSuite {
  /**
   * Create a benchmark suite
   * @param {string} name - Name of the benchmark suite
   * @param {Object} options - Suite options
   * @param {boolean} options.verbose - Whether to log detailed information
   * @param {number} options.warmupRuns - Number of warmup runs before measuring
   * @param {number} options.iterations - Number of measurement iterations
   */
  constructor(name, options = {}) {
    this.name = name
    this.cases = []
    this.options = {
      verbose: false,
      warmupRuns: 3,
      iterations: 5,
      ...options
    }
    this.results = {}
  }

  /**
   * Add a benchmark case to the suite
   * @param {string} name - Name of the benchmark case
   * @param {Function} fn - Function to benchmark
   * @param {Object} options - Case-specific options
   * @returns {BenchmarkSuite} This suite for chaining
   */
  add(name, fn, options = {}) {
    this.cases.push({
      name,
      fn,
      options: { ...this.options, ...options }
    })
    return this
  }

  /**
   * Run the entire benchmark suite
   * @param {Object} globalOptions - Global options to override suite defaults
   * @returns {Object} Benchmark results
   */
  async run(globalOptions = {}) {
    console.log(`\n🔬 Running benchmark suite: ${this.name}`)
    console.log(`${'-'.repeat(50)}`)
    
    // Store configuration in results
    this.results.options = { ...this.options }
    this.results.cases = {}
    this.results.summary = {
      totalTime: 0,
      fastest: { name: '', opsPerSecond: 0 },
      slowest: { name: '', opsPerSecond: Infinity }
    }
    
    const startTime = performance.now()
    
    for (const benchmark of this.cases) {
      const options = { ...benchmark.options, ...globalOptions }
      const result = await this.runBenchmark(benchmark.name, benchmark.fn, options)
      this.results.cases[benchmark.name] = result
      
      // Update summary stats
      this.results.summary.totalTime += result.totalTime
      
      if (result.opsPerSecond > this.results.summary.fastest.opsPerSecond) {
        this.results.summary.fastest = { 
          name: benchmark.name, 
          opsPerSecond: result.opsPerSecond 
        }
      }
      
      if (result.opsPerSecond < this.results.summary.slowest.opsPerSecond) {
        this.results.summary.slowest = { 
          name: benchmark.name, 
          opsPerSecond: result.opsPerSecond 
        }
      }
    }
    
    const endTime = performance.now()
    this.results.totalDuration = endTime - startTime
    
    // Print summary
    console.log(`\n📊 Suite Summary: ${this.name}`)
    console.log(`${'-'.repeat(50)}`)
    console.log(`Total Duration: ${(this.results.totalDuration / 1000).toFixed(2)}s`)
    console.log(`Fastest: ${this.results.summary.fastest.name} (${Math.round(this.results.summary.fastest.opsPerSecond)} ops/sec)`)
    console.log(`Slowest: ${this.results.summary.slowest.name} (${Math.round(this.results.summary.slowest.opsPerSecond)} ops/sec)`)
    console.log(`${'-'.repeat(50)}\n`)
    
    // Store in global results
    benchmarkResults.suites[this.name] = this.results
    
    return this.results
  }

  /**
   * Run a single benchmark
   * @param {string} name - Benchmark name 
   * @param {Function} fn - Function to benchmark
   * @param {Object} options - Benchmark options
   * @returns {Object} Benchmark metrics
   */
  async runBenchmark(name, fn, options) {
    if (options.verbose) {
      console.log(`\nRunning benchmark: ${name}`)
      console.log(`Warmup runs: ${options.warmupRuns}, Iterations: ${options.iterations}`)
    } else {
      process.stdout.write(`Running ${name}... `)
    }
    
    // Run garbage collection if available
    if (global.gc) {
      global.gc()
    }
    
    // Warmup runs
    for (let i = 0; i < options.warmupRuns; i++) {
      await fn()
    }
    
    // Measurement runs
    const iterations = []
    let totalTime = 0
    let totalMemoryUsage = 0
    
    for (let i = 0; i < options.iterations; i++) {
      const startMemory = process.memoryUsage().heapUsed
      const startTime = performance.now()
      
      await fn()
      
      const endTime = performance.now()
      const endMemory = process.memoryUsage().heapUsed
      
      const duration = endTime - startTime
      const memoryUsed = endMemory - startMemory
      
      iterations.push({ duration, memoryUsed })
      totalTime += duration
      totalMemoryUsage += memoryUsed
    }
    
    // Calculate stats
    const avgTime = totalTime / options.iterations
    const avgMemory = totalMemoryUsage / options.iterations
    const opsPerSecond = 1000 / avgTime
    
    // Calculate min, max, stddev
    const minTime = Math.min(...iterations.map(i => i.duration))
    const maxTime = Math.max(...iterations.map(i => i.duration))
    
    const stdDev = Math.sqrt(
      iterations.map(i => (i.duration - avgTime) ** 2)
        .reduce((sum, val) => sum + val, 0) / options.iterations
    )
    
    // Format the output
    if (options.verbose) {
      console.log(`Average time: ${avgTime.toFixed(4)}ms (${opsPerSecond.toFixed(2)} ops/sec)`)
      console.log(`Memory usage: ${(avgMemory / 1024 / 1024).toFixed(2)} MB`)
      console.log(`Min/Max time: ${minTime.toFixed(4)}ms / ${maxTime.toFixed(4)}ms`)
      console.log(`Standard deviation: ${stdDev.toFixed(4)}ms (${(stdDev * 100 / avgTime).toFixed(2)}%)`)
    } else {
      console.log(`${opsPerSecond.toFixed(2)} ops/sec, ±${(stdDev * 100 / avgTime).toFixed(2)}%`)
    }
    
    return {
      iterations,
      avgTime,
      minTime,
      maxTime,
      stdDev,
      relativeStdDev: stdDev / avgTime,
      opsPerSecond,
      totalTime,
      avgMemory,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Save benchmark results to a file
 * @param {string} filename - Output filename
 * @param {Object} results - Benchmark results to save
 */
function saveResults(filename = 'benchmark-results.json') {
  const outputPath = path.join(__dirname, 'results', filename)
  
  // Create results directory if it doesn't exist
  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  }
  
  fs.writeFileSync(
    outputPath,
    JSON.stringify(benchmarkResults, null, 2)
  )
  
  console.log(`Results saved to ${outputPath}`)
}

/**
 * Load all benchmark suites from the suites directory
 * @returns {Array<BenchmarkSuite>} Array of benchmark suites
 */
function loadSuites() {
  const suitesDir = path.join(__dirname, 'suites')
  const suiteFiles = fs.readdirSync(suitesDir)
    .filter(file => file.endsWith('.js'))
  
  return suiteFiles.map(file => {
    const suitePath = path.join(suitesDir, file)
    return require(suitePath)
  })
}

/**
 * Create a new benchmark suite
 * @param {string} name - Name of the benchmark suite
 * @param {Object} options - Suite options
 * @returns {BenchmarkSuite} The created benchmark suite
 */
function createSuite(name, options = {}) {
  return new BenchmarkSuite(name, options)
}

/**
 * Run all benchmark suites
 * @param {Object} options - Global options
 * @param {string} options.profile - Performance profile ('balanced', 'speed', 'precision')
 * @param {string} options.size - Test data size ('small', 'medium', 'large', 'extreme')
 * @param {Object} options.config - Applied configuration settings
 * @param {Array<string>} options.specificSuites - Optional array of suite names to run
 */
async function runAll(options = {}) {
  console.log('🚀 Starting math-js benchmark suite')
  console.log(`Library version: ${benchmarkResults.libraryVersion}`)
  console.log(`Node version: ${process.version}`)
  console.log(`Platform: ${process.platform}, Arch: ${process.arch}`)
  console.log(`${'-'.repeat(50)}`)
  
  // Store global configuration for reference
  benchmarkResults.globalConfig = { ...mathjs.config }
  
  // Store profile and size information
  benchmarkResults.profile = options.profile || 'balanced'
  benchmarkResults.size = options.size || 'medium'
  benchmarkResults.appliedConfig = options.config || {}
  
  // Get all suites
  const allSuites = loadSuites()
  
  // Filter suites if specificSuites is provided
  const suitesToRun = options.specificSuites && options.specificSuites.length > 0
    ? allSuites.filter(suite => {
        const suiteName = suite.name.toLowerCase().replace(/\s+/g, '-')
        return options.specificSuites.some(name => 
          suiteName.includes(name) || 
          suite.name.toLowerCase().includes(name) ||
          name === suiteName)
      })
    : allSuites
  
  if (suitesToRun.length === 0) {
    console.log('No matching suites found to run.')
    return
  }
  
  // Run each suite sequentially
  for (const suite of suitesToRun) {
    // Pass the configuration details to each suite
    const suiteOptions = {
      ...options,
      // Add data size specific parameters for test generation
      testSizes: getTestSizesForProfile(options.size)
    }
    
    await suite.run(suiteOptions)
  }
  
  // Save results
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]
  const resultsFilename = `benchmark-${options.profile}-${options.size}-${timestamp}.json`
  saveResults(resultsFilename)
  
  console.log('\n✅ All benchmarks completed')
}

/**
 * Get appropriate test number sizes based on the selected profile
 * @param {string} size - Size profile ('small', 'medium', 'large', 'extreme')
 * @returns {Object} Test size ranges for different benchmark categories
 */
function getTestSizesForProfile(size = 'medium') {
  // Define size ranges for different test categories
  const sizeRanges = {
    small: {
      arithmetic: {
        small: 2,         // 2-digit numbers
        medium: 5,         // 5-digit numbers
        large: 10          // 10-digit numbers
      },
      factorization: {
        small: 5,         // 5-digit numbers
        medium: 8,         // 8-digit numbers
        large: 12          // 12-digit numbers
      },
      conversion: {
        small: 5,         // 5-digit numbers
        medium: 10,        // 10-digit numbers
        large: 15          // 15-digit numbers
      }
    },
    medium: {
      arithmetic: {
        small: 5,          // 5-digit numbers
        medium: 10,        // 10-digit numbers
        large: 15          // 15-digit numbers
      },
      factorization: {
        small: 8,          // 8-digit numbers
        medium: 12,        // 12-digit numbers
        large: 18          // 18-digit numbers
      },
      conversion: {
        small: 10,         // 10-digit numbers
        medium: 20,        // 20-digit numbers
        large: 30          // 30-digit numbers
      }
    },
    large: {
      arithmetic: {
        small: 10,         // 10-digit numbers
        medium: 20,        // 20-digit numbers
        large: 30          // 30-digit numbers
      },
      factorization: {
        small: 15,         // 15-digit numbers
        medium: 25,        // 25-digit numbers
        large: 40          // 40-digit numbers
      },
      conversion: {
        small: 20,         // 20-digit numbers
        medium: 40,        // 40-digit numbers
        large: 60          // 60-digit numbers
      }
    },
    extreme: {
      arithmetic: {
        small: 20,         // 20-digit numbers
        medium: 40,        // 40-digit numbers
        large: 60          // 60-digit numbers
      },
      factorization: {
        small: 25,         // 25-digit numbers
        medium: 50,        // 50-digit numbers
        large: 75          // 75-digit numbers
      },
      conversion: {
        small: 40,         // 40-digit numbers
        medium: 80,        // 80-digit numbers
        large: 120         // 120-digit numbers
      }
    }
  }
  
  return sizeRanges[size] || sizeRanges.medium
}

// Check if the script is being run directly
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2)
  const options = {}
  
  // Simple argument parsing
  args.forEach(arg => {
    if (arg === '--verbose') options.verbose = true
    if (arg.startsWith('--iterations=')) options.iterations = parseInt(arg.split('=')[1])
    if (arg.startsWith('--warmup=')) options.warmupRuns = parseInt(arg.split('=')[1])
    if (arg === '--expose-gc') console.warn('For best results, run with --expose-gc flag')
  })
  
  // Run all benchmarks
  runAll(options)
} else {
  // Export the API for use in other files
  module.exports = {
    createSuite,
    runAll,
    saveResults,
    BenchmarkSuite,
    benchmarkResults
  }
}