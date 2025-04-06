export = UniversalNumber;
/**
 * @typedef {Object} Coordinates
 * @property {Map<BigInt, BigInt>} factorization - Map where keys are prime factors and values are their exponents
 * @property {boolean} isNegative - Whether the number is negative
 * @property {boolean} [isZero] - Whether the number is zero
 */
/**
 * @typedef {Object} FiberAlgebra
 * @property {string} referencePoint - The reference point in manifold (default: "standard")
 * @property {Map<number, Array<number>>} gradedComponents - The graded components (by base) of the representation
 */
/**
 * @typedef {Object} ReferenceFrame
 * @property {string} id - Unique identifier for the reference frame
 * @property {Object} transformationRules - Rules for transforming between frames
 */
/**
 * Class representing a universal number in the Prime Framework
 * Stores numbers using their prime factorization (universal coordinates)
 * Provides exact arithmetic operations with no rounding errors
 * Ensures unique canonical representation through strict normalization
 */
declare class UniversalNumber {
    /**
     * Create a UniversalNumber from a regular number
     *
     * @param {number} n - The JavaScript Number to convert
     * @returns {UniversalNumber} A new UniversalNumber instance
     * @throws {PrimeMathError} If n is not a safe integer or is not finite
     */
    static fromNumber(n: number): UniversalNumber;
    /**
     * Create a UniversalNumber from a BigInt
     *
     * @param {BigInt} n - The BigInt to convert
     * @returns {UniversalNumber} A new UniversalNumber instance
     */
    static fromBigInt(n: bigint): UniversalNumber;
    /**
     * Create a UniversalNumber from a string representation
     *
     * @param {string} str - The string to parse
     * @param {number} [base=10] - The base of the input string (configurable, default: 2-36)
     * @returns {UniversalNumber} A new UniversalNumber instance
     * @throws {PrimeMathError} If str cannot be parsed in the given base
     */
    static fromString(str: string, base?: number): UniversalNumber;
    /**
     * Create a UniversalNumber from its prime factorization
     *
     * @param {Array<{prime: BigInt|number|string, exponent: BigInt|number|string}>|Map<BigInt, BigInt>} factors - Prime factorization
     * @param {boolean} [isNegative=false] - Whether the number is negative
     * @returns {UniversalNumber} A new UniversalNumber instance
     * @throws {PrimeMathError} If the factorization is invalid
     */
    static fromFactors(factors: Array<{
        prime: bigint | number | string;
        exponent: bigint | number | string;
    }> | Map<bigint, bigint>, isNegative?: boolean): UniversalNumber;
    /**
     * Factorize a number into its UniversalNumber representation with prime factorization
     *
     * @param {number|string|BigInt} n - The number to factorize
     * @param {Object} [options] - Options for factorization
     * @param {boolean} [options.advanced=false] - Whether to use advanced factorization algorithms
     * @returns {UniversalNumber} A new UniversalNumber instance
     */
    static factorize(n: number | string | bigint, options?: {
        advanced?: boolean;
    }): UniversalNumber;
    /**
     * Create a UniversalNumber from a JSON representation
     *
     * @param {Object} json - The JSON object
     * @returns {UniversalNumber} A new UniversalNumber
     * @throws {PrimeMathError} If the JSON is invalid
     */
    static fromJSON(json: any): UniversalNumber;
    /**
     * Verify round-trip consistency between UniversalNumber and standard number formats
     * This is used to ensure that conversions don't lose information
     *
     * @param {number|string|BigInt} value - The value to test for round-trip consistency
     * @returns {boolean} True if conversions are consistent, false otherwise
     */
    static verifyRoundTrip(value: number | string | bigint): boolean;
    /**
     * Create a new UniversalNumber
     *
     * @param {number|string|BigInt|Map<BigInt, BigInt>|UniversalNumber|{factorization: Map<BigInt, BigInt>, isNegative: boolean}} value - The value to initialize with
     * @throws {PrimeMathError} If value cannot be converted to a valid UniversalNumber
     */
    constructor(value: number | string | bigint | Map<bigint, bigint> | UniversalNumber | {
        factorization: Map<bigint, bigint>;
        isNegative: boolean;
    }, ...args: any[]);
    /** @private */
    private _factorization;
    /** @private */
    private _isNegative;
    /** @private */
    private _isZero;
    /**
     * Validate that the factorization is correct
     * Checks that all factors are prime and all exponents are positive
     * @private
     *
     * @param {Map<BigInt, BigInt>} factorization - The factorization to validate
     * @throws {PrimeMathError} If the factorization is invalid
     */
    private _validateFactorization;
    /**
     * Normalize the factorization to ensure canonical form
     * Removes any factors with zero exponents and sorts by prime
     * @private
     */
    private _normalizeFactorization;
    /**
     * Verify that this UniversalNumber has been properly normalized
     * Used to check that operations maintain canonical representation
     * @private
     *
     * @returns {boolean} True if the factorization is in canonical form
     */
    private _verifyNormalization;
    /**
     * Check if the UniversalNumber represents an intrinsic prime
     * A number is intrinsically prime if its prime factorization consists of a single prime with exponent 1
     *
     * @returns {boolean} True if the number is an intrinsic prime, false otherwise
     */
    isIntrinsicPrime(): boolean;
    /**
     * Get the prime factorization of the UniversalNumber
     *
     * @returns {Map<BigInt, BigInt>} A Map where keys are prime factors and values are their exponents
     */
    getFactorization(): Map<bigint, bigint>;
    /**
     * Get the universal coordinates (prime factorization and sign)
     *
     * @returns {Coordinates} Object containing the factorization and sign information
     */
    getCoordinates(): Coordinates;
    /**
     * Convert the UniversalNumber to a BigInt
     *
     * @returns {BigInt} The BigInt representation of the number
     */
    toBigInt(): bigint;
    /**
     * Convert the UniversalNumber to a JavaScript Number
     *
     * @param {Object} [options] - Conversion options
     * @param {boolean} [options.allowApproximate=false] - Whether to allow approximate conversion for large values
     * @param {boolean} [options.suppressErrors=false] - Whether to return Infinity/-Infinity instead of throwing errors
     * @returns {number} The Number representation of the number
     * @throws {PrimeMathError} If the value is too large to be represented as a Number (unless suppressErrors is true)
     */
    toNumber(options?: {
        allowApproximate?: boolean;
        suppressErrors?: boolean;
    }): number;
    /**
     * Get an approximate JavaScript Number representation with scientific notation
     * This is useful for very large numbers that exceed Number.MAX_SAFE_INTEGER
     *
     * @param {Object} [options] - Options for the approximation
     * @param {number} [options.significantDigits=15] - Number of significant digits to include (max 17)
     * @param {boolean} [options.throwOnOverflow=false] - Whether to throw an error if the exponent overflows
     * @returns {number} The approximate Number in scientific notation
     * @throws {PrimeMathError} If the exponent is too large even for scientific notation and throwOnOverflow is true
     */
    toApproximateNumber(options?: {
        significantDigits?: number;
        throwOnOverflow?: boolean;
    }): number;
    /**
     * Convert the UniversalNumber to a string representation in the given base
     *
     * @param {number} [base=10] - The base for the output representation (2-36)
     * @returns {string} The string representation in the specified base
     * @throws {PrimeMathError} If the base is invalid
     */
    toString(base?: number): string;
    /**
     * Format the number as a string with configurable formatting options
     * Particularly useful for very large numbers that exceed JavaScript Number limits
     *
     * @param {Object} [options] - Formatting options
     * @param {number} [options.precision=20] - Maximum number of significant digits to include
     * @param {boolean} [options.scientific=false] - Whether to use scientific notation
     * @param {string} [options.notation='standard'] - Notation style: 'standard', 'scientific', 'engineering', or 'compact'
     * @param {number} [options.base=10] - The base for the output representation (2-36)
     * @param {boolean} [options.groupDigits=false] - Whether to group digits (e.g., with commas in base 10)
     * @param {string} [options.groupSeparator=','] - Character to use as the digit group separator
     * @returns {string} The formatted string representation
     */
    formatNumber(options?: {
        precision?: number;
        scientific?: boolean;
        notation?: string;
        base?: number;
        groupDigits?: boolean;
        groupSeparator?: string;
    }): string;
    /**
     * Get parts of the number for custom display formatting
     * Useful for handling very large numbers that exceed JavaScript Number limits
     *
     * @param {Object} [options] - Options for extracting parts
     * @param {number} [options.base=10] - The base for representation
     * @param {boolean} [options.includeExponent=true] - Whether to calculate and include exponent info
     * @param {number} [options.significantDigits=15] - Number of significant digits
     * @param {boolean} [options.getSeparateDigits=false] - Whether to return digits as separate array entries
     * @returns {Object} Object containing number parts (sign, integerPart, fractionalPart, etc.)
     */
    getNumberParts(options?: {
        base?: number;
        includeExponent?: boolean;
        significantDigits?: number;
        getSeparateDigits?: boolean;
    }): any;
    /**
     * Get the digit representation of the number in a specific base
     *
     * @param {number} [base=10] - The base to use (2-36)
     * @param {boolean} [leastSignificantFirst=false] - Order of digits
     * @returns {number[]} Array of digits in the specified base
     * @throws {PrimeMathError} If the base is invalid
     */
    getDigits(base?: number, leastSignificantFirst?: boolean): number[];
    /**
     * Add another number to this UniversalNumber
     *
     * @param {number|string|BigInt|UniversalNumber} other - The number to add
     * @returns {UniversalNumber} A new UniversalNumber representing the sum
     */
    add(other: number | string | bigint | UniversalNumber): UniversalNumber;
    /**
     * Subtract another number from this UniversalNumber
     *
     * @param {number|string|BigInt|UniversalNumber} other - The number to subtract
     * @returns {UniversalNumber} A new UniversalNumber representing the difference
     */
    subtract(other: number | string | bigint | UniversalNumber): UniversalNumber;
    /**
     * Multiply this UniversalNumber by another number
     * For factorized numbers, multiplication is performed by combining prime exponents
     *
     * @param {number|string|BigInt|UniversalNumber} other - The number to multiply by
     * @returns {UniversalNumber} A new UniversalNumber representing the product
     */
    multiply(other: number | string | bigint | UniversalNumber): UniversalNumber;
    /**
     * Divide this UniversalNumber by another number
     * Only succeeds if the division is exact (no remainder)
     * For factorized numbers, division is performed by subtracting prime exponents
     *
     * @param {number|string|BigInt|UniversalNumber} other - The divisor
     * @returns {UniversalNumber} A new UniversalNumber representing the quotient
     * @throws {PrimeMathError} If the division is not exact or divisor is zero
     */
    divide(other: number | string | bigint | UniversalNumber): UniversalNumber;
    /**
     * Raise this UniversalNumber to a power
     * For factorized numbers, exponentiation is performed by multiplying prime exponents
     *
     * @param {number|string|BigInt} exponent - The exponent
     * @returns {UniversalNumber} A new UniversalNumber representing the result of the exponentiation
     * @throws {PrimeMathError} If exponent is negative
     */
    pow(exponent: number | string | bigint): UniversalNumber;
    /**
     * Find the greatest common divisor (GCD) of this UniversalNumber and another number
     * For factorized numbers, GCD is computed by taking the minimum of each prime's exponents
     *
     * @param {number|string|BigInt|UniversalNumber} other - The other number
     * @returns {UniversalNumber} A new UniversalNumber representing the GCD
     * @throws {PrimeMathError} If both inputs are zero
     */
    gcd(other: number | string | bigint | UniversalNumber): UniversalNumber;
    /**
     * Find the least common multiple (LCM) of this UniversalNumber and another number
     * For factorized numbers, LCM is computed by taking the maximum of each prime's exponents
     *
     * @param {number|string|BigInt|UniversalNumber} other - The other number
     * @returns {UniversalNumber} A new UniversalNumber representing the LCM
     * @throws {PrimeMathError} If either input is zero
     */
    lcm(other: number | string | bigint | UniversalNumber): UniversalNumber;
    /**
     * Calculate the radical of the number (product of distinct prime factors)
     *
     * @returns {UniversalNumber} A new UniversalNumber with all exponents set to 1
     */
    radical(): UniversalNumber;
    /**
     * Check if this number is divisible by another
     *
     * @param {number|string|BigInt|UniversalNumber} other - The potential divisor
     * @returns {boolean} True if this number is divisible by other, false otherwise
     * @throws {PrimeMathError} If divisor is zero
     */
    isDivisibleBy(other: number | string | bigint | UniversalNumber): boolean;
    /**
     * Calculate the modular inverse (a^-1 mod m) if it exists
     *
     * @param {number|string|BigInt|UniversalNumber} modulus - The modulus
     * @returns {UniversalNumber|null} The modular inverse, or null if it doesn't exist
     * @throws {PrimeMathError} If modulus is not positive
     */
    modInverse(modulus: number | string | bigint | UniversalNumber): UniversalNumber | null;
    /**
     * Compute modular exponentiation (a^b mod n)
     *
     * @param {number|string|BigInt} expValue - The exponent
     * @param {number|string|BigInt|UniversalNumber} modulus - The modulus
     * @returns {UniversalNumber} Result of (this^expValue) mod modulus
     * @throws {PrimeMathError} If modulus is not positive
     */
    modPow(expValue: number | string | bigint, modulus: number | string | bigint | UniversalNumber): UniversalNumber;
    /**
     * Compute the modulo (remainder after division)
     *
     * @param {number|string|BigInt|UniversalNumber} modulus - The modulus
     * @returns {UniversalNumber} This value modulo the given modulus
     * @throws {PrimeMathError} If modulus is not positive
     */
    mod(modulus: number | string | bigint | UniversalNumber): UniversalNumber;
    /**
     * Compare this UniversalNumber with another number for equality
     *
     * @param {number|string|BigInt|UniversalNumber} other - The number to compare with
     * @returns {boolean} True if the numbers are equal, false otherwise
     */
    equals(other: number | string | bigint | UniversalNumber): boolean;
    /**
     * Compare this UniversalNumber with another number
     *
     * @param {number|string|BigInt|UniversalNumber} other - The number to compare with
     * @returns {number} -1 if this < other, 0 if this === other, 1 if this > other
     */
    compareTo(other: number | string | bigint | UniversalNumber): number;
    /**
     * Get the absolute value of this UniversalNumber
     *
     * @returns {UniversalNumber} A new UniversalNumber with the same magnitude but positive sign
     */
    abs(): UniversalNumber;
    /**
     * Negate this UniversalNumber
     *
     * @returns {UniversalNumber} A new UniversalNumber with the same magnitude but opposite sign
     */
    negate(): UniversalNumber;
    /**
     * Get the sign of this UniversalNumber
     *
     * @returns {number} -1 if negative, 1 if positive
     */
    sign(): number;
    /**
     * Check if this UniversalNumber is 1
     *
     * @returns {boolean} True if this number is 1, false otherwise
     */
    isOne(): boolean;
    /**
     * Check if this UniversalNumber is 0
     *
     * @returns {boolean} True if this number is 0, false otherwise
     */
    isZero(): boolean;
    /**
     * Convert the UniversalNumber to a native JavaScript primitive
     * Used for automatic conversion in expressions
     *
     * @returns {BigInt} The BigInt representation of the number
     */
    valueOf(): bigint;
    /**
     * Convert the UniversalNumber to a serializable object
     * For use with JSON.stringify
     *
     * @returns {Object} Object with type, factors, and sign information
     */
    toJSON(): any;
    /**
     * Calculate the coherence norm of a UniversalNumber
     * The coherence norm measures how consistent a number's representation is
     * A minimal-norm representation is the canonical form in the Prime Framework
     *
     * @returns {UniversalNumber} The coherence norm value
     */
    coherenceNorm(): UniversalNumber;
    /**
     * Check if this UniversalNumber is in minimal-norm canonical form
     * In the Prime Framework, the minimal-norm representation is the unique canonical form
     *
     * @returns {boolean} True if the number is in minimal-norm form
     */
    isMinimalNorm(): boolean;
    /**
     * Calculate the coherence distance between this UniversalNumber and another
     * The coherence distance measures how "far apart" two numbers are in the fiber algebra
     *
     * @param {UniversalNumber} other - The other UniversalNumber
     * @returns {UniversalNumber} The coherence distance
     */
    coherenceDistance(other: UniversalNumber): UniversalNumber;
    /**
     * Get this number's graded components in the fiber algebra (Clifford algebra)
     * The graded components represent the number's digit expansions in various bases
     *
     * @param {Object} options - Options for retrieving graded components
     * @param {number[]} [options.bases=[2,10]] - The bases to include in the graded components
     * @param {string} [options.referenceFrame] - Optional reference frame (defaults to active frame)
     * @returns {Map<number, number[]>} Map of base to array of digits
     */
    getGradedComponents(options?: {
        bases?: number[];
        referenceFrame?: string;
    }): Map<number, number[]>;
    /**
     * Transform this UniversalNumber to a different reference frame
     * Implements symmetry group action (G-action) on the reference manifold
     *
     * @param {string} targetFrame - The reference frame to transform to
     * @returns {UniversalNumber} The number transformed to the new reference frame
     * @throws {PrimeMathError} If the target frame doesn't exist
     */
    transformToFrame(targetFrame: string): UniversalNumber;
    private _ensureComputed;
    _isFactorizationComputed: boolean;
    /**
     * Create a compacted representation of this UniversalNumber
     * Memory-optimized representation for very large numbers
     *
     * @returns {Object} Compact serializable representation
     */
    toCompact(): any;
    /**
     * Calculate modular square root if it exists
     * Finds x such that x^2 ≡ this (mod n)
     *
     * @param {UniversalNumber|BigInt|number|string} modulus - The modulus
     * @returns {UniversalNumber|null} The modular square root if it exists, null otherwise
     */
    modSqrt(modulus: UniversalNumber | bigint | number | string): UniversalNumber | null;
}
declare namespace UniversalNumber {
    export { innerProduct, getActiveReferenceFrame, setActiveReferenceFrame, registerReferenceFrame, lazy, fuse, fromCompact, fromPartialFactorization, fastMultiply, Coordinates, FiberAlgebra, ReferenceFrame, PartialFactorization };
}
/**
 * Calculate the coherence inner product between two UniversalNumber instances
 * The coherence inner product is a positive-definite inner product that measures
 * consistency between different representations of the same abstract number
 *
 * @param {UniversalNumber} a - First UniversalNumber
 * @param {UniversalNumber} b - Second UniversalNumber
 * @returns {UniversalNumber} The coherence inner product value
 */
