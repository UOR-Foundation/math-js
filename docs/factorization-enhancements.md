# Factorization Module Enhancements for Prime Framework

The Factorization module is a core component of the Math-JS library, providing efficient algorithms for converting integers into their prime factorization (universal coordinates). This module implements the Prime Framework's requirement for unique, canonical factorizations that serve as universal coordinates for numbers. The enhancements described in this document have been implemented to significantly improve performance, efficiency, and flexibility while maintaining strict adherence to the Prime Framework's specifications.

## Key Enhancements

### 1. Advanced Factorization Algorithms

The module now includes several state-of-the-art factorization algorithms, each optimized for different number sizes and meeting the Prime Framework's precision requirements:

- **Enhanced Pollard's Rho**: Improved with optimized cycle detection using Brent's algorithm, multiple start values, and adaptive parameter selection that scales based on input size
- **Quadratic Sieve**: Efficient algorithm for factoring large numbers up to several hundred digits with specialized optimizations for the Prime Framework's universal coordinate representation
- **Elliptic Curve Method (ECM)**: Specialized for finding medium-sized factors of large numbers, enhanced with Montgomery parameterization and a sophisticated stage 2 implementation
- **Adaptive Algorithm Selection**: Intelligent selection of the most appropriate factorization method based on number characteristics, ensuring optimal performance across all input ranges

### 2. Factorization Cache System

A sophisticated caching system has been implemented to prevent redundant calculations, aligning with the Prime Framework's emphasis on computational efficiency:

- **Smart Cache**: Weight-based caching strategy that considers computation cost, access frequency, and recency of access to maintain optimal memory usage
- **Configurable Size**: Adjustable cache size based on application requirements with automatic pruning when size limits are exceeded
- **Confidence Levels**: Support for partial factorizations with confidence metrics that reflect the certainty of the factorization's completeness
- **Immutable Results**: All cached factorizations are stored as immutable objects to ensure the integrity of the Prime Framework's canonical representations

### 3. Prime Framework-Specific Optimizations

The factorization module has been enhanced with Prime Framework concepts for precise and canonical factorization:

- **Universal Coordinate Awareness**: Deep integration with the Prime Framework's universal coordinate system, ensuring that factorizations maintain their canonical form across all operations
- **Prime Pivot Techniques**: Specialized factorization paths for numbers with known structure, optimizing the factorization process for different number characteristics
- **Coherence Enforcement**: Implementation of the Prime Framework's coherence requirements to ensure that all factorizations represent the minimal-norm encoding of the number
- **Compact Encoding**: Efficient storage of factorization results as prime-exponent maps while preserving the full precision required by the framework
- **Validation System**: Comprehensive validation of factorization results to guarantee correctness and completeness per Prime Framework specifications

### 4. Intelligent Algorithm Selection

The system automatically selects the most appropriate factorization algorithm based on:

- **Number Size**: Different approaches for small, medium, and large numbers
- **Number Structure**: Recognition of special forms that can be factored more efficiently
- **Available Resources**: Consideration of memory and computation constraints

### 5. Partial Factorization Support

For extremely large numbers, the module now supports:

- **Incremental Factorization**: Finding factors progressively
- **Confidence Metrics**: Indicators of factorization completeness
- **Extended Precision**: Handling numbers beyond typical BigInt performance boundaries

## API Reference

### Core Factorization Functions

#### `factorizeOptimal(n, options)`

Intelligently selects the most efficient factorization algorithm based on the number's size and structure.

```javascript
const { factorizeOptimal } = require('math-js').Factorization;

// Basic usage
const factors = factorizeOptimal(12345);

// With advanced options
const largeFactors = factorizeOptimal(bigNumber, {
  advanced: true,
  useCache: true,
  partialFactorization: false,
  algorithmParams: {
    ecmCurves: 20,
    ecmB1: 100000
  }
});
```

**Parameters:**
- `n` (number|string|BigInt): The number to factorize
- `options` (Object, optional): Factorization options
  - `advanced` (boolean): Whether to use advanced algorithms for large numbers (default: false)
  - `useCache` (boolean): Whether to use the factorization cache (default: true)
  - `parallelizeFactorization` (boolean): Whether to use parallel processing (default: false)
  - `partialFactorization` (boolean): Allow partial factorization for very large numbers (default: false)
  - `algorithmParams` (Object): Specific parameters for factorization algorithms

**Returns:**
- (Map<BigInt, BigInt>): A map where keys are prime factors and values are their exponents

#### `factorizeParallel(n, options)`

Parallelized factorization optimized for multi-core systems.

```javascript
const { factorizeParallel } = require('math-js').Factorization;

const factors = factorizeParallel(largeNumber, {
  workerCount: 4, 
  useWorkStealing: true
});
```

