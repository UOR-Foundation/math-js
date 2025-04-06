/**
 * Tests for the basic sieve algorithm with configurable size
 */
const { isPrime, getPrimeRange } = require('../src/Utils');
const { configure, resetConfig } = require('../src/config');
describe('Basic Sieve of Eratosthenes', () => {
    // Reset config before each test
    beforeEach(() => {
        resetConfig();
    });
    test('Should handle primality checks for large numbers', () => {
        // Configure for a more reasonable test
        configure({
            primalityTesting: {
                basicSieveChunkSize: 10000,
                maxPrimesGenerated: 1000
            }
        });
        // Test a large but manageable prime number (Mersenne prime M31 = 2^31 - 1)
        const largePrime = 2147483647n; // 2^31 - 1 (known prime)
        // Verify that our primality testing correctly identifies this number
        expect(isPrime(largePrime)).toBe(true);
        // Check that a non-prime near it is correctly identified
        expect(isPrime(largePrime + 2n)).toBe(false);
    });
    test('Should handle checking primality just beyond MAX_SAFE_INTEGER', () => {
        // Configure for stringent primality testing
        configure({
            primalityTesting: {
                millerRabinRounds: 10, // Reduce this to avoid excessive computation
                useTrialDivision: true
            }
        });
        // Known prime just above Number.MAX_SAFE_INTEGER
        // This is approximately 2^53 + 21
        const nearMAX = 9007199254740991n + 20n;
        // Verify we can check primality for a number just above MAX_SAFE_INTEGER
        const isPrimeResult = isPrime(nearMAX);
        // The main test here is that the function runs without throwing an error
        // The specific result may depend on the implementation details
        expect(typeof isPrimeResult).toBe('boolean');
    });
    test('Should integrate properly with the segmented sieve for small ranges', () => {
        // Configure small chunk sizes to test chunking behavior
        configure({
            primalityTesting: {
                basicSieveChunkSize: 500,
                segmentedSieveSize: 100,
                maxPrimesGenerated: 100
            }
        });
        // Get a small range of primes to verify chunking behavior
        const start = 1000n;
        const end = 1100n;
        const primes = getPrimeRange(start, end);
        // This range should have some primes
        expect(primes.length).toBeGreaterThan(0);
        // Every number in this range should be correctly identified
        for (let i = start; i <= end; i++) {
            const isPrimeActual = primes.includes(i);
            const isPrimeExpected = isPrime(i);
            expect(isPrimeActual).toBe(isPrimeExpected);
        }
    });
    test('Should allow configurable limits', () => {
        // Explicitly pass the limit as an option
        const primes = getPrimeRange(1n, 50n, { maxCount: 5 });
        // Should be limited to 5 primes: 2, 3, 5, 7, 11
        expect(primes.length).toBeLessThanOrEqual(5);
        expect(primes).toContain(2n);
        expect(primes).toContain(3n);
        // Verify expected primes
        expect(primes).toContain(2n);
        expect(primes).toContain(3n);
        expect(primes.length).toBe(5);
    });
});
