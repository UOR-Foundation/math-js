#!/usr/bin/env node

/**
 * Benchmark Runner CLI
 * 
 * This script provides a command-line interface for running the benchmarks.
 * It configures the math-js library based on command-line parameters and
 * the current environment capabilities.
 */

const { runAll } = require('./benchmark-runner')
const { analyzeResults, findMostRecentResults } = require('./analyze-results')
const { generateReport } = require('./visualize-results')
const mathjs = require('../src')
const { configure } = mathjs

// Parse command line arguments
const args = process.argv.slice(2)
const options = {
  analyze: args.includes('--analyze'),
  visualize: args.includes('--visualize'),
  verbose: args.includes('--verbose'),
  iterations: 5,
  warmupRuns: 3,
  profile: 'balanced',  // Default performance profile
  size: 'medium'        // Default test data size
}

// Extract numeric and string options
args.forEach(arg => {
  if (arg.startsWith('--iterations=')) {
    options.iterations = parseInt(arg.split('=')[1], 10)
  } else if (arg.startsWith('--warmup=')) {
    options.warmupRuns = parseInt(arg.split('=')[1], 10)
  } else if (arg.startsWith('--profile=')) {
    options.profile = arg.split('=')[1]
  } else if (arg.startsWith('--size=')) {
    options.size = arg.split('=')[1]
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
  console.log('  --verbose            Show detailed output during benchmarking')
  console.log('  --analyze            Analyze results after benchmarking')
  console.log('  --visualize          Generate HTML visualization of results')
  console.log('  --iterations=N       Set number of iterations (default: 5)')
  console.log('  --warmup=N           Set number of warmup runs (default: 3)')
  console.log('  --profile=PROFILE    Set performance profile (balanced, speed, precision)')
  console.log('  --size=SIZE          Set test data size (small, medium, large, extreme)')
  console.log('  --help, -h           Show this help message')
  console.log('\nExamples:')
  console.log('  node benchmarks/run.js                          # Run all benchmarks')
  console.log('  node benchmarks/run.js arithmetic conversion    # Run specific suites')
  console.log('  node benchmarks/run.js --profile=speed          # Run with speed profile')
  console.log('  node benchmarks/run.js --size=large             # Run with large test data')
  console.log('  node benchmarks/run.js --analyze --visualize    # Run and create reports')
  process.exit(0)
}

// Check if garbage collection is available
if (!global.gc) {
  console.warn('\n⚠️  For more accurate memory measurements, run with:')
  console.warn('   node --expose-gc benchmarks/run.js\n')
}

// Apply the selected profile configuration
function applyConfiguration() {
  // Base configuration adjustments based on profile
  const profileConfigs = {
    balanced: {
      performanceProfile: 'balanced',
      factorization: {
        lazy: true,
        completeSizeLimit: 100,
        thresholds: {
          trialDivision: 6,
          optimizedTrialDivision: 12,
          pollardRho: 25,
          ecm: 50,
          quadraticSieve: 100
        }
      },
      primalityTesting: {
        verificationThreshold: 1000000,
        millerRabinRounds: 40
      },
      conversion: {
        directConversionLimit: 1000
      },
      cache: {
        enabled: true,
        maxSize: 1024 * 1024 * 10 // 10MB
      }
    },
    speed: {
      performanceProfile: 'speed',
      factorization: {
        lazy: true,
        algorithm: 'auto',
        thresholds: {
          trialDivision: 8,           // Increased to use simple methods more
          optimizedTrialDivision: 16,  // Increased to use optimized methods more
          pollardRho: 30,              // Increased to prefer Pollard Rho over ECM
          ecm: 60,                     // Increased to handle larger numbers with ECM
          quadraticSieve: 120          // Increased upper limit
        }
      },
      primalityTesting: {
        verificationThreshold: 2000000, // Higher threshold to use simple method more
        millerRabinRounds: 20           // Fewer rounds for speed
      },
      conversion: {
        directConversionLimit: 2000     // Larger direct conversion limit
      },
      cache: {
        enabled: true,
        maxSize: 1024 * 1024 * 20      // 20MB cache
      },
      memory: {
        optimizeMemory: false          // Don't optimize for memory
      }
    },
    precision: {
      performanceProfile: 'precision',
      factorization: {
        lazy: false,  // Never lazy factorize
        completeSizeLimit: 200,  // Higher size limit
        thresholds: {
          trialDivision: 4,            // Lower to use more advanced methods
          optimizedTrialDivision: 10,   // Lower to use more advanced methods
          pollardRho: 20,               // Lower to move to more robust methods quicker
          ecm: 40,                      // Lower to use quadratic sieve more
          quadraticSieve: 100           // Keep same
        }
      },
      primalityTesting: {
        verificationThreshold: 500000,  // Lower threshold for more accurate method
        millerRabinRounds: 100          // More rounds for higher confidence
      },
      conversion: {
        directConversionLimit: 1000     // Standard
      },
      cache: {
        enabled: true
      },
      memory: {
        optimizeMemory: true            // Optimize for memory to support larger numbers
      }
    }
  };

  // Size-based adjustments on top of the profile
  const sizeConfigs = {
    small: {
      // Default settings, no overrides needed
    },
    medium: {
      factorization: {
        completeSizeLimit: 150,
        thresholds: {
          // Increase thresholds by 20%
          trialDivision: Math.ceil(profileConfigs[options.profile].factorization.thresholds.trialDivision * 1.2),
          optimizedTrialDivision: Math.ceil(profileConfigs[options.profile].factorization.thresholds.optimizedTrialDivision * 1.2),
          pollardRho: Math.ceil(profileConfigs[options.profile].factorization.thresholds.pollardRho * 1.2),
          ecm: Math.ceil(profileConfigs[options.profile].factorization.thresholds.ecm * 1.2),
          quadraticSieve: Math.ceil(profileConfigs[options.profile].factorization.thresholds.quadraticSieve * 1.2)
        }
      },
      primalityTesting: {
        segmentedSieveSize: 2000000,   // 2M segment size
        maxPrimesGenerated: 20000000   // 20M primes limit
      }
    },
    large: {
      factorization: {
        completeSizeLimit: 200,
        thresholds: {
          // Increase thresholds by 50%
          trialDivision: Math.ceil(profileConfigs[options.profile].factorization.thresholds.trialDivision * 1.5),
          optimizedTrialDivision: Math.ceil(profileConfigs[options.profile].factorization.thresholds.optimizedTrialDivision * 1.5),
          pollardRho: Math.ceil(profileConfigs[options.profile].factorization.thresholds.pollardRho * 1.5),
          ecm: Math.ceil(profileConfigs[options.profile].factorization.thresholds.ecm * 1.5),
          quadraticSieve: Math.ceil(profileConfigs[options.profile].factorization.thresholds.quadraticSieve * 1.5)
        }
      },
      primalityTesting: {
        segmentedSieveSize: 5000000,   // 5M segment size
        maxPrimesGenerated: 50000000   // 50M primes limit
      },
      cache: {
        maxSize: 1024 * 1024 * 50      // 50MB cache for large tests
      }
    },
    extreme: {
      factorization: {
        completeSizeLimit: 300,
        thresholds: {
          // Increase thresholds by 100%
          trialDivision: Math.ceil(profileConfigs[options.profile].factorization.thresholds.trialDivision * 2),
          optimizedTrialDivision: Math.ceil(profileConfigs[options.profile].factorization.thresholds.optimizedTrialDivision * 2),
          pollardRho: Math.ceil(profileConfigs[options.profile].factorization.thresholds.pollardRho * 2),
          ecm: Math.ceil(profileConfigs[options.profile].factorization.thresholds.ecm * 2),
          quadraticSieve: Math.ceil(profileConfigs[options.profile].factorization.thresholds.quadraticSieve * 2)
        }
      },
      primalityTesting: {
        segmentedSieveSize: 10000000,  // 10M segment size
        maxPrimesGenerated: 100000000  // 100M primes limit
      },
      cache: {
        maxSize: 1024 * 1024 * 100     // 100MB cache for extreme tests
      }
    }
  };

  // Apply profile configuration
  const profileConfig = profileConfigs[options.profile] || profileConfigs.balanced;
  configure(profileConfig);
  
  // Apply size-based adjustments
  const sizeConfig = sizeConfigs[options.size] || sizeConfigs.medium;
  configure(sizeConfig);
  
  // Add calculated properties to options for passing to benchmark suites
  options.configProfile = profileConfig;
  options.configSize = sizeConfig;
  
  return { ...profileConfig, ...sizeConfig };
}

// Welcome message
console.log('🚀 math-js Benchmark Runner')
console.log('==========================')
console.log(`Profile: ${options.profile}, Size: ${options.size}`)
console.log(`Iterations: ${options.iterations}, Warmup runs: ${options.warmupRuns}`)

if (specificSuites.length > 0) {
  console.log(`Running specific suites: ${specificSuites.join(', ')}`)
}

// Run the benchmarks
async function run() {
  // Apply configuration based on selected profile and size
  const appliedConfig = applyConfiguration();
  console.log('\nApplied Configuration:');
  console.log(`- Performance Profile: ${appliedConfig.performanceProfile}`);
  console.log(`- Factorization thresholds: trial=${appliedConfig.factorization.thresholds.trialDivision}, ` + 
              `optimized=${appliedConfig.factorization.thresholds.optimizedTrialDivision}, ` +
              `pollard=${appliedConfig.factorization.thresholds.pollardRho}, ` +
              `ecm=${appliedConfig.factorization.thresholds.ecm}, ` +
              `quadratic=${appliedConfig.factorization.thresholds.quadraticSieve}`);
  console.log(`- Primality threshold: ${appliedConfig.primalityTesting?.verificationThreshold || mathjs.config.primalityTesting.verificationThreshold}, ` +
              `rounds: ${appliedConfig.primalityTesting?.millerRabinRounds || mathjs.config.primalityTesting.millerRabinRounds}`);
  
  const bench_options = {
    iterations: options.iterations,
    warmupRuns: options.warmupRuns,
    verbose: options.verbose,
    specificSuites: specificSuites.length > 0 ? specificSuites : undefined,
    profile: options.profile,
    size: options.size,
    config: appliedConfig
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