# UOR Foundation Math-JS Repository Specification

## 1. Overview

**Math-JS** is a JavaScript library that implements the Prime Framework by representing each natural number as a **UniversalNumber**. In this design, every number is stored in its unique canonical form via its prime factorization (its “universal coordinates”). This approach guarantees lossless arithmetic, exact conversions, and deep interoperability with standard numeral systems. The repository is organized to provide:

- A **core class** (`UniversalNumber`) that encapsulates universal coordinates and associated arithmetic.
- A suite of **utility modules** for factorization, conversion, and advanced number-theoretic operations.
- A familiar API mimicking standard JavaScript math interfaces (like `Math` and `BigInt`), while exposing advanced functionality.
- Comprehensive tests and documentation to ensure correctness, precision, and ease of use.

---

## 2. Repository Structure

A pragmatic structure is used to separate core functionality, utilities, tests, and documentation:

```
math-js/
├── src/
│   ├── index.js                # Entry point that exports the library's public API.
│   ├── UniversalNumber.js      # Core class for universal number representation.
│   ├── PrimeMath.js            # Static arithmetic operations and prime-based functions.
│   ├── Factorization.js        # Internal algorithms for prime factorization (trial division, etc.).
│   ├── Conversion.js           # Functions to convert to/from BigInt, Number, String, and digit arrays.
│   └── Utils.js                # Helper functions (fast exponentiation, divisibility checks, etc.).
├── tests/
│   ├── universalNumber.test.js # Unit tests for UniversalNumber and its methods.
│   ├── primeMath.test.js       # Tests for arithmetic operations (gcd, lcm, intrinsic prime tests, etc.).
│   └── conversion.test.js      # Tests for conversion functions and round-trip consistency.
├── examples/
│   └── usage-example.md        # Step-by-step usage examples and API demonstration.
├── docs/
│   └── API.md                  # Detailed API documentation (generated or manually maintained).
├── package.json                # NPM package specification, scripts, dependencies, etc.
├── README.md                 # Overview, installation, usage instructions, and high-level documentation.
├── LICENSE                   # Open-source license (e.g., MIT).
└── .gitignore                # Standard ignore file for node_modules, logs, etc.
```

---

## 3. Core Modules & Detailed Specifications

### 3.1 index.js

- **Purpose:**  
  Serves as the main entry point for the library, exposing the public API in a clean, organized manner.
- **Key Features:**
  - Exports the `UniversalNumber` class and `PrimeMath` namespace as the primary public interfaces.
  - May also export utility functions from other modules as needed.
  - Provides a single import point for consumers of the library.
- **Design Rationale:**  
  Follows standard JavaScript module practices to ensure the library is easy to use and integrate into existing projects.

### 3.2 UniversalNumber.js

- **Purpose:**  
  Provides the `UniversalNumber` class that represents any natural number using its universal coordinate tuple (prime factorization).  
- **Key Features:**
  - **Constructor & Factory Methods:**  
    - `new UniversalNumber(value)` or static constructors like `UniversalNumber.fromNumber()`, `fromBigInt()`, and `fromString()`.
    - Internally factorizes the input value to obtain the canonical representation.
  - **Arithmetic Methods:**  
    - `add(b)`, `subtract(b)`: Perform addition/subtraction by converting operands to a BigInt, computing the result, then re-factorizing.
    - `multiply(b)`, `divide(b)`: For multiplication, merge prime exponent maps by addition; for division, subtract exponents if the division is exact.
    - `pow(n)`: Scales each prime’s exponent by `n`.
  - **Utility Methods:**  
    - `isIntrinsicPrime()`: Checks whether the number is prime (i.e., its factorization consists of a single prime with exponent 1).
    - `gcd(b)`, `lcm(b)`: Compute greatest common divisor and least common multiple based on the minimum/maximum exponents.
  - **Conversion Methods:**  
    - `toBigInt()`, `toNumber()`, and `toString(base)`: Reconstruct the numeric value or string representation by multiplying out the prime powers.
    - `getCoordinates()`: Returns an object or array representing the prime-exponent pairs.
  - **Internal Invariants:**  
    - Enforces canonical form by immediately normalizing any arithmetic result to the unique minimal-norm representation.
- **Design Rationale:**  
  Directly follows the universal number notation described in the specification, ensuring that every number is a point in an infinite-dimensional space (with almost all coordinates zero).

---

### 3.3 PrimeMath.js

- **Purpose:**  
  Provides a namespace (or static class) with advanced arithmetic and number theory functions.
