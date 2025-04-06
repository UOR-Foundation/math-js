/**
 * Utils module - Helper functions for the UOR Math-JS library
 * Implements advanced mathematical utilities optimized for the Prime Framework
 * @module Utils
 */
// Import global config
const { config } = require('./config');
/**
 * Custom error class for Prime Math-related errors
 * @class PrimeMathError
 * @extends Error
 */
class PrimeMathError extends Error {
    /**
     * Create a new PrimeMathError
     * @param {string} message - Error message
     */
    constructor(message) {
        super(message);
        this.name = 'PrimeMathError';
        // Add stack trace based on configuration
        if (config.errorHandling && !config.errorHandling.includeStackTrace) {
            this.stack = undefined;
        }
    }
}
/**
 * Prime number cache for efficient repetitive primality testing
 * Stores known prime numbers and composite status
 * Optimized for the Prime Framework's universal coordinate system
 * @private
 */
const _primeCache = {
    /**
     * Precalculated small primes to initialize the cache
     * These are used as trial divisors in primality testing
     */
    knownPrimes: [
        2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n,
        31n, 37n, 41n, 43n, 47n, 53n, 59n, 61n, 67n, 71n,
        73n, 79n, 83n, 89n, 97n, 101n, 103n, 107n, 109n, 113n,
        127n, 131n, 137n, 139n, 149n, 151n, 157n, 163n, 167n, 173n,
        179n, 181n, 191n, 193n, 197n, 199n, 211n, 223n, 227n, 229n,
        233n, 239n, 241n, 251n, 257n, 263n, 269n, 271n, 277n, 281n,
        283n, 293n, 307n, 311n, 313n, 317n, 331n, 337n, 347n, 349n,
        353n, 359n, 367n, 373n, 379n, 383n, 389n, 397n, 401n, 409n,
        419n, 421n, 431n, 433n, 439n, 443n, 449n, 457n, 461n, 463n,
        467n, 479n, 487n, 491n, 499n, 503n, 509n, 521n, 523n, 541n,
        547n, 557n, 563n, 569n, 571n, 577n, 587n, 593n, 599n, 601n,
        607n, 613n, 617n, 619n, 631n, 641n, 643n, 647n, 653n, 659n,
        661n, 673n, 677n, 683n, 691n, 701n, 709n, 719n, 727n, 733n,
        739n, 743n, 751n, 757n, 761n, 769n, 773n, 787n, 797n, 809n,
        811n, 821n, 823n, 827n, 829n, 839n, 853n, 857n, 859n, 863n,
        877n, 881n, 883n, 887n, 907n, 911n, 919n, 929n, 937n, 941n,
        947n, 953n, 967n, 971n, 977n, 983n, 991n, 997n
    ],
    /**
     * Map for storing prime status of checked numbers
     * Uses sparse representation for memory efficiency
     * key: number as string, value: boolean indicating primality
     */
    primalityMap: new Map(),
    /**
     * Largest prime number currently in the cache
     */
    largestKnownPrime: 997n,
    /**
     * Largest number that has been fully checked for primality
     */
    largestCheckedNumber: 997n,
    /**
     * Get the maximum size of primality map before pruning from global config
     */
    get MAX_CACHE_SIZE() {
        return config.cache.maxPrimeCacheSize;
    },
    /**
     * Initialize the prime cache with the known primes
     */
    initialize() {
        // Initialize primality map with known primes
        this.knownPrimes.forEach(prime => {
            this.primalityMap.set(prime.toString(), true);
        });
        // Mark 0 and 1 as not prime
        this.primalityMap.set('0', false);
        this.primalityMap.set('1', false);
    }
};
// Initialize the prime cache
_primeCache.initialize();
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
function fastExp(base, exponent, modulus = null) {
    if (exponent < 0n) {
        throw new PrimeMathError('Exponent must be non-negative in the Prime Framework');
    }
    if (exponent === 0n) {
        return 1n;
    }
    // Special cases for optimization
    if (base === 0n)
        return 0n;
    if (base === 1n)
        return 1n;
    if (base === -1n)
        return exponent % 2n === 0n ? 1n : -1n;
    // If modulus is provided, ensure base is within the modulus range
    if (modulus !== null) {
        base = base % modulus;
    }
    // Handle large exponents more safely with modular arithmetic
    if (modulus !== null) {
        let result = 1n;
        let currentBase = base;
        let currentExponent = exponent;
        while (currentExponent > 0n) {
            if (currentExponent % 2n === 1n) {
                // If the current exponent is odd, multiply the result by the current base
                result = (result * currentBase) % modulus;
            }
            // Square the base and halve the exponent
            currentBase = (currentBase * currentBase) % modulus;
            currentExponent /= 2n;
        }
        return result;
    }
    else {
        // Standard binary exponentiation for non-modular cases
        // Add safety checks to avoid overflow
        // For very large exponents on values > 1, we might overflow
        if (exponent > 1000n && (base > 10n || base < -10n)) {
            throw new PrimeMathError('Exponentiation may exceed safe BigInt range. Use modular exponentiation instead.', { cause: { base, exponent } });
        }
        let result = 1n;
        let currentBase = base;
        let currentExponent = exponent;
        while (currentExponent > 0n) {
            if (currentExponent % 2n === 1n) {
                // If the current exponent is odd, multiply the result by the current base
                result *= currentBase;
            }
            // Early termination for very large numbers
            if (currentExponent > 1n &&
                currentBase > Number.MAX_SAFE_INTEGER &&
                result > Number.MAX_SAFE_INTEGER) {
                throw new PrimeMathError('Exponentiation result exceeds safe computation range', { cause: { base, exponent, currentExponent } });
            }
            // Square the base and halve the exponent
            currentBase *= currentBase;
            currentExponent /= 2n;
        }
        return result;
    }
}
/**
 * Check if a number is divisible by another
 *
 * @param {BigInt} num - The number to check
 * @param {BigInt} divisor - The potential divisor
 * @returns {boolean} True if num is divisible by divisor, false otherwise
 * @throws {PrimeMathError} If divisor is zero
 */