declare function innerProduct(a: UniversalNumber, b: UniversalNumber): UniversalNumber;
/**
 * Get the currently active reference frame in the fiber algebra
 * In the Prime Framework, numbers exist at a point on a smooth manifold M
 *
 * @returns {string} The identifier of the active reference frame
 */
declare function getActiveReferenceFrame(): string;
/**
 * Set the active reference frame for Prime Framework operations
 * All numbers are interpreted relative to the current reference
 *
 * @param {string} frameId - The identifier of the reference frame to activate
 * @throws {PrimeMathError} If the reference frame doesn't exist
 */
declare function setActiveReferenceFrame(frameId: string): void;
/**
 * Register a new reference frame in the fiber algebra
 * Used for advanced geometric interpretations of the Prime Framework
 *
 * @param {ReferenceFrame} frame - The reference frame to register
 * @throws {PrimeMathError} If the frame is invalid
 */
declare function registerReferenceFrame(frame: ReferenceFrame): void;
/**
 * Create a UniversalNumber with lazy evaluation
 *
 * @param {Function} operation - Function to execute when the value is needed
 * @returns {UniversalNumber} A lazily evaluated UniversalNumber
 */
declare function lazy(operation: Function): UniversalNumber;
/**
 * Apply operation fusion to a sequence of operations
 * This optimizes computation by eliminating intermediate results
 *
 * @param {Array<Function>} operations - Array of functions to compose
 * @param {UniversalNumber} initialValue - Starting value
 * @returns {UniversalNumber} Result of all operations combined
 */