- **Key Features:**
  - Static functions for arithmetic operations: `PrimeMath.add(a, b)`, `PrimeMath.multiply(a, b)`, etc.
  - Functions for computing **gcd** and **lcm** via prime exponent comparisons.
  - Optional prime generation utilities (e.g., `PrimeMath.nextPrime(after)`).
  - Intrinsic primality tests that leverage both classical algorithms (like Miller–Rabin) and the known factorization in a `UniversalNumber`.
- **Design Rationale:**  
  Separates general-purpose number-theoretic operations from the core representation, allowing reuse in different contexts.

---

### 3.4 Factorization.js

- **Purpose:**  
  Contains algorithms for converting a conventional integer into its universal coordinates.
- **Key Features:**
  - Implements **Algorithm 1** (from the specification) for prime factorization via trial division.
  - Provides hooks for more advanced algorithms (e.g., Pollard’s Rho) for large numbers.
  - Exposes a function like `factorize(n: BigInt): Map<prime, exponent>`.
- **Design Rationale:**  
  Factorization is the computational bottleneck but is essential for creating universal coordinates. The module abstracts this process so that different algorithms can be swapped in based on input size.

---

### 3.5 Conversion.js

- **Purpose:**  
  Offers utility functions to convert between `UniversalNumber` and standard numeric representations.
- **Key Features:**
  - `fromString(str, base)`: Parses a numeral in any base and returns a `UniversalNumber`.
  - `toString(base)`: Converts a `UniversalNumber` to its base‑B digit representation.
  - `getDigits(base)`: Returns the digit array without converting fully to a BigInt.
  - Round-trip conversion verification to ensure that converting back and forth preserves the number.
- **Design Rationale:**  
  Ensures full interoperability with JavaScript’s native types and numeral systems, reflecting the “interoperability with standard numeral systems” section of the specification.

---

### 3.6 Utils.js

- **Purpose:**  
  Contains helper functions that support the other modules.
- **Key Features:**
  - Fast exponentiation (e.g., exponentiation by squaring) used in `UniversalNumber.toBigInt()`.
  - Divisibility checks, modulo operations, and any other low-level arithmetic helpers.
  - Error handling functions that throw custom errors (e.g., `PrimeMathError`) when operations (like non-exact division) are attempted.
- **Design Rationale:**  
  Modularizes common logic and promotes code reuse across the repository.

---

## 4. Testing and Documentation

### 4.1 Tests

- **Testing Framework:**  
  Use Jest, Mocha, or a similar testing library.
- **Test Coverage:**  
  - **UniversalNumber Tests:** Verify correct factorization, arithmetic operations, conversion integrity, and error handling.
  - **PrimeMath Tests:** Validate all static arithmetic functions (gcd, lcm, nextPrime, etc.) with both typical and edge-case inputs.
  - **Conversion Tests:** Ensure that round-trip conversions (e.g., Number → UniversalNumber → Number) are lossless.

### 4.2 Documentation

- **README.md:**  
  Provides an overview of the library, installation instructions (e.g., via npm), and basic usage examples.
- **API Documentation (docs/API.md):**  
  Details all classes and methods, including parameter types, return types, and examples.
- **Examples:**  
  The `examples/usage-example.md` file contains practical code snippets demonstrating common tasks like creating universal numbers, performing arithmetic, and converting between representations.

---

## 5. Package and Contribution Details

- **package.json:**  
  Contains all metadata, dependencies (e.g., for testing or advanced math utilities), and scripts for building and testing.
- **LICENSE:**  
  Specifies the open-source license (for example, MIT).
- **.gitignore:**  
  Lists files and directories to be ignored (e.g., node_modules, logs).

### Contribution Guidelines (Optional)
- A `CONTRIBUTING.md` file may be added to outline coding standards, pull request procedures, and issue tracking practices.
- Use of automated testing and linting (e.g., ESLint) is encouraged to maintain code quality.

---

## 6. Design Alignment with the Prime Framework

Every module is built to ensure that:

- **Universality and Canonical Representation:**  
  Each number is stored as its unique prime coordinate tuple, reflecting the Fundamental Theorem of Arithmetic.
- **Exact Arithmetic:**  
  Operations on `UniversalNumber` guarantee no rounding errors because they work on prime exponent maps.
- **Interoperability:**  
  Conversion utilities allow seamless translation between the universal format and standard numeral systems, ensuring developers can use the library with existing JavaScript code.
- **Performance Considerations:**  
  While factorization can be computationally expensive, the library uses lazy or optimized strategies for large numbers (and allows for pluggable algorithms).

This core repo specification ensures that **math-js** is both theoretically rigorous (as per the Universal Coordinate System Specification) and pragmatically useful in real-world JavaScript applications.

---

This specification document should serve as a blueprint for building and maintaining the **UOR Foundation Math-JS** repository. It outlines all core components and their responsibilities while ensuring that the implementation remains true to the advanced mathematical foundations of the Prime Framework.