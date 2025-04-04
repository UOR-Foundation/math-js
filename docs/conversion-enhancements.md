# Conversion Module Enhancements for Prime Framework

The Conversion module is a vital component of the Math-JS library, providing utilities for converting between different number representations. This module implements the Prime Framework's requirements for direct base conversions via universal coordinates, coordinate transformations, and efficient serialization formats. The enhancements described in this document have been implemented to significantly improve performance, flexibility, and interoperability while maintaining strict adherence to the Prime Framework's specifications.

## Key Enhancements

### 1. Direct Base Conversion via Universal Coordinates

The module now includes optimized algorithms for converting numbers between any bases using the Universal Coordinate representation:

- **Universal Coordinate Transit**: Converts numbers through factorization representation for perfect accuracy
- **Specialized Conversion Paths**: Optimized direct conversion methods for common bases like binary, octal, and hexadecimal
- **Large Number Support**: Handles arbitrarily large numbers through factorization-based conversion
- **Direct Digit Computation**: Leverages prime factorization properties to compute digits directly for certain bases

### 2. Prime Framework Reference Frames and Transformations

Support for the Prime Framework's geometric understanding of universal coordinates:

- **Reference Frame Creation**: Implements the concept of reference frames from the Prime Framework
- **Coordinate Transformations**: Allows transforming universal coordinates between reference frames
- **Clifford Algebra Support**: Basic implementation of Clifford algebras for the fiber at each reference point
- **Coherence Inner Product**: Implements the positive-definite inner product defined in the Prime Framework
- **Canonical Form Validation**: Verifies whether factorizations are in the minimal-norm canonical form

### 3. Advanced Serialization Formats

Multiple serialization formats to meet different requirements:

- **Standard Format**: Comprehensive representation with complete metadata
- **Compact Format**: Space-efficient format for minimal storage requirements
- **Binary Format**: Highly optimized binary representation for maximum efficiency
- **Streaming Format**: Chunked processing for handling extremely large factorizations

### 4. High-Efficiency Conversion Pipeline

A sophisticated pipeline for batch processing of conversions:

- **Batch Processing**: Efficient processing of multiple conversions in a single operation
- **Parallel Execution**: Support for parallel processing of compatible conversion steps
- **Streaming Output**: Stream results incrementally to minimize memory usage
- **Customizable Pipelines**: Flexible configuration of conversion steps for specific requirements

## API Reference

### Core Conversion Functions

#### `convertBase(value, fromBase, toBase)`

Converts a number from one base to another using standard conversion methods.

```javascript
const { convertBase } = require('math-js').Conversion;

// Convert from decimal to binary
const binary = convertBase(42, 10, 2);
console.log(binary); // "101010"

// Convert from hexadecimal to decimal
const decimal = convertBase("2A", 16, 10);
console.log(decimal); // "42"
```

**Parameters:**
- `value` (string|number|BigInt): The value to convert
- `fromBase` (number, optional): The base of the input (default: 10)
- `toBase` (number, optional): The base to convert to (default: 10)

**Returns:**
- (string): The converted value as a string

#### `convertBaseViaUniversal(value, fromBase, toBase, options)`

Converts a number between bases using universal coordinates for perfect accuracy.

```javascript
const { convertBaseViaUniversal } = require('math-js').Conversion;

// Convert a large number from decimal to binary
const binary = convertBaseViaUniversal("123456789012345678901234567890", 10, 2, {
  useDirectComputation: true
});

// Convert between binary and hexadecimal directly
const hex = convertBaseViaUniversal("101010", 2, 16, {
  useFactorizationShortcuts: true
});
```

**Parameters:**
- `value` (number|string|BigInt|Map<BigInt, BigInt>): The value to convert
- `fromBase` (number): Base of the input (2-36)
- `toBase` (number): Base for the output (2-36)
- `options` (Object, optional): Additional options
  - `useFactorizationShortcuts` (boolean): Whether to use optimized shortcut paths (default: true)
  - `useDirectComputation` (boolean): Whether to use direct digit computation (default: true)
  - `partialFactorization` (boolean): Allow partial factorization for very large numbers

**Returns:**
- (string): The value in the target base

### Prime Framework Coordinate Functions

#### `createReferenceFrame(options)`

Creates a new reference frame for the Prime Framework.

```javascript
const { createReferenceFrame } = require('math-js').Conversion;

// Create a custom reference frame
const frame = createReferenceFrame({
  id: 'custom',
  parameters: { rotationAngle: 45 }
});
```

**Parameters:**
- `options` (Object, optional): Options for creating the reference frame
  - `id` (string): Identifier for the reference frame (default: 'canonical')
  - `parameters` (Map<string, any>|Object): Parameters for the reference geometry

