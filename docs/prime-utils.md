# Prime Utility Functions in the Math-JS Library

This documentation describes the prime number utilities provided by the Math-JS library through the Utils module. These functions adhere to the Prime Framework principles, ensuring exactness, efficiency, and robustness while working with prime numbers.

## Core Functions

### `isPrime(n, options)`

Determines whether a number is prime using an efficient combination of trial division and probabilistic primality testing.

```javascript
const { isPrime } = require('math-js').internal.Utils;

// Basic usage
isPrime(17);    // true
isPrime(25);    // false

// With options
isPrime(10007, { useCache: true, updateCache: true });
```

#### Parameters:
- `n` (BigInt|number|string): The number to test for primality
- `options` (Object, optional): Configuration options
  - `useCache` (boolean): Whether to use the prime cache (default: true)
  - `updateCache` (boolean): Whether to update the cache with result (default: true)

#### Returns:
- (boolean): True if the number is prime, false otherwise

### `nextPrime(n)`

Finds the next prime number greater than or equal to a given value.

```javascript
const { nextPrime } = require('math-js').internal.Utils;

nextPrime(10);    // 11n
nextPrime(11);    // 11n
nextPrime(20);    // 23n
```

#### Parameters:
- `n` (BigInt|number|string): The starting value

#### Returns:
- (BigInt): The next prime number

### `getPrimeRange(start, end)`

Returns all prime numbers within a specified range, inclusive of both ends.

```javascript
const { getPrimeRange } = require('math-js').internal.Utils;

// Get primes between 10 and 30
const primes = getPrimeRange(10, 30);  // [11n, 13n, 17n, 19n, 23n, 29n]
```

#### Parameters:
- `start` (BigInt|number|string): The lower bound (inclusive)
- `end` (BigInt|number|string): The upper bound (inclusive)

#### Returns:
- (BigInt[]): Array of prime numbers in the specified range

### `primeGenerator(options)`

Creates a generator that yields sequential prime numbers.

```javascript
const { primeGenerator } = require('math-js').internal.Utils;

// Basic generator starting from 2
const generator = primeGenerator();
const firstPrimes = [];
for (let i = 0; i < 5; i++) {
  firstPrimes.push(generator.next().value);
}
// firstPrimes: [2n, 3n, 5n, 7n, 11n]

// With options
const gen = primeGenerator({ 
  start: 100, 
  end: 120,
  count: 3 
});
const primes = Array.from(gen);  // [101n, 103n, 107n]
```

#### Parameters:
- `options` (Object, optional): Generator configuration
  - `start` (BigInt|number): Starting value (default: 2)
  - `end` (BigInt|number, optional): Ending value (inclusive)
  - `count` (number, optional): Maximum number of primes to generate

#### Returns:
- (Generator<BigInt>): A generator that yields prime numbers

## Prime Cache

The module includes an efficient prime number cache to improve performance of repeated primality tests.

### `primeCache`

An object providing access to the internal prime cache, including statistics and management functions.

```javascript
const { primeCache } = require('math-js').internal.Utils;

// Get statistics
const count = primeCache.getKnownPrimeCount();
const largest = primeCache.getLargestKnownPrime();
const smallPrimes = primeCache.getSmallPrimes();

// Manage cache
primeCache.clear(1000n);  // Clear cache above 1000
primeCache.setMaxCacheSize(50000);  // Set maximum cache size
```

#### Methods:
- `getKnownPrimeCount()`: Returns the number of primes in the cache
- `getLargestKnownPrime()`: Returns the largest known prime in the cache
- `getSmallPrimes()`: Returns an array of pre-cached small primes
- `clear(threshold)`: Clears cache entries above the specified threshold
- `setMaxCacheSize(size)`: Sets the maximum number of entries in the cache

## Implementation Notes

1. **Prime Caching**: The library maintains a cache of prime numbers to avoid redundant computations. This significantly improves performance for repeated primality tests.

2. **Primality Testing Algorithms**:
   - For small numbers: Trial division with optimizations
   - For large numbers: Miller-Rabin primality test (deterministic for n < 2^64)

3. **Memory Efficiency**: The segmented Sieve of Eratosthenes implementation allows for efficient generation of primes in large ranges without excessive memory usage.

4. **Performance Considerations**:
   - The cache automatically prunes itself to prevent unbounded growth
   - For very large numbers, consider using options to control cache behavior

5. **Prime Framework Compliance**: All functions adhere to the Prime Framework's requirements for exactness and canonical representation.

## Examples

### Finding large primes efficiently
```javascript
const { isPrime, nextPrime } = require('math-js').internal.Utils;

// Find a prime larger than 1 million
let p = 1000000n;
while (!isPrime(p)) {
  p++;
}
console.log(`First prime after one million: ${p}`);

// Alternatively, use nextPrime
const q = nextPrime(1000000n);
console.log(`Next prime after one million: ${q}`);
```

### Working with prime ranges
```javascript
const { getPrimeRange } = require('math-js').internal.Utils;

// Get all primes between 1000 and 1100
const primes = getPrimeRange(1000, 1100);
console.log(`Found ${primes.length} primes`);
console.log(`Largest: ${primes[primes.length - 1]}`);
```

### Using the prime generator
```javascript
const { primeGenerator } = require('math-js').internal.Utils;

// Generate the first 1000 primes
const gen = primeGenerator({ count: 1000 });
const primes = Array.from(gen);
console.log(`1000th prime: ${primes[primes.length - 1]}`);

// Generate primes until we find one > 10000
const largeGen = primeGenerator({ start: 9900 });
let prime;
do {
  prime = largeGen.next().value;
} while (prime <= 10000n);
console.log(`First prime > 10000: ${prime}`);
```