declare function fuse(operations: Array<Function>, initialValue: UniversalNumber): UniversalNumber;
/**
 * Create a UniversalNumber from a compact representation
 *
 * @param {Object} compact - Compact representation created by toCompact()
 * @returns {UniversalNumber} The reconstructed UniversalNumber
 */
declare function fromCompact(compact: any): UniversalNumber;
/**
 * Support for partial factorization of very large numbers
 *
 * @typedef {Object} PartialFactorization
 * @property {Map<BigInt, BigInt>} knownFactors - Factors that have been found
 * @property {BigInt} remainingPart - Part that hasn't been factorized yet
 */
/**
 * Create a UniversalNumber with partially known factorization
 * Useful for very large numbers where complete factorization is impractical
 *
 * @param {Object} params - Parameters for partial factorization
 * @param {Array<{prime: BigInt|number|string, exponent: BigInt|number|string}>|Map<BigInt, BigInt>} params.knownFactors - Known prime factors
 * @param {BigInt|number|string} params.remainingPart - The unfactorized part (must be > 1)
 * @param {boolean} [params.isNegative=false] - Whether the number is negative
 * @returns {UniversalNumber} A new UniversalNumber with partial factorization
 */
declare function fromPartialFactorization(params: {
    knownFactors: Array<{
        prime: bigint | number | string;
        exponent: bigint | number | string;
    }> | Map<bigint, bigint>;
    remainingPart: bigint | number | string;
    isNegative?: boolean;
}): UniversalNumber;
/**
 * Perform fast multiplication when operands have many small prime factors
 * Optimized for the Prime Framework's universal coordinates
 *
 * @param {UniversalNumber} a - First number
 * @param {UniversalNumber} b - Second number
 * @returns {UniversalNumber} Product a × b
 */
declare function fastMultiply(a: UniversalNumber, b: UniversalNumber): UniversalNumber;
type Coordinates = {
    /**
     * - Map where keys are prime factors and values are their exponents
     */
    factorization: Map<bigint, bigint>;
    /**
     * - Whether the number is negative
     */
    isNegative: boolean;
    /**
     * - Whether the number is zero
     */
    isZero?: boolean;
};
type FiberAlgebra = {
    /**
     * - The reference point in manifold (default: "standard")
     */
    referencePoint: string;
    /**
     * - The graded components (by base) of the representation
     */
    gradedComponents: Map<number, Array<number>>;
};
type ReferenceFrame = {
    /**
     * - Unique identifier for the reference frame
     */
    id: string;
    /**
     * - Rules for transforming between frames
     */
    transformationRules: any;
};
/**
 * Support for partial factorization of very large numbers
 */
type PartialFactorization = {
    /**
     * - Factors that have been found
     */
    knownFactors: Map<bigint, bigint>;
    /**
     * - Part that hasn't been factorized yet
     */
    remainingPart: bigint;
};
//# sourceMappingURL=UniversalNumber.d.ts.map