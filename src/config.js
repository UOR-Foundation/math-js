/**
 * Configuration system for the math-js library
 * Central storage and management of all configurable settings and limits
 * @module config
 */

/**
 * Default configuration for the library
 * Contains all settings and their default values
 * @type {Object}
 */
const defaultConfig = {
  /**
   * Performance profile for the library
   * - "balanced": Default profile balancing speed and precision
   * - "speed": Optimize for speed with potential precision trade-offs
   * - "precision": Maximum precision regardless of performance impact
   * @type {string}
   */
  performanceProfile: 'balanced',
  
  /**
   * Controls caching behavior for computational results
   * @type {Object}
   */
  cache: {
    /**
     * Whether to enable caching of computational results
     * @type {boolean}
     */
    enabled: true,
    
    /**
     * Maximum size of the cache in bytes (approximate)
     * @type {number}
     */
    maxSize: 1024 * 1024 * 10, // 10MB default
    
    /**
     * Eviction policy for cache ("lru", "fifo", "random")
     * @type {string}
     */
    evictionPolicy: 'lru',
    
    /**
     * Maximum number of entries in the prime number cache
     * @type {number}
     */
    maxPrimeCacheSize: 100000,
    
    /**
     * Maximum number of entries in the factorization cache
     * @type {number}
     */
    maxFactorizationCacheSize: 1000,
    
    /**
     * Whether to use persistent caching (if available in the environment)
     * @type {boolean}
     */
    persistentCache: false,
    
    /**
     * Time-to-live for cache entries in milliseconds (0 = no expiry)
     * @type {number}
     */
    ttl: 0
  },
  
  /**
   * Controls factorization behavior
   * @type {Object}
   */
  factorization: {
    /**
     * Whether to compute factorization lazily
     * @type {boolean}
     */
    lazy: true,
    
    /**
     * Maximum size (in digits) for which to attempt complete factorization
     * @type {number}
     */
    completeSizeLimit: 100,
    
    /**
     * Algorithm to use for factorization ("auto", "trial", "pollard", "quadratic", etc.)
     * @type {string}
     */
    algorithm: 'auto',
    
    /**
     * Maximum time (in milliseconds) to spend on a factorization attempt (0 = no limit)
     * @type {number}
     */
    timeLimit: 0,
    
    /**
     * Memory limit (in MB) for factorization operations (0 = no limit)
     * @type {number}
     */
    memoryLimit: 0,
    
    /**
     * Maximum number of iterations for probabilistic factorization algorithms
     * @type {number}
     */
    maxIterations: 1000000,
    
    /**
     * Thresholds for factorization method selection based on number size (digits)
     * Controls when to switch between different factorization algorithms
     * @type {Object}
     */
    thresholds: {
      /**
       * Maximum digit size for using simple trial division
       * Numbers up to this size will use basic trial division
       * @type {number}
       */
      trialDivision: 6,
      
      /**
       * Maximum digit size for using optimized trial division with precomputed primes
       * Numbers up to this size will use trial division with cached primes
       * @type {number}
       */
      optimizedTrialDivision: 12,
      
      /**
       * Maximum digit size for using Pollard's Rho algorithm
       * Numbers up to this size will use Pollard's Rho
       * @type {number}
       */
      pollardRho: 25,
      
      /**
       * Maximum digit size for using Elliptic Curve Method (ECM)
       * Numbers up to this size will use ECM
       * @type {number}
       */
      ecm: 50,
      
      /**
       * Maximum digit size for using Quadratic Sieve
       * Numbers up to this size will use Quadratic Sieve for factorization
       * @type {number}
       */
      quadraticSieve: 100
    }
  },
  
  /**
   * Controls behavior of asynchronous operations
   * @type {Object}
   */
  async: {
    /**
     * Whether to use WebWorkers when available
     * @type {boolean}
     */
    useWorkers: true,
    
    /**
     * Default timeout for async operations in milliseconds (0 = no timeout)
     * @type {number}
     */
    defaultTimeout: 30000,
    
    /**
     * Whether to report progress events for long-running operations
     * @type {boolean}
     */
    reportProgress: true,
    
    /**
     * Maximum number of concurrent workers for parallel operations
     * @type {number}
     */
    maxWorkers: 4
  },
  
  /**
   * Controls memory usage and optimization
   * @type {Object}
   */
  memory: {
    /**
     * Whether to optimize memory usage at the expense of performance
     * @type {boolean}
     */
    optimizeMemory: false,
    
    /**
     * Whether to use compact representations for storage
     * @type {boolean}
     */
    useCompactRepresentation: false,
    
    /**
     * Maximum memory usage limit in MB (0 = no explicit limit)
     * @type {number}
     */
    maxMemoryUsage: 0,
    
    /**
     * Garbage collection strategy ("auto", "aggressive", "conservative")
     * @type {string}
     */
    gcStrategy: 'auto'
  },
  
  /**
   * Controls primality testing behavior
   * @type {Object}
   */
  primalityTesting: {
    /**
     * Number of Miller-Rabin rounds for primality testing
     * Higher values give more confidence for large numbers
     * @type {number}
     */
    millerRabinRounds: 40,
    
    /**
     * Maximum size (in digits) for deterministic primality testing
     * Larger numbers will use probabilistic tests
     * @type {number}
     */
    deterministicTestLimit: 20,
    
    /**
     * Whether to use trial division before advanced primality tests
     * @type {boolean}
     */
    useTrialDivision: true,
    
    /**
     * Size of each segment for the segmented sieve of Eratosthenes algorithm
     * Controls memory usage vs. performance tradeoff
     * @type {number}
     */
    segmentedSieveSize: 1000000,
    
    /**
     * Whether to dynamically adjust segment size based on range size
     * and available system resources
     * @type {boolean}
     */
    dynamicSegmentSizing: true,
    
    /**
     * Size of each chunk for the basic sieve when handling large ranges
     * Controls memory usage vs. performance tradeoff
     * @type {number}
     */
    basicSieveChunkSize: 1000000,
    
    /**
     * Maximum number of primes to generate in a single operation
     * Acts as a safety limit to prevent memory exhaustion
     * @type {number}
     */
    maxPrimesGenerated: 10000000,
    
    /**
     * Threshold for using different primality testing algorithms
     * Numbers below this threshold use simple primality test
     * Numbers above this threshold use Miller-Rabin test
     * @type {number}
     */
    verificationThreshold: 1000000
  },
  
  /**
   * Controls number conversion behavior
   * @type {Object}
   */
  conversion: {
    /**
     * Maximum size (in digits) for direct conversion without chunking
     * @type {number}
     */
    directConversionLimit: 1000,
    
    /**
     * Default base for number conversion operations (when not specified)
     * @type {number}
     */
    defaultBase: 10,
    
    /**
     * Whether to cache conversion results
     * @type {boolean}
     */
    cacheResults: true,
    
    /**
     * Minimum allowable base for conversions
     * @type {number}
     */
    minBase: 2,
    
    /**
     * Maximum allowable base for conversions
     * @type {number}
     */
    maxBase: 36
  },
  
  /**
   * Controls error handling and reporting
   * @type {Object}
   */
  errorHandling: {
    /**
     * Whether to include stack traces in errors
     * @type {boolean}
     */
    includeStackTrace: true,
    
    /**
     * Level of detail in error messages ("minimal", "standard", "verbose")
     * @type {string}
     */
    verbosity: 'standard',
    
    /**
     * Whether to throw on potentially recoverable errors
     * @type {boolean}
     */
    strictMode: false
  }
}

