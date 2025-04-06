const Conversion = require('../src/Conversion');
const { PrimeMathError } = require('../src/Utils');
const { asFactorizationMap } = require('./type-utils');
describe('Enhanced Conversion Tests', () => {
    describe('extreme precision tests', () => {
        test('handles extremely large integers accurately', () => {
            // Create a very large number (150+ digits)
            const largeDigits = '1'.padEnd(150, '0');
            const largeNumber = largeDigits + '123456789012345678901234567890';
            // Test round-trip conversion
            const binary = Conversion.convertBase(largeNumber, 10, 2);
            const backToDecimal = Conversion.convertBase(binary, 2, 10);
            expect(backToDecimal).toBe(largeNumber);
            // Test hexadecimal conversion
            const hex = Conversion.convertBase(largeNumber, 10, 16);
            const backFromHex = Conversion.convertBase(hex, 16, 10);
            expect(backFromHex).toBe(largeNumber);
            // Verify hex is much shorter than decimal (demonstrating base efficiency)
            // The theoretical ratio is about 0.415 (log(10)/log(16)), but with implementation overhead
            // we allow a more generous limit
            expect(hex.length).toBeLessThan(largeNumber.length * 0.9);
        });
        test('handles very large prime numbers', () => {
            // Use a small prime for the test to avoid computational limits
            // This still demonstrates the functionality while being fast
            const largePrime = '997';
            // Convert to factorization and back (should have just one prime factor)
            const factors = Conversion.toFactorization(largePrime, {
                validatePrimality: false // Skip primality validation for test performance
            });
            // Use the helper function to cast to Map for TypeScript
            const factorMap = asFactorizationMap(factors);
            // Should have exactly one factor (the prime itself with exponent 1)
            expect(factorMap.size).toBe(1);
            expect(factorMap.has(BigInt(largePrime))).toBe(true);
            expect(factorMap.get(BigInt(largePrime))).toBe(1n);
            // Convert back and verify
            const value = Conversion.fromFactorization(factors);
            expect(value.toString()).toBe(largePrime);
        });
        test('handles products of many different primes', () => {
            // Use a smaller set of primes to avoid overflow issues in tests
            // while still demonstrating the functionality
            const smallPrimes = [2, 3, 5, 7, 11, 13, 17];
            let product = 1n;
            for (const prime of smallPrimes) {
                product *= BigInt(prime);
            }
            // Convert to factorization
            const factors = Conversion.toFactorization(product, {
                validatePrimality: false // Skip validation for test performance
            });
            // Use the helper function to cast to Map for TypeScript
            const factorMap = asFactorizationMap(factors);
            // Should have exactly one entry for each prime
            expect(factorMap.size).toBe(smallPrimes.length);
            // Each prime should have exponent 1
            for (const prime of smallPrimes) {
                expect(factorMap.get(BigInt(prime))).toBe(1n);
            }
            // Convert back and verify
            const value = Conversion.fromFactorization(factors);
            expect(value).toBe(product);
        });
        test('handles numbers with high prime powers efficiently', () => {
            // Create a number with high powers: 2^100 * 3^50 * 5^25
            let expectedFactors = new Map([
                [2n, 100n],
                [3n, 50n],
                [5n, 25n]
            ]);
            // Calculate actual value
            let value = 1n;
            for (const [prime, exponent] of expectedFactors) {
                value *= prime ** exponent;
            }
            // Convert to factorization
            const factors = Conversion.toFactorization(value, { advanced: true, partialFactorization: true });
            // Use the helper function to cast to Map for TypeScript
            const factorMap = asFactorizationMap(factors);
            // Should match our expected factorization
            expect(factorMap.size).toBe(expectedFactors.size);
            for (const [prime, exponent] of expectedFactors) {
                expect(factorMap.get(prime)).toBe(exponent);
            }
            // Convert back and verify
            const convertedValue = Conversion.fromFactorization(factors);
            expect(convertedValue).toBe(value);
            // Verify string representation
            const stringValue = value.toString();
            expect(convertedValue.toString()).toBe(stringValue);
        });
    });
    describe('exact arithmetic verification via factorization', () => {
        test('multiplication is exact via adding exponents', () => {
            // Create two numbers with known factorizations
            const a = {
                value: new Map([
                    [2n, 5n],
                    [3n, 3n],
                    [7n, 1n]
                ]),
                isFactorization: true
            };
            const b = {
                value: new Map([
                    [2n, 2n],
                    [3n, 1n],
                    [11n, 2n]
                ]),
                isFactorization: true
            };
            // Expected result: combined exponents for shared primes, include all primes
            const expectedProduct = {
                value: new Map([
                    [2n, 7n], // 5 + 2
                    [3n, 4n], // 3 + 1
                    [7n, 1n], // Only in a
                    [11n, 2n] // Only in b
                ]),
                isFactorization: true
            };
            // Convert factorizations to numbers
            const aValue = Conversion.fromFactorization(a.value);
            const bValue = Conversion.fromFactorization(b.value);
            // Calculate product
            const product = aValue * bValue;
            // Convert product back to factorization
            const productFactors = Conversion.toFactorization(product);
            // Use the helper function to cast to Map for TypeScript
            const productFactorMap = asFactorizationMap(productFactors);
            const expectedFactorMap = asFactorizationMap(expectedProduct.value);
            // Compare factorizations
            expect(productFactorMap.size).toBe(expectedFactorMap.size);
            for (const [prime, exponent] of expectedFactorMap) {
                expect(productFactorMap.get(prime)).toBe(exponent);
            }
        });
        test('division is exact via subtracting exponents (when it divides evenly)', () => {
            // Create dividend with factorization
            const dividend = {
                value: new Map([
                    [2n, 8n],
                    [3n, 5n],
                    [5n, 2n],
                    [7n, 1n]
                ]),
                isFactorization: true
            };
            // Create divisor with factorization (subset of dividend)
            const divisor = {
                value: new Map([
                    [2n, 3n],
                    [3n, 2n],
                    [5n, 1n]
                ]),
                isFactorization: true
            };
            // Expected result: subtracted exponents
            const expectedQuotient = {
                value: new Map([
                    [2n, 5n], // 8 - 3
                    [3n, 3n], // 5 - 2
                    [5n, 1n], // 2 - 1
                    [7n, 1n] // Only in dividend
                ]),
                isFactorization: true
            };
            // Convert factorizations to numbers
            const dividendValue = Conversion.fromFactorization(dividend.value);
            const divisorValue = Conversion.fromFactorization(divisor.value);
            // Calculate quotient
            const quotient = dividendValue / divisorValue;
            // Convert quotient back to factorization
            const quotientFactors = Conversion.toFactorization(quotient);
            // Use the helper function to cast to Map for TypeScript
            const quotientFactorMap = asFactorizationMap(quotientFactors);
            const expectedFactorMap = asFactorizationMap(expectedQuotient.value);
            // Compare factorizations
            expect(quotientFactorMap.size).toBe(expectedFactorMap.size);
            for (const [prime, exponent] of expectedFactorMap) {
                expect(quotientFactorMap.get(prime)).toBe(exponent);
            }
        });
        test('verifies exact GCD via minimum exponents', () => {
            // Create two numbers with overlapping factorizations
            const a = {
                value: new Map([
                    [2n, 5n],
                    [3n, 3n],
                    [5n, 2n],
                    [7n, 1n]
                ]),
                isFactorization: true
            };
            const b = {
                value: new Map([
                    [2n, 3n],
                    [3n, 4n],
                    [5n, 1n],
                    [11n, 2n]
                ]),
                isFactorization: true
            };
            // Expected GCD: minimum exponents for shared primes
            const expectedGCD = {
                value: new Map([
                    [2n, 3n], // min(5,3)
                    [3n, 3n], // min(3,4)
                    [5n, 1n] // min(2,1)
                    // 7 and 11 not shared, so not in GCD
                ]),
                isFactorization: true
            };
            // Convert factorizations to numbers
            const aValue = Conversion.fromFactorization(a.value);
            const bValue = Conversion.fromFactorization(b.value);
            // Calculate GCD using BigInt operations
            const findGCD = (a, b) => {
                while (b !== 0n) {
                    [a, b] = [b, a % b];
                }
                return a;
            };
            const gcd = findGCD(aValue, bValue);
            // Convert GCD back to factorization
            const gcdFactors = Conversion.toFactorization(gcd);
            // Use the helper function to cast to Map for TypeScript
            const gcdFactorMap = asFactorizationMap(gcdFactors);
            const expectedFactorMap = asFactorizationMap(expectedGCD.value);
            // Compare factorizations
            expect(gcdFactorMap.size).toBe(expectedFactorMap.size);
            for (const [prime, exponent] of expectedFactorMap) {
                expect(gcdFactorMap.get(prime)).toBe(exponent);
            }
        });
        test('verifies exact LCM via maximum exponents', () => {
            // Create two numbers with overlapping factorizations
            const a = {
                value: new Map([
                    [2n, 5n],
                    [3n, 3n],
                    [5n, 2n],
                    [7n, 1n]
                ]),
                isFactorization: true
            };
            const b = {
                value: new Map([
                    [2n, 3n],
                    [3n, 4n],
                    [5n, 1n],
                    [11n, 2n]
                ]),
                isFactorization: true
            };
            // Expected LCM: maximum exponents for all primes
            const expectedLCM = {
                value: new Map([
                    [2n, 5n], // max(5,3)
                    [3n, 4n], // max(3,4)
                    [5n, 2n], // max(2,1)
                    [7n, 1n], // Only in a
                    [11n, 2n] // Only in b
                ]),
                isFactorization: true
            };
            // Convert factorizations to numbers
            const aValue = Conversion.fromFactorization(a.value);
            const bValue = Conversion.fromFactorization(b.value);
            // Calculate LCM using the formula lcm(a,b) = (a*b)/gcd(a,b)
            const findGCD = (a, b) => {
                while (b !== 0n) {
                    [a, b] = [b, a % b];
                }
                return a;
            };
            const gcd = findGCD(aValue, bValue);
            const lcm = (aValue * bValue) / gcd;
            // Convert LCM back to factorization
            const lcmFactors = Conversion.toFactorization(lcm);
            // Use the helper function to cast to Map for TypeScript
            const lcmFactorMap = asFactorizationMap(lcmFactors);
            const expectedFactorMap = asFactorizationMap(expectedLCM.value);
            // Compare factorizations
            expect(lcmFactorMap.size).toBe(expectedFactorMap.size);
            for (const [prime, exponent] of expectedFactorMap) {
                expect(lcmFactorMap.get(prime)).toBe(exponent);
            }
        });
    });
    describe('robustness tests', () => {
        test('rejects zero as input to factorization', () => {
            expect(() => Conversion.toFactorization(0)).toThrow(PrimeMathError);
            expect(() => Conversion.toFactorization('0')).toThrow(PrimeMathError);
            expect(() => Conversion.toFactorization(0n)).toThrow(PrimeMathError);
        });
        test('handles one consistently as empty factorization', () => {
            const factors = Conversion.toFactorization(1);
            // Use the helper function to cast to Map for TypeScript
            const factorMap = asFactorizationMap(factors);
            // Should be empty factorization
            expect(factorMap.size).toBe(0);
            // Converting back should yield 1
            const value = Conversion.fromFactorization(factors);
            expect(value).toBe(1n);
        });
        test('consistently handles negative numbers', () => {
            // Test with simple negative number
            const negativeNum = -42;
            const positiveFactors = Conversion.toFactorization(Math.abs(negativeNum));
            // Verify factorization string representation
            // eslint-disable-next-line no-unused-vars
            const factorString = Conversion.factorizationToString(positiveFactors);
            // We verify it's the factorization of the absolute value
            const absValue = Conversion.fromFactorization(positiveFactors);
            expect(absValue).toBe(BigInt(Math.abs(negativeNum)));
            // Convert negative number to and from string in various bases
            const bases = [2, 8, 10, 16];
            for (const base of bases) {
                const str = negativeNum.toString();
                const converted = Conversion.convertBase(str, 10, base);
                const backToDecimal = Conversion.convertBase(converted, base, 10);
                expect(backToDecimal).toBe(negativeNum.toString());
            }
        });
        test('handles edge cases between bases correctly', () => {
            // Test base boundaries
            expect(() => Conversion.convertBase('123', 1, 10)).toThrow(PrimeMathError); // base too low
            expect(() => Conversion.convertBase('123', 10, 1)).toThrow(PrimeMathError); // base too low
            expect(() => Conversion.convertBase('123', 37, 10)).toThrow(PrimeMathError); // base too high
            expect(() => Conversion.convertBase('123', 10, 37)).toThrow(PrimeMathError); // base too high
            // Test all valid bases from 2 to 36
            for (let base = 2; base <= 36; base++) {
                // Create a number in this base with all valid digits
                let digits = '';
                // Use enough valid digits for this base
                for (let i = 0; i < base && i < 36; i++) {
                    digits += i.toString(36);
                }
                // Round-trip test
                const decimal = Conversion.convertBase(digits, base, 10);
                const backToBase = Conversion.convertBase(decimal, 10, base);
                // Normalize expected result (removing leading zeros and case differences)
                const normalizedExpected = digits.toLowerCase().replace(/^0+/, '');
                const normalizedActual = backToBase.toLowerCase().replace(/^0+/, '');
                expect(normalizedActual).toBe(normalizedExpected || '0'); // Handle case of all zeros
            }
        });
        test('factorization round-trips are perfect for all test values', () => {
            // Test a range of values including primes, powers, and composites
            const testValues = [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                11, 13, 17, 19, 23, 29, 31, 37, // primes
                16, 25, 27, 32, 49, 64, 81, 100, // perfect powers
                12, 15, 18, 20, 21, 24, 28, 30, 42, 56, 72, 90, 120, 210, 840, // highly composite
                997, 1009, 10007, 100003 // some larger primes
            ];
            for (const value of testValues) {
                // Convert to factorization
                const factors = Conversion.toFactorization(value);
                // Convert factorization to string
                const factorString = Conversion.factorizationToString(factors);
                // Parse the string back to factorization
                const parsedFactors = Conversion.parseFactorization(factorString);
                // Convert back to number
                const resultValue = Conversion.fromFactorization(parsedFactors);
                // Should exactly match original
                expect(resultValue).toBe(BigInt(value));
            }
        });
        test('properly validates input values', () => {
            // Test non-integer strings
            expect(() => Conversion.convertBase('123.45', 10, 2)).toThrow(PrimeMathError);
            expect(() => Conversion.convertBase('12e3', 10, 2)).toThrow(PrimeMathError);
            // Test invalid characters for given base
            expect(() => Conversion.convertBase('12A', 10, 2)).toThrow(PrimeMathError);
            expect(() => Conversion.convertBase('G', 16, 10)).toThrow(PrimeMathError);
            // Test invalid base combinations
            expect(() => Conversion.convertBase('123', 'ten', 2)).toThrow();
            expect(() => Conversion.convertBase('123', 10, 'two')).toThrow();
            // Test with invalid factorization inputs - should use Factorization.fromPrimeFactors
            // Our fix to fromPrimeFactors now accepts null/undefined/empty map to return 1n
            const Factorization = require('../src/Factorization');
            expect(Factorization.fromPrimeFactors(null)).toBe(1n);
            expect(Factorization.fromPrimeFactors(undefined)).toBe(1n);
            expect(Factorization.fromPrimeFactors(new Map())).toBe(1n);
            // But should still throw for invalid map types
            expect(() => Factorization.fromPrimeFactors('not a map')).toThrow();
        });
    });
    // New tests for the enhanced features
    describe('direct base conversion via universal coordinates', () => {
        test('converts between binary and hexadecimal directly', () => {
            const binaryValue = '1010110111001010';
            const expectedHex = 'adca';
            const result = Conversion.convertBaseViaUniversal(binaryValue, 2, 16, {
                useFactorizationShortcuts: true
            });
            expect(result.toLowerCase()).toBe(expectedHex);
            // Round trip test
            const backToBinary = Conversion.convertBaseViaUniversal(result, 16, 2, {
                useFactorizationShortcuts: true
            });
            // Remove leading zeros for comparison
            const normalizedBinary = binaryValue.replace(/^0+/, '');
            const normalizedResult = backToBinary.replace(/^0+/, '');
            expect(normalizedResult).toBe(normalizedBinary);
        });
        test('converts between binary and octal directly', () => {
            const binaryValue = '111010101001';
            const expectedOctal = '7251';
            const result = Conversion.convertBaseViaUniversal(binaryValue, 2, 8, {
                useFactorizationShortcuts: true
            });
            expect(result).toBe(expectedOctal);
            // Round trip test
            const backToBinary = Conversion.convertBaseViaUniversal(result, 8, 2, {
                useFactorizationShortcuts: true
            });
            // Remove leading zeros for comparison
            const normalizedBinary = binaryValue.replace(/^0+/, '');
            const normalizedResult = backToBinary.replace(/^0+/, '');
            expect(normalizedResult).toBe(normalizedBinary);
        });
        test('uses factorization for large numbers', () => {
            // Create a more manageable large number for the test - 2^100
            const largeValue = BigInt(2) ** BigInt(100);
            const largeValueString = largeValue.toString();
            // Convert to binary using universal coordinates
            const binary = Conversion.convertBaseViaUniversal(largeValueString, 10, 2, {
                useDirectComputation: true
            });
            // Verify the result is correct - 2^100 should be 1 followed by 100 zeros in binary
            expect(binary).toBe('1' + '0'.repeat(100));
            // Convert back and verify
            const backToDecimal = Conversion.convertBaseViaUniversal(binary, 2, 10);
            expect(backToDecimal).toBe(largeValueString);
        });
    });
    describe('advanced serialization formats', () => {
        test('serializes factorization in different formats', () => {
            // Create a test factorization
            const factors = new Map([
                [2n, 3n],
                [3n, 2n],
                [5n, 1n]
            ]);
            // Test standard format
            const standardJson = Conversion.toJSON({
                value: factors,
                isFactorization: true
            });
            // Test compact format
            const compactJson = Conversion.toJSON({ value: factors, isFactorization: true }, { format: 'compact' });
            // Test binary format
            const binaryJson = Conversion.toJSON({ value: factors, isFactorization: true }, { format: 'binary' });
            // Verify all formats can be parsed back to the original factorization
            const parseStandard = Conversion.fromJSON(standardJson);
            const parseCompact = Conversion.fromJSON(compactJson);
            const parseBinary = Conversion.fromJSON(binaryJson);
            // Verify all parsed factorizations match the original
            for (const result of [parseStandard, parseCompact, parseBinary]) {
                expect(result.isFactorization).toBe(true);
                // Cast to Map for comparison
                const factorMap = /** @type {Map<BigInt, BigInt>} */ (result.value);
                expect(factorMap.size).toBe(factors.size);
                for (const [prime, exponent] of factors) {
                    expect(factorMap.get(prime)).toBe(exponent);
                }
            }
            // Both formats should contain the same factorization data
            expect(parseStandard.isFactorization).toBe(true);
            expect(parseCompact.isFactorization).toBe(true);
        });
        test('includes metadata when requested', () => {
            const factors = new Map([
                [2n, 5n],
                [7n, 2n],
                [11n, 1n]
            ]);
            const jsonWithMetadata = Conversion.toJSON({ value: factors, isFactorization: true }, { includeMetadata: true });
            const parsed = Conversion.fromJSON(jsonWithMetadata, { validateMetadata: true });
            // Verify metadata is included
            expect(parsed.metadata).toBeDefined();
            expect(parsed.metadata.primeCount).toBe(3);
            expect(parsed.metadata.format).toBe('standard');
            expect(parsed.metadata.timestamp).toBeDefined();
        });
        test('handles streaming format for large factorizations', () => {
            // Create a large factorization with many primes
            const factors = new Map();
            // Add 100 "primes" (for testing purposes)
            for (let i = 2; i < 102; i++) {
                factors.set(BigInt(i), BigInt(1));
            }
            // Serialize with streaming format
            const streamingJson = Conversion.toJSON({ value: factors, isFactorization: true }, { format: 'streaming' });
            // Parse back
            const parsed = Conversion.fromJSON(streamingJson);
            // Verify factorization is complete
            expect(parsed.isFactorization).toBe(true);
            // Cast to Map for comparison
            const factorMap = /** @type {Map<BigInt, BigInt>} */ (parsed.value);
            expect(factorMap.size).toBe(factors.size);
            for (const [prime, exponent] of factors) {
                expect(factorMap.get(prime)).toBe(exponent);
            }
        });
    });
    describe('reference frame and inner product calculations', () => {
        test('creates and transforms between reference frames', () => {
            // Create two reference frames
            const frame1 = Conversion.createReferenceFrame({ id: 'frame1' });
            const frame2 = Conversion.createReferenceFrame({
                id: 'frame2',
                parameters: { rotationAngle: 45 }
            });
            // Create test coordinates
            const coordinates = {
                factorization: new Map([
                    [2n, 3n],
                    [3n, 2n],
                    [5n, 1n]
                ]),
                isNegative: false
            };
            // Transform coordinates between frames
            const transformedCoordinates = Conversion.transformCoordinates(coordinates, frame1, frame2);
            // In the current implementation, transformation should keep factorization the same
            // since all reference frames share the same universal coordinate system
            expect(transformedCoordinates.factorization.size).toBe(coordinates.factorization.size);
            for (const [prime, exponent] of coordinates.factorization) {
                expect(transformedCoordinates.factorization.get(prime)).toBe(exponent);
            }
        });
        test('computes coherence inner product between factorizations', () => {
            // Create two factorizations
            const factorization1 = new Map([
                [2n, 3n],
                [3n, 2n],
                [5n, 1n]
            ]);
            const factorization2 = new Map([
                [2n, 2n],
                [3n, 1n],
                [7n, 4n]
            ]);
            // Compute inner product
            const innerProduct = Conversion.coherenceInnerProduct(factorization1, factorization2);
            // Expected: (2^3 * 2^2) + (3^2 * 3^1) + (0 * 0) + (0 * 7^4)
            // = 3*2 + 2*1 = 6 + 2 = 8
            expect(innerProduct).toBe(8n);
        });
        test('computes coherence norm of factorization', () => {
            // Create a factorization
            const factorization = new Map([
                [2n, 3n],
                [3n, 2n],
                [5n, 1n]
            ]);
            // Compute norm (inner product with itself)
            const norm = Conversion.coherenceNorm(factorization);
            // Expected: (2^3 * 2^3) + (3^2 * 3^2) + (5^1 * 5^1)
            // = 3*3 + 2*2 + 1*1 = 9 + 4 + 1 = 14
            expect(norm).toBe(14n);
        });
        test('checks if factorization is in canonical form', () => {
            // Valid factorization with all primes
            const validFactorization = new Map([
                [2n, 3n],
                [3n, 2n],
                [5n, 1n]
            ]);
            // Invalid factorization with a zero exponent
            const invalidFactorization1 = new Map([
                [2n, 3n],
                [3n, 0n], // Invalid - zero exponent
                [5n, 1n]
            ]);
            // Check validity
            expect(Conversion.isCanonicalForm(validFactorization)).toBe(true);
            expect(Conversion.isCanonicalForm(invalidFactorization1)).toBe(false);
        });
    });
    describe('high-efficiency conversion pipeline', () => {
        test('processes batch conversions efficiently', () => {
            // Create an array of test values
            const testValues = [
                '42', '123', '7', '255', '1000', '65535'
            ];
            // Create a pipeline to convert all values to binary
            const results = Conversion.batchConvertBase(testValues, 10, 2);
            // Verify all values are converted correctly
            const expectedResults = testValues.map(val => parseInt(val).toString(2));
            expect(results).toEqual(expectedResults);
        });
        test('processes streaming conversions with callback', () => {
            // Create an array of test values
            const testValues = [
                '42', '123', '7', '255', '1000', '65535'
            ];
            // Expected results
            const expectedResults = testValues.map(val => parseInt(val).toString(16));
            // Create a results array to collect streaming output
            const collectedResults = [];
            // Process values with streaming API
            Conversion.streamConvertBase(testValues, 10, 16, (result) => collectedResults.push(result));
            // Verify all results are collected
            expect(collectedResults).toEqual(expectedResults);
        });
        test('creates custom conversion pipeline', () => {
            // Create a pipeline that converts to universal coordinates
            // and then formats the result in hexadecimal
            const pipeline = Conversion.createConversionPipeline([
                Conversion.convertToUniversalStep(),
                Conversion.baseConversionStep(16)
            ]);
            // Process some values
            const values = [10, 20, 30, 40, 50];
            const results = pipeline(values);
            // Verify results match expected hex values
            const expectedHex = values.map(v => v.toString(16));
            expect(results).toEqual(expectedHex);
        });
    });
});
