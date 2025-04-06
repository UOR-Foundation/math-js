export type PrimeFactor = {
    /**
     * - The prime number
     */
    prime: bigint;
    /**
     * - The exponent (power) of the prime
     */
    exponent: bigint;
};
export type FactorizationResult = {
    /**
     * - Map of prime factors where key is the prime and value is the exponent
     */
    factors: Map<bigint, bigint>;
    /**
     * - Indicates if the factorization is complete (true) or partial (false)
     */
    isComplete: boolean;
    /**
     * - Confidence level for primality testing (0-1)
     */
    confidence?: number;
};
export type WorkerConfig = {
    /**
     * - Number of worker threads to use
     */
    threadCount?: number;
    /**
     * - Whether to enable work stealing
     */
    enableWorkStealing?: boolean;
    /**
     * - Size of work chunks for distribution
     */
    chunkSize?: number;
};
/**
 * Factorize a number using trial division
 * Implements Algorithm 1 from the specification for prime factorization
 *
 * @param {number|string|BigInt} n - The number to factorize
 * @returns {Map<BigInt, BigInt>} A map where keys are prime factors and values are their exponents
 * @throws {PrimeMathError} If n is not a positive integer
 */
export function factorize(n: number | string | bigint): Map<bigint, bigint>;
/**
 * Factorize a number using optimized trial division with precomputed primes
 * This is more efficient for moderately sized numbers
 *
 * @param {number|string|BigInt} n - The number to factorize
 * @returns {Map<BigInt, BigInt>} A map where keys are prime factors and values are their exponents
 * @throws {PrimeMathError} If n is not a positive integer
 */
export function factorizeWithPrimes(n: number | string | bigint): Map<bigint, bigint>;
/**
 * Factorize a large number using enhanced Pollard's Rho algorithm
 * Improved with Prime Framework optimizations for performance
 *
 * @param {number|string|BigInt} n - The number to factorize
 * @param {Object} [options] - Factorization options
 * @param {boolean} [options.useCache=true] - Whether to use factorization cache
 * @param {boolean} [options.perfectFactorization=true] - Whether to ensure complete factorization
 * @returns {Map<BigInt, BigInt>} A map where keys are prime factors and values are their exponents
 * @throws {PrimeMathError} If n is not a positive integer
 */
export function factorizePollardsRho(n: number | string | bigint, options?: {
    useCache?: boolean;
    perfectFactorization?: boolean;
}): Map<bigint, bigint>;
/**
 * Factorize a number using the most appropriate algorithm based on its size and properties
 * Enhanced with Prime Framework optimizations for better performance and precision
 * Implements the Prime Framework's requirements for unique factorization and canonical form
 * Uses configurable thresholds from config.factorization.thresholds to dynamically select
 * the most efficient factorization algorithm based on number characteristics
 *
 * @param {number|string|BigInt} n - The number to factorize
 * @param {Object} [options] - Factorization options
 * @param {boolean} [options.advanced=false] - Whether to use advanced factorization for large numbers
 * @param {boolean} [options.useCache=true] - Whether to use factorization cache
 * @param {boolean} [options.parallelizeFactorization=false] - Whether to use parallel factorization (when available)
 * @param {Object} [options.algorithmParams] - Specific parameters for factorization algorithms
 * @param {number} [options.algorithmParams.ecmCurves] - Number of curves for ECM
 * @param {number} [options.algorithmParams.ecmB1] - B1 bound for ECM
 * @param {number} [options.algorithmParams.ecmB2] - B2 bound for ECM (stage 2)
 * @param {number} [options.algorithmParams.qsFactorBase] - Factor base size for quadratic sieve
 * @param {number} [options.algorithmParams.qsSieveSize] - Sieve size for quadratic sieve
 * @param {boolean} [options.partialFactorization=false] - Whether to allow partial factorization for very large numbers
 * @param {boolean} [options.validateFactors=true] - Whether to validate that factors are indeed prime
 * @returns {Map<BigInt, BigInt>} A map where keys are prime factors and values are their exponents
 * @throws {PrimeMathError} If n is not a positive integer
 */