function isDivisible(num, divisor) {
    if (divisor === 0n) {
        throw new PrimeMathError('Division by zero is not allowed in the Prime Framework');
    }
    return num % divisor === 0n;
}
/**
 * Perform exact division, ensuring the result is an integer
 * Aligns with the Prime Framework's requirement for exact arithmetic
 *
 * @param {BigInt} dividend - The number to divide
 * @param {BigInt} divisor - The divisor
 * @returns {BigInt} The result of the division
 * @throws {PrimeMathError} If the division is not exact or if divisor is zero
 */
function exactDivide(dividend, divisor) {
    if (divisor === 0n) {
        throw new PrimeMathError('Division by zero is not allowed in the Prime Framework');
    }
    if (!isDivisible(dividend, divisor)) {
        throw new PrimeMathError(`${dividend} is not divisible by ${divisor} in the natural numbers (Prime Framework requirement)`);
    }
    return dividend / divisor;
}
/**
 * Calculate the greatest common divisor (GCD) of two numbers using the binary GCD algorithm
 * Optimized version of the Euclidean algorithm for better performance in the Prime Framework
 *
 * @param {BigInt} a - First number
 * @param {BigInt} b - Second number
 * @returns {BigInt} The GCD of a and b
 */
function gcd(a, b) {
    // Ensure positive values
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    // Base cases
    if (a === 0n)
        return b;
    if (b === 0n)
        return a;
    if (a === b)
        return a;
    if (a === 1n || b === 1n)
        return 1n;
    // Binary GCD algorithm (Stein's algorithm)
    // Find common factors of 2
    let shift = 0n;
    while (((a | b) & 1n) === 0n) {
        a >>= 1n;
        b >>= 1n;
        shift++;
    }
    // Remove factors of 2 from a
    while ((a & 1n) === 0n) {
        a >>= 1n;
    }
    // Main loop
    while (b !== 0n) {
        // Remove factors of 2 from b
        while ((b & 1n) === 0n) {
            b >>= 1n;
        }
        // Ensure a >= b
        if (a > b) {
            [a, b] = [b, a];
        }
        b -= a;
    }
    // Multiply by the common factors of 2
    return a << shift;
}
/**
 * Calculate the least common multiple (LCM) of two numbers
 * Optimized for the Prime Framework using the GCD
 *
 * @param {BigInt} a - First number
 * @param {BigInt} b - Second number
 * @returns {BigInt} The LCM of a and b
 */
function lcm(a, b) {
    if (a === 0n || b === 0n) {
        return 0n;
    }
    // Ensure positive values
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    // LCM(a,b) = (a * b) / GCD(a,b)
    // To avoid potential overflow, divide first then multiply
    return (a / gcd(a, b)) * b;
}
/**
 * Safely convert a value to BigInt
 * Enhanced to handle a wider range of inputs for the Prime Framework
 *
 * @param {number|string|BigInt} value - The value to convert
 * @returns {BigInt} The value as a BigInt
 * @throws {PrimeMathError} If the value cannot be converted to BigInt
 */
