# Enhanced API Examples

This document provides practical examples of how to use the enhanced library architecture implemented in the Prime Framework for Math-JS.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Configuration](#configuration)
3. [Streaming API](#streaming-api)
4. [Asynchronous Processing](#asynchronous-processing)
5. [Domain-Specific APIs](#domain-specific-apis)
6. [Plugin System](#plugin-system)
7. [Dynamic Loading](#dynamic-loading)

## Basic Usage

The library provides a unified API for working with UniversalNumbers:

```javascript
const mathjs = require('math-js');
const { UniversalNumber } = mathjs;

// Create universal numbers
const a = new UniversalNumber(42);
const b = new UniversalNumber(17);

// Perform operations
const sum = a.add(b);
const product = a.multiply(b);
const quotient = a.divide(b);

console.log(`Sum: ${sum}`);        // 59
console.log(`Product: ${product}`); // 714
```

## Configuration

Customize the library's behavior with the configuration system:

```javascript
const { configure, config } = require('math-js');

// View current configuration
console.log(`Current performance profile: ${config.performanceProfile}`);

// Update configuration
configure({
  performanceProfile: 'precision',  // 'balanced', 'speed', or 'precision'
  factorization: {
    algorithm: 'pollard',           // 'auto', 'trial', 'pollard', etc.
    lazy: false                     // Compute factorization immediately
  },
  cache: {
    enabled: true,                  // Enable caching
    maxSize: 1024 * 1024 * 20       // 20MB cache size
  }
});

// Configuration is applied globally
console.log(`Updated performance profile: ${config.performanceProfile}`);
```

## Streaming API

Process sequences of numbers with the streaming API:

```javascript
const { createStream, UniversalNumber } = require('math-js');

// Input data
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Create a processing pipeline
const stream = createStream(n => new UniversalNumber(n))
  .map(n => n.multiply(new UniversalNumber(2)))  // Double each number
  .filter(n => n.greaterThan(new UniversalNumber(10))); // Keep values > 10

// Process the sequence
const results = stream.process(numbers);
console.log(results.map(n => n.toString())); // [12, 14, 16, 18, 20]

// Use reduce to calculate a single result
const product = stream.reduce(
  numbers,
  (acc, val) => acc.multiply(val),
  new UniversalNumber(1)
);
console.log(`Product: ${product}`); // Product of filtered values
```

## Asynchronous Processing

Handle expensive computations asynchronously:

```javascript
const { createAsync, UniversalNumber } = require('math-js');

async function calculateLargeFactorial() {
  try {
    // Use createAsync for potentially long-running operations
    const factorial = await createAsync(() => {
      // This will be executed asynchronously
      let result = new UniversalNumber(1);
      
      // Calculate factorial of 100
      for (let i = 1; i <= 100; i++) {
        result = result.multiply(new UniversalNumber(i));
      }
      
      return result;
    }, {
      defaultTimeout: 10000,  // 10 second timeout
      reportProgress: true    // Enable progress reporting
    });
    
    console.log(`100! has ${factorial.toString().length} digits`);
  } catch (error) {
    console.error('Calculation failed:', error.message);
  }
}

// Execute the async operation
calculateLargeFactorial();
```

## Domain-Specific APIs

Use specialized APIs for different mathematical domains:

```javascript
const { UniversalNumber, numberTheory, crypto, analysis } = require('math-js');

// Number theory operations
const isPrime = numberTheory.isPrime(17);
const factors = numberTheory.factorize(60);
const gcdValue = numberTheory.gcd(24, 36);
const lcmValue = numberTheory.lcm(15, 20);

// Cryptographic operations
const modPower = crypto.modPow(5, 3, 13);    // 5^3 mod 13
const inverse = crypto.modInverse(7, 11);    // 7^-1 mod 11

// Analysis operations
const sequence = analysis.sequence(1, 10);   // Create sequence from 1 to 10
const sum = analysis.sum([1, 2, 3, 4, 5]);   // Sum of values
const product = analysis.product([1, 2, 3]); // Product of values
```

## Plugin System

Extend the library with custom plugins:

```javascript
const { registerPlugin, getPlugin, UniversalNumber } = require('math-js');

// Register a plugin for statistical operations
registerPlugin('statistics', {
  // Calculate mean of values
  mean: (values) => {
    const numbers = values.map(n => 
      n instanceof UniversalNumber ? n : new UniversalNumber(n)
    );
    
    // Initialize with first value
    let sum = numbers[0];
    
    // Add remaining values
    for (let i = 1; i < numbers.length; i++) {
      sum = sum.add(numbers[i]);
    }
    
    // Divide by count
    return sum.divide(new UniversalNumber(numbers.length));
  },
  
  // Find median value
  median: (values) => {
    const numbers = values.map(n => 
      n instanceof UniversalNumber ? n : new UniversalNumber(n)
    ).sort((a, b) => {
      if (a.lessThan(b)) return -1;
      if (a.greaterThan(b)) return 1;
      return 0;
    });
    
    const mid = Math.floor(numbers.length / 2);
    
    if (numbers.length % 2 === 0) {
      // Even number of elements - average middle two
      return numbers[mid - 1].add(numbers[mid]).divide(new UniversalNumber(2));
    } else {
      // Odd number of elements - return middle element
      return numbers[mid];
    }
  }
});

// Use the plugin
const stats = getPlugin('statistics');
const data = [1, 3, 5, 7, 9];

console.log(`Mean: ${stats.mean(data)}`);
console.log(`Median: ${stats.median(data)}`);
```

## Dynamic Loading

Load modules on-demand to reduce initial footprint:

```javascript
const { dynamic } = require('math-js');
const { loadModule, isLoaded, getRegisteredModules } = dynamic;

// List available modules
console.log('Available modules:', getRegisteredModules());

// Check if a module is loaded
if (!isLoaded('Factorization')) {
  console.log('Factorization module not yet loaded');
  
  // Load the module when needed
  const Factorization = loadModule('Factorization');
  console.log('Factorization module loaded');
  
  // Use the dynamically loaded module
  const factors = Factorization.factorize(120n);
  console.log('Prime factors of 120:', factors);
}

// Clear the module cache if needed
dynamic.clearCache('Factorization');
```

Each of these examples demonstrates a key aspect of the enhanced library architecture, making it easy for developers to leverage the full power of the Prime Framework.