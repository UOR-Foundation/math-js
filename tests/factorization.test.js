const {
  factorize,
  factorizeWithPrimes,
  factorizePollardsRho,
  factorizeOptimal,
  millerRabinTest,
  pollardRho,
  isFactorizationComplete,
  fromPrimeFactors,
  getPrimeFactors,
  factorMapToArray,
  factorArrayToMap,
  getRadical,
  getPrimeSignature
} = require('../src/Factorization')

const { PrimeMathError } = require('../src/Utils')

/**
 * Helper function to convert a Map to an object for easier assertions
 * @param {Map<BigInt, BigInt>} map - Map of prime factors
 * @returns {Object.<string, string>} Object representation of the map
 */
const mapToObject = (map) => {
  /** @type {Object.<string, string>} */
  const obj = {}
  for (const [key, value] of map.entries()) {
    obj[key.toString()] = value.toString()
  }
  return obj
}

describe('Factorization Module', () => {
  describe('factorize', () => {
    test('should correctly factorize small numbers', () => {
      expect(mapToObject(factorize(1))).toEqual({})
      expect(mapToObject(factorize(2))).toEqual({ '2': '1' })
      expect(mapToObject(factorize(3))).toEqual({ '3': '1' })
      expect(mapToObject(factorize(4))).toEqual({ '2': '2' })
      expect(mapToObject(factorize(12))).toEqual({ '2': '2', '3': '1' })
      expect(mapToObject(factorize(60))).toEqual({ '2': '2', '3': '1', '5': '1' })
    })

    test('should factorize prime numbers correctly', () => {
      expect(mapToObject(factorize(2))).toEqual({ '2': '1' })
      expect(mapToObject(factorize(3))).toEqual({ '3': '1' })
      expect(mapToObject(factorize(5))).toEqual({ '5': '1' })
      expect(mapToObject(factorize(7))).toEqual({ '7': '1' })
      expect(mapToObject(factorize(11))).toEqual({ '11': '1' })
      expect(mapToObject(factorize(101))).toEqual({ '101': '1' })
    })

    test('should handle powers of primes', () => {
      expect(mapToObject(factorize(4))).toEqual({ '2': '2' })
      expect(mapToObject(factorize(8))).toEqual({ '2': '3' })
      expect(mapToObject(factorize(9))).toEqual({ '3': '2' })
      expect(mapToObject(factorize(16))).toEqual({ '2': '4' })
      expect(mapToObject(factorize(25))).toEqual({ '5': '2' })
      expect(mapToObject(factorize(27))).toEqual({ '3': '3' })
    })

    test('should handle composite numbers with multiple prime factors', () => {
      expect(mapToObject(factorize(6))).toEqual({ '2': '1', '3': '1' })
      expect(mapToObject(factorize(30))).toEqual({ '2': '1', '3': '1', '5': '1' })
      expect(mapToObject(factorize(210))).toEqual({ '2': '1', '3': '1', '5': '1', '7': '1' })
      expect(mapToObject(factorize(360))).toEqual({ '2': '3', '3': '2', '5': '1' })
      expect(mapToObject(factorize(2310))).toEqual({ '2': '1', '3': '1', '5': '1', '7': '1', '11': '1' })
    })

    test('should handle larger numbers', () => {
      expect(mapToObject(factorize(1234))).toEqual({ '2': '1', '617': '1' })
      expect(mapToObject(factorize(9973))).toEqual({ '9973': '1' }) // Prime number
      expect(mapToObject(factorize(10000))).toEqual({ '2': '4', '5': '4' })
    })

    test('should throw error for non-positive integers', () => {
      expect(() => factorize(0)).toThrow(PrimeMathError)
      expect(() => factorize(-5)).toThrow(PrimeMathError)
    })

    test('should handle string and BigInt inputs', () => {
      expect(mapToObject(factorize('12'))).toEqual({ '2': '2', '3': '1' })
      expect(mapToObject(factorize(12n))).toEqual({ '2': '2', '3': '1' })
    })
  })

  describe('factorizeWithPrimes', () => {
    test('should correctly factorize numbers with small prime factors', () => {
      expect(mapToObject(factorizeWithPrimes(60))).toEqual({ '2': '2', '3': '1', '5': '1' })
      expect(mapToObject(factorizeWithPrimes(97))).toEqual({ '97': '1' })
      expect(mapToObject(factorizeWithPrimes(98))).toEqual({ '2': '1', '7': '2' })
      expect(mapToObject(factorizeWithPrimes(100))).toEqual({ '2': '2', '5': '2' })
    })

    test('should correctly factorize number with large prime factors', () => {
      // The number 101 * 103 = 10403
      expect(mapToObject(factorizeWithPrimes(10403))).toEqual({ '101': '1', '103': '1' })
    })
  })
  
  describe('millerRabinTest', () => {
    test('should correctly identify small prime numbers', () => {
      expect(millerRabinTest(2n)).toBe(true)
      expect(millerRabinTest(3n)).toBe(true)
      expect(millerRabinTest(5n)).toBe(true)
      expect(millerRabinTest(7n)).toBe(true)
      expect(millerRabinTest(11n)).toBe(true)
      expect(millerRabinTest(13n)).toBe(true)
      expect(millerRabinTest(17n)).toBe(true)
      expect(millerRabinTest(19n)).toBe(true)
      expect(millerRabinTest(23n)).toBe(true)
    })
    
    test('should correctly identify small composite numbers', () => {
      expect(millerRabinTest(4n)).toBe(false)
      expect(millerRabinTest(6n)).toBe(false)
      expect(millerRabinTest(8n)).toBe(false)
      expect(millerRabinTest(9n)).toBe(false)
      expect(millerRabinTest(10n)).toBe(false)
      expect(millerRabinTest(12n)).toBe(false)
      expect(millerRabinTest(15n)).toBe(false)
    })
    
    test('should work with larger known primes', () => {
      expect(millerRabinTest(101n)).toBe(true)
      expect(millerRabinTest(997n)).toBe(true)
      expect(millerRabinTest(10007n)).toBe(true)
    })
  })

  describe('pollardRho', () => {
    test('should find a factor of composite numbers', () => {
      const factor = pollardRho(12n)
      expect(12n % factor).toBe(0n)
      
      const factor2 = pollardRho(1001n) // 7 * 143
      expect(1001n % factor2).toBe(0n)
    })
    
    test('should return the number itself for prime numbers', () => {
      const prime = 101n
      expect(pollardRho(prime)).toBe(prime)
    })
    
    test('should return 2 for even numbers', () => {
      expect(pollardRho(100n)).toBe(2n)
      expect(pollardRho(256n)).toBe(2n)
    })
  })
  
  describe('factorizePollardsRho', () => {
    test('should correctly factorize composite numbers', () => {
      // Test with a number that has multiple prime factors
      const result = factorizePollardsRho(60)
      expect(mapToObject(result)).toEqual({ '2': '2', '3': '1', '5': '1' })
      
      // Another example with larger factors
      const bigComposite = 1001n // 7 * 143
      expect(isFactorizationComplete(factorizePollardsRho(bigComposite), bigComposite)).toBe(true)
    })
    
    test('should handle prime numbers', () => {
      expect(mapToObject(factorizePollardsRho(101))).toEqual({ '101': '1' })
    })
  })

  describe('factorizeOptimal', () => {
    test('should correctly choose algorithm based on number size', () => {
      // For small numbers, should use basic factorization
      expect(mapToObject(factorizeOptimal(60))).toEqual({ '2': '2', '3': '1', '5': '1' })
      
      // For larger numbers, should still work correctly
      const largeNumber = 10000n * 10000n // 100,000,000
      expect(isFactorizationComplete(factorizeOptimal(largeNumber), largeNumber)).toBe(true)
    })

    test('should handle options parameter', () => {
      // Without advanced option
      expect(mapToObject(factorizeOptimal(60))).toEqual({ '2': '2', '3': '1', '5': '1' })
      
      // With advanced option set to true
      expect(mapToObject(factorizeOptimal(60, { advanced: true }))).toEqual({ '2': '2', '3': '1', '5': '1' })
    })
  })

  describe('isFactorizationComplete', () => {
    test('should verify if factorization is complete', () => {
      // Test with 12 = 2² * 3
      const factors = new Map([
        [2n, 2n],
        [3n, 1n]
      ])
      expect(isFactorizationComplete(factors, 12n)).toBe(true)
    })

    test('should identify incomplete factorizations', () => {
      // Incomplete factorization for 12 (missing the 3)
      const incompleteFactors = new Map([
        [2n, 2n]
      ])
      expect(isFactorizationComplete(incompleteFactors, 12n)).toBe(false)
    })

    test('should handle empty factorizations for 1', () => {
      // 1 has no prime factors
      expect(isFactorizationComplete(new Map(), 1n)).toBe(true)
    })
  })

  describe('fromPrimeFactors', () => {
    test('should correctly reconstruct numbers from factorization', () => {
      // 12 = 2² * 3
      const factors = new Map([
        [2n, 2n],
        [3n, 1n]
      ])
      expect(fromPrimeFactors(factors)).toBe(12n)
      
      // 360 = 2³ * 3² * 5
      const factors360 = new Map([
        [2n, 3n],
        [3n, 2n],
        [5n, 1n]
      ])
      expect(fromPrimeFactors(factors360)).toBe(360n)
    })

    test('should handle array input format', () => {
      // 12 = 2² * 3
      const factors = [
        { prime: 2n, exponent: 2n },
        { prime: 3n, exponent: 1n }
      ]
      expect(fromPrimeFactors(factors)).toBe(12n)
    })

    test('should throw error for non-prime factors', () => {
      const invalidFactors = new Map([
        [4n, 1n] // 4 is not prime
      ])
      expect(() => fromPrimeFactors(invalidFactors)).toThrow(PrimeMathError)
    })

    test('should throw error for non-positive exponents', () => {
      const invalidFactors = new Map([
        [2n, 0n] // Exponent must be positive
      ])
      expect(() => fromPrimeFactors(invalidFactors)).toThrow(PrimeMathError)
    })
  })

  describe('getPrimeFactors', () => {
    test('should return unique prime factors without exponents', () => {
      // 12 = 2² * 3
      expect(getPrimeFactors(12)).toEqual([2n, 3n])
      
      // 360 = 2³ * 3² * 5
      expect(getPrimeFactors(360)).toEqual([2n, 3n, 5n])
    })

    test('should return a single factor for prime numbers', () => {
      expect(getPrimeFactors(7)).toEqual([7n])
      expect(getPrimeFactors(11)).toEqual([11n])
    })

    test('should return empty array for 1', () => {
      expect(getPrimeFactors(1)).toEqual([])
    })
  })

  describe('factorMapToArray and factorArrayToMap', () => {
    test('should correctly convert between map and array formats', () => {
      // 360 = 2³ * 3² * 5
      const factorMap = new Map([
        [2n, 3n],
        [3n, 2n],
        [5n, 1n]
      ])
      
      const factorArray = [
        { prime: 2n, exponent: 3n },
        { prime: 3n, exponent: 2n },
        { prime: 5n, exponent: 1n }
      ]
      
      // Test map to array conversion
      const resultArray = factorMapToArray(factorMap)
      expect(resultArray).toEqual(factorArray)
      
      // Test array to map conversion
      const resultMap = factorArrayToMap(factorArray)
      expect(mapToObject(resultMap)).toEqual(mapToObject(factorMap))
    })
  })
  
  describe('getRadical', () => {
    test('should compute the radical of a number correctly', () => {
      // Radical of 12 = 2³ * 3 is 2 * 3 = 6
      expect(getRadical(12)).toBe(6n)
      
      // Radical of 8 = 2³ is 2
      expect(getRadical(8)).toBe(2n)
      
      // Radical of 60 = 2² * 3 * 5 is 2 * 3 * 5 = 30
      expect(getRadical(60)).toBe(30n)
    })
    
    test('should return the number itself for prime numbers', () => {
      expect(getRadical(7)).toBe(7n)
      expect(getRadical(11)).toBe(11n)
    })
    
    test('should return 1 for 1', () => {
      expect(getRadical(1)).toBe(1n)
    })
  })

  describe('getPrimeSignature', () => {
    test('should compute the prime signature correctly', () => {
      // Signature of 2 is (2-1)*(2^1-1) = 1*1 = 1
      expect(getPrimeSignature(2)).toBe(1n)
      
      // Signature of 4 = 2² is (2-1)*(2^2-1) = 1*3 = 3
      expect(getPrimeSignature(4)).toBe(3n)
      
      // Signature of 6 = 2*3 is (2-1)*(2^1-1)*(3-1)*(3^1-1) = 1*1*2*2 = 4
      expect(getPrimeSignature(6)).toBe(4n)
    })
  })

  // Round-trip test
  describe('factorization round trip', () => {
    test('should correctly roundtrip factorization', () => {
      const testNumbers = [2n, 3n, 12n, 60n, 360n, 1234n]
      
      for (const num of testNumbers) {
        const factors = factorizeOptimal(num)
        const reconstructed = fromPrimeFactors(factors)
        expect(reconstructed).toBe(num)
      }
    })
  })
})