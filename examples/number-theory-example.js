// Example of using the math-js library for number theory operations
const { UniversalNumber } = require('../src')

// Create numbers
const a = new UniversalNumber(42)
const b = new UniversalNumber(17)

// Check if a number is prime
console.log(`Is ${a} an intrinsic prime? ${a.isIntrinsicPrime()}`)
// Output: Is 42 an intrinsic prime? false

console.log(`Is ${b} an intrinsic prime? ${b.isIntrinsicPrime()}`)
// Output: Is 17 an intrinsic prime? true

// Radical (product of distinct prime factors)
const c = new UniversalNumber(360)  // 360 = 2^3 * 3^2 * 5
const radical = c.radical()
console.log(`Radical of ${c} is ${radical}`)
// Output: Radical of 360 is 30 (which is 2 * 3 * 5)

// Modular arithmetic
const x = new UniversalNumber(8)
const m = new UniversalNumber(5)

const remainder = x.mod(m)
console.log(`${x} mod ${m} = ${remainder}`)
// Output: 8 mod 5 = 3

// Modular exponentiation
const base = new UniversalNumber(7)
const exponent = 3
const modulus = new UniversalNumber(13)

const modPowResult = base.modPow(exponent, modulus)
console.log(`${base}^${exponent} mod ${modulus} = ${modPowResult}`)
// Output: 7^3 mod 13 = 5

// Modular inverse (only exists if gcd(a,m) = 1)
const y = new UniversalNumber(3)
const mod = new UniversalNumber(11)

const inverse = y.modInverse(mod)
if (inverse) {
  console.log(`Inverse of ${y} mod ${mod} is ${inverse}`)
  // Output: Inverse of 3 mod 11 is 4
  
  // Verify: (3 * 4) mod 11 = 1
  console.log(`Verification: (${y} * ${inverse}) mod ${mod} = ${y.multiply(inverse).mod(mod)}`)
  // Output: Verification: (3 * 4) mod 11 = 1
} else {
  console.log(`${y} has no inverse modulo ${mod}`)
}

// Example of a number with no modular inverse
const z = new UniversalNumber(4)
const mod2 = new UniversalNumber(8)

const noInverse = z.modInverse(mod2)
if (noInverse) {
  console.log(`Inverse of ${z} mod ${mod2} is ${noInverse}`)
} else {
  console.log(`${z} has no inverse modulo ${mod2} (because gcd(4,8) = 4 ≠ 1)`)
  // Output: 4 has no inverse modulo 8 (because gcd(4,8) = 4 ≠ 1)
}
