# Prime Utilities in Math-JS

The Math-JS library provides robust utilities for working with prime numbers, built on the Prime Framework's principles of exact arithmetic and universal representation.

## Prime Generation

### Configurable Segmented Sieve

The library implements a memory-efficient Segmented Sieve of Eratosthenes algorithm for generating prime numbers within a range. The segmented approach allows for efficient prime generation even for very large ranges by processing the range in manageable chunks (segments).

#### Configuration Options

You can configure the behavior of the segmented sieve through the global configuration system or by passing options directly to the `getPrimeRange` function:

```javascript
const { configure } = require('math-js/config');
const { getPrimeRange } = require('math-js');

// Configure globally
configure({
  primalityTesting: {
    // Size of each segment (default: 1,000,000)
    segmentedSieveSize: 500000,
    
    // Whether to use dynamic sizing based on range and environment
    dynamicSegmentSizing: true
  }
});

// Or configure per operation
const primes = getPrimeRange(1000n, 10000n, {
  segmentSize: 1000,  // Override segment size for this call
  dynamic: false      // Disable dynamic sizing for this call
});
```

#### Dynamic Segment Sizing

When dynamic segment sizing is enabled (default), the library will automatically adjust the segment size based on:

1. **Range Size**: Smaller segments for smaller ranges (better locality), larger segments for very large ranges (reduced overhead)
2. **Environment**: More conservative memory usage in browser environments
3. **Available Memory**: (Planned feature) Adjustment based on system memory availability

#### Benefits

- **Memory Efficiency**: Process arbitrarily large ranges with bounded memory usage
- **Customization**: Tune performance vs. memory usage tradeoff to your needs
- **Automatic Optimization**: Let the library choose optimal settings based on your data and environment

## Advanced Prime Functions

The library provides several utility functions for working with prime numbers:

- `isPrime(n)`: Fast primality test with caching
- `nextPrime(n)`: Get the next prime number after n
- `getNthPrime(n)`: Get the nth prime number
- `getPrimeRange(start, end, options)`: Get all primes in a range
- `primeGenerator({ start, end, count })`: Generator function that yields prime numbers

## Prime Cache

For performance optimization, the library maintains a cache of known prime numbers. This cache is automatically managed but can be controlled through the configuration system:

```javascript
configure({
  cache: {
    maxPrimeCacheSize: 100000  // Maximum number of entries
  }
});
```

The cache size and other parameters can also be configured through the `primeCache` API:

```javascript
const { primeCache } = require('math-js');

// Get statistics about the cache
const stats = primeCache.getStats();

// Clear cache for numbers above a threshold
primeCache.clear(1000n);

// Set maximum cache size
primeCache.setMaxCacheSize(50000);
```

## Performance Considerations

Prime generation and testing are fundamental operations in the Prime Framework, and their performance directly impacts many higher-level functions. Some guidelines for optimal performance:

1. For repeated primality tests on the same numbers, ensure caching is enabled
2. For generating primes in large ranges, use the segmented sieve with appropriately sized segments
3. For extremely large numbers, consider the performance profile settings in the global configuration