// Create a mutable current configuration by copying the default
let currentConfig = JSON.parse(JSON.stringify(defaultConfig))

/**
 * Update configuration with custom settings
 * @param {Object} options - Configuration options to update
 * @returns {Object} The updated configuration object
 */
function configure(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Configuration options must be an object')
  }
  
  // Helper function to recursively merge objects
  function deepMerge(target, source) {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (
          source[key] instanceof Object && 
          key in target && 
          target[key] instanceof Object
        ) {
          deepMerge(target[key], source[key])
        } else {
          target[key] = source[key]
        }
      }
    }
    return target
  }
  
  // Merge the provided options into the current configuration
  deepMerge(currentConfig, options)
  
  // Update environment-specific optimizations based on the profile
  applyProfileSpecificSettings()
  
  return currentConfig
}

/**
 * Apply profile-specific optimizations
 * @private
 */
function applyProfileSpecificSettings() {
  // Adjust settings based on the selected performance profile
  switch (currentConfig.performanceProfile) {
  case 'speed':
    // Optimize for speed
    if (!userConfiguredValue('cache.enabled')) {
      currentConfig.cache.enabled = true
    }
    if (!userConfiguredValue('factorization.lazy')) {
      currentConfig.factorization.lazy = true
    }
    if (!userConfiguredValue('memory.optimizeMemory')) {
      currentConfig.memory.optimizeMemory = false
    }
    break
      
  case 'precision':
    // Optimize for precision
    if (!userConfiguredValue('factorization.lazy')) {
      currentConfig.factorization.lazy = false
    }
    if (!userConfiguredValue('primalityTesting.millerRabinRounds')) {
      currentConfig.primalityTesting.millerRabinRounds = 100
    }
    if (!userConfiguredValue('errorHandling.strictMode')) {
      currentConfig.errorHandling.strictMode = true
    }
    break
      
  case 'balanced':
  default:
    // Use default settings
    break
  }
  
  // Apply memory-specific optimizations
  if (currentConfig.memory.optimizeMemory) {
    if (!userConfiguredValue('cache.maxSize')) {
      currentConfig.cache.maxSize = 1024 * 1024 * 2 // 2MB
    }
    if (!userConfiguredValue('cache.maxPrimeCacheSize')) {
      currentConfig.cache.maxPrimeCacheSize = 10000
    }
    if (!userConfiguredValue('cache.maxFactorizationCacheSize')) {
      currentConfig.cache.maxFactorizationCacheSize = 200
    }
  }
}

