declare namespace _exports {
    export { PrimeTestOptions };
}
declare namespace _exports {
    export { PrimeMathError };
    export { fastExp };
    export { isDivisible };
    export { exactDivide };
    export { gcd };
    export { lcm };
    export { toBigInt };
    export { isPrime };
    export { nextPrime };
    export { factorial };
    export { primeCache };
    export { getPrimeRange };
    export { primeGenerator };
    export { getNthPrime };
    export { isMersennePrime };
    export { moebiusFunction };
    export { quadraticResidue };
    export { testExports as __test__ };
}
export = _exports;
type PrimeTestOptions = {
    /**
     * - Whether to use the prime cache
     */
    useCache: boolean;
    /**
     * - Whether to update the cache with result
     */
    updateCache: boolean;
};
/**
 * Custom error class for Prime Math-related errors
 * @class PrimeMathError
 * @extends Error
 */
declare class PrimeMathError extends Error {
    /**
     * Create a new PrimeMathError
     * @param {string} message - Error message
     */
    constructor(message: string);
    stack: string;
}
/**
 * Fast exponentiation algorithm (exponentiation by squaring)
 * Efficiently computes base^exponent in O(log n) time
 * Optimized for use in the Prime Framework
 * Enhanced to handle large exponents safely
 *
 * @param {BigInt} base - The base value
 * @param {BigInt} exponent - The exponent value (must be non-negative)
 * @param {BigInt} [modulus] - Optional modulus for modular exponentiation
 * @returns {BigInt} base raised to the power of exponent (modulo modulus if provided)
 * @throws {PrimeMathError} If exponent is negative
 */
declare function fastExp(base: bigint, exponent: bigint, modulus?: bigint): bigint;
/**
 * Check if a number is divisible by another
 *
 * @param {BigInt} num - The number to check
 * @param {BigInt} divisor - The potential divisor
 * @returns {boolean} True if num is divisible by divisor, false otherwise
 * @throws {PrimeMathError} If divisor is zero
 */
declare function isDivisible(num: bigint, divisor: bigint): boolean;
/**
 * Perform exact division, ensuring the result is an integer
 * Aligns with the Prime Framework's requirement for exact arithmetic
 *
 * @param {BigInt} dividend - The number to divide
 * @param {BigInt} divisor - The divisor
 * @returns {BigInt} The result of the division
 * @throws {PrimeMathError} If the division is not exact or if divisor is zero
 */
declare function exactDivide(dividend: bigint, divisor: bigint): bigint;
/**
 * Calculate the greatest common divisor (GCD) of two numbers using the binary GCD algorithm
 * Optimized version of the Euclidean algorithm for better performance in the Prime Framework
 *
 * @param {BigInt} a - First number
 * @param {BigInt} b - Second number
 * @returns {BigInt} The GCD of a and b
 */
declare function gcd(a: bigint, b: bigint): bigint;
/**
 * Calculate the least common multiple (LCM) of two numbers
 * Optimized for the Prime Framework using the GCD
 *
 * @param {BigInt} a - First number
 * @param {BigInt} b - Second number
 * @returns {BigInt} The LCM of a and b
 */
declare function lcm(a: bigint, b: bigint): bigint;
/**
 * Safely convert a value to BigInt
 * Enhanced to handle a wider range of inputs for the Prime Framework
 *
 * @param {number|string|BigInt} value - The value to convert
 * @returns {BigInt} The value as a BigInt
 * @throws {PrimeMathError} If the value cannot be converted to BigInt
 */
declare function toBigInt(value: number | string | bigint): bigint;
/**
 * Fast primality test that combines trial division and Miller-Rabin
 * Optimized for the Prime Framework with caching
 *
 * @param {BigInt} n - The number to check for primality
 * @param {Object} options - Optional configuration
 * @param {boolean} options.useCache - Whether to use the prime cache (default: true)
 * @param {boolean} options.updateCache - Whether to update the cache with result (default: true)
 * @returns {boolean} True if n is prime, false otherwise
 */
/**
 * @typedef {Object} PrimeTestOptions
 * @property {boolean} useCache - Whether to use the prime cache
 * @property {boolean} updateCache - Whether to update the cache with result
 */
/**
 * @param {BigInt|number|string} n - The number to check for primality
 * @param {PrimeTestOptions} [options] - Options for primality testing
 * @returns {boolean} True if n is prime, false otherwise
 */
declare function isPrime(n: bigint | number | string, options?: PrimeTestOptions): boolean;
/**
 * Get the next prime number after a given number
 * Enhanced with prime cache for efficiency
 *
 * @param {BigInt|number} n - The starting number
 * @returns {BigInt} The next prime number after n
 */
declare function nextPrime(n: bigint | number): bigint;
/**
 * Factorial function
 * Optimized for the Prime Framework
 *
 * @param {BigInt|number} n - The number to calculate factorial for
 * @returns {BigInt} n!
 * @throws {PrimeMathError} If n is negative
 */
declare function factorial(n: bigint | number): bigint;
declare namespace primeCache {
    /**
     * Get the current count of known primes in the cache
     * @returns {number} Count of cached primes
     */
    function getKnownPrimeCount(): number;
    /**
     * Get the largest known prime in the cache
     * @returns {BigInt} Largest known prime
     */
    function getLargestKnownPrime(): bigint;
    /**
     * Get a copy of the known small primes list
     * @returns {BigInt[]} List of small primes
     */
    function getSmallPrimes(): bigint[];
    /**
     * Clear cache data for numbers above the specified threshold
     * Retains key structural primes for efficiency
     *
     * @param {BigInt|number} threshold - Clear cache above this value
     */
    function clear(threshold?: bigint | number): void;
    /**
     * Get the maximum size limit of the prime cache
     *
     * @returns {number} The current maximum cache size limit
     */
    function getMaxCacheSize(): number;
    /**
     * Get detailed statistics about the prime cache
     *
     * @returns {Object} Statistics including size, capacity, and prime counts
     */
    function getStats(): any;
    /**
     * Set the maximum size of the prime cache
     * Enhanced to provide fine-grained control over memory usage
     *
     * @param {number} size - New maximum cache size (number of entries)
     * @param {Object} [options] - Additional options
     * @param {boolean} [options.aggressive=false] - If true, immediately prunes to new size
     * @param {boolean} [options.adjustThreshold=true] - If true, adjusts pruning thresholds based on new size
     * @throws {PrimeMathError} If the size parameter is invalid
     */
    function setMaxCacheSize(size: number, options?: {
        aggressive?: boolean;
        adjustThreshold?: boolean;
    }): void;
}
/**
 * Get a range of prime numbers
 * Efficiently generates primes within a specified range
 * Uses segmented sieve of Eratosthenes for optimal performance
 * Enhanced to respect configurable limits
 *
 * @param {BigInt|number} start - The lower bound of the range (inclusive)
 * @param {BigInt|number} end - The upper bound of the range (inclusive)
 * @param {Object} [options] - Options for prime generation
 * @param {BigInt|number} [options.segmentSize] - Size of each segment for the segmented sieve
 * @param {boolean} [options.dynamic] - Whether to use dynamic segment sizing (overrides config)
 * @param {number} [options.maxCount] - Maximum number of primes to return
 * @returns {BigInt[]} Array of prime numbers in the specified range
 * @throws {PrimeMathError} If parameters are invalid
 */
declare function getPrimeRange(start: bigint | number, end: bigint | number, options?: {
    segmentSize?: bigint | number;
    dynamic?: boolean;
    maxCount?: number;
}): bigint[];
/**
 * Get a prime number generator/iterator that produces sequential primes
 * Follows the Prime Framework's stream-based approach
 *
 * @param {Object} options - Generator options
 * @param {BigInt|number} [options.start=2] - The number to start from (inclusive if prime)
 * @param {BigInt|number} [options.end] - Optional end value (inclusive)
 * @param {number} [options.count] - Optional max count of primes to generate
 * @returns {Generator<BigInt>} A generator that yields prime numbers
 */
declare function primeGenerator(options?: {
    start?: bigint | number;
    end?: bigint | number;
    count?: number;
}): Generator<bigint>;
/**
 * Get the nth prime number
 * Uses optimized caching and generation for efficiency
 *
 * @param {BigInt|number|string} n - The 1-based index of the prime number to retrieve
 * @returns {BigInt} The nth prime number
 * @throws {PrimeMathError} If n is not a positive integer
 */
declare function getNthPrime(n: bigint | number | string): bigint;
/**
 * Check if a number is a Mersenne prime (a prime of the form 2^n - 1)
 * Mersenne primes have the form 2^p - 1 where p is also prime
 *
 * @param {BigInt|number|string} n - The number to check
 * @returns {boolean} True if n is a Mersenne prime, false otherwise
 */
declare function isMersennePrime(n: bigint | number | string): boolean;
/**
 * Calculate the Möbius function μ(n) value for a number
 * The Möbius function is defined as:
 * μ(n) =
 *   1  if n is square-free with an even number of prime factors
 *  -1  if n is square-free with an odd number of prime factors
 *   0  if n has a squared prime factor
 *
 * @param {BigInt|number|string} n - The number to compute the Möbius function for
 * @returns {BigInt} The Möbius function value
 * @throws {PrimeMathError} If n is not a positive integer
 */
declare function moebiusFunction(n: bigint | number | string): bigint;
/**
 * Check if a is a quadratic residue modulo p
 * A number a is a quadratic residue modulo p if there exists an x such that x^2 ≡ a (mod p)
 *
 * @param {BigInt|number|string} a - The number to check
 * @param {BigInt|number|string} p - The prime modulus
 * @returns {boolean} True if a is a quadratic residue modulo p, false otherwise
 * @throws {PrimeMathError} If p is not likely a prime
 */
declare function quadraticResidue(a: bigint | number | string, p: bigint | number | string): boolean;
declare namespace testExports {
    export { basicSieveOfEratosthenes };
}
/**
 * Basic Sieve of Eratosthenes for generating primes up to a limit
 * Used internally by the segmented sieve
 * Enhanced to handle arbitrarily large ranges through chunking
 *
 * @private
 * @param {BigInt} limit - Upper bound (inclusive)
 * @returns {BigInt[]} Array of primes up to limit
 */
declare function basicSieveOfEratosthenes(limit: bigint): bigint[];
//# sourceMappingURL=Utils.d.ts.map