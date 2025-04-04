# Math-JS Library Usage Examples

This document provides examples of how to use the Math-JS library, which implements the Prime Framework for representing and manipulating integers through their prime factorization.

## Installation

```bash
npm install @uor-foundation/math-js
```

You may need to configure npm to use GitHub Packages by creating a `.npmrc` file in your project:

```
@uor-foundation:registry=https://npm.pkg.github.com
```

## Basic Usage

```javascript
const { UniversalNumber } = require('@uor-foundation/math-js');

// Create a number
const num = new UniversalNumber(42);
console.log(num.toString()); // "42"

// Get prime factorization
const factorization = num.getFactorization();
console.log(factorization); // Map { 2 => 1n, 3 => 1n, 7 => 1n }
```

## Creating UniversalNumbers

```javascript
// Different ways to create UniversalNumbers
const a = new UniversalNumber(123);                 // From number
const b = UniversalNumber.fromString('456');        // From string
const c = UniversalNumber.fromBigInt(789n);         // From BigInt
const d = UniversalNumber.fromString('1010101', 2); // From binary
const e = UniversalNumber.fromString('1A3', 16);    // From hexadecimal

// Create from prime factorization
const f = UniversalNumber.fromFactors([
  { prime: 2, exponent: 3 },  // 2^3
  { prime: 3, exponent: 2 },  // 3^2
  { prime: 5, exponent: 1 }   // 5^1
]);
console.log(f.toString()); // "360"
```

## Arithmetic Operations

```javascript
const a = new UniversalNumber(42);
const b = new UniversalNumber(18);

// Addition
const sum = a.add(b);
console.log(`${a} + ${b} = ${sum}`); // "42 + 18 = 60"

// Subtraction
const difference = a.subtract(b);
console.log(`${a} - ${b} = ${difference}`); // "42 - 18 = 24"

// Multiplication
const product = a.multiply(b);
console.log(`${a} * ${b} = ${product}`); // "42 * 18 = 756"

// Division (only works if result is an integer)
try {
  const quotient = a.divide(b);
  console.log(`${a} / ${b} = ${quotient}`);
} catch (error) {
  console.log(`${a} is not exactly divisible by ${b}`);
}

// Exact division with compatible numbers
const c = new UniversalNumber(756);
const d = new UniversalNumber(12);
const exactQuotient = c.divide(d);
console.log(`${c} / ${d} = ${exactQuotient}`); // "756 / 12 = 63"

// Exponentiation
const base = new UniversalNumber(3);
const result = base.pow(4);
console.log(`${base}^4 = ${result}`); // "3^4 = 81"
```

## Number Theory Operations

```javascript
// GCD and LCM
const num1 = new UniversalNumber(48);
const num2 = new UniversalNumber(18);

const gcd = num1.gcd(num2);
console.log(`GCD of ${num1} and ${num2} is ${gcd}`); // "GCD of 48 and 18 is 6"

const lcm = num1.lcm(num2);
console.log(`LCM of ${num1} and ${num2} is ${lcm}`); // "LCM of 48 and 18 is 144"

// Check if a number is prime
const primeCandidate = new UniversalNumber(17);
console.log(`Is ${primeCandidate} prime? ${primeCandidate.isIntrinsicPrime()}`); // "Is 17 prime? true"

// Radical (product of distinct prime factors)
const n = new UniversalNumber(360);  // 360 = 2^3 * 3^2 * 5
const radical = n.radical();
console.log(`Radical of ${n} is ${radical}`); // "Radical of 360 is 30"

// Modular arithmetic
const x = new UniversalNumber(8);
const m = new UniversalNumber(5);
const remainder = x.mod(m);
console.log(`${x} mod ${m} = ${remainder}`); // "8 mod 5 = 3"

// Modular exponentiation
const modPowResult = x.modPow(3, m);
console.log(`${x}^3 mod ${m} = ${modPowResult}`); // "8^3 mod 5 = 2"

// Modular inverse (only exists if gcd(a,m) = 1)
const y = new UniversalNumber(3);
const mod = new UniversalNumber(11);
const inverse = y.modInverse(mod);
console.log(`Inverse of ${y} mod ${mod} is ${inverse}`); // "Inverse of 3 mod 11 is 4"
```

## Conversion Methods

```javascript
const num = new UniversalNumber(123);

// Convert to different formats
console.log(num.toString());     // "123" (base 10)
console.log(num.toString(2));    // "1111011" (binary)
console.log(num.toString(16));   // "7b" (hexadecimal)
console.log(num.toBigInt());     // 123n

// Get digits in a specific base
const decimalDigits = num.getDigits(10);
console.log(decimalDigits);      // [1, 2, 3]

const binaryDigits = num.getDigits(2);
console.log(binaryDigits);       // [1, 1, 1, 1, 0, 1, 1]
```

## Comparison Operations

```javascript
const a = new UniversalNumber(42);
const b = new UniversalNumber(42);
const c = new UniversalNumber(24);

// Equality
console.log(a.equals(b));           // true
console.log(a.equals(c));           // false

// Comparison
console.log(a.compareTo(b));        // 0 (equal)
console.log(a.compareTo(c));        // 1 (greater than)
console.log(c.compareTo(a));        // -1 (less than)
```

## Serialization

```javascript
const original = new UniversalNumber(123456);

// Serialize to JSON
const jsonString = JSON.stringify(original);
console.log(jsonString);
// {"type":"UniversalNumber","factors":{"2":"4","3":"1","643":"1"},"isNegative":false}

// Deserialize from JSON
const parsed = JSON.parse(jsonString);
const recreated = UniversalNumber.fromJSON(parsed);

console.log(original.equals(recreated)); // true
```

## Working with Large Numbers

The UniversalNumber class can handle arbitrarily large integers, far beyond JavaScript's native Number limits:

```javascript
// Create a very large number
const largeNumber = UniversalNumber.fromString('12345678901234567890123456789012345678901234567890');

// Operations with large numbers
const doubled = largeNumber.multiply(2);
console.log(doubled.toString());
// "24691357802469135780246913578024691357802469135780"

// Check if a large number is prime
const bigPrime = UniversalNumber.fromString('32416190071");
console.log(`Is ${bigPrime} prime? ${bigPrime.isIntrinsicPrime()}`);
```

## Benefits of the Prime Framework

- **Exact arithmetic:** No rounding errors or approximations
- **Efficient operations:** Multiplication, division, and GCD/LCM are efficient when using prime factorization
- **Structural insights:** Access to the prime factorization reveals number-theoretic properties
- **Base-agnostic representation:** Numbers exist independently of their representation in any specific base

For more detailed information, see the [API documentation](../docs/API.md).