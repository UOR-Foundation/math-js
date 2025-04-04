/**
 * Type definitions for the UOR Math-JS Library
 * A JavaScript implementation of the Prime Framework for universal number representation
 */

declare module 'math-js' {
  /**
   * Class representing a universal number in the Prime Framework
   */
  export class UniversalNumber {
    /**
     * Create a new UniversalNumber
     * @param value - Value to initialize the UniversalNumber with
     */
    constructor(value: BigInt | number | string | object);
    
    /**
     * Create a UniversalNumber from a BigInt
     * @param value - BigInt value
     */
    static fromBigInt(value: BigInt): UniversalNumber;
    
    /**
     * Create a UniversalNumber from a number
     * @param value - Number value
     */
    static fromNumber(value: number): UniversalNumber;
    
    /**
     * Create a UniversalNumber from a string
     * @param value - String value
     * @param base - Base of the string representation (default 10)
     */
    static fromString(value: string, base?: number): UniversalNumber;
    
    /**
     * Create a UniversalNumber from prime factors
     * @param factors - Array of prime factor objects with prime and exponent
     */
    static fromFactors(factors: Array<{prime: BigInt | number, exponent: BigInt | number}>): UniversalNumber;
    
    /**
     * Add another UniversalNumber to this one
     * @param value - Value to add
     */
    add(value: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Subtract another UniversalNumber from this one
     * @param value - Value to subtract
     */
    subtract(value: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Multiply this UniversalNumber by another
     * @param value - Value to multiply by
     */
    multiply(value: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Divide this UniversalNumber by another
     * @param value - Value to divide by
     */
    divide(value: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Raise this UniversalNumber to a power
     * @param exponent - Exponent to raise to
     */
    pow(exponent: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Calculate this UniversalNumber modulo another
     * @param modulus - Modulus
     */
    mod(modulus: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Calculate modular exponentiation (this^exponent mod modulus)
     * @param exponent - Exponent
     * @param modulus - Modulus
     */
    modPow(exponent: UniversalNumber | BigInt | number | string, modulus: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Calculate modular multiplicative inverse (this^-1 mod modulus)
     * @param modulus - Modulus
     */
    modInverse(modulus: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Check if this UniversalNumber is an intrinsic prime
     */
    isIntrinsicPrime(): boolean;
    
    /**
     * Get the prime factorization of this UniversalNumber
     */
    getFactorization(): Map<BigInt, BigInt>;
    
    /**
     * Convert this UniversalNumber to a BigInt
     */
    toBigInt(): BigInt;
    
    /**
     * Convert this UniversalNumber to a number
     * Note: May lose precision for large numbers
     */
    toNumber(): number;
    
    /**
     * Convert this UniversalNumber to a string
     * @param base - Base for the string representation (default 10)
     */
    toString(base?: number): string;
    
    /**
     * Get the digits of this UniversalNumber in a specific base
     * @param base - Base to get digits for
     */
    getDigits(base: number): number[];
    
    /**
     * Compare this UniversalNumber with another for equality
     * @param other - Value to compare with
     */
    equals(other: UniversalNumber | BigInt | number | string): boolean;
    
    /**
     * Check if this UniversalNumber is less than another
     * @param other - Value to compare with
     */
    lessThan(other: UniversalNumber | BigInt | number | string): boolean;
    
    /**
     * Check if this UniversalNumber is greater than another
     * @param other - Value to compare with
     */
    greaterThan(other: UniversalNumber | BigInt | number | string): boolean;
    
    /**
     * Calculate the GCD of this UniversalNumber and another
     * @param other - Other number
     */
    gcd(other: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Calculate the LCM of this UniversalNumber and another
     * @param other - Other number
     */
    lcm(other: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Calculate the coherence norm of this UniversalNumber
     */
    coherenceNorm(): UniversalNumber;
    
    /**
     * Check if this UniversalNumber is in minimal norm form
     */
    isMinimalNorm(): boolean;
    
    /**
     * Calculate the coherence distance between this UniversalNumber and another
     * @param other - Other number
     */
    coherenceDistance(other: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Get the graded components of this UniversalNumber
     * @param options - Options for component retrieval
     */
    getGradedComponents(options?: {
      bases?: number[],
      referenceFrame?: string
    }): Map<number, number[]>;
    
    /**
     * Transform this UniversalNumber to another reference frame
     * @param targetFrame - Target reference frame
     */
    transformToFrame(targetFrame: string): UniversalNumber;
    
    /**
     * Create a compact representation of this UniversalNumber
     */
    toCompact(): {
      type: string,
      sign: number,
      factors: Record<string, string>
    };
    
    /**
     * Convert this UniversalNumber to JSON
     */
    toJSON(): object;
  }
  
  /**
   * Static math operations on UniversalNumbers
   */
  export namespace PrimeMath {
    /**
     * Add two UniversalNumbers
     * @param a - First operand
     * @param b - Second operand
     */
    function add(a: UniversalNumber | BigInt | number | string, b: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Subtract two UniversalNumbers
     * @param a - First operand
     * @param b - Second operand
     */
    function subtract(a: UniversalNumber | BigInt | number | string, b: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Multiply two UniversalNumbers
     * @param a - First operand
     * @param b - Second operand
     */
    function multiply(a: UniversalNumber | BigInt | number | string, b: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Divide two UniversalNumbers
     * @param a - First operand
     * @param b - Second operand
     */
    function divide(a: UniversalNumber | BigInt | number | string, b: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Calculate the power of a UniversalNumber
     * @param base - Base
     * @param exponent - Exponent
     */
    function pow(base: UniversalNumber | BigInt | number | string, exponent: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Calculate the greatest common divisor of two UniversalNumbers
     * @param a - First number
     * @param b - Second number
     */
    function gcd(a: UniversalNumber | BigInt | number | string, b: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Calculate the least common multiple of two UniversalNumbers
     * @param a - First number
     * @param b - Second number
     */
    function lcm(a: UniversalNumber | BigInt | number | string, b: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Find the next prime number after a given value
     * @param n - Starting value
     */
    function nextPrime(n: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Generate a random prime number of specified bit length
     * @param bits - Bit length
     * @param options - Generation options
     */
    function randomPrime(bits: number, options?: object): UniversalNumber;
    
    /**
     * Calculate the coherence inner product of two UniversalNumbers
     * @param a - First number
     * @param b - Second number
     */
    function innerProduct(a: UniversalNumber, b: UniversalNumber): UniversalNumber;
    
    /**
     * Create a lazy-evaluated UniversalNumber
     * @param operation - Function that returns a UniversalNumber
     */
    function lazy(operation: () => UniversalNumber): UniversalNumber;
    
    /**
     * Apply a sequence of operations with fusion optimization
     * @param operations - Array of operations to apply
     * @param initialValue - Initial value
     */
    function fuse(operations: Array<(n: UniversalNumber) => UniversalNumber>, initialValue: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Perform fast multiplication optimized for numbers with many small prime factors
     * @param a - First number
     * @param b - Second number
     */
    function fastMultiply(a: UniversalNumber, b: UniversalNumber): UniversalNumber;
  }
  
  /**
   * Cache configuration
   */
  export interface CacheConfig {
    /**
     * Whether to enable caching
     */
    enabled?: boolean;
    
    /**
     * Maximum cache size in bytes
     */
    maxSize?: number;
    
    /**
     * Maximum number of entries in the prime number cache
     */
    maxPrimeCacheSize?: number;
    
    /**
     * Maximum number of entries in the factorization cache
     */
    maxFactorizationCacheSize?: number;
    
    /**
     * Cache eviction policy
     */
    evictionPolicy?: 'lru' | 'fifo' | 'random';
    
    /**
     * Whether to use persistent caching
     */
    persistentCache?: boolean;
    
    /**
     * Time-to-live for cache entries in milliseconds (0 = no expiry)
     */
    ttl?: number;
  }
  
  /**
   * Factorization configuration
   */
  export interface FactorizationConfig {
    /**
     * Whether to compute factorization lazily
     */
    lazy?: boolean;
    
    /**
     * Maximum size (in digits) for which to attempt complete factorization
     */
    completeSizeLimit?: number;
    
    /**
     * Algorithm to use for factorization
     */
    algorithm?: 'auto' | 'trial' | 'pollard' | 'quadratic';
    
    /**
     * Maximum time (in milliseconds) to spend on a factorization attempt
     */
    timeLimit?: number;
    
    /**
     * Memory limit (in MB) for factorization operations
     */
    memoryLimit?: number;
    
    /**
     * Maximum number of iterations for probabilistic factorization algorithms
     */
    maxIterations?: number;
  }
  
  /**
   * Async operation configuration
   */
  export interface AsyncConfig {
    /**
     * Whether to use WebWorkers when available
     */
    useWorkers?: boolean;
    
    /**
     * Default timeout for async operations in milliseconds
     */
    defaultTimeout?: number;
    
    /**
     * Whether to report progress events for long-running operations
     */
    reportProgress?: boolean;
    
    /**
     * Maximum number of concurrent workers for parallel operations
     */
    maxWorkers?: number;
  }
  
  /**
   * Memory usage configuration
   */
  export interface MemoryConfig {
    /**
     * Whether to optimize memory usage at the expense of performance
     */
    optimizeMemory?: boolean;
    
    /**
     * Whether to use compact representations for storage
     */
    useCompactRepresentation?: boolean;
    
    /**
     * Maximum memory usage limit in MB (0 = no explicit limit)
     */
    maxMemoryUsage?: number;
    
    /**
     * Garbage collection strategy
     */
    gcStrategy?: 'auto' | 'aggressive' | 'conservative';
  }
  
  /**
   * Primality testing configuration
   */
  export interface PrimalityTestingConfig {
    /**
     * Number of Miller-Rabin rounds for primality testing
     */
    millerRabinRounds?: number;
    
    /**
     * Maximum size (in digits) for deterministic primality testing
     */
    deterministicTestLimit?: number;
    
    /**
     * Whether to use trial division before advanced primality tests
     */
    useTrialDivision?: boolean;
  }
  
  /**
   * Conversion configuration
   */
  export interface ConversionConfig {
    /**
     * Maximum size (in digits) for direct conversion without chunking
     */
    directConversionLimit?: number;
    
    /**
     * Default base for number conversion operations
     */
    defaultBase?: number;
    
    /**
     * Whether to cache conversion results
     */
    cacheResults?: boolean;
  }
  
  /**
   * Error handling configuration
   */
  export interface ErrorHandlingConfig {
    /**
     * Whether to include stack traces in errors
     */
    includeStackTrace?: boolean;
    
    /**
     * Level of detail in error messages
     */
    verbosity?: 'minimal' | 'standard' | 'verbose';
    
    /**
     * Whether to throw on potentially recoverable errors
     */
    strictMode?: boolean;
  }
  
  /**
   * Library configuration options
   */
  export interface LibraryConfig {
    /**
     * Performance profile for the library
     */
    performanceProfile?: 'balanced' | 'speed' | 'precision';
    
    /**
     * Cache configuration
     */
    cache?: CacheConfig;
    
    /**
     * Factorization configuration
     */
    factorization?: FactorizationConfig;
    
    /**
     * Async operation configuration
     */
    async?: AsyncConfig;
    
    /**
     * Memory usage configuration
     */
    memory?: MemoryConfig;
    
    /**
     * Primality testing configuration
     */
    primalityTesting?: PrimalityTestingConfig;
    
    /**
     * Conversion configuration
     */
    conversion?: ConversionConfig;
    
    /**
     * Error handling configuration
     */
    errorHandling?: ErrorHandlingConfig;
  }
  
  /**
   * Update library configuration
   * @param options - Configuration options to update
   */
  export function configure(options: Partial<LibraryConfig>): LibraryConfig;
  
  /**
   * Reset configuration to default values
   */
  export function resetConfig(): LibraryConfig;
  
  /**
   * Get the current configuration
   */
  export function getConfig(): LibraryConfig;
  
  /**
   * Current library configuration
   */
  export const config: LibraryConfig;
  
  /**
   * Stream interface for processing sequences of numbers
   */
  export interface Stream {
    /**
     * Chain another transformation
     * @param transformer - Transformation function
     */
    pipe(transformer: (value: any) => any): Stream;
    
    /**
     * Transform each value in the stream
     * @param fn - Mapping function
     */
    map(fn: (value: any) => any): Stream;
    
    /**
     * Filter values in the stream
     * @param predicate - Filtering function
     */
    filter(predicate: (value: any) => boolean): Stream;
    
    /**
     * Process a sequence of values
     * @param values - Values to process
     */
    process(values: Iterable<any>): Array<any>;
    
    /**
     * Reduce a sequence to a single value
     * @param values - Values to process
     * @param reducer - Reduction function
     * @param initialValue - Initial accumulator value
     */
    reduce(values: Iterable<any>, reducer: (acc: any, value: any) => any, initialValue: any): any;
  }
  
  /**
   * Create a stream processor for sequences of numbers
   * @param transformer - Initial transformation function
   */
  export function createStream(transformer: (value: any) => any): Stream;
  
  /**
   * Create an asynchronous processor for expensive operations
   * @param operation - Operation to perform
   * @param options - Async operation options
   */
  export function createAsync<T>(operation: () => T | Promise<T>, options?: {
    defaultTimeout?: number;
    reportProgress?: boolean;
  }): Promise<T>;
  
  /**
   * Register a plugin with the library
   * @param name - Plugin name
   * @param plugin - Plugin implementation
   */
  export function registerPlugin(name: string, plugin: object): void;
  
  /**
   * Get a registered plugin
   * @param name - Plugin name
   */
  export function getPlugin(name: string): object;
  
  /**
   * Number theory utilities
   */
  export namespace numberTheory {
    /**
     * Check if a number is prime
     * @param n - Number to check
     */
    function isPrime(n: UniversalNumber | BigInt | number | string): boolean;
    
    /**
     * Get the prime factorization of a number
     * @param n - Number to factorize
     */
    function factorize(n: UniversalNumber | BigInt | number | string): Map<BigInt, BigInt>;
    
    /**
     * Find the next prime number after a given value
     * @param n - Starting value
     */
    function nextPrime(n: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Calculate the greatest common divisor of two numbers
     * @param a - First number
     * @param b - Second number
     */
    function gcd(a: UniversalNumber | BigInt | number | string, b: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Calculate the least common multiple of two numbers
     * @param a - First number
     * @param b - Second number
     */
    function lcm(a: UniversalNumber | BigInt | number | string, b: UniversalNumber | BigInt | number | string): UniversalNumber;
  }
  
  /**
   * Cryptography utilities
   */
  export namespace crypto {
    /**
     * Generate a random prime number of specified bit length
     * @param bits - Bit length
     * @param options - Generation options
     */
    function randomPrime(bits: number, options?: object): UniversalNumber;
    
    /**
     * Calculate modular exponentiation (base^exponent mod modulus)
     * @param base - Base
     * @param exponent - Exponent
     * @param modulus - Modulus
     */
    function modPow(base: UniversalNumber | BigInt | number | string, exponent: UniversalNumber | BigInt | number | string, modulus: UniversalNumber | BigInt | number | string): UniversalNumber;
    
    /**
     * Calculate modular multiplicative inverse (a^-1 mod n)
     * @param a - Number
     * @param n - Modulus
     */
    function modInverse(a: UniversalNumber | BigInt | number | string, n: UniversalNumber | BigInt | number | string): UniversalNumber;
  }
  
  /**
   * Analysis and statistics utilities
   */
  export namespace analysis {
    /**
     * Create a sequence of numbers
     * @param start - Start of sequence
     * @param end - End of sequence (inclusive)
     * @param step - Step size
     */
    function sequence(start: number, end: number, step?: number): Array<UniversalNumber>;
    
    /**
     * Calculate the sum of an array of numbers
     * @param numbers - Numbers to sum
     */
    function sum(numbers: Array<UniversalNumber | BigInt | number | string>): UniversalNumber;
    
    /**
     * Calculate the product of an array of numbers
     * @param numbers - Numbers to multiply
     */
    function product(numbers: Array<UniversalNumber | BigInt | number | string>): UniversalNumber;
  }
  
  /**
   * Dynamic module loader
   */
  export namespace dynamic {
    /**
     * Register a module with the dynamic loader
     * @param name - Module name
     * @param definition - Module definition
     */
    function registerModule(name: string, definition: {
      dependencies?: string[];
      factory: Function;
    }): void;
    
    /**
     * Load a module dynamically
     * @param name - Module name
     */
    function loadModule(name: string): any;
    
    /**
     * Clear the module cache
     * @param name - Optional module name to clear
     */
    function clearCache(name?: string): void;
    
    /**
     * Check if a module is loaded
     * @param name - Module name
     */
    function isLoaded(name: string): boolean;
    
    /**
     * Get list of all registered modules
     */
    function getRegisteredModules(): string[];
  }
  
  /**
   * Internal utilities (advanced usage)
   */
  export namespace internal {
    /**
     * Factorization utilities
     */
    const Factorization: any;
    
    /**
     * Conversion utilities
     */
    const Conversion: any;
    
    /**
     * Math utilities
     */
    const Utils: any;
  }
}