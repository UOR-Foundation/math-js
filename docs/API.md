# Math-JS API Documentation

This document provides the complete API reference for the Math-JS library and the Universal Number framework.

## Core Classes

### UniversalNumber

The `UniversalNumber` class is the main entry point for working with numbers in the Prime Framework. It represents integers using their prime factorization (universal coordinates) and provides operations that are lossless and exact.

#### Constructor

```javascript
new UniversalNumber(value)
```

Creates a new UniversalNumber from:
- JavaScript Number (integer)
- BigInt
- String representation of a number
- Map of prime factors
- Another UniversalNumber (copy constructor)
- Object with factorization and sign flag

#### Static Factory Methods

```javascript
UniversalNumber.fromNumber(n)      // From JavaScript Number
UniversalNumber.fromBigInt(n)      // From BigInt
UniversalNumber.fromString(str, base=10)  // From string in specified base
UniversalNumber.fromFactors(factors, isNegative=false)  // From array of prime-exponent pairs or Map
UniversalNumber.factorize(n, options={})  // Factorize a number into a UniversalNumber
```

#### Special Value Support

The UniversalNumber class now fully supports zero as a valid value:

```javascript
const zero = new UniversalNumber(0);
zero.isZero(); // Returns true
zero.toBigInt(); // Returns 0n
```

All arithmetic operations correctly handle zero:
- `add`: x + 0 = x, 0 + x = x
- `subtract`: x - 0 = x, 0 - x = -x, 0 - 0 = 0
- `multiply`: x * 0 = 0, 0 * x = 0
- `divide`: 0 / x = 0 (for x ` 0), x / 0 throws an error
- `pow`: 0^0 = 1 (by mathematical convention), 0^n = 0 for n > 0
- `gcd`: gcd(x, 0) = gcd(0, x) = |x|, gcd(0, 0) is undefined
- `lcm`: lcm(x, 0) = lcm(0, x) = lcm(0, 0) = 0

#### Arithmetic Operations

```javascript
univNum.add(other)        // Addition
univNum.subtract(other)   // Subtraction
univNum.multiply(other)   // Multiplication (via prime exponent addition)
univNum.divide(other)     // Division (via prime exponent subtraction) - only exact division is supported
univNum.pow(exponent)     // Exponentiation (via prime exponent multiplication)
univNum.gcd(other)        // Greatest common divisor
univNum.lcm(other)        // Least common multiple
```

#### Conversion Methods

```javascript
univNum.toBigInt()        // Convert to BigInt
univNum.toNumber()        // Convert to JavaScript Number (may throw if too large)
univNum.toString(base=10) // Convert to string in specified base
univNum.getDigits(base=10, leastSignificantFirst=false) // Get digit array
```

#### Query Methods

```javascript
univNum.getFactorization()  // Get Map of prime factors
univNum.getCoordinates()    // Get factorization and sign
univNum.isIntrinsicPrime()  // Check if number is prime
univNum.isOne()             // Check if number is 1
univNum.isZero()            // Check if number is 0
univNum.isDivisibleBy(other) // Check if divisible by another number
```

#### Comparison and Utility

```javascript
univNum.equals(other)       // Check for equality
univNum.compareTo(other)    // Compare (-1, 0, 1)
univNum.abs()               // Absolute value
univNum.negate()            // Negation
univNum.sign()              // Get sign (-1 or 1)
univNum.radical()           // Product of distinct prime factors
```

#### Advanced Features

```javascript
univNum.modInverse(modulus)    // Modular inverse
univNum.modPow(exp, modulus)   // Modular exponentiation
univNum.mod(modulus)           // Modulo operation
univNum.modSqrt(modulus)       // Modular square root (if it exists)
```

## PrimeMath

The `PrimeMath` namespace provides static functions for advanced arithmetic and number theory operations.

```javascript
PrimeMath.isPrime(n)          // Check if a number is prime
PrimeMath.nextPrime(after)    // Find the next prime after a given number
PrimeMath.gcd(a, b)           // Greatest common divisor
PrimeMath.lcm(a, b)           // Least common multiple
PrimeMath.factorize(n)        // Prime factorization
```

## Utilities

The library includes various utility functions for working with numbers:

```javascript
Utils.isPrime(n)              // Primality test
Utils.generatePrimes(limit)   // Generate primes up to a limit
Utils.getPrimes(start, end)   // Get primes in a range
```

## Conversion Utilities

Functions for converting between different number systems:

```javascript
Conversion.fromBigInt(b)      // Convert BigInt to universal coordinates
Conversion.fromString(str, base) // Parse string in any base
Conversion.toBigInt(factorization) // Convert universal coordinates to BigInt
Conversion.toString(factorization, base) // Convert to string in any base
```

## Dynamic Loading

The library supports dynamic loading of components based on need:

```javascript
const { loadComponent } = require('math-js/dynamicLoader');
const advancedFactorization = await loadComponent('AdvancedFactorization');
```

This allows for efficient use of resources by only loading components when they are needed.