# Math-JS Configuration Guide

This document outlines the configuration options available in the Math-JS library. The library features a comprehensive configuration system that allows you to fine-tune performance, memory usage, and computational limits according to your needs.

## Using the Configuration System

The configuration system can be accessed through the main module:

```javascript
const math = require('math-js');

// Get the current configuration
const currentConfig = math.getConfig();

// Update configuration
math.configure({
  performanceProfile: 'speed',
  cache: {
    maxSize: 1024 * 1024 * 20 // 20MB
  }
});

// Reset to default configuration
math.resetConfig();
```

## Configuration Options

### Performance Profiles

Use performance profiles for quick configuration of multiple settings at once:

```javascript
math.configure({
  performanceProfile: 'balanced' // or 'speed' or 'precision'
});
```

Available profiles:
- `'balanced'`: Default profile that balances speed and precision
- `'speed'`: Optimizes for performance at the potential cost of some precision
- `'precision'`: Maximizes precision regardless of performance impact

### Caching

Control the caching behavior for computational results:

```javascript
math.configure({
  cache: {
    enabled: true,                 // Whether to enable caching
    maxSize: 1024 * 1024 * 10,     // 10MB of general cache
    maxPrimeCacheSize: 100000,     // Maximum entries in prime cache
    maxFactorizationCacheSize: 1000, // Maximum entries in factorization cache
    evictionPolicy: 'lru',         // Cache eviction policy ('lru', 'fifo', 'random')
    persistentCache: false,        // Whether to use persistent storage across sessions
    ttl: 0                         // Cache TTL in ms (0 = no expiry)
  }
});
```

### Factorization

Configure how number factorization is performed:

```javascript
math.configure({
  factorization: {
    lazy: true,                  // Whether to compute factorization lazily
    completeSizeLimit: 100,      // Max digits for complete factorization
    algorithm: 'auto',           // Algorithm to use ('auto', 'trial', 'pollard', etc.)
    timeLimit: 10000,            // Time limit in ms (0 = no limit)
    memoryLimit: 500,            // Memory limit in MB (0 = no limit)
    maxIterations: 1000000,      // Max iterations for probabilistic algorithms
    
    // Factorization method selection thresholds (based on number of digits)
    thresholds: {
      trialDivision: 6,          // Max digits for basic trial division
      optimizedTrialDivision: 12, // Max digits for optimized trial division
      pollardRho: 25,            // Max digits for Pollard's Rho algorithm
      ecm: 50,                   // Max digits for Elliptic Curve Method
      quadraticSieve: 100        // Max digits for Quadratic Sieve
    }
  }
});
```

#### Factorization Method Thresholds

The `factorization.thresholds` configuration controls when the library switches between different factorization algorithms based on the input number size (measured in digits):

* **trialDivision**: For very small numbers, simple trial division is used
* **optimizedTrialDivision**: Slightly larger numbers use trial division with precomputed primes
* **pollardRho**: Medium-sized numbers use Pollard's Rho algorithm for better performance
* **ecm**: Large numbers use the Elliptic Curve Method
* **quadraticSieve**: Very large numbers use the Quadratic Sieve algorithm

Example of adjusting thresholds for systems with powerful CPUs:

```javascript
math.configure({
  factorization: {
    thresholds: {
      // Extend Pollard's Rho range to handle larger numbers
      pollardRho: 35,
      // Use ECM for even larger numbers
      ecm: 70
    }
  }
});
```

### Asynchronous Operations

Control async operation behavior:

```javascript
math.configure({
  async: {
    useWorkers: true,            // Whether to use WebWorkers when available
    defaultTimeout: 30000,       // Default timeout for async operations in ms
    reportProgress: true,        // Whether to report progress events
    maxWorkers: 4                // Maximum number of concurrent workers
  }
});
```

### Memory Optimization

Manage memory usage:

```javascript
math.configure({
  memory: {
    optimizeMemory: false,               // Whether to optimize memory at expense of speed
    useCompactRepresentation: false,     // Whether to use compact representations
    maxMemoryUsage: 0,                   // Max memory usage in MB (0 = no explicit limit)
    gcStrategy: 'auto'                   // GC strategy ('auto', 'aggressive', 'conservative')
  }
});
```

### Primality Testing

Configure primality testing parameters:

```javascript
math.configure({
  primalityTesting: {
    millerRabinRounds: 40,           // Number of Miller-Rabin rounds
    deterministicTestLimit: 20,       // Max digits for deterministic primality testing
    useTrialDivision: true,          // Whether to use trial division before advanced tests
    verificationThreshold: 1000000    // Threshold for using Miller-Rabin vs simple primality test
  }
});
```

#### Primality Verification Threshold

The `verificationThreshold` setting controls when to switch between simple primality testing and more advanced methods like Miller-Rabin:

- For numbers **below** the threshold, a faster but still accurate primality test is used
- For numbers **above** the threshold, the more rigorous Miller-Rabin test with configurable rounds is used

Adjust this threshold based on your performance needs:

```javascript
math.configure({
  primalityTesting: {
    // Use faster primality testing for larger numbers (if you're confident in their primality)
    verificationThreshold: 10000000,
    // Increase Miller-Rabin rounds for more confidence when using the advanced test
    millerRabinRounds: 60
  }
});
```

### Number Conversion

Control conversion behavior between number systems:

```javascript
math.configure({
  conversion: {
    directConversionLimit: 1000,     // Max digits for direct conversion without chunking
    defaultBase: 10,                 // Default base for number conversion
    cacheResults: true               // Whether to cache conversion results
  }
});
```

### Error Handling

Configure error reporting and handling:

```javascript
math.configure({
  errorHandling: {
    includeStackTrace: true,         // Whether to include stack traces in errors
    verbosity: 'standard',           // Level of detail ('minimal', 'standard', 'verbose')
    strictMode: false                // Whether to throw on recoverable errors
  }
});
```

## Environment Detection

The library automatically detects resource constraints in the runtime environment and adjusts configuration settings accordingly:

- In browser environments, it detects if the client is a mobile device
- In Node.js environments, it checks available system memory

When limited resources are detected, the library applies more conservative defaults to prevent excessive memory usage or computational load.

## Configuration Cascading

Configuration settings cascade in the following order (from highest to lowest priority):

1. Explicitly configured settings via `math.configure()`
2. Environment-specific adjustments
3. Performance profile defaults
4. Library default values

## Persistent Caching

When `persistentCache` is enabled, the library automatically saves cached factorization results to persistent storage and loads them when the library is initialized. This is particularly useful for applications that repeatedly work with the same large numbers, as it can significantly reduce factorization time across sessions.

```javascript
// Enable persistent cache
math.configure({
  cache: {
    persistentCache: true
  }
});

// The library will now automatically save factorization results
// to localStorage in browsers or the file system in Node.js

// You can also manually control persistence
const { factorizationCache } = math.Factorization;

// Save the current cache state
factorizationCache.saveToStorage();

// Load the cache from storage
factorizationCache.loadFromStorage();
```

In browser environments, the cache is stored in `localStorage`. In Node.js environments, the cache is stored in the user's home directory under `.math-js-cache/`.

## Advanced Usage

### Dynamic Configuration

You can dynamically adjust configuration based on input size:

```javascript
// Example: Adjust settings for a large computation
const hugeNumber = new math.UniversalNumber('1234567890'.repeat(100));

// Temporarily increase cache for large calculation
const originalConfig = math.getConfig();
math.configure({
  cache: { maxFactorizationCacheSize: 5000 }
});

// Perform calculation
const result = hugeNumber.factorize();

// Restore original configuration
math.configure(originalConfig);
```

### Configuration Composition

Combine multiple configuration setups:

```javascript
// Base configuration for server environment
const serverConfig = {
  performanceProfile: 'balanced',
  memory: { optimizeMemory: true }
};

// Additional configuration for high-load scenarios
const highLoadConfig = {
  async: { maxWorkers: 8 },
  cache: { maxSize: 1024 * 1024 * 50 }
};

// Apply combined configuration
math.configure({
  ...serverConfig,
  ...highLoadConfig
});
```

## Troubleshooting

If you encounter performance issues or memory errors, consider:

1. Reducing cache sizes with `cache.maxSize`, `cache.maxPrimeCacheSize`, and `cache.maxFactorizationCacheSize`
2. Setting `memory.optimizeMemory` to `true`
3. Increasing `factorization.timeLimit` or `async.defaultTimeout` for complex calculations
4. Adjusting `primalityTesting.millerRabinRounds` based on your needed confidence level