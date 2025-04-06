/**
 * Validates if a string is a valid representation of a number in the given base
 *
 * @param {string} str - The string to validate
 * @param {number} base - The base of the number representation (configurable, default: 2-36)
 * @returns {boolean} True if the string is a valid representation
 */
export function validateStringForBase(str: string, base: number): boolean;
/**
 * Get the digit character set for a specific base
 * Supports extended bases beyond the standard 36
 *
 * @param {number} base - The base for which to get the character set
 * @returns {string} The character set for the given base
 */
export function getDigitCharset(base: number): string;
/**
 * Advanced serialization format options
 * Provides different serialization strategies for universal coordinates
 */
export type SerializationFormat = "standard" | "compact" | "binary" | "streaming";
export type FactorizationMetadata = {
    /**
     * - The format used (standard, compact, binary, streaming)
     */
    format: string;
    /**
     * - Number of prime factors
     */
    primeCount: number;
    /**
     * - ISO timestamp of serialization
     */
    timestamp: string;
};
export type StandardFactorizationResult = {
    /**
     * - Always 'Factorization'
     */
    type: string;
    /**
     * - Object mapping prime factors to exponents
     */
    factors: Record<string, string>;
    /**
     * - Optional metadata
     */
    metadata?: FactorizationMetadata;
};
export type CompactFactorizationResult = {
    /**
     * - Always 'CompactFactorization'
     */
    type: string;
    /**
     * - Array of prime factors as strings
     */
    primes: string[];
    /**
     * - Array of exponents as strings
     */
    exponents: string[];
    /**
     * - Optional metadata
     */
    metadata?: FactorizationMetadata;
};
export type BinaryFactorizationResult = {
    /**
     * - Always 'BinaryFactorization'
     */
    type: string;
    /**
     * - Encoding type (e.g., 'base64')
     */
    encoding: string;
    /**
     * - Encoded data
     */
    data: string;
    /**
     * - Optional metadata
     */
    metadata?: FactorizationMetadata;
};
export type StreamingFactorizationResult = {
    /**
     * - Always 'StreamingFactorization'
     */
    type: string;
    /**
     * - Number of chunks
     */
    chunkCount: number;
    /**
     * - Array of chunks
     */
    chunks: Array<{
        primes: string[];
        exponents: string[];
    }>;
    /**
     * - Optional metadata
     */
    metadata?: FactorizationMetadata;
};
export type BigIntResult = {
    /**
     * - Always 'BigInt'
     */
    type: string;
    /**
     * - String representation of the BigInt value
     */
    value: string;
    /**
     * - Optional metadata
     */
    metadata?: any;
};
/**
 * Parses a JSON string back to number data with advanced options
 */
export type ParsedJSONResult = {
    /**
     * - The numeric value or prime factorization
     */
    value: bigint | Map<bigint, bigint>;
    /**
     * - Whether the value is a factorization (true) or BigInt (false)
     */
    isFactorization: boolean;
    /**
     * - Additional metadata if present and validated
     */
    metadata?: any;
};
/**
 * Get the digit representation of a number in a specific base
 * This extracts digits directly from the value
 */
export type DigitResult = {
    /**
     * - Array of digits in the specified base
     */
    digits: number[];
    /**
     * - Whether the value is negative (only included if includeSign is true)
     */
    isNegative?: boolean;
};
/**
 * Conversion pipeline configuration options
 */
export type ConversionPipelineOptions = {
    /**
     * - Whether to process items in parallel (when supported)
     */
    parallel?: boolean;
    /**
     * - Size of batches for batch processing
     */
    batchSize?: number;
    /**
     * - Whether to preserve factorization between steps
     */
    preserveFactorization?: boolean;
    /**
     * - Whether to stream output or return all at once
     */
    streamingOutput?: boolean;
};
/**
 * Conversion pipeline step definition
 */
export type ConversionStep = {
    /**
     * - Type of conversion step ('format', 'transform', 'compute')
     */
    type: string;
    /**
     * - Function to process a value in the pipeline
     */
    process: Function;
    /**
     * - Step-specific options
     */
    options?: any;
};
/**
 * Represents a reference frame in the Prime Framework
 * A reference frame defines a specific algebraic context for universal coordinates
 * This corresponds to a point on the smooth reference manifold M described in lib-spec.md
 */
export type ReferenceFrame = {
    /**
     * - Unique identifier for the reference frame
     */
    id: string;
    /**
     * - Parameters defining the specific reference geometry
     */
    parameters: Map<string, any>;
    /**
     * - Function to transform coordinates between frames
     */
    transform: Function;
    /**
     * - Gets the Clifford algebra at this reference point
     */
    getCliffAlgebra: Function;
};
//# sourceMappingURL=Conversion.d.ts.map