import UniversalNumber = require("./UniversalNumber");
import PrimeMath = require("./PrimeMath");
/**
 * Update configuration with custom settings
 * @param {Object} options - Configuration options to update
 * @returns {Object} The updated configuration object
 */
export function configure(options: any): any;
/**
 * Creates a stream processor for handling sequences of UniversalNumbers
 * @param {Function} transformer - Function to apply to each number in the stream
 * @returns {Object} A stream processing object with methods: pipe, map, filter, reduce
 */
export function createStream(transformer: Function): any;
/**
 * Creates an asynchronous processor for expensive operations
 * @param {Function} operation - The operation to perform asynchronously
 * @param {Object} options - Options for the async operation
 * @returns {Promise} A promise that resolves with the operation result
 */
export function createAsync(operation: Function, options?: any): Promise<any>;
/**
 * Register a plugin with the library
 * @param {string} name - Unique name for the plugin
 * @param {Object} plugin - Plugin implementation
 */
export function registerPlugin(name: string, plugin: any): void;
/**
 * Get a registered plugin by name
 * @param {string} name - The name of the plugin to retrieve
 * @returns {Object} The plugin instance
 */
export function getPlugin(name: string): any;
import dynamicLoader = require("./dynamicLoader");
import Factorization = require("./Factorization");
import Conversion = require("./Conversion");
import Utils = require("./Utils");
export declare let config: any;
export declare let resetConfig: () => any;
export declare let getConfig: () => any;
export declare namespace internal {
    export { Factorization };
    export { Conversion };
    export { Utils };
}
export declare namespace numberTheory {
    /**
     * Check if a number is prime
     * @param {UniversalNumber|BigInt|number|string} n - The number to check
     * @returns {boolean} True if the number is prime
     */
    function isPrime(n: UniversalNumber | bigint | number | string): boolean;
    /**
     * Get the prime factorization of a number
     * @param {UniversalNumber|BigInt|number|string} n - The number to factorize
     * @returns {Map<BigInt, BigInt>} Map of prime factors to exponents
     */
    function factorize(n: UniversalNumber | bigint | number | string): Map<bigint, bigint>;
    /**
     * Find the next prime number after a given value
     * @param {UniversalNumber|BigInt|number|string} n - The starting value
     * @returns {UniversalNumber} The next prime number
     */
    function nextPrime(n: UniversalNumber | bigint | number | string): UniversalNumber;
    /**
     * Calculate the greatest common divisor of two numbers
     * @param {UniversalNumber|BigInt|number|string} a - First number
     * @param {UniversalNumber|BigInt|number|string} b - Second number
     * @returns {UniversalNumber} The GCD
     */
    function gcd(a: UniversalNumber | bigint | number | string, b: UniversalNumber | bigint | number | string): UniversalNumber;
    /**
     * Calculate the least common multiple of two numbers
     * @param {UniversalNumber|BigInt|number|string} a - First number
     * @param {UniversalNumber|BigInt|number|string} b - Second number
     * @returns {UniversalNumber} The LCM
     */
    function lcm(a: UniversalNumber | bigint | number | string, b: UniversalNumber | bigint | number | string): UniversalNumber;
}
export declare namespace crypto {
    /**
     * Generate a random prime number of specified bit length
     * @param {number} bits - Bit length of the prime
     * @param {Object} options - Generation options
     * @returns {UniversalNumber} A random prime number
     */
    function randomPrime(bits: number, options?: any): UniversalNumber;
    /**
     * Modular exponentiation (a^b mod n)
     * @param {UniversalNumber|BigInt|number|string} base - The base
     * @param {UniversalNumber|BigInt|number|string} exponent - The exponent
     * @param {UniversalNumber|BigInt|number|string} modulus - The modulus
     * @returns {UniversalNumber} The result of modular exponentiation
     */
    function modPow(base: UniversalNumber | bigint | number | string, exponent: UniversalNumber | bigint | number | string, modulus: UniversalNumber | bigint | number | string): UniversalNumber;
    /**
     * Modular multiplicative inverse (a^-1 mod n)
     * @param {UniversalNumber|BigInt|number|string} a - The number
     * @param {UniversalNumber|BigInt|number|string} n - The modulus
     * @returns {UniversalNumber} The modular inverse if it exists
     */
    function modInverse(a: UniversalNumber | bigint | number | string, n: UniversalNumber | bigint | number | string): UniversalNumber;
}
export declare namespace analysis {
    /**
     * Create a sequence of numbers
     * @param {number} start - Start of the sequence
     * @param {number} end - End of the sequence (inclusive)
     * @param {number} step - Step size (default: 1)
     * @returns {Array<UniversalNumber>} Array of UniversalNumbers
     */
    function sequence(start: number, end: number, step?: number): Array<UniversalNumber>;
    /**
     * Calculate the sum of an array of numbers
     * @param {Array<UniversalNumber|BigInt|number|string>} numbers - The numbers to sum
     * @returns {UniversalNumber} The sum
     */
    function sum(numbers: Array<UniversalNumber | bigint | number | string>): UniversalNumber;
    /**
     * Calculate the product of an array of numbers
     * @param {Array<UniversalNumber|BigInt|number|string>} numbers - The numbers to multiply
     * @returns {UniversalNumber} The product
     */
    function product(numbers: Array<UniversalNumber | bigint | number | string>): UniversalNumber;
}
export { UniversalNumber, PrimeMath, dynamicLoader as dynamic };
//# sourceMappingURL=index.d.ts.map