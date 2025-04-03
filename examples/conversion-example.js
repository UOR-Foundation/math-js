// Example of using the math-js library for number conversions
const { UniversalNumber } = require('../src')

// Create a UniversalNumber from various sources
const fromNumber = UniversalNumber.fromNumber(123)
const fromString = UniversalNumber.fromString('456')
const fromBigInt = UniversalNumber.fromBigInt(789n)
const fromBinary = UniversalNumber.fromString('1010101', 2)
const fromHex = UniversalNumber.fromString('1A3', 16)

// Convert to different formats
console.log(`Original number: ${fromNumber}`)
console.log(`As BigInt: ${fromNumber.toBigInt()}`)
console.log(`As binary: ${fromNumber.toString(2)}`)
console.log(`As hexadecimal: ${fromNumber.toString(16)}`)

/*
Output:
Original number: 123
As BigInt: 123n
As binary: 1111011
As hexadecimal: 7b
*/

// Working with large numbers beyond JavaScript Number limits
const largeNumber = UniversalNumber.fromString('1234567890')
console.log(`Large number: ${largeNumber}`)
console.log(`Large number in hex: ${largeNumber.toString(16)}`)

// Getting individual digits
const num = new UniversalNumber(9876)
const decimalDigits = num.getDigits(10)  // Base 10
const binaryDigits = num.getDigits(2)    // Base 2

console.log(`Digits of ${num} in decimal: ${decimalDigits.join(',')}`)
console.log(`Digits of ${num} in binary: ${binaryDigits.join(',')}`)

// Serialization and deserialization
const original = new UniversalNumber(123456)
const jsonString = JSON.stringify(original)

console.log('Serialized to JSON:', jsonString)

// Recreate the number from JSON
const recreated = UniversalNumber.fromJSON(JSON.parse(jsonString))
console.log(`Recreated from JSON: ${recreated}`)

// Verify they're equal
console.log(`Original and recreated are equal: ${original.equals(recreated)}`)
// Output: Original and recreated are equal: true

// Round-trip verification
const testValue = '987654321'
console.log(`Round-trip consistent for ${testValue}: ${UniversalNumber.verifyRoundTrip(testValue)}`)
// Output: Round-trip consistent for 987654321: true
