#!/usr/bin/env node

/**
 * Benchmark Runner CLI
 * 
 * This script provides a command-line interface for running the benchmarks.
 */

const { runAll } = require('./benchmark-runner')
const { analyzeResults, findMostRecentResults } = require('./analyze-results')
const { generateReport } = require('./visualize-results')

// Parse command line arguments
const args = process.argv.slice(2)
const options = {
  analyze: args.includes('--analyze'),
  visualize: args.includes('--visualize'),
  verbose: args.includes('--verbose'),
  iterations: 5,
  warmupRuns: 3
}

// Extract numeric options
args.forEach(arg => {
  if (arg.startsWith('--iterations=')) {
    options.iterations = parseInt(arg.split('=')[1], 10)
  } else if (arg.startsWith('--warmup=')) {
    options.warmupRuns = parseInt(arg.split('=')[1], 10)
  }
})

// Process specific suites to run
let specificSuites = args
  .filter(arg => !arg.startsWith('--'))
  .map(arg => arg.toLowerCase())
  
// For initial testing, default to a small test suite if none specified
if (specificSuites.length === 0 && process.env.NODE_ENV !== 'production') {
  specificSuites = ['small-test']
}

// Show usage if help is requested
if (args.includes('--help') || args.includes('-h')) {
  console.log('math-js Benchmark Runner')
  console.log('\nUsage:')
  console.log('  node benchmarks/run.js [options] [suite_names...]')
  console.log('\nOptions:')
  console.log('  --verbose         Show detailed output during benchmarking')
  console.log('  --analyze         Analyze results after benchmarking')
  console.log('  --visualize       Generate HTML visualization of results')
  console.log('  --iterations=N    Set number of iterations (default: 5)')
  console.log('  --warmup=N        Set number of warmup runs (default: 3)')
  console.log('  --help, -h        Show this help message')
  console.log('\nExamples:')
  console.log('  node benchmarks/run.js                       # Run all benchmarks')
  console.log('  node benchmarks/run.js arithmetic conversion # Run only arithmetic and conversion suites')
  console.log('  node benchmarks/run.js --iterations=10       # Run with 10 iterations')
  console.log('  node benchmarks/run.js --analyze --visualize # Run and create reports')
  process.exit(0)
}

// Check if garbage collection is available
if (!global.gc) {
  console.warn('\n⚠️  For more accurate memory measurements, run with:')
  console.warn('   node --expose-gc benchmarks/run.js\n')
}

// Welcome message
console.log('🚀 math-js Benchmark Runner')
console.log('==========================')
console.log(`Iterations: ${options.iterations}, Warmup runs: ${options.warmupRuns}`)

if (specificSuites.length > 0) {
  console.log(`Running specific suites: ${specificSuites.join(', ')}`)
}

// Run the benchmarks
async function run() {
  const bench_options = {
    iterations: options.iterations,
    warmupRuns: options.warmupRuns,
    verbose: options.verbose,
    specificSuites: specificSuites.length > 0 ? specificSuites : undefined
  }
  
  try {
    await runAll(bench_options)
    
    // Optional post-processing
    if (options.analyze || options.visualize) {
      const latestResults = findMostRecentResults()
      
      if (latestResults) {
        if (options.analyze) {
          analyzeResults(latestResults)
        }
        
        if (options.visualize) {
          generateReport(latestResults)
        }
      }
    }
    
    console.log('\n✅ Benchmarks completed successfully')
  } catch (error) {
    console.error('\n❌ Error running benchmarks:', error)
    process.exit(1)
  }
}

// Start the benchmarks
run()