**Returns:**
- (ReferenceFrame): A new reference frame object

#### `coherenceInnerProduct(a, b, options)`

Computes the coherence inner product between two universal coordinate representations.

```javascript
const { coherenceInnerProduct, toFactorization } = require('math-js').Conversion;

// Calculate inner product between factorizations
const factors1 = toFactorization(12);
const factors2 = toFactorization(18);
const product = coherenceInnerProduct(factors1, factors2);
```

**Parameters:**
- `a` (Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>}): First universal coordinates
- `b` (Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>}): Second universal coordinates
- `options` (Object, optional): Options for computing the inner product
  - `referenceFrame` (ReferenceFrame): Reference frame to use

**Returns:**
- (BigInt): The coherence inner product value

#### `coherenceNorm(coordinates, options)`

Computes the coherence norm of universal coordinates.

```javascript
const { coherenceNorm, toFactorization } = require('math-js').Conversion;

// Calculate norm of a factorization
const factors = toFactorization(42);
const norm = coherenceNorm(factors);
```

**Parameters:**
- `coordinates` (Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>}): Universal coordinates
- `options` (Object, optional): Options for computing the norm
  - `referenceFrame` (ReferenceFrame): Reference frame to use

**Returns:**
- (BigInt): The coherence norm value

#### `isCanonicalForm(coordinates, options)`

Checks if universal coordinates are in canonical (minimal norm) form.

```javascript
const { isCanonicalForm, toFactorization } = require('math-js').Conversion;

// Check if a factorization is in canonical form
const factors = toFactorization(42);
const isCanonical = isCanonicalForm(factors);
```

**Parameters:**
- `coordinates` (Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>}): Universal coordinates
- `options` (Object, optional): Options for checking canonical form
  - `referenceFrame` (ReferenceFrame): Reference frame to use

**Returns:**
- (boolean): Whether the coordinates are in canonical form

### Advanced Serialization Functions

#### `toJSON(data, options)`

Serializes number data to JSON format with advanced options.

```javascript
const { toJSON, toFactorization } = require('math-js').Conversion;

// Create a factorization
const factors = toFactorization(42);

// Serialize in different formats
const standardJson = toJSON({ value: factors, isFactorization: true });
const compactJson = toJSON({ value: factors, isFactorization: true }, { format: 'compact' });
const binaryJson = toJSON({ value: factors, isFactorization: true }, { format: 'binary' });
```

**Parameters:**
- `data` (Object): The number data to serialize
  - `value` (BigInt|Map<BigInt, BigInt>): The numeric value or prime factorization
  - `isFactorization` (boolean): If true, value is treated as factorization
- `options` (Object, optional): Serialization options
  - `format` ('standard'|'compact'|'binary'|'streaming'): Format to use for serialization
  - `includeMetadata` (boolean): Whether to include additional metadata

**Returns:**
- (string): JSON string representation

#### `fromJSON(json, options)`

Parses a JSON string back to number data with advanced options.

```javascript
const { fromJSON, toJSON, toFactorization } = require('math-js').Conversion;

// Create and serialize a factorization
const factors = toFactorization(42);
const jsonString = toJSON({ value: factors, isFactorization: true });

// Parse it back
const parsed = fromJSON(jsonString);
console.log(parsed.isFactorization); // true
```

**Parameters:**
- `json` (string): The JSON string to parse
- `options` (Object, optional): Parsing options
  - `validateMetadata` (boolean): Whether to validate included metadata

**Returns:**
- (Object): The parsed data with value and isFactorization properties

### High-Efficiency Conversion Pipeline

#### `createConversionPipeline(steps, options)`

Creates a conversion pipeline for processing large sets of numbers.

```javascript
const { createConversionPipeline, convertToUniversalStep, baseConversionStep } = require('math-js').Conversion;

// Create a pipeline for converting decimal to binary
const pipeline = createConversionPipeline([
  convertToUniversalStep(),
  baseConversionStep(2)
]);

// Process a batch of numbers
const results = pipeline([10, 20, 30, 40, 50]);
```

**Parameters:**
- `steps` (Array): Array of conversion steps to apply
- `options` (Object, optional): Pipeline configuration options
  - `parallel` (boolean): Whether to process items in parallel
  - `batchSize` (number): Size of batches for batch processing
  - `preserveFactorization` (boolean): Whether to preserve factorization between steps
  - `streamingOutput` (boolean): Whether to stream output or return all at once

**Returns:**
- (Function): Pipeline function that processes arrays of values

#### `batchConvertBase(values, fromBase, toBase, options)`