/**
 * Check if a specific configuration value has been explicitly set by the user
 * @private
 * @param {string} path - Dot-separated path to the configuration value
 * @returns {boolean} True if the value was explicitly configured
 */
function userConfiguredValue(path) {
  // Split the path into parts
  const parts = path.split('.')
  
  // Track the default and current config values
  let defaultValue = defaultConfig
  let currentValue = currentConfig
  
  // Traverse the path
  for (const part of parts) {
    defaultValue = defaultValue[part]
    currentValue = currentValue[part]
    
    // If either value is undefined, the path is invalid
    if (defaultValue === undefined || currentValue === undefined) {
      return false
    }
  }
  
  // Check if the value differs from the default
  return JSON.stringify(defaultValue) !== JSON.stringify(currentValue)
}

/**
 * Reset configuration to default values
 * @returns {Object} The reset configuration object
 */
function resetConfig() {
  currentConfig = JSON.parse(JSON.stringify(defaultConfig))
  return currentConfig
}

/**
 * Get the current configuration
 * @returns {Object} The current configuration (read-only)
 */
function getConfig() {
  // Return a deep copy to prevent external modification
  return JSON.parse(JSON.stringify(currentConfig))
}

/**
 * Check if the current environment has limited resources
 * Used to automatically adjust settings based on platform constraints
 * @private
 * @returns {boolean} True if the environment has memory or processing constraints
 */
function isLimitedEnvironment() {
  // Check for Node.js vs Browser
  if (typeof window !== 'undefined') {
    // Browser environment
    // Check if it's a mobile device (approximate)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== 'undefined' ? navigator.userAgent : ''
    )
    
    return isMobile
  } else {
    // Node.js environment
    try {
      // Try to get system memory
      const os = require('os')
      const totalMemory = os.totalmem()
      
      // Consider environments with < 1GB RAM to be limited
      return totalMemory < 1024 * 1024 * 1024
    } catch (e) {
      // If we can't detect, assume it's not limited
      return false
    }
  }
}

// Apply environment-specific adjustments on initial load
if (isLimitedEnvironment()) {
  // Apply conservative defaults for limited environments
  currentConfig.cache.maxSize = 1024 * 1024 * 2 // 2MB
  currentConfig.cache.maxPrimeCacheSize = 5000
  currentConfig.cache.maxFactorizationCacheSize = 100
  currentConfig.factorization.completeSizeLimit = 50
  currentConfig.memory.optimizeMemory = true
}

// Export the configuration system
module.exports = {
  configure,
  resetConfig,
  getConfig,
  config: currentConfig
}
