/**
 * Simple test for base extension in UniversalNumber
 */

// Direct access to the config object
const config = require('../src/config').config

describe('Base Extension', () => {
  it('should support bases beyond 36 when configured', () => {
    // Directly update configuration
    config.conversion.maxBase = 62
    
    // Import modules after config change
    const UniversalNumber = require('../src/UniversalNumber')
    
    // Create a UniversalNumber
    const num = new UniversalNumber(42)
    
    // Using standard base (should work)
    expect(num.toString(10)).toBe('42')
    
    // Using base 62 (should work with our config changes)
    expect(num.toString(62)).toBe('G')
    
    // Run the test with index 16 
    // (using G as the test character which is at index 16 for base-36)
    const base62Num = new UniversalNumber('G', 62)
    expect(base62Num.toNumber()).toBe(16) 
    
    // We should be able to represent larger digits with base-62
    const largeBase62 = new UniversalNumber('Z9', 62)
    expect(largeBase62.toNumber()).toBe(35 * 62 + 9)
    
    // Verify we get an error for bases greater than our limit
    expect(() => num.toString(63)).toThrow(/Invalid base/)
  })
})