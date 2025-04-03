/**
 * Tests for the Prime Framework enhancements to the UniversalNumber class
 */

const UniversalNumber = require('../src/UniversalNumber')
const { PrimeMathError } = require('../src/Utils')

describe('Prime Framework Enhancements', () => {
  // Coherence inner product and norm
  describe('Coherence Inner Product and Norm', () => {
    test('innerProduct should compute the coherence inner product correctly', () => {
      const a = UniversalNumber.fromFactors([
        { prime: 2, exponent: 3 },  // 2^3
        { prime: 3, exponent: 1 }   // 3^1
      ]) // a = 24
      
      const b = UniversalNumber.fromFactors([
        { prime: 2, exponent: 2 },  // 2^2
        { prime: 3, exponent: 2 }   // 3^2
      ]) // b = 36
      
      const ip = UniversalNumber.innerProduct(a, b)
      
      // Expected inner product should have prime factors:
      // 2^(3*2) = 2^6
      // 3^(1*2) = 3^2
      // So inner product = 2^6 * 3^2 = 64 * 9 = 576
      expect(ip.toString()).toBe('576')
      
      // Check the factorization directly
      const factors = ip.getFactorization()
      expect(factors.get(2n)).toBe(6n)
      expect(factors.get(3n)).toBe(2n)
    })
    
    test('coherenceNorm should compute the coherence norm correctly', () => {
      const a = UniversalNumber.fromFactors([
        { prime: 2, exponent: 3 },  // 2^3
        { prime: 5, exponent: 1 }   // 5^1
      ]) // a = 40
      
      const norm = a.coherenceNorm()
      
      // Expected norm should have prime factors:
      // 2^(3*3) = 2^9
      // 5^(1*1) = 5^1
      // So norm = 2^9 * 5^1 = 512 * 5 = 2560
      expect(norm.toString()).toBe('2560')
      
      // Check the factorization directly
      const factors = norm.getFactorization()
      expect(factors.get(2n)).toBe(9n)
      expect(factors.get(5n)).toBe(1n)
    })
    
    test('isMinimalNorm should check if a number is in canonical form', () => {
      const a = new UniversalNumber(42)
      expect(a.isMinimalNorm()).toBe(true)
      
      // Create an already normalized number
      const b = UniversalNumber.fromFactors([
        { prime: 2, exponent: 1 },
        { prime: 3, exponent: 1 },
        { prime: 7, exponent: 1 }
      ])
      expect(b.isMinimalNorm()).toBe(true)
    })
    
    test('coherenceDistance should compute distance between two numbers', () => {
      const a = new UniversalNumber(12) // 2^2 * 3
      const b = new UniversalNumber(15) // 3 * 5
      
      const distance = a.coherenceDistance(b)
      
      // |a - b| = |12 - 15| = |-3| = 3
      // But coherence distance uses coherence norm of difference
      // 3 = 3^1, so norm is 3^(1*1) = 3
      expect(distance.toString()).toBe('3')
    })
  })
  
  // Reference frame and transformation
  describe('Fiber Algebra and Reference Frames', () => {
    test('should maintain a registry of reference frames', () => {
      const initialFrame = UniversalNumber.getActiveReferenceFrame()
      expect(initialFrame).toBe('standard')
      
      // Register a new frame
      UniversalNumber.registerReferenceFrame({
        id: 'test-frame',
        transformationRules: { rule1: 'test' },
        description: 'Test reference frame'
      })
      
      // Switch to the new frame
      UniversalNumber.setActiveReferenceFrame('test-frame')
      expect(UniversalNumber.getActiveReferenceFrame()).toBe('test-frame')
      
      // Switch back to standard frame for other tests
      UniversalNumber.setActiveReferenceFrame('standard')
    })
    
    test('getGradedComponents should return digit expansions in different bases', () => {
      const a = new UniversalNumber(42)
      const components = a.getGradedComponents({
        bases: [2, 10, 16]
      })
      
      expect(components.get(2)).toEqual([0, 1, 0, 1, 0, 1])  // Binary
      expect(components.get(10)).toEqual([2, 4])             // Decimal
      expect(components.get(16)).toEqual([10, 2])            // Hex (a = 10 in decimal)
    })
    
    test('transformToFrame should transform between reference frames', () => {
      const a = new UniversalNumber(42)
      
      // Since we only have one frame implementation for now,
      // transformation should result in the same number
      const transformed = a.transformToFrame('standard')
      expect(transformed.equals(a)).toBe(true)
      
      // Should throw for non-existent frame
      expect(() => a.transformToFrame('non-existent')).toThrow(PrimeMathError)
    })
  })
  
  // Lazy evaluation
  describe('Lazy Evaluation and Operation Fusion', () => {
    test('lazy should create a lazily evaluated UniversalNumber', () => {
      const lazyNum = UniversalNumber.lazy(() => new UniversalNumber(42))
      
      // The value shouldn't be computed until needed
      // But when we convert to string, it should compute
      expect(lazyNum.toString()).toBe('42')
    })
    
    test('operation fusion should optimize computation chains', () => {
      const operations = [
        num => num.multiply(2),     // × 2
        num => num.add(10),         // + 10
        num => num.subtract(5)      // - 5
      ]
      
      const fused = UniversalNumber.fuse(operations, 10)
      
      // (10 × 2) + 10 - 5 = 20 + 10 - 5 = 25
      expect(fused.toString()).toBe('25')
      
      // Should throw for invalid inputs
      expect(() => UniversalNumber.fuse([], 10)).toThrow(PrimeMathError)
    })
    
    test('lazy evaluation should delay factorization until needed', () => {
      let factorizationComputed = false
      
      const lazyNum = UniversalNumber.lazy(() => {
        factorizationComputed = true
        return new UniversalNumber(42)
      })
      
      // Factorization shouldn't be computed yet
      expect(factorizationComputed).toBe(false)
      
      // This should trigger computation
      const factors = lazyNum.getFactorization()
      expect(factorizationComputed).toBe(true)
      expect(factors.size).toBe(3) // 2, 3, 7
    })
  })
  
  // Memory optimization
  describe('Memory Optimization', () => {
    test('toCompact and fromCompact should serialize and deserialize compactly', () => {
      const a = new UniversalNumber(42)
      const compact = a.toCompact()
      
      expect(compact.type).toBe('CompactUniversalNumber')
      expect(compact.sign).toBe(1)  // Positive
      
      // Check that the factors are stored as strings
      expect(typeof Object.keys(compact.factors)[0]).toBe('string')
      expect(typeof Object.values(compact.factors)[0]).toBe('string')
      
      const restored = UniversalNumber.fromCompact(compact)
      expect(restored.equals(a)).toBe(true)
      
      // Should throw for invalid inputs
      expect(() => UniversalNumber.fromCompact(null)).toThrow(PrimeMathError)
      expect(() => UniversalNumber.fromCompact({ type: 'WrongType' })).toThrow(PrimeMathError)
    })
    
    test('fromPartialFactorization should handle incomplete factorizations', () => {
      // Create a number with partially known factorization
      // Known: 2^3 * 3^2 = 8 * 9 = 72
      // Unknown/remaining: 11 (a prime)
      // Full number: 72 * 11 = 792
      const partial = UniversalNumber.fromPartialFactorization({
        knownFactors: [
          { prime: 2, exponent: 3 },
          { prime: 3, exponent: 2 }
        ],
        remainingPart: 11
      })
      
      // Should compute the full factorization when needed
      expect(partial.toString()).toBe('792')
      
      // Check the final factorization
      const factors = partial.getFactorization()
      expect(factors.get(2n)).toBe(3n)
      expect(factors.get(3n)).toBe(2n)
      expect(factors.get(11n)).toBe(1n)
      
      // Should throw for invalid inputs
      expect(() => UniversalNumber.fromPartialFactorization(null)).toThrow(PrimeMathError)
      expect(() => 
        UniversalNumber.fromPartialFactorization({ knownFactors: [], remainingPart: 0 })
      ).toThrow(PrimeMathError)
    })
    
    test('should handle partial factorization with prime remaining part', () => {
      const partial = UniversalNumber.fromPartialFactorization({
        knownFactors: [{ prime: 2, exponent: 2 }], // 4
        remainingPart: 7  // Prime number
      })
      
      expect(partial.toString()).toBe('28')
      
      // Check the factorization
      const factors = partial.getFactorization()
      expect(factors.get(2n)).toBe(2n)
      expect(factors.get(7n)).toBe(1n)
    })
  })
  
  // Advanced arithmetic operations
  describe('Advanced Number-Theoretic Operations', () => {
    test('modSqrt should compute modular square root when it exists', () => {
      // 4 is a perfect square, so modSqrt(4, 7) should find x where x^2 ≡ 4 (mod 7)
      // 2^2 = 4 and 5^2 = 25 ≡ 4 (mod 7)
      const a = new UniversalNumber(4)
      const sqrt = a.modSqrt(7)
      
      // Verify by squaring the result
      const squared = sqrt.multiply(sqrt).mod(7)
      expect(squared.toString()).toBe('4')
    })
    
    test('modSqrt should return null when square root does not exist', () => {
      // 3 is not a quadratic residue modulo 7
      const a = new UniversalNumber(3)
      const sqrt = a.modSqrt(7)
      
      expect(sqrt).toBeNull()
    })
    
    test('fastMultiply should optimize multiplication of factorized numbers', () => {
      const a = UniversalNumber.fromFactors([
        { prime: 2, exponent: 2 },  // 2^2 = 4
        { prime: 3, exponent: 1 }   // 3^1 = 3
      ]) // a = 12
      
      const b = UniversalNumber.fromFactors([
        { prime: 2, exponent: 1 },  // 2^1 = 2
        { prime: 5, exponent: 1 }   // 5^1 = 5
      ]) // b = 10
      
      const product = UniversalNumber.fastMultiply(a, b)
      
      // Expected product: 12 * 10 = 120
      expect(product.toString()).toBe('120')
      
      // Check the factorization
      const factors = product.getFactorization()
      expect(factors.get(2n)).toBe(3n)  // 2^3
      expect(factors.get(3n)).toBe(1n)  // 3^1
      expect(factors.get(5n)).toBe(1n)  // 5^1
      
      // Should throw for invalid inputs
      expect(() => UniversalNumber.fastMultiply('invalid', b)).toThrow(PrimeMathError)
    })
  })
})