/**
 * Tests for extended base support in UniversalNumber
 */

const UniversalNumber = require('../src/UniversalNumber')
const { configure, getConfig, resetConfig, config } = require('../src/config')
// Conversion module is imported in tests that need it

describe('Extended Base Support', () => {
  // Reset config before each test
  beforeEach(() => {
    resetConfig()
  })
  
  describe('Default base limitations', () => {
    it('should have default base limits of 2-36', () => {
      const config = getConfig()
      expect(config.conversion.minBase).toBe(2)
      expect(config.conversion.maxBase).toBe(36)
    })
    
    it('should throw error when using base > 36 with default config', () => {
      const num = new UniversalNumber(42)
      expect(() => num.toString(37)).toThrow(/Invalid base/)
    })
    
    it('should throw error when using base < 2 with default config', () => {
      const num = new UniversalNumber(42)
      expect(() => num.toString(1)).toThrow(/Invalid base/)
    })
  })
  
  describe('Configurable base limits', () => {
    it('should accept custom base limits via config', () => {
      configure({
        conversion: {
          minBase: 2,
          maxBase: 62
        }
      })
      
      const config = getConfig()
      expect(config.conversion.minBase).toBe(2)
      expect(config.conversion.maxBase).toBe(62)
    })
    
    it('should allow bases up to configured maximum', () => {
      // First modify the config directly
      config.conversion.maxBase = 62
      
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
      expect(num.toString(50)).toBe('G')
      
      // Base 62 (max extended)
      // 42 = 0*62 + 42 in base 62
      expect(num.toString(62)).toBe('G')
    })
    
    it('should convert strings in extended bases to numbers', () => {
      // Reimport modules to get config changes
      const UniversalNumberReloaded = require('../src/UniversalNumber')
      
      // Test base 50
      const base50 = new UniversalNumberReloaded('G', 50)
      expect(base50.toNumber()).toBe(16) // G is at index 16 in base-62
      
      // Test base 62
      const base62 = new UniversalNumberReloaded('G', 62)
      expect(base62.toNumber()).toBe(42)
      
      // Test larger number in base 62
      // 'Za' in base 62 = 35*62 + 10 = 2180
      const largeBase62 = new UniversalNumberReloaded('Za', 62)
      expect(largeBase62.toNumber()).toBe(35*62 + 10)
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
      // Reimport module to get config changes
      const UniversalNumberReloaded = require('../src/UniversalNumber')
      
      // Valid for base 50
      expect(() => new UniversalNumberReloaded('9AzG', 50)).not.toThrow()
      
      // Invalid for base 50 (Z is beyond base 50)
      expect(() => new UniversalNumberReloaded('9Z', 50)).toThrow(/Invalid characters/)
      
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
      
      // Number 2180 (= 35*62 + 10) (base 10)
      const largeNum = new UniversalNumberReloaded(35*62 + 10)
      
      // In base 62, this should be [10, 35]
      expect(largeNum.getDigits(62, true)).toEqual([10, 35])
    })
  })
  
  describe('Documentation in example code', () => {
    it('should correctly load and demonstrate extended base usage', () => {
      // Simple test of example code functionality
      // This is to ensure the example works as documented
      resetConfig() // Start with default config
      const num = new UniversalNumber(42)
      
      // Should throw with default config
      expect(() => num.toString(50)).toThrow()
      
      // Configure for extended bases
      config.conversion.maxBase = 62
      
      // Force modules to reload the config
      jest.resetModules()
      const UniversalNumberReloaded = require('../src/UniversalNumber')
      const numReloaded = new UniversalNumberReloaded(42)
      
      // Should work now
      expect(() => numReloaded.toString(50)).not.toThrow()
      expect(numReloaded.toString(50)).toBe('G')
    })
  })
})