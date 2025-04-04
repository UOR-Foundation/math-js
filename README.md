# UOR Math-JS

A JavaScript library implementing the Prime Framework for universal number representation.

## Overview

The Prime Math Library is a JavaScript library that implements the **Prime Framework** for numbers. It provides a comprehensive system for representing and manipulating integers in a base-independent way, ensuring unique, factorization-based representations and geometric consistency.

The library introduces **Universal Numbers** – integers encoded by their complete digit expansions across all bases – and supports operations on these numbers while preserving their intrinsic prime factor structure.

## Installation

```bash
npm install uor-math-js
```

## Basic Usage

```javascript
const { UniversalNumber, PrimeMath } = require('uor-math-js');

// Create universal numbers
const a = UniversalNumber.fromNumber(42);
const b = UniversalNumber.fromString("123456789");

// Perform arithmetic operations
const sum = a.add(b);
const product = a.multiply(b);

// Get the prime factorization
const factors = a.getCoordinates();
console.log(factors); // Array of prime-exponent pairs

// Check if a number is an intrinsic prime
const isPrime = b.isIntrinsicPrime();

// Convert back to standard formats
const bigIntValue = sum.toBigInt();
const decimalString = product.toString();
```

## Features

- **Universal Number Representation**: Numbers are stored in their unique canonical form via prime factorization
- **Exact Arithmetic**: Guaranteed lossless operations, preserving full precision
- **Base-Independent**: Work with numbers in their intrinsic form, not tied to any specific base
- **Seamless Conversions**: Convert between universal representation and standard formats
- **Number Theory Operations**: Access to prime factorization, GCD, LCM, and primality testing
- **Global Configuration**: Centralized system to control memory usage, computation limits, and performance trade-offs

## Configuration

The library includes a comprehensive configuration system that allows you to adjust memory usage, computation limits, and performance trade-offs:

```javascript
const math = require('uor-math-js');

// Configure the library according to your needs
math.configure({
  performanceProfile: 'speed',  // Options: 'balanced', 'speed', or 'precision'
  cache: {
    maxPrimeCacheSize: 50000,
    maxFactorizationCacheSize: 1000
  },
  factorization: {
    completeSizeLimit: 150  // Maximum digit size for complete factorization
  }
});
```

For more details, see [Configuration Guide](docs/configuration.md).

## Documentation

For full API documentation, run:

```bash
npm run docs
```

Then open `docs/generated/index.html` in your browser.

## Performance Benchmarking

The library includes a comprehensive benchmarking system to measure and optimize performance. To run benchmarks:

```bash
# Run all benchmarks
npm run benchmark

# Run with garbage collection for more accurate memory measurements
npm run benchmark:gc

# Run benchmarks and analyze results
npm run benchmark:analyze

# Run benchmarks, analyze results, and generate visualizations
npm run benchmark:visualize

# Run memory-specific benchmarks
npm run benchmark:memory
```

For more details, see the [benchmarks README](./benchmarks/README.md).

## License

MIT