export function factorizeOptimal(n: number | string | bigint, options?: {
    advanced?: boolean;
    useCache?: boolean;
    parallelizeFactorization?: boolean;
    algorithmParams?: {
        ecmCurves?: number;
        ecmB1?: number;
        ecmB2?: number;
        qsFactorBase?: number;
        qsSieveSize?: number;
    };
    partialFactorization?: boolean;
    validateFactors?: boolean;
}): Map<bigint, bigint>;
/**
 * Implements parallel factorization using worker threads when available
 * Falls back to sequential factorization in environments without worker thread support
 *
 * @param {number|string|BigInt} n - The number to factorize
 * @param {Object} [options] - Factorization options
 * @param {number} [options.workerCount] - Number of worker threads to use (default: CPU count - 1)
 * @param {boolean} [options.useWorkStealing=true] - Whether to use work stealing for load balancing
 * @returns {Map<BigInt, BigInt>} A map where keys are prime factors and values are their exponents
 * @throws {PrimeMathError} If n is not a positive integer
 */
export function factorizeParallel(n: number | string | bigint, options?: {
    workerCount?: number;
    useWorkStealing?: boolean;
}): Map<bigint, bigint>;
/**
 * Quadratic Sieve implementation for factoring large numbers
 * Implements a complete and efficient factorization algorithm aligned with the Prime Framework
 *
 * @param {BigInt} n - The number to factor
 * @param {Object} [options] - Algorithm options
 * @param {number} [options.factorBaseSize=100] - Size of the factor base
 * @param {number} [options.sieveSize=10000] - Size of the sieve interval
 * @param {number} [options.numRelations=0] - Number of relations to collect (0 = auto)
 * @param {boolean} [options.verbose=false] - Whether to output debug info
 * @returns {BigInt} A non-trivial factor of n, or n if no factor is found
 * @throws {PrimeMathError} If input is not a positive composite number
 */
export function quadraticSieve(n: bigint, options?: {
    factorBaseSize?: number;
    sieveSize?: number;
    numRelations?: number;
    verbose?: boolean;
}): bigint;
/**
 * Lenstra's Elliptic Curve Method (ECM) for factorization
 * Optimized for finding medium-sized factors of large numbers
 * Enhanced with Prime Framework optimizations for universal coordinates
 *
 * This implementation uses configurable parameters for number of curves, bounds, and memory limits.
 * All limits can be set either through the options parameter or via the global configuration
 * system in config.factorization.ecm.
 *
 * @param {BigInt} n - The number to factor
 * @param {Object} [options] - Algorithm options
 * @param {number} [options.curves] - Number of curves to try (default: config.factorization.ecm.maxCurves or scaled by number size)
 * @param {number} [options.b1] - Stage 1 bound (default: config.factorization.ecm.defaultB1)
 * @param {number} [options.b2] - Stage 2 bound (default: config.factorization.ecm.defaultB2 or b1*100 if 0)
 * @param {number} [options.maxMemory] - Max memory usage in MB (default: config.factorization.ecm.maxMemory or config.factorization.memoryLimit)
 * @returns {BigInt} A non-trivial factor of n, or n if no factor is found
 * @throws {PrimeMathError} If input is not a positive composite number
 */
export function ellipticCurveMethod(n: bigint, options?: {
    curves?: number;
    b1?: number;
    b2?: number;
    maxMemory?: number;
}): bigint;
/**
 * Miller-Rabin primality test for larger numbers
 *
 * @param {BigInt} n - The number to test for primality
 * @param {number} k - Number of iterations for accuracy (higher is more accurate)
 * @returns {boolean} True if n is probably prime, false if definitely composite
 */
export function millerRabinTest(n: bigint, k?: number): boolean;
/**
 * Enhanced Pollard's Rho algorithm with cycle detection
 * Optimized for the Prime Framework's factorization requirements
 *
 * @param {BigInt} n - The number to factor
 * @param {Object} [options] - Algorithm options
 * @param {number} [options.maxIterations] - Maximum number of iterations (if not specified, no limit is applied)
 * @param {BigInt} [options.c=1n] - Polynomial constant
 * @param {number} [options.timeLimit] - Maximum time to spend in milliseconds (if not specified, no time limit is applied)
 * @returns {BigInt} A non-trivial factor of n, or n if no factor is found
 */
