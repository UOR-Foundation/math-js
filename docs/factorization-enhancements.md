# Factorization and Prime Framework Module Enhancements

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
- **Persistent Storage**: Optional persistence across sessions to avoid redundant factorization of large numbers, with storage adapters for browser and Node.js environments

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

// Enable persistent caching across sessions
factorizationCache.setPersistence(true);

// Save the current cache to persistent storage
factorizationCache.saveToStorage();

// Load cache from persistent storage
factorizationCache.loadFromStorage();

// Clear the cache
factorizationCache.clear();
```

**Methods:**
- `size()`: Get the current size of the cache
- `clear()`: Clear all entries from the cache
- `setMaxSize(size)`: Set the maximum size of the cache
- `getStats()`: Get statistics about the cache
- `setPersistence(enabled)`: Enable or disable persistent caching across sessions
- `saveToStorage()`: Manually save the current cache to persistent storage
- `loadFromStorage()`: Manually load the cache from persistent storage

## Performance Considerations

1. **Memory Usage**: The factorization cache can consume significant memory with large numbers. Adjust the cache size based on your application's requirements.

2. **Persistent Cache**: For computationally intensive applications working with large numbers, enable persistent caching to avoid redundant factorization across application restarts.

3. **Algorithm Selection**: For most numbers up to 15-20 digits, the default algorithms provide excellent performance. For larger numbers, enable the `advanced` option.

4. **Parallel Factorization**: When factoring very large numbers (>25 digits), enable parallel factorization for better performance on multi-core systems.

5. **Partial Factorization**: For numbers with hundreds of digits, complete factorization may be infeasible. In such cases, enable the `partialFactorization` option.

## Prime Framework Algebraic Structure Enhancement

The Prime Framework establishes a mathematical foundation where each number's representation is based on its prime factorization, providing a universal coordinate system. The implemented enhancements maintain this structure while adding powerful algebraic operations.

### Coherence Inner Product

The coherence inner product measures the geometric alignment between two numbers in the Prime Framework's reference fiber algebra. For two numbers with prime factorizations:
- a = p₁ᵃ¹ × p₂ᵃ² × ... × pₙᵃⁿ
- b = p₁ᵇ¹ × p₂ᵇ² × ... × pₙᵇⁿ

The coherence inner product is defined as:
```
⟨a, b⟩ = ∑ pᵢ × aᵢ × bᵢ
```

This provides a measure of how "aligned" the two numbers are in the Prime Framework's coordinate system.

Usage:
```javascript
const innerProduct = PrimeMath.coherenceInnerProduct(12n, 18n);
// Returns 10n (since 12 = 2² × 3, 18 = 2 × 3², and 2×2×1 + 3×1×2 = 10)
```

### Coherence Norm

The coherence norm measures the "magnitude" of a number in the Prime Framework. It is defined as the inner product of a number with itself:
```
‖a‖ = ⟨a, a⟩ = ∑ pᵢ × aᵢ²
```

Usage:
```javascript
const norm = PrimeMath.coherenceNorm(12n);
// Returns 12n (since 12 = 2² × 3, and 2×2² + 3×1² = 11)
```

### Coherence Distance

The distance between two numbers in the Prime Framework's algebraic structure is defined as the norm of their difference:
```
d(a, b) = ‖a - b‖
```

Usage:
```javascript
const distance = PrimeMath.coherenceDistance(10n, 7n);
// Returns the coherence norm of 3n
```

### Canonical Form Optimization

The Prime Framework ensures each number has a unique canonical representation with minimal norm. The `optimizeToCanonicalForm` function ensures this property:

```javascript
const canonical = PrimeMath.optimizeToCanonicalForm(24n);
// Returns the canonical representation of 24 (2³ × 3)
```

## Advanced Number Theory Functions

### Möbius Function

The Möbius function μ(n) is a number-theoretic function defined as:
- μ(1) = 1
- μ(n) = 0 if n has a squared prime factor
- μ(n) = (-1)ᵏ if n is a product of k distinct primes

```javascript
const result = PrimeMath.moebius(30n);
// Returns -1n (since 30 = 2 × 3 × 5, with 3 distinct primes)
```

### Mersenne Prime Testing

Mersenne primes are prime numbers of the form 2ᵖ - 1, where p is also prime.

```javascript
const isMersenne = PrimeMath.isMersennePrime(127n);
// Returns true (since 127 = 2⁷ - 1, and 7 is prime)
```

### Legendre and Jacobi Symbols

The Legendre symbol (a/p) determines whether a is a quadratic residue modulo p (where p is prime).
The Jacobi symbol extends this to composite moduli.

```javascript
const legendreValue = PrimeMath.legendreSymbol(3, 7);
// Returns -1 (since 3 is not a quadratic residue modulo 7)

const jacobiValue = PrimeMath.jacobiSymbol(2, 15);
// Returns 1
```

### Discrete Logarithm

The discrete logarithm problem involves finding x such that gˣ ≡ h (mod p).

```javascript
const log = PrimeMath.discreteLog(2, 3, 5);
// Returns 3n (since 2³ ≡ 3 (mod 5))
```

### Nth Prime Function

Retrieves the nth prime number in sequence.

```javascript
const fifth = PrimeMath.nthPrime(5);
// Returns 11n (the 5th prime number)
```

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

### Prime Framework Operations

```javascript
const PrimeMath = require('math-js').PrimeMath;

// Check coherence between numbers
const norm12 = PrimeMath.coherenceNorm(12n);
console.log(norm12);  // 8n + 3n = 11n

// Compute Legendre symbol for quadratic residue
const isQuadraticResidue = PrimeMath.legendreSymbol(2, 7);
console.log(isQuadraticResidue);  // 1

// Find discrete logarithm: 3^x ≡ 7 (mod 11)
const discreteLog = PrimeMath.discreteLog(3, 7, 11);
console.log(discreteLog);  // Returns the value of x

// Check if a number is a Mersenne prime
const isMersenne = PrimeMath.isMersennePrime(31);
console.log(isMersenne);  // true
```

### Advanced Algebraic Structure

```javascript
const PrimeMath = require('math-js').PrimeMath;

// Complex coherence inner product example
const a = 60n;  // 2^2 * 3 * 5
const b = 42n;  // 2 * 3 * 7
const innerProduct = PrimeMath.coherenceInnerProduct(a, b);
console.log(innerProduct);  // 2*2*1 + 3*1*1 = 7

// Compare canonical forms of numbers
const num1 = 36n;  // 2^2 * 3^2
const num2 = 36n;  // Same value, potentially different representations
const areCoherent = PrimeMath.areCoherent(num1, num2);
console.log(areCoherent);  // true
```