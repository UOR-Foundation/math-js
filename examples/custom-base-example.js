/**
 * Example demonstrating custom base support in UniversalNumber
 * Shows the flexibility of configurable base limits in the library
 */

// Import the necessary modules
const { UniversalNumber } = require('../src')
const { configure, config } = require('../src/config')

// Original base limits (2-36 by default)
console.log('Default base limits:')
console.log(`Min base: ${config.conversion.minBase}`)
console.log(`Max base: ${config.conversion.maxBase}`)

try {
  // Try to use a base beyond the default limit
  console.log('\nTrying base 40 with default settings:')
  const num = new UniversalNumber(123)
  console.log(num.toString(40)) // This will throw an error
} catch (error) {
  console.log(`Error: ${error.message}`)
}

// Configure the library with custom base limits
console.log('\nConfiguring custom base limits (2-62):')
configure({
  conversion: {
    minBase: 2,
    maxBase: 62 // Extend to base-62 (0-9, a-z, A-Z)
  }
})

console.log(`New Min base: ${config.conversion.minBase}`)
console.log(`New Max base: ${config.conversion.maxBase}`)

// Create a number and convert it to different bases
const number = new UniversalNumber(12345)

// Print the number in various bases
console.log('\nRepresenting 12345 in various bases:')
console.log(`Base 10: ${number.toString(10)}`)
console.log(`Base 16 (hex): ${number.toString(16)}`)
console.log(`Base 36: ${number.toString(36)}`)
console.log(`Base 50: ${number.toString(50)}`) // Now works with our custom config
console.log(`Base 62: ${number.toString(62)}`) // Now works with our custom config

// Demonstrate parsing strings in extended bases
console.log('\nParsing strings in extended bases:')
// 'Z' is at position 35 in the charset for base-62 (after a-z)
const base62Number = new UniversalNumber('Z', 62) 
console.log(`Parsing 'Z' in base-62: ${base62Number.toNumber()} (decimal)`)

// 'ZA' in base-62 represents 35*62 + 36 = 2206
const largerNumber = new UniversalNumber('ZA', 62)
console.log(`Parsing 'ZA' in base-62: ${largerNumber.toNumber()} (decimal)`)

// The character set for base-62 is: 0-9, a-z, A-Z
// This means we can represent values 0-61 with single digits
console.log('\nCharacter set for base-62:')
console.log(`Digits 0-9: Represent values 0-9`)
console.log(`Letters a-z: Represent values 10-35`)
console.log(`Letters A-Z: Represent values 36-61`)

// Demonstrate round-trip conversion
console.log('\nRound-trip conversion:')
const original = 9876543210n
const univNum = new UniversalNumber(original)
console.log(`Original BigInt: ${original}`)
console.log(`In base-62: ${univNum.toString(62)}`)
console.log(`Converted back: ${new UniversalNumber(univNum.toString(62), 62).toBigInt()}`)
console.log(`Roundtrip matches: ${original === new UniversalNumber(univNum.toString(62), 62).toBigInt()}`)