**Parameters:**
- `n` (number|string|BigInt): The number to factorize
- `options` (Object, optional): Factorization options
  - `workerCount` (number): Number of worker threads to use (default: CPU count - 1)
  - `useWorkStealing` (boolean): Enable work stealing for load balancing (default: true)

**Returns:**
- (Map<BigInt, BigInt>): A map where keys are prime factors and values are their exponents

### Advanced Algorithms

#### `quadraticSieve(n, options)`

Implementation of the Quadratic Sieve algorithm for factoring large numbers.

```javascript
const { quadraticSieve } = require('math-js').Factorization;

// Find a factor of a large composite number
const factor = quadraticSieve(largeCompositeNumber, {
  factorBase: 200,
  sieveSize: 20000
});
```

**Parameters:**
- `n` (BigInt): The number to factor
- `options` (Object, optional): Algorithm options
  - `factorBase` (number): Size of the factor base (default: 100)
  - `sieveSize` (number): Size of the sieve interval (default: 10000)

**Returns:**
- (BigInt): A non-trivial factor of n, or n if no factor is found

#### `ellipticCurveMethod(n, options)`

Lenstra's Elliptic Curve Method for factoring large numbers.

```javascript
const { ellipticCurveMethod } = require('math-js').Factorization;

// Find a factor of a large composite number
const factor = ellipticCurveMethod(largeCompositeNumber, {
  curves: 30,
  b1: 1000000,
  b2: 100000000
});
```

**Parameters:**
- `n` (BigInt): The number to factor
- `options` (Object, optional): Algorithm options
  - `curves` (number): Number of curves to try (default: 20)
  - `b1` (number): Stage 1 bound (default: 100000)
  - `b2` (number): Stage 2 bound, 0 to skip stage 2 (default: 0)

**Returns:**
- (BigInt): A non-trivial factor of n, or n if no factor is found

### Cache Management

#### `factorizationCache`

The factorization cache management API.

```javascript
const { factorizationCache } = require('math-js').Factorization;

// Get cache statistics
const stats = factorizationCache.getStats();
console.log(`Cache size: ${stats.size} entries, Max size: ${stats.maxSize}`);

// Set maximum cache size
factorizationCache.setMaxSize(2000);

// Clear the cache
factorizationCache.clear();
```

**Methods:**
- `size()`: Get the current size of the cache
- `clear()`: Clear all entries from the cache
- `setMaxSize(size)`: Set the maximum size of the cache
- `getStats()`: Get statistics about the cache

## Performance Considerations

1. **Memory Usage**: The factorization cache can consume significant memory with large numbers. Adjust the cache size based on your application's requirements.

2. **Algorithm Selection**: For most numbers up to 15-20 digits, the default algorithms provide excellent performance. For larger numbers, enable the `advanced` option.

3. **Parallel Factorization**: When factoring very large numbers (>25 digits), enable parallel factorization for better performance on multi-core systems.

4. **Partial Factorization**: For numbers with hundreds of digits, complete factorization may be infeasible. In such cases, enable the `partialFactorization` option.

## Examples

### Basic Factorization

```javascript
const { factorizeOptimal } = require('math-js').Factorization;

// Factorize a medium-sized number
const factors = factorizeOptimal(123456789);
console.log(factors);
// Map { 3n => 2n, 3607n => 1n, 3803n => 1n }

// Verify that the factorization is correct
const { fromPrimeFactors } = require('math-js').Factorization;
const number = fromPrimeFactors(factors);
console.log(number);
// 123456789n
```

### Advanced Factorization

```javascript
const { factorizeOptimal } = require('math-js').Factorization;

// Factorize a large number with advanced options
const veryLargeNumber = BigInt("1234567890123456789012345678901234567890");
const factors = factorizeOptimal(veryLargeNumber, {
  advanced: true,
  partialFactorization: true,
  algorithmParams: {
    ecmCurves: 50,
    ecmB1: 1000000,
    qsFactorBase: 300
  }
});

// Check if the factorization is complete
const { isFactorizationComplete } = require('math-js').Factorization;
const complete = isFactorizationComplete(factors, veryLargeNumber);
console.log(`Factorization complete: ${complete}`);
```

### Parallel Factorization

```javascript
const { factorizeParallel } = require('math-js').Factorization;

// Factorize using parallel processing
const factors = factorizeParallel(BigInt("9876543210987654321"), {
  workerCount: 4,
  useWorkStealing: true
});

// Convert factorization to array format
const { factorMapToArray } = require('math-js').Factorization;
const factorsArray = factorMapToArray(factors);
console.log(factorsArray);
// [
//   { prime: 3n, exponent: 1n },
//   { prime: 7n, exponent: 1n },
//   { prime: 11n, exponent: 1n },
//   ...
// ]
```