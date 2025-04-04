/**
 * Example demonstrating large number conversion options in UniversalNumber
 */

const { UniversalNumber } = require('../src')

console.log('UniversalNumber Large Number Conversion Example')
console.log('==============================================')

// Create a very large number
const largeNumber = new UniversalNumber('123456789012345678901234567890')
console.log(`\nLarge number: ${largeNumber.toString()}`)
console.log(`Digits: ${largeNumber.toString().length}`)

// Attempt to convert to Number with different options
console.log('\n1. Default toNumber() behavior:')
try {
  // Default behavior - throws error for values outside safe integer range
  const num1 = largeNumber.toNumber()
  console.log(`   Result: ${num1}`) // This won't run
} catch (e) {
  console.log(`   Error: ${e.message}`)
}

// Use approximate conversion (will lose precision)
console.log('\n2. toNumber() with allowApproximate option:')
const approxNum = largeNumber.toNumber({ allowApproximate: true })
console.log(`   Result: ${approxNum}`)
console.log(`   Original: ${largeNumber.toString()}`)
console.log(`   Note: Precision has been lost`)

// Use suppressErrors option (returns Infinity)
console.log('\n3. toNumber() with suppressErrors option:')
const infinityNum = largeNumber.toNumber({ suppressErrors: true })
console.log(`   Result: ${infinityNum}`)

// Use scientific notation approximation
console.log('\n4. toApproximateNumber() for scientific notation:')
const scientificNum = largeNumber.toApproximateNumber()
console.log(`   Result: ${scientificNum}`)
console.log(`   As scientific: ${scientificNum.toExponential(14)}`)

// Control precision
console.log('\n5. toApproximateNumber() with controlled precision:')
const preciseNum = largeNumber.toApproximateNumber({ significantDigits: 5 })
console.log(`   Result with 5 significant digits: ${preciseNum.toExponential(4)}`)

// Format as string with different notations
console.log('\n6. formatNumber() with different notations:')
console.log(`   Scientific notation: ${largeNumber.formatNumber({ notation: 'scientific', precision: 6 })}`)
console.log(`   Engineering notation: ${largeNumber.formatNumber({ notation: 'engineering', precision: 6 })}`)
console.log(`   Compact notation: ${largeNumber.formatNumber({ notation: 'compact' })}`)
console.log(`   Standard with grouping: ${largeNumber.formatNumber({ groupDigits: true })}`)

// Format in different bases with grouping
console.log('\n7. formatNumber() with different bases:')
console.log(`   Binary (grouped): ${largeNumber.formatNumber({ base: 2, groupDigits: true, groupSeparator: '_' })}`)
console.log(`   Hex (grouped): ${largeNumber.formatNumber({ base: 16, groupDigits: true, groupSeparator: ' ' })}`)

// Get number parts for custom display
console.log('\n8. getNumberParts() for custom display:')
const parts = largeNumber.getNumberParts()
console.log('   Number parts:')
console.log(`   - Sign: ${parts.sign}`)
console.log(`   - Integer part: ${parts.integerPart}`)
console.log(`   - Fractional part: ${parts.fractionalPart}`)
console.log(`   - Exponent: ${parts.exponent}`)
console.log(`   - Is exponent in range: ${parts.isExponentInRange}`)

// Example for a negative number
console.log('\n9. Handling negative numbers:')
const negativeNumber = new UniversalNumber('-98765432109876543210')
console.log(`   Negative number: ${negativeNumber.toString()}`)
console.log(`   Scientific notation: ${negativeNumber.formatNumber({ notation: 'scientific', precision: 5 })}`)
console.log(`   Approximate value: ${negativeNumber.toApproximateNumber().toExponential(4)}`)

console.log('\nEnd of example')