function toBigInt(value) {
    try {
        if (value === null || value === undefined) {
            throw new PrimeMathError('Cannot convert null or undefined to BigInt');
        }
        if (typeof value === 'number') {
            if (!Number.isFinite(value)) {
                throw new PrimeMathError('Cannot convert infinite or NaN value to BigInt');
            }
            if (!Number.isInteger(value)) {
                throw new PrimeMathError('Cannot convert non-integer number to BigInt (Prime Framework requires integers)');
            }
            if (!Number.isSafeInteger(value)) {
                throw new PrimeMathError('Number exceeds safe integer range, use string input for large values');
            }
        }
        if (typeof value === 'string') {
            // Trim whitespace
            value = value.trim();
            // Validate string format
            if (!/^[+-]?\d+$/.test(value)) {
                throw new PrimeMathError('String must contain a valid integer number');
            }
        }
        return BigInt(value);
    }
    catch (error) {
        if (error instanceof PrimeMathError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new PrimeMathError(`Cannot convert value to BigInt: ${errorMessage}`);
    }
}
/**
 * Miller-Rabin primality test implementation
 * Deterministic for n < 2^64, probabilistic for larger numbers
 * Used for efficient primality testing of large numbers
 * Enhanced to safely handle very large numbers
 *
 * @private
 * @param {BigInt} n - The number to test for primality
 * @param {number} k - The number of rounds (higher means more accuracy for probabilistic testing)
 * @returns {boolean} True if n is probably prime, false if n is definitely composite
 */
function _millerRabinTest(n, k = null) {
    // Use configured number of rounds if not specified explicitly
    if (k === null) {
        k = config.primalityTesting.millerRabinRounds;
    }
    // Handle small numbers and ensure n > 0
    if (n <= 1n)
        return false;
    if (n <= 3n)
        return true;
    if (n % 2n === 0n)
        return false;
    // Write n-1 as 2^r * d where d is odd
    let r = 0n;
    let d = n - 1n;
    while (d % 2n === 0n) {
        d /= 2n;
        r += 1n;
    }
    // Check if we can safely perform a deterministic test
    const isPotentiallyDeterministic = n < 2n ** 64n;
    // Safety check for extremely large numbers
    if (n > 2n ** 100n) {
        // For extremely large numbers, use a simplified primality test
        // to avoid BigInt overflow in the Miller-Rabin test
        // Try division by small prime numbers
        for (const p of _primeCache.knownPrimes) {
            if (p * p > n)
                break; // No need to check further
            if (n % p === 0n)
                return false;
        }
        // For extremely large numbers, use a minimal set of witnesses
        // and perform fewer rounds to avoid computation errors
        k = Math.min(k, 5);
    }
    /**
     * @param {BigInt} a - The witness to test
     * @returns {boolean} True if the witness passes, false otherwise
     */
    const witnessLoop = (a) => {
        // Compute a^d % n using modular exponentiation to prevent overflow
        let x = fastExp(a, d, n);
        if (x === 1n || x === n - 1n)
            return true;
        // Square x repeatedly r-1 times (with modular arithmetic)
        for (let i = 1n; i < r; i++) {
            x = (x * x) % n;
            if (x === n - 1n)
                return true;
            if (x === 1n)
                return false;
        }
        return false;
    };
    // Deterministic Miller-Rabin for n < 2^64
    if (isPotentiallyDeterministic) {
        // First 12 primes cover deterministic test for n < 2^64
        const witnesses = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
        for (const a of witnesses) {
            if (a >= n)
                break;
            if (!witnessLoop(a))
                return false;
        }
        return true;
    }
    // Probabilistic Miller-Rabin for larger numbers
    for (let i = 0; i < k; i++) {
        // To prevent randomness issues in deterministic contexts, use well-known values
        // Use first few primes as deterministic witnesses
        const knownPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
        const a = BigInt(knownPrimes[i % knownPrimes.length]) % (n - 3n) + 2n;
        try {
            if (!witnessLoop(a))
                return false;
        }
        catch (error) {
            // If we get computational errors, fall back to a different approach
            if (error instanceof PrimeMathError) {
                // If Miller-Rabin test fails due to computational limits,
                // perform a more basic analysis
                return isPrime(n, { useCache: false, updateCache: false });
            }
            throw error; // Rethrow unexpected errors
        }
    }
    return true;
}
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
function isPrime(n, options = { useCache: true, updateCache: true }) {
    // Default options
    const useCache = options.useCache !== false;
    const updateCache = options.updateCache !== false;
    // Ensure n is a BigInt
    if (typeof n !== 'bigint') {
        try {
            n = toBigInt(n);
        }
        catch (error) {
            return false;
        }
    }
    // Check basic cases
    if (n <= 1n)
        return false;
    // Check cache first if enabled
    if (useCache) {
        const cachedResult = _primeCache.primalityMap.get(n.toString());
        if (cachedResult !== undefined) {
            return cachedResult;
        }
    }
    // For small numbers, use the trial division approach
    if (n < 10000n) {
        // Small primes check
        if (n <= 3n)
            return true;
        if (n % 2n === 0n || n % 3n === 0n)
            return false;
        // Trial division by primes of form 6k±1
        let i = 5n;
        while (i * i <= n) {
            if (n % i === 0n || n % (i + 2n) === 0n) {
                // Update cache if enabled
                if (useCache && updateCache) {
                    _primeCache.primalityMap.set(n.toString(), false);
                    // Prune cache if too large
                    if (_primeCache.primalityMap.size > _primeCache.MAX_CACHE_SIZE) {
                        pruneCache();
                    }
                }
                return false;
            }
            i += 6n;
        }
        // If we get here, n is prime
        if (useCache && updateCache) {
            _primeCache.primalityMap.set(n.toString(), true);
            // Update largest known prime if applicable
            if (n > _primeCache.largestKnownPrime) {
                _primeCache.largestKnownPrime = n;
            }
            // Update largest checked number
            if (n > _primeCache.largestCheckedNumber) {
                _primeCache.largestCheckedNumber = n;
            }
        }
        return true;
    }
    // For large numbers, use the Miller-Rabin test
    const isProbablyPrime = _millerRabinTest(n);
    // Update cache if enabled
    if (useCache && updateCache) {
        _primeCache.primalityMap.set(n.toString(), isProbablyPrime);
        // Update tracking variables
        if (isProbablyPrime && n > _primeCache.largestKnownPrime) {
            _primeCache.largestKnownPrime = n;
        }
        if (n > _primeCache.largestCheckedNumber) {
            _primeCache.largestCheckedNumber = n;
        }
        // Prune cache if too large
        if (_primeCache.primalityMap.size > _primeCache.MAX_CACHE_SIZE) {
            pruneCache();
        }
    }
    return isProbablyPrime;
}
/**
 * Prune the prime cache to prevent memory growth
 * Removes least recently accessed items while preserving small primes
 * Enhanced to use configuration settings for more flexibility
 *
 * @private
 */
function pruneCache() {
    // Get parameters from configuration
    const preserveLimit = 1000n; // Always keep primes under this value
    const targetSize = Math.floor(_primeCache.MAX_CACHE_SIZE * 0.8); // Target 80% of max
    // If cache is smaller than max size or barely over, no need to prune
    if (_primeCache.primalityMap.size <= _primeCache.MAX_CACHE_SIZE * 1.1) {
        return;
    }
    // Identify candidates for removal (we keep small primes)
    const keysToRemove = [];
    for (const key of _primeCache.primalityMap.keys()) {
        const num = BigInt(key);
        if (num > preserveLimit) {
            keysToRemove.push(key);
        }
    }
    // Calculate how many entries to remove to reach target size
    const removalTarget = Math.max(_primeCache.primalityMap.size - targetSize, Math.floor(keysToRemove.length * 0.5) // Remove at least 50% of removable entries
    );
    // Sort candidates by value (we prefer to keep smaller numbers)
    keysToRemove.sort((a, b) => {
        // First prioritize by primality - keep primes
        const isPrimeA = _primeCache.primalityMap.get(a);
        const isPrimeB = _primeCache.primalityMap.get(b);
        if (isPrimeA !== isPrimeB) {
            return isPrimeA ? 1 : -1; // Remove composites first
        }
        // Then prioritize by size - remove larger numbers first
        // Use string comparison for sorting since we can't subtract BigInts for sort
        const numA = BigInt(a);
        const numB = BigInt(b);
        if (numA > numB)
            return -1;
        if (numA < numB)
            return 1;
        return 0;
    });
    // Remove entries to reach target
    const toRemove = keysToRemove.slice(0, removalTarget);
    for (const key of toRemove) {
        _primeCache.primalityMap.delete(key);
    }
    // Update the largest known prime if we removed it
    if (_primeCache.primalityMap.has(_primeCache.largestKnownPrime.toString()) === false) {
        // Find new largest known prime
        let newLargest = _primeCache.knownPrimes[_primeCache.knownPrimes.length - 1];
        for (const [key, isPrime] of _primeCache.primalityMap.entries()) {
            if (isPrime) {
                const num = BigInt(key);
                if (num > newLargest) {
                    newLargest = num;
                }
            }
        }
        _primeCache.largestKnownPrime = newLargest;
    }
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
function getPrimeRange(start, end, options = {}) {
    // Convert to BigInt
    start = toBigInt(start);
    end = toBigInt(end);
    // Validate parameters
    if (start < 0n) {
        throw new PrimeMathError('Start parameter must be non-negative');
    }
    if (end < start) {
        throw new PrimeMathError('End parameter must be greater than or equal to start parameter');
    }
    // Get maximum count from options or configuration
    const maxCount = options.maxCount || config.primalityTesting.maxPrimesGenerated;
    // Adjust start to be at least 2 (the first prime)
    if (start < 2n) {
        start = 2n;
    }
    // Small range can use naive approach
    if (end - start < 1000000n) {
        const primes = [];
        for (let n = start; n <= end && primes.length < maxCount; n++) {
            if (isPrime(n)) {
                primes.push(n);
            }
        }
        return primes;
    }
    // Prepare options for segmented sieve
    const sieveOptions = {
        segmentSize: options.segmentSize || null,
        maxCount: maxCount
    };
    // Handle dynamic sizing option if explicitly specified
    if (options.dynamic !== undefined) {
        // Pass the dynamic option directly to the sieve
        sieveOptions.dynamicSegmentSizing = options.dynamic;
    }
    // For larger ranges, use segmented sieve with normal config
    return segmentedSieveOfEratosthenes(start, end, sieveOptions);
}
/**
 * Segmented Sieve of Eratosthenes for finding primes in a range
 * Memory-efficient algorithm for large ranges
 * Enhanced to respect maximum count limits
 *
 * @private
 * @param {BigInt} low - Lower bound (inclusive)
 * @param {BigInt} high - Upper bound (inclusive)
 * @param {Object} [options] - Options for the sieve
 * @param {BigInt|number} [options.segmentSize] - Size of each segment to process
 * @param {boolean} [options.dynamicSegmentSizing] - Whether to use dynamic segment sizing
 * @param {number} [options.maxCount] - Maximum number of primes to return
 * @returns {BigInt[]} Array of primes in the range [low, high]
 */
function segmentedSieveOfEratosthenes(low, high, options = {}) {
    const primes = [];
    // Get maximum count from options or configuration
    const maxCount = options.maxCount || config.primalityTesting.maxPrimesGenerated || Number.MAX_SAFE_INTEGER;
    // Get segment size from options, or use the global configuration
    let segmentSize = options.segmentSize ? toBigInt(options.segmentSize) : null;
    if (!segmentSize) {
        // If not provided, get from configuration
        segmentSize = toBigInt(config.primalityTesting.segmentedSieveSize || 1000000);
        // Check if dynamic sizing is enabled (either from options or config)
        const useDynamicSizing = options.dynamicSegmentSizing !== undefined
            ? options.dynamicSegmentSizing
            : config.primalityTesting.dynamicSegmentSizing;
        // Apply dynamic sizing based on available memory if configured
        if (useDynamicSizing) {
            // Adjust segment size based on the size of the range
            const rangeSize = high - low + 1n;
            if (rangeSize < 10000000n) {
                // For small ranges, use smaller segments for better RAM locality
                segmentSize = 100000n;
            }
            else if (rangeSize > 1000000000n) {
                // For very large ranges, use larger segments to reduce overhead
                segmentSize = 10000000n;
            }
            // Further adjust based on environment constraints
            if (typeof window !== 'undefined') {
                // Browser environment - be more conservative with memory
                segmentSize = segmentSize > 1000000n ? 1000000n : segmentSize;
            }
        }
    }
    // Generate small primes up to sqrt(high)
    const sqrtHigh = sqrt(high) + 1n;
    const smallPrimes = basicSieveOfEratosthenes(sqrtHigh);
    // Process range in segments to save memory
    for (let segmentStart = low; segmentStart <= high; segmentStart += segmentSize) {
        // Check if we've reached the maximum count
        if (primes.length >= maxCount) {
            break;
        }
        const segmentEnd = segmentStart + segmentSize - 1n > high ? high : segmentStart + segmentSize - 1n;
        // Create a boolean array representing primality in current segment
        const segmentSizeNumber = Number(segmentEnd - segmentStart + 1n);
        const segment = new Array(segmentSizeNumber).fill(true);
        // Mark multiples of each small prime in the current segment
        for (const p of smallPrimes) {
            // Find the first multiple of p in the segment
            let start = segmentStart;
            if (start % p !== 0n) {
                start = segmentStart + (p - segmentStart % p);
            }
            // If p itself is in the segment, ensure it's not marked
            if (start === p) {
                start += p;
            }
            // Mark all multiples of p in this segment
            for (let j = start; j <= segmentEnd; j += p) {
                segment[Number(j - segmentStart)] = false;
            }
        }
        // Collect primes from current segment - up to maximum count
        for (let i = 0; i < segmentSizeNumber && primes.length < maxCount; i++) {
            const num = segmentStart + BigInt(i);
            if (segment[i] && num >= 2n) {
                primes.push(num);
                // Update prime cache
                _primeCache.primalityMap.set(num.toString(), true);
                if (num > _primeCache.largestKnownPrime) {
                    _primeCache.largestKnownPrime = num;
                }
            }
        }
    }
    return primes;
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
function basicSieveOfEratosthenes(limit) {
    // Make sure limit is a BigInt
    limit = toBigInt(limit);
    // For small values, use the original optimized implementation
    if (limit <= BigInt(Number.MAX_SAFE_INTEGER)) {
        const n = Number(limit);
        // Initialize the sieve
        const sieve = new Array(n + 1).fill(true);
        sieve[0] = sieve[1] = false;
        // Mark composite numbers
        for (let i = 2; i * i <= n; i++) {
            if (sieve[i]) {
                for (let j = i * i; j <= n; j += i) {
                    sieve[j] = false;
                }
            }
        }
        // Collect primes
        const primes = [];
        for (let i = 2; i <= n; i++) {
            if (sieve[i]) {
                primes.push(BigInt(i));
                // Update prime cache
                _primeCache.primalityMap.set(BigInt(i).toString(), true);
            }
        }
        return primes;
    }
    // For larger values, we need a more memory-efficient approach
    // Either use segmented sieve or just trial division based on size
    // If the number is extremely large, it's better to handle this in the calling code
    if (limit > 2n ** 64n) {
        throw new PrimeMathError('Basic sieve limit too large for direct processing, use segmentedSieveOfEratosthenes instead', { cause: { limit } });
    }
    const maxSafeInt = BigInt(Number.MAX_SAFE_INTEGER);
    // If the number is just slightly above MAX_SAFE_INTEGER, use a more controlled approach
    // Get chunk size from configuration
    const chunkSize = config.primalityTesting.basicSieveChunkSize
        ? BigInt(config.primalityTesting.basicSieveChunkSize)
        : 100000n; // Default to 100k for safer memory usage
    // Set a safety limit for the number of primes we'll collect
    const maxPrimesToCollect = config.primalityTesting.maxPrimesGenerated || 1000000;
    // Collect primes but limit array size
    const allPrimes = [];
    // First generate primes up to sqrt(limit) - these are needed to sieve higher numbers
    const sqrtLimit = sqrt(limit);
    // Only use recursion for manageable sqrt values to avoid stack issues
    let smallPrimes;
    if (sqrtLimit <= 1000000n) {
        // Safe to recursively get small primes
        smallPrimes = sqrtLimit <= maxSafeInt
            ? basicSieveOfEratosthenes(sqrtLimit)
            : [];
    }
    else {
        // For larger sqrt values, use an efficient alternative (trial division)
        smallPrimes = [];
        for (let i = 2n; i <= sqrtLimit; i++) {
            let isPrime = true;
            // Only check divisibility by numbers up to sqrt(i)
            for (let j = 2n; j * j <= i; j++) {
                if (i % j === 0n) {
                    isPrime = false;
                    break;
                }
            }
            if (isPrime) {
                smallPrimes.push(i);
                // Add to cache
                _primeCache.primalityMap.set(i.toString(), true);
            }
            // Safety check for small primes collection
            if (smallPrimes.length >= maxPrimesToCollect / 10) {
                break;
            }
        }
    }
    // Add small primes to our result
    if (limit >= 2n)
        allPrimes.push(...smallPrimes.filter(p => p <= limit));
    // Now process the range in chunks
    // Start from max(2, min(limit, sqrt(limit) + 1))
    let start = sqrtLimit + 1n;
    if (start < 2n)
        start = 2n;
    if (start > limit)
        return allPrimes;
    // Only continue with the chunked approach if we have a reasonable number of small primes
    // Otherwise it's inefficient to sieve
    if (smallPrimes.length === 0) {
        // Fall back to trial division for very large ranges with no small primes calculated
        for (let i = start; i <= limit; i++) {
            let isPrime = true;
            // Check divisibility by small factors
            if (i % 2n === 0n || i % 3n === 0n || i % 5n === 0n) {
                isPrime = false;
            }
            else {
                // Check other potential divisors
                for (let j = 7n; j * j <= i; j += 2n) {
                    if (i % j === 0n) {
                        isPrime = false;
                        break;
                    }
                }
            }
            if (isPrime) {
                allPrimes.push(i);
                _primeCache.primalityMap.set(i.toString(), true);
            }
            // Safety check
            if (allPrimes.length >= maxPrimesToCollect)
                break;
        }
        return allPrimes;
    }
    // Process remaining range in chunks, limiting each chunk size
    while (start <= limit) {
        // Calculate end of current chunk
        const end = (start + chunkSize - 1n) > limit ? limit : (start + chunkSize - 1n);
        // Constrain the segment size to avoid excessive memory usage
        const segmentSizeNumber = Math.min(Number(end - start + 1n > maxSafeInt ? maxSafeInt : end - start + 1n), Number(chunkSize), 1000000 // Hard cap at 1M elements for safety
        );
        // Only create a segment array if it's reasonably sized
        if (segmentSizeNumber > 0 && segmentSizeNumber <= 1000000) {
            const segment = new Array(segmentSizeNumber).fill(true);
            // Mark multiples of each small prime in the current segment
            for (const p of smallPrimes) {
                // Find the first multiple of p in the segment
                let startMultiple = start;
                if (start % p !== 0n) {
                    startMultiple = start + (p - start % p);
                }
                // Skip if the prime itself is in the segment
                if (startMultiple === p) {
                    startMultiple += p;
                }
                // Mark multiples within array bounds
                for (let j = startMultiple; j <= end && (j - start) < BigInt(segmentSizeNumber); j += p) {
                    const idx = Number(j - start);
                    if (idx >= 0 && idx < segmentSizeNumber) {
                        segment[idx] = false;
                    }
                }
            }
            // Collect primes from current segment
            for (let i = 0; i < segmentSizeNumber; i++) {
                if (segment[i]) {
                    const num = start + BigInt(i);
                    if (num >= 2n && num <= limit) {
                        allPrimes.push(num);
                        // Update prime cache
                        _primeCache.primalityMap.set(num.toString(), true);
                        if (num > _primeCache.largestKnownPrime) {
                            _primeCache.largestKnownPrime = num;
                        }
                    }
                }
            }
        }
        else {
            // For excessively large segments, use a different approach
            // Just check individual numbers to avoid memory issues
            for (let num = start; num <= end; num++) {
                let isPrime = true;
                for (const p of smallPrimes) {
                    if (p * p > num)
                        break; // No need to check past sqrt(num)
                    if (num % p === 0n) {
                        isPrime = false;
                        break;
                    }
                }
                if (isPrime && num >= 2n) {
                    allPrimes.push(num);
                    _primeCache.primalityMap.set(num.toString(), true);
                }
                if (allPrimes.length >= maxPrimesToCollect)
                    break;
            }
        }
        // Move to next chunk
        start = end + 1n;
        // Check if we should break due to memory constraints
        if (allPrimes.length >= maxPrimesToCollect) {
            break;
        }
    }
    return allPrimes;
}
/**
 * Integer square root function
 * Finds the largest integer square root that doesn't exceed the value
 *
 * @private
 * @param {BigInt} n - Input value
 * @returns {BigInt} Integer square root of n
 */
function sqrt(n) {
    if (n < 0n) {
        throw new PrimeMathError('Cannot compute square root of negative number');
    }
    if (n < 2n) {
        return n;
    }
    // Newton's method for square root
    let x = n;
    let y = (x + 1n) / 2n;
    while (y < x) {
        x = y;
        y = (x + n / x) / 2n;
    }
    return x;
}
/**
 * Get the next prime number after a given number
 * Enhanced with prime cache for efficiency
 *
 * @param {BigInt|number} n - The starting number
 * @returns {BigInt} The next prime number after n
 */
function nextPrime(n) {
    // Convert to BigInt
    n = toBigInt(n);
    // Start from at least 1
    if (n < 1n) {
        return 2n;
    }
    // Check if we can use cache to speed up the search
    if (n < _primeCache.largestCheckedNumber) {
        // Find the smallest prime in the cache larger than n
        let candidate = n + 1n;
        // Check cache until we find a prime
        while (candidate <= _primeCache.largestCheckedNumber) {
            if (_primeCache.primalityMap.get(candidate.toString()) === true) {
                return candidate;
            }
            candidate++;
        }
    }
    // If we can't use the cache, use the standard method
    let candidate = n + 1n;
    // Ensure candidate is odd (except for n=1)
    if (candidate > 2n && candidate % 2n === 0n) {
        candidate++;
    }
    // Keep checking odd numbers until we find a prime
    while (!isPrime(candidate)) {
        candidate += 2n;
    }
    return candidate;
}
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
function* primeGenerator(options = {}) {
    // Parse options
    const start = options.start ? toBigInt(options.start) : 2n;
    const end = options.end ? toBigInt(options.end) : null;
    const maxCount = options.count || Number.MAX_SAFE_INTEGER;
    let count = 0;
    let current = start < 2n ? 2n : start;
    // If we're starting with an even number > 2, increment to make it odd
    if (current > 2n && current % 2n === 0n) {
        current++;
    }
    else if (current === 2n) {
        yield 2n;
        count++;
        current = 3n;
    }
    // Generate primes until reaching end or count limit
    while ((end === null || current <= end) && count < maxCount) {
        if (isPrime(current)) {
            yield current;
            count++;
        }
        // Only check odd numbers
        current += 2n;
    }
}
/**
 * Factorial function
 * Optimized for the Prime Framework
 *
 * @param {BigInt|number} n - The number to calculate factorial for
 * @returns {BigInt} n!
 * @throws {PrimeMathError} If n is negative
 */
function factorial(n) {
    // Convert to BigInt
    n = toBigInt(n);
    if (n < 0n) {
        throw new PrimeMathError('Factorial is not defined for negative numbers in the Prime Framework');
    }
    if (n === 0n) {
        return 1n;
    }
    let result = 1n;
    for (let i = 1n; i <= n; i++) {
        result *= i;
    }
    return result;
}
/**
 * Export the prime cache for external use
 * Provides access to the cache for statistics and management
 */
const primeCache = {
    /**
     * Get the current count of known primes in the cache
     * @returns {number} Count of cached primes
     */
    getKnownPrimeCount() {
        let count = 0;
        for (const isPrime of _primeCache.primalityMap.values()) {
            if (isPrime)
                count++;
        }
        return count;
    },
    /**
     * Get the largest known prime in the cache
     * @returns {BigInt} Largest known prime
     */
    getLargestKnownPrime() {
        return _primeCache.largestKnownPrime;
    },
    /**
     * Get a copy of the known small primes list
     * @returns {BigInt[]} List of small primes
     */
    getSmallPrimes() {
        return [..._primeCache.knownPrimes];
    },
    /**
     * Clear cache data for numbers above the specified threshold
     * Retains key structural primes for efficiency
     *
     * @param {BigInt|number} threshold - Clear cache above this value
     */
    clear(threshold = 1000n) {
        // Convert to BigInt
        threshold = toBigInt(threshold);
        // Identify keys to remove
        const keysToRemove = [];
        for (const key of _primeCache.primalityMap.keys()) {
            const num = BigInt(key);
            if (num > threshold) {
                keysToRemove.push(key);
            }
        }
        // Remove keys
        for (const key of keysToRemove) {
            _primeCache.primalityMap.delete(key);
        }
        // Update tracking variables if needed
        if (_primeCache.largestKnownPrime > threshold) {
            // Find new largest known prime
            _primeCache.largestKnownPrime = _primeCache.knownPrimes[_primeCache.knownPrimes.length - 1];
            for (const [key, isPrime] of _primeCache.primalityMap.entries()) {
                const num = BigInt(key);
                if (isPrime && num > _primeCache.largestKnownPrime && num <= threshold) {
                    _primeCache.largestKnownPrime = num;
                }
            }
        }
        _primeCache.largestCheckedNumber = threshold;
    },
    /**
     * Get the maximum size limit of the prime cache
     *
     * @returns {number} The current maximum cache size limit
     */
    getMaxCacheSize() {
        return _primeCache.MAX_CACHE_SIZE;
    },
    /**
     * Get detailed statistics about the prime cache
     *
     * @returns {Object} Statistics including size, capacity, and prime counts
     */
    getStats() {
        // Count primes in the cache
        let primeCount = 0;
        let compositeCount = 0;
        for (const isPrime of _primeCache.primalityMap.values()) {
            if (isPrime) {
                primeCount++;
            }
            else {
                compositeCount++;
            }
        }
        return {
            size: _primeCache.primalityMap.size,
            maxSize: _primeCache.MAX_CACHE_SIZE,
            utilization: _primeCache.primalityMap.size / _primeCache.MAX_CACHE_SIZE,
            primes: primeCount,
            composites: compositeCount,
            largestPrime: _primeCache.largestKnownPrime,
            largestChecked: _primeCache.largestCheckedNumber
        };
    },
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
    setMaxCacheSize(size, options = {}) {
        // Validate size parameter
        if (typeof size !== 'number' || !Number.isFinite(size) || size <= 0) {
            throw new PrimeMathError('Cache size must be a positive finite number', {
                cause: { provided: size, expected: 'positive number' }
            });
        }
        // Parse options
        const aggressive = options.aggressive === true;
        // Note: adjustThreshold is reserved for future enhanced pruning strategies
        // Update global configuration
        const { configure } = require('./config');
        configure({
            cache: {
                maxPrimeCacheSize: size
            }
        });
        // If aggressive, immediately prune to target size
        if (aggressive && _primeCache.primalityMap.size > size) {
            pruneCache(); // This will prune to 80% of the new size
        }
        // Otherwise, only prune if significantly over limit
        else if (_primeCache.primalityMap.size > size * 1.2) {
            pruneCache();
        }
    }
};
/**
 * Get the nth prime number
 * Uses optimized caching and generation for efficiency
 *
 * @param {BigInt|number|string} n - The 1-based index of the prime number to retrieve
 * @returns {BigInt} The nth prime number
 * @throws {PrimeMathError} If n is not a positive integer
 */
function getNthPrime(n) {
    const index = toBigInt(n);
    if (index <= 0n) {
        throw new PrimeMathError('Index must be a positive integer');
    }
    // For small values, use the known primes cache
    if (index <= BigInt(_primeCache.knownPrimes.length)) {
        return _primeCache.knownPrimes[Number(index - 1n)];
    }
    // Generate primes up to the required index
    let count = BigInt(_primeCache.knownPrimes.length);
    let candidate = _primeCache.knownPrimes[_primeCache.knownPrimes.length - 1];
    while (count < index) {
        candidate = nextPrime(candidate);
        count += 1n;
    }
    return candidate;
}
/**
 * Check if a number is a Mersenne prime (a prime of the form 2^n - 1)
 * Mersenne primes have the form 2^p - 1 where p is also prime
 *
 * @param {BigInt|number|string} n - The number to check
 * @returns {boolean} True if n is a Mersenne prime, false otherwise
 */
function isMersennePrime(n) {
    const num = toBigInt(n);
    // Quick test: Mersenne primes are of the form 2^p - 1
    // First check if n is prime
    if (!isPrime(num)) {
        return false;
    }
    // Check if n is of the form 2^p - 1
    // If n is 2^p - 1, then n + 1 is a power of 2
    const nPlusOne = num + 1n;
    // Check if n + 1 is a power of 2 by checking if it has exactly one bit set
    if ((nPlusOne & (nPlusOne - 1n)) !== 0n) {
        return false;
    }
    // Get the exponent p by computing log2(n + 1)
    let exponent = 0n;
    let temp = nPlusOne;
    while (temp > 1n) {
        temp = temp >> 1n;
        exponent++;
    }
    // For a true Mersenne prime, p must also be prime
    return isPrime(exponent);
}
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
function moebiusFunction(n) {
    const num = toBigInt(n);
    if (num <= 0n) {
        throw new PrimeMathError('Möbius function is only defined for positive integers');
    }
    if (num === 1n) {
        return 1n; // μ(1) = 1 by definition
    }
    // Trial division approach to factorize and check for repeated factors
    let remainingNum = num;
    let sign = 1n; // Track the parity of the number of prime factors
    let lastFactor = 0n;
    for (let i = 0; i < _primeCache.knownPrimes.length && _primeCache.knownPrimes[i] * _primeCache.knownPrimes[i] <= remainingNum; i++) {
        const prime = _primeCache.knownPrimes[i];
        if (remainingNum % prime === 0n) {
            // Found a prime factor
            remainingNum /= prime;
            // Check if this prime appears more than once
            if (remainingNum % prime === 0n) {
                return 0n; // Not square-free
            }
            sign = -sign; // Flip the sign for each prime factor
            lastFactor = prime;
        }
    }
    // If there's a remaining factor and it's not the last found factor, it's a prime
    if (remainingNum > 1n) {
        if (remainingNum !== lastFactor) {
            sign = -sign; // Flip the sign for this additional prime factor
        }
    }
    return sign;
}
/**
 * Check if a is a quadratic residue modulo p
 * A number a is a quadratic residue modulo p if there exists an x such that x^2 ≡ a (mod p)
 *
 * @param {BigInt|number|string} a - The number to check
 * @param {BigInt|number|string} p - The prime modulus
 * @returns {boolean} True if a is a quadratic residue modulo p, false otherwise
 * @throws {PrimeMathError} If p is not likely a prime
 */
function quadraticResidue(a, p) {
    const bigA = toBigInt(a);
    const bigP = toBigInt(p);
    // Special cases
    if (bigP <= 1n) {
        throw new PrimeMathError('Modulus must be positive');
    }
    if (!isPrime(bigP)) {
        throw new PrimeMathError('Modulus should be prime for reliable results');
    }
    // Handle special cases
    if (bigA % bigP === 0n) {
        return true; // 0 is a quadratic residue
    }
    // For small primes, check by brute force
    if (bigP < 100n) {
        for (let x = 1n; x < bigP; x++) {
            if ((x * x) % bigP === bigA % bigP) {
                return true;
            }
        }
        return false;
    }
    // For larger primes, use Euler's criterion: a^((p-1)/2) ≡ 1 (mod p) if a is a quadratic residue
    const power = (bigP - 1n) / 2n;
    // Modular exponentiation
    let result = 1n;
    let base = bigA % bigP;
    let exp = power;
    while (exp > 0n) {
        if (exp % 2n === 1n) {
            result = (result * base) % bigP;
        }
        base = (base * base) % bigP;
        exp /= 2n;
    }
    // If result is congruent to 1, then a is a quadratic residue
    return result === 1n;
}
// Export for testing in non-production environments
const testExports = process.env.NODE_ENV === 'test' ? {
    basicSieveOfEratosthenes
} : null;
module.exports = {
    PrimeMathError,
    fastExp,
    isDivisible,
    exactDivide,
    gcd,
    lcm,
    toBigInt,
    isPrime,
    nextPrime,
    factorial,
    primeCache,
    getPrimeRange,
    primeGenerator,
    getNthPrime,
    isMersennePrime,
    moebiusFunction,
    quadraticResidue,
    // Export private functions for testing only
    __test__: testExports
};
//# sourceMappingURL=Utils.js.map