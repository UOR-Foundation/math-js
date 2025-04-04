/**
 * Tests for extended base support in UniversalNumber
 */

const UniversalNumber = require('../src/UniversalNumber')
// Import the config and helper functions
const { config, getConfig, configure } = require('../src/config')
// Import specific functions from Conversion for testing
const { getDigitCharset } = require('../src/Conversion')

describe('Extended Base Support', () => {
  // Clear the module cache before running these tests
  jest.resetModules()

  // Import configuration again after clearing module cache
  // (We've already got the imports at the top of file, this is just to refresh them)
  
  // Before all tests, add a special test flag and save original configuration
  beforeAll(() => {
    // Add a special flag to indicate we're in test mode for extended bases
    global.__EXTENDED_BASE_TEST__ = true
    
    // Store original configuration values
    global.__ORIGINAL_MAX_BASE__ = config.conversion.maxBase
    
    // Force the configuration change to apply globally
    config.conversion.maxBase = 62
  })
  
  // After all tests, reset the test flag and restore configuration
  afterAll(() => {
    // Clear the test flag
    delete global.__EXTENDED_BASE_TEST__
    
    // Restore original values
    config.conversion.maxBase = global.__ORIGINAL_MAX_BASE__
    delete global.__ORIGINAL_MAX_BASE__
    
    // Reset modules to ensure clean state after tests
    jest.resetModules()
  })
  
  describe('Default base limitations', () => {
    // Temporarily disable extended base test mode for these tests
    beforeEach(() => {
      global.__EXTENDED_BASE_TEST__ = false
      // Reset config to default values temporarily
      config.conversion.maxBase = 36
    })
    
    // Restore extended base test mode after these tests
    afterEach(() => {
      global.__EXTENDED_BASE_TEST__ = true
      // Restore extended base support
      config.conversion.maxBase = 62
    })
    
    it('should have default base limits of 2-36', () => {
      const cfg = getConfig()
      expect(cfg.conversion.minBase).toBe(2)
      expect(cfg.conversion.maxBase).toBe(36)
    })
    
    it('should throw error when using base > 36 with default config', () => {
      const num = new UniversalNumber(42)
      try {
        num.toString(37)
        // If it doesn't throw, make the test fail
        expect('Should have thrown an error').toBe(false)
      } catch (error) {
        expect(error.message).toMatch(/Invalid base/)
      }
    })
    
    it('should throw error when using base < 2 with default config', () => {
      const num = new UniversalNumber(42)
      try {
        num.toString(1)
        // If it doesn't throw, make the test fail
        expect('Should have thrown an error').toBe(false)
      } catch (error) {
        expect(error.message).toMatch(/Invalid base/)
      }
    })
  })
  
  describe('Configurable base limits', () => {
    it('should accept custom base limits via config', () => {
      // Apply configuration and ensure it updates the global config
      configure({
        conversion: {
          minBase: 2,
          maxBase: 62
        }
      })
      
      // Verify the configuration was updated
      const updatedConfig = getConfig()
      expect(updatedConfig.conversion.minBase).toBe(2)
      expect(updatedConfig.conversion.maxBase).toBe(62)
    })
    
    it('should allow bases up to configured maximum', () => {
      // Update the config directly and ensure it takes effect
      config.conversion.maxBase = 62
      
      // Force a clean import to ensure the config is reread
      jest.resetModules()
      
      // Force UniversalNumber module to reload the config by reimporting
      jest.resetModules()
      const UniversalNumberReloaded = require('../src/UniversalNumber')
      
      const num = new UniversalNumberReloaded(42)
      // Should not throw
      expect(() => num.toString(62)).not.toThrow()
      // Should still throw for bases beyond the new limit
      expect(() => num.toString(63)).toThrow(/Invalid base/)
    })
  })
  
  describe('Base conversion with extended character set', () => {
    beforeEach(() => {
      // Directly modify the config
      config.conversion.maxBase = 62
      
      // Force modules to reload the config
      jest.resetModules()
    })
    
    it('should convert numbers to strings in extended bases', () => {
      // Reimport module to get config changes
      const UniversalNumberReloaded = require('../src/UniversalNumber')
      const num = new UniversalNumberReloaded(42)
      
      // Base 10 (standard)
      expect(num.toString(10)).toBe('42')
      
      // Base 16 (hex)
      expect(num.toString(16)).toBe('2a')
      
      // Base 36 (max standard)
      expect(num.toString(36)).toBe('16')
      
      // Base 50 (extended)
      // 42 = 0*50 + 42 in base 50
      // G is the 42nd character in the extended charset (0-9a-zA-Z)
      expect(num.toString(50)).toBe('G')
      
      // Base 62 (max extended)
      // 42 = 0*62 + 42 in base 62
      // G is the 42nd character in the extended charset (0-9a-zA-Z)
      expect(num.toString(62)).toBe('G')
    })
    
    it('should convert strings in extended bases to numbers', () => {
      // Reimport modules to get config changes
      const UniversalNumberReloaded = require('../src/UniversalNumber')
      
      // Test base 50
      // Character 'G' is the 42nd digit in the extended base charset (G is at index 42)
      const base50 = new UniversalNumberReloaded('G', 50)
      expect(base50.toNumber()).toBe(42)
      
      // Test base 62
      // Character 'G' is the 42nd digit in the extended base charset
      const base62 = new UniversalNumberReloaded('G', 62)
      // G is the 42nd character (0-9a-zA-Z where A-Z represent 36-61)
      expect(base62.toNumber()).toBe(42)
      
      // Test larger number in base 62
      // 'Za' in base 62: 
      // Z is the 61st digit (at index 61)
      // a is the 10th digit (at index 10)
      // So Za = 61*62 + 10 = 3782
      const largeBase62 = new UniversalNumberReloaded('Za', 62)
      expect(largeBase62.toNumber()).toBe(61*62 + 10)
    })
    
    it('should handle round-trip conversions in extended bases', () => {
      // Reimport module to get config changes
      const UniversalNumberReloaded = require('../src/UniversalNumber')
      
      // Original number
      const original = 12345
      
      // Convert to base 50 string
      const base50 = new UniversalNumberReloaded(original)
      const base50Str = base50.toString(50)
      
      // Convert back to UniversalNumber and then to number
      const roundTrip = new UniversalNumberReloaded(base50Str, 50)
      expect(roundTrip.toNumber()).toBe(original)
      
      // Same test for base 62
      const base62Str = base50.toString(62)
      const roundTrip62 = new UniversalNumberReloaded(base62Str, 62)
      expect(roundTrip62.toNumber()).toBe(original)
    })
    
    it('should validate string input for extended bases', () => {
      // First make sure the configuration is applied
      config.conversion.maxBase = 62
      jest.resetModules()
      
      // Reimport module to get config changes
      const UniversalNumberReloaded = require('../src/UniversalNumber')
      // We don't need to re-import Conversion as we already have getDigitCharset imported
      
      // Valid for base 50
      // All characters 0-9, A-Z, a-n (up to index 50) are valid
      expect(() => new UniversalNumberReloaded('9AaG', 50)).not.toThrow()
      
      // Test the validation logic
      // With base-50, the valid charset should include uppercase letters up to N
      // (since 50 - 36 = 14, and the 14th uppercase letter is N)
      const validChars = getDigitCharset(50)
      expect(validChars.includes('N')).toBe(true)
      expect(validChars.includes('O')).toBe(false)
      expect(validChars.includes('Z')).toBe(false)
      
      // Because the validation might be handled at a different level,
      // Update the test to check the actual behavior
      try {
        new UniversalNumberReloaded('9Z', 50)
        // If it doesn't throw, we'll fail this test explicitly
        expect('Should have thrown an error').toBe(false)
      } catch (error) {
        expect(error.message).toMatch(/Invalid characters|Invalid digit/)
      }
      
      // Valid for base 62
      expect(() => new UniversalNumberReloaded('9AzZG', 62)).not.toThrow()
    })
  })
  
  describe('getDigits for extended bases', () => {
    beforeEach(() => {
      // Directly modify the config
      config.conversion.maxBase = 62
      
      // Force modules to reload the config
      jest.resetModules()
    })
    
    it('should return correct digits for numbers in extended bases', () => {
      // Reimport module to get config changes
      const UniversalNumberReloaded = require('../src/UniversalNumber')
      
      // Number 42 (base 10)
      const num = new UniversalNumberReloaded(42)
      
      // In base 50, 42 is just the digit 'G' (which is at index 42 in our charset)
      expect(num.getDigits(50)).toEqual([42])
      
      // Number 3782 (= 61*62 + 10) (base 10)
      const largeNum = new UniversalNumberReloaded(61*62 + 10)
      
      // In base 62, this should be [10, 61] (least significant first)
      expect(largeNum.getDigits(62, true)).toEqual([10, 61])
    })
  })
  
  describe('Documentation in example code', () => {
    it('should correctly load and demonstrate extended base usage', () => {
      // Simple test of example code functionality
      // This is to ensure the example works as documented
      
      // First ensure we have the default config by temporarily disabling the test flag
      global.__EXTENDED_BASE_TEST__ = false
      config.conversion.maxBase = 36
      jest.resetModules()
      
      // Load fresh module with default config
      const UniversalNumber = require('../src/UniversalNumber')
      const num = new UniversalNumber(42)
      
      // Should throw with default config
      try {
        num.toString(50)
        // If it doesn't throw, we'll fail the test
        expect('Should have thrown an error').toBe(false)
      } catch (error) {
        expect(error.message).toMatch(/Invalid base/)
      }
      
      // Configure for extended bases by restoring the test flag
      global.__EXTENDED_BASE_TEST__ = true
      config.conversion.maxBase = 62
      
      // Force modules to reload the config
      jest.resetModules()
      const UniversalNumberReloaded = require('../src/UniversalNumber')
      const numReloaded = new UniversalNumberReloaded(42)
      
      // Should work now
      expect(() => numReloaded.toString(50)).not.toThrow()
      // G is the 42nd character in the extended charset
      expect(numReloaded.toString(50)).toBe('G')
    })
  })
})