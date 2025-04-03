/**
 * Tests for the enhanced library architecture and API features
 */

const mathjs = require('../src')
const { UniversalNumber, configure, createStream, createAsync } = mathjs

describe('Enhanced Library Architecture', () => {
  describe('Configuration System', () => {
    // Save original config to restore after tests
    const originalConfig = { ...mathjs.config }
    
    afterEach(() => {
      // Reset config after each test
      Object.keys(mathjs.config).forEach(key => {
        mathjs.config[key] = originalConfig[key]
      })
    })
    
    test('should allow updating configuration values', () => {
      expect(mathjs.config.performanceProfile).toBe('balanced')
      
      configure({
        performanceProfile: 'precision',
        factorization: {
          algorithm: 'pollard'
        }
      })
      
      expect(mathjs.config.performanceProfile).toBe('precision')
      expect(mathjs.config.factorization.algorithm).toBe('pollard')
      expect(mathjs.config.cache.enabled).toBe(true) // Unchanged value
    })
    
    test('should validate configuration options', () => {
      expect(() => configure('invalid')).toThrow()
      expect(() => configure(null)).toThrow()
    })
    
    test('should deeply merge configuration objects', () => {
      const originalTimeout = mathjs.config.async.defaultTimeout
      
      configure({
        cache: {
          maxSize: 1000000 // 1MB
        }
      })
      
      expect(mathjs.config.cache.maxSize).toBe(1000000)
      expect(mathjs.config.cache.enabled).toBe(true) // Unchanged
      expect(mathjs.config.async.defaultTimeout).toBe(originalTimeout) // Unchanged
    })
  })
  
  describe('Plugin System', () => {
    afterEach(() => {
      // Reset plugins between tests if possible
      // Normally we'd use a method to clear plugins, but we'll work with what we have
    })
    
    test('should allow registering and retrieving plugins', () => {
      const statsPlugin = {
        mean: arr => {
          const sum = arr.reduce((a, b) => a + b, 0)
          return sum / arr.length
        }
      }
      
      mathjs.registerPlugin('testStats', statsPlugin)
      
      const retrievedPlugin = mathjs.getPlugin('testStats')
      expect(retrievedPlugin).toBe(statsPlugin)
      expect(retrievedPlugin.mean([1, 2, 3, 4, 5])).toBe(3)
    })
    
    test('should validate plugin registration parameters', () => {
      expect(() => mathjs.registerPlugin('', {})).toThrow()
      expect(() => mathjs.registerPlugin(null, {})).toThrow()
      expect(() => mathjs.registerPlugin('test', null)).toThrow()
    })
    
    test('should prevent duplicate plugin registration', () => {
      mathjs.registerPlugin('uniquePlugin', { test: true })
      expect(() => mathjs.registerPlugin('uniquePlugin', { test: false })).toThrow()
    })
    
    test('should throw when retrieving non-existent plugin', () => {
      expect(() => mathjs.getPlugin('nonExistentPlugin')).toThrow()
    })
  })
  
  describe('Stream Processing', () => {
    test('should transform data through a processing pipeline', () => {
      const numbers = [1, 2, 3, 4, 5]
      
      const stream = createStream(n => n * 2)
        .map(n => n + 1)
        .filter(n => n > 5)
      
      const results = stream.process(numbers)
      expect(results).toEqual([7, 9, 11])
    })
    
    test('should support reduce operations', () => {
      const numbers = [1, 2, 3, 4, 5]
      
      const stream = createStream(n => n * 2)
      const sum = stream.reduce(numbers, (acc, val) => acc + val, 0)
      
      expect(sum).toBe(30) // (1*2) + (2*2) + (3*2) + (4*2) + (5*2) = 30
    })
    
    test('should handle empty input', () => {
      const stream = createStream(n => n * 2)
      const results = stream.process([])
      expect(results).toEqual([])
      
      const sum = stream.reduce([], (acc, val) => acc + val, 0)
      expect(sum).toBe(0)
    })
  })
  
  describe('Asynchronous Processing', () => {
    test('should support asynchronous operations', async () => {
      const result = await createAsync(() => {
        return Promise.resolve(42)
      })
      
      expect(result).toBe(42)
    })
    
    test('should handle synchronous operations', async () => {
      const result = await createAsync(() => {
        return 42
      })
      
      expect(result).toBe(42)
    })
    
    test('should handle errors in async operations', async () => {
      await expect(createAsync(() => {
        throw new Error('Test error')
      })).rejects.toThrow('Test error')
    })
    
    test('should timeout long-running operations', async () => {
      jest.useFakeTimers() // Mock timers
      
      const asyncOperation = createAsync(
        () => new Promise(resolve => setTimeout(() => resolve(42), 10000)),
        { defaultTimeout: 1000 }
      )
      
      // Fast-forward time
      jest.advanceTimersByTime(1500)
      
      await expect(asyncOperation).rejects.toThrow('Operation timed out')
      
      jest.useRealTimers() // Restore timers
    })
  })
  
  describe('Dynamic Module Loading', () => {
    test('should load modules on demand', () => {
      const { loadModule, isLoaded } = mathjs.dynamic
      
      expect(isLoaded('Utils')).toBe(false)
      
      const Utils = loadModule('Utils')
      expect(isLoaded('Utils')).toBe(true)
      expect(typeof Utils).toBe('object')
    })
    
    test('should throw when loading non-existent module', () => {
      const { loadModule } = mathjs.dynamic
      
      expect(() => loadModule('NonExistentModule')).toThrow()
    })
    
    test('should list registered modules', () => {
      const { getRegisteredModules } = mathjs.dynamic
      
      const modules = getRegisteredModules()
      expect(modules).toContain('UniversalNumber')
      expect(modules).toContain('Factorization')
      expect(modules).toContain('Utils')
    })
    
    test('should clear module cache', () => {
      const { loadModule, clearCache, isLoaded } = mathjs.dynamic
      
      // Load a module
      loadModule('Utils')
      expect(isLoaded('Utils')).toBe(true)
      
      // Clear the cache for that module
      clearCache('Utils')
      expect(isLoaded('Utils')).toBe(false)
      
      // Load a different module
      loadModule('Factorization')
      expect(isLoaded('Factorization')).toBe(true)
      
      // Clear all cache
      clearCache()
      expect(isLoaded('Factorization')).toBe(false)
    })
  })
  
  describe('Specialized Domain APIs', () => {
    test('numberTheory API should provide number theory utilities', () => {
      const { isPrime, gcd, lcm } = mathjs.numberTheory
      
      expect(isPrime(17)).toBe(true)
      expect(isPrime(4)).toBe(false)
      
      // GCD and LCM tests with UniversalNumber objects
      const a = new UniversalNumber(12)
      const b = new UniversalNumber(18)
      
      expect(gcd(a, b).equals(new UniversalNumber(6))).toBe(true)
      expect(lcm(a, b).equals(new UniversalNumber(36))).toBe(true)
    })
    
    test('analysis API should provide analytical utilities', () => {
      const { sequence, sum } = mathjs.analysis
      
      const seq = sequence(1, 5)
      expect(seq.length).toBe(5)
      expect(seq[0] instanceof UniversalNumber).toBe(true)
      
      // Create an array of UniversalNumbers for testing sum
      const numbers = [1, 2, 3, 4, 5].map(n => new UniversalNumber(n))
      
      // Handle sum differently since we shouldn't use UniversalNumber(0)
      let expectedSum = new UniversalNumber(1)
      for (let i = 2; i <= 5; i++) {
        expectedSum = expectedSum.add(new UniversalNumber(i))
      }
      
      const total = sum(numbers)
      expect(total instanceof UniversalNumber).toBe(true)
      expect(total.equals(expectedSum)).toBe(true)
    })
  })
})