Performs batch conversion of an array of values from one base to another.

```javascript
const { batchConvertBase } = require('math-js').Conversion;

// Convert multiple values from decimal to binary
const results = batchConvertBase(['42', '123', '7', '255'], 10, 2);
```

**Parameters:**
- `values` (Array<number|string|BigInt>): Values to convert
- `fromBase` (number): Base of the input values
- `toBase` (number): Base for the output
- `options` (Object, optional): Conversion options
  - `parallel` (boolean): Whether to process in parallel
  - `useFactorization` (boolean): Whether to use factorization for conversion

**Returns:**
- (string[]): Converted values in the target base

#### `streamConvertBase(values, fromBase, toBase, callback, options)`

Stream conversion of values from one base to another.

```javascript
const { streamConvertBase } = require('math-js').Conversion;

// Process conversions with streaming
const values = ['123456789', '987654321', '42424242'];
streamConvertBase(values, 10, 16, (result) => {
  console.log(`Converted to hex: ${result}`);
});
```

**Parameters:**
- `values` (Array<number|string|BigInt>): Values to convert
- `fromBase` (number): Base of the input values
- `toBase` (number): Base for the output
- `callback` (function): Function to call with each converted value
- `options` (Object, optional): Conversion options
  - `parallel` (boolean): Whether to process in parallel
  - `useFactorization` (boolean): Whether to use factorization for conversion

## Performance Considerations

1. **Direct Base Conversion**: For common bases (2, 8, 10, 16), direct conversion shortcuts provide excellent performance. For large numbers or unusual bases, universal coordinate transit ensures accuracy.

2. **Serialization Formats**: Choose the appropriate serialization format based on your needs:
   - Standard format provides the most readable form
   - Compact format reduces storage requirements
   - Binary format provides the most efficient representation
   - Streaming format is ideal for extremely large factorizations

3. **Batch Processing**: Use batch conversion for processing multiple values, which can be significantly faster than sequential conversions.

4. **Pipeline Configuration**: Configure the conversion pipeline based on your specific requirements to balance memory usage and computation speed.

## Examples

### Base Conversion

```javascript
const { convertBase, convertBaseViaUniversal } = require('math-js').Conversion;

// Standard base conversion
const binary = convertBase(42, 10, 2);
console.log(binary); // "101010"

// Converting a medium-sized number using universal coordinates
// Using a smaller number than the original example for compatibility with JS environments
const mediumNumber = "123456789";
const binaryMedium = convertBaseViaUniversal(mediumNumber, 10, 2, {
  useDirectComputation: true
});
console.log(binaryMedium); // "111010110111100110100010101"

// Direct conversion between binary and hexadecimal
const binary2 = "1010110111001010";
const hex = convertBaseViaUniversal(binary2, 2, 16, {
  useFactorizationShortcuts: true
});
console.log(hex); // "adca"

// Binary to octal direct conversion
const binaryStr = "111010101001";
const octal = convertBaseViaUniversal(binaryStr, 2, 8, {
  useFactorizationShortcuts: true
});
console.log(octal); // "7251"
```

### Reference Frames and Universal Coordinates

```javascript
const { 
  createReferenceFrame, 
  toFactorization,
  coherenceInnerProduct,
  coherenceNorm,
  isCanonicalForm
} = require('math-js').Conversion;

// Create factorizations for two numbers with known prime factors
const factors1 = toFactorization(12); // 2^2 * 3
const factors2 = toFactorization(18); // 2 * 3^2

// Calculate coherence metrics
const innerProduct = coherenceInnerProduct(factors1, factors2);
console.log(`Inner product: ${innerProduct}`); // 4 (2*1 + 1*2 = 4)

const norm1 = coherenceNorm(factors1);
console.log(`Norm of 12: ${norm1}`); // 5 (2^2 + 1^2 = 5)

const norm2 = coherenceNorm(factors2);
console.log(`Norm of 18: ${norm2}`); // 5 (1^2 + 2^2 = 5)

// Verify canonical form - should be true since these are optimal representations
console.log(`12 in canonical form: ${isCanonicalForm(factors1)}`); // true

// Create a reference frame with custom parameters
const customFrame = createReferenceFrame({
  id: 'custom',
  parameters: { rotationAngle: 45 }
});

// Get the canonical reference frame
const canonicalFrame = createReferenceFrame();

// Transform coordinates between frames
// Note: In the current implementation, this maintains the same factorization
// as all reference frames share the same universal coordinate system
const transformed = customFrame.transform(factors1, canonicalFrame);
```

### Serialization

```javascript
const { toJSON, fromJSON, toFactorization } = require('math-js').Conversion;

// Create a factorization for the number 42 = 2 * 3 * 7
const factors = toFactorization(42);

// Standard format serialization - detailed object format
const standardJson = toJSON({ value: factors, isFactorization: true });
console.log(standardJson);
// {"type":"Factorization","factors":{"2":"1","3":"1","7":"1"}}

// Compact format serialization - array-based format for smaller size
const compactJson = toJSON(
  { value: factors, isFactorization: true },
  { format: 'compact' }
);
console.log(compactJson);
// {"type":"CompactFactorization","primes":["2","3","7"],"exponents":["1","1","1"]}

// Binary format serialization - base64 encoded for maximum efficiency
const binaryJson = toJSON(
  { value: factors, isFactorization: true },
  { format: 'binary' }
);
console.log(binaryJson);
// {"type":"BinaryFactorization","encoding":"base64","data":"..."}

// Deserialize from standard format
const parsed = fromJSON(standardJson);
console.log(`Number of factors: ${parsed.value.size}`); // 3

// Include metadata in serialization
const jsonWithMetadata = toJSON(
  { value: factors, isFactorization: true },
  { includeMetadata: true }
);

// Parse with metadata validation
const parsedWithMetadata = fromJSON(jsonWithMetadata, { validateMetadata: true });
console.log(`Metadata format: ${parsedWithMetadata.metadata.format}`); // "standard"
console.log(`Prime count: ${parsedWithMetadata.metadata.primeCount}`); // 3
```

### Conversion Pipeline

```javascript
const { 
  createConversionPipeline, 
  convertToUniversalStep, 
  baseConversionStep,
  batchConvertBase,
  streamConvertBase
} = require('math-js').Conversion;

// Creating a custom pipeline for decimal to hexadecimal conversion
const pipeline = createConversionPipeline([
  // Step 1: Convert inputs to universal coordinates
  convertToUniversalStep(),
  // Step 2: Convert from universal coordinates to hexadecimal
  baseConversionStep(16)
], {
  // Configure pipeline options
  parallel: true,        // Process in parallel when possible
  batchSize: 100,        // Process in batches of 100 items
  preserveFactorization: true  // Keep factorization between steps
});

// Process a batch of decimal numbers
const results = pipeline([10, 20, 30, 40, 50]);
console.log(results); // ["a", "14", "1e", "28", "32"]

// Use the built-in batch conversion utility for decimal to binary
const batchResults = batchConvertBase(['42', '123', '255'], 10, 2);
console.log(batchResults); 
// ["101010", "1111011", "11111111"]

// Use streaming conversion for memory-efficient processing
const collectedResults = [];
streamConvertBase(
  ['42', '123', '255'], 
  10, 
  16,
  (result) => collectedResults.push(result)
);
console.log(collectedResults); // ["2a", "7b", "ff"]
```

## Extended Base Support

The library now supports configurable numeric base conversion beyond the standard JavaScript limit of base-36. This enhancement allows for representation of numbers in higher bases, which can be useful for various applications including:

1. More compact string representation of large numbers
2. Custom encoding schemes requiring higher bases
3. Specialized algorithms optimized for specific base representations

### Usage

By default, the library maintains compatibility with JavaScript's native behavior, allowing bases between 2 and 36. To extend this range:

```javascript
const { UniversalNumber, configure } = require('math-js')

// Configure library for extended base support
configure({
  conversion: {
    maxBase: 62  // Supports bases up to 62 (0-9, a-z, A-Z)
  }
})

// Create a universal number
const number = new UniversalNumber(12345)

// Convert to higher bases
console.log(number.toString(50))  // Base-50 representation
console.log(number.toString(62))  // Base-62 representation

// Parse strings in higher bases
const fromHighBase = new UniversalNumber('Za', 62)  // 'Za' in base-62
console.log(fromHighBase.toNumber())  // Outputs the decimal value
```

### Character Set

For bases 2-36, the standard digit set `0-9a-z` is used, maintaining compatibility with JavaScript's native `toString()` and `parseInt()` behavior.

For bases 37-62, the digit set is extended with uppercase letters `A-Z`. The complete digit set for base-62 is:

```
0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
```

### Configuration Options

The following configuration options control base conversion behavior:

```javascript
configure({
  conversion: {
    minBase: 2,     // Minimum allowed base (default: 2)
    maxBase: 62,    // Maximum allowed base (default: 36)
    defaultBase: 10 // Default base when not specified (default: 10)
  }
})
```

### Limitations

- The current implementation supports bases up to 62 using alphanumeric characters
- For bases beyond 62, a custom character set would need to be defined
- All base conversions support arbitrarily large numbers through BigInt