export function pollardRho(n: bigint, options?: {
    maxIterations?: number;
    c?: bigint;
    timeLimit?: number;
}): bigint;
/**
 * Check if the factorization of a number is complete
 *
 * @param {Map<BigInt, BigInt>} factors - The factorization to check
 * @param {BigInt} original - The original number
 * @returns {boolean} True if the factorization is complete, false otherwise
 */
export function isFactorizationComplete(factors: Map<bigint, bigint>, original: bigint): boolean;
/**
 * Create a number from its prime factorization
 * Implements the Prime Framework's universal coordinate system conversion
 *
 * @param {Array<PrimeFactor>|Map<BigInt, BigInt>} factors - Array of {prime, exponent} objects or Map of prime->exponent
 * @param {Object} [options] - Conversion options
 * @param {boolean} [options.validatePrimality=true] - Whether to validate that each factor is prime
 * @param {boolean} [options.enforceCanonicalForm=true] - Whether to enforce canonical form (e.g., sort factors)
 * @returns {BigInt} The number represented by the given prime factorization
 * @throws {PrimeMathError} If any of the factors is not a prime number or has a non-positive exponent
 */
export function fromPrimeFactors(factors: Array<PrimeFactor> | Map<bigint, bigint>, options?: {
    validatePrimality?: boolean;
    enforceCanonicalForm?: boolean;
}): bigint;
/**
 * Get unique prime factors of a number (without exponents)
 *
 * @param {number|string|BigInt} n - The number to get prime factors for
 * @returns {BigInt[]} Array of prime factors (without repetition)
 */
export function getPrimeFactors(n: number | string | bigint): bigint[];
/**
 * Convert factorization map to array of {prime, exponent} objects
 *
 * @param {Map<BigInt, BigInt>} factorMap - Map of prime factors
 * @returns {Array<PrimeFactor>} Array of prime-exponent objects
 */
export function factorMapToArray(factorMap: Map<bigint, bigint>): Array<PrimeFactor>;
/**
 * Convert array of {prime, exponent} objects to factorization map
 *
 * @param {Array<PrimeFactor>} factorArray - Array of prime-exponent objects
 * @returns {Map<BigInt, BigInt>} Map of prime factors
 */
export function factorArrayToMap(factorArray: Array<PrimeFactor>): Map<bigint, bigint>;
/**
 * Find the radical of a number (product of distinct prime factors)
 *
 * @param {number|string|BigInt} n - The number to find the radical for
 * @returns {BigInt} The radical of n
 */
export function getRadical(n: number | string | bigint): bigint;
/**
 * Find the prime signature of a number (product of (p_i - 1)(p_i^e_i - 1))
 * Used in various number theory contexts
 *
 * @param {number|string|BigInt} n - The number to find the signature for
 * @returns {BigInt} The prime signature
 */
export function getPrimeSignature(n: number | string | bigint): bigint;
export namespace factorizationCache {
    /**
     * Get the current size of the factorization cache
     * @returns {number} Number of entries in the cache
     */
    function size(): number;
    /**
     * Clear the factorization cache
     */
    function clear(): void;
    /**
     * Set the maximum size of the factorization cache
     * @param {number} size - New maximum cache size
     */
    function setMaxSize(size: number): void;
    /**
     * Get statistics about the cache
     * @returns {Object} Statistics object with size, maxSize, hits, misses, hitRate, and efficiency
     */
    function getStats(): any;
    /**
     * Enable or disable persistent caching of factorization results
     * @param {boolean} enabled - Whether to enable persistent caching
     */
    function setPersistence(enabled: boolean): void;
    /**
     * Save the current cache to persistent storage
     * @returns {boolean} True if successfully saved, false otherwise
     */
    function saveToStorage(): boolean;
    /**
     * Load the cache from persistent storage
     * @returns {boolean} True if successfully loaded, false otherwise
     */
    function loadFromStorage(): boolean;
}
//# sourceMappingURL=Factorization.d.ts.map