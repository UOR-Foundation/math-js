/**
 * Example demonstrating the Prime Framework enhancements to the UniversalNumber class
 */

const { UniversalNumber } = require('../src');

console.log('Prime Framework Enhancements Example');
console.log('====================================');

// Create UniversalNumbers using different methods
const a = new UniversalNumber(12);  // 2^2 * 3
const b = new UniversalNumber(18);  // 2 * 3^2

console.log('\n1. Coherence Inner Product and Norm');
console.log('--------------------------------');

// Calculate the coherence inner product
const innerProduct = UniversalNumber.innerProduct(a, b);
console.log(`Inner product of ${a} and ${b}: ${innerProduct}`);

// Calculate coherence norms
const normA = a.coherenceNorm();
console.log(`Coherence norm of ${a}: ${normA}`);

const normB = b.coherenceNorm();
console.log(`Coherence norm of ${b}: ${normB}`);

// Calculate coherence distance
const distance = a.coherenceDistance(b);
console.log(`Coherence distance between ${a} and ${b}: ${distance}`);

// Check minimal norm status
console.log(`Is ${a} in minimal norm form? ${a.isMinimalNorm()}`);

console.log('\n2. Fiber Algebra and Reference Frames');
console.log('----------------------------------');

// Get the active reference frame
console.log(`Active reference frame: ${UniversalNumber.getActiveReferenceFrame()}`);

// Register a new reference frame
UniversalNumber.registerReferenceFrame({
  id: 'custom-frame',
  transformationRules: {},
  description: 'Custom reference frame for demonstration'
});

// Switch to the new frame
UniversalNumber.setActiveReferenceFrame('custom-frame');
console.log(`Active reference frame after switch: ${UniversalNumber.getActiveReferenceFrame()}`);

// Get graded components
const number = new UniversalNumber(42);
const components = number.getGradedComponents({
  bases: [2, 10, 16]
});

console.log(`Graded components of ${number}:`);
console.log(`  Base 2 (binary): [${components.get(2).join(', ')}]`);
console.log(`  Base 10 (decimal): [${components.get(10).join(', ')}]`);
console.log(`  Base 16 (hex): [${components.get(16).join(', ')}]`);

// Transform to another frame
const transformed = number.transformToFrame('standard');
console.log(`${number} transformed to standard frame: ${transformed}`);

// Switch back to standard frame for the rest of the examples
UniversalNumber.setActiveReferenceFrame('standard');

console.log('\n3. Lazy Evaluation and Operation Fusion');
console.log('------------------------------------');

// Create a lazy UniversalNumber
let computationPerformed = false;
const lazyNumber = UniversalNumber.lazy(() => {
  computationPerformed = true;
  return new UniversalNumber(123);
});

console.log(`Has computation been performed? ${computationPerformed}`);
console.log(`Lazy number value: ${lazyNumber}`);
console.log(`Has computation been performed now? ${computationPerformed}`);

// Operation fusion
const operations = [
  num => num.multiply(2),   // × 2
  num => num.add(10),       // + 10
  num => num.subtract(5)    // - 5
];

const fusedResult = UniversalNumber.fuse(operations, 10);
console.log(`Result of fused operations (10 × 2 + 10 - 5): ${fusedResult}`);

console.log('\n4. Memory Optimization');
console.log('--------------------');

// Create a compact representation
const compact = number.toCompact();
console.log('Compact representation:', compact);

// Recreate from compact form
const recreated = UniversalNumber.fromCompact(compact);
console.log(`Recreated from compact: ${recreated}`);

// Partial factorization
const partial = UniversalNumber.fromPartialFactorization({
  knownFactors: [
    { prime: 2, exponent: 3 },  // 2^3 = 8
    { prime: 3, exponent: 2 }   // 3^2 = 9
  ],
  remainingPart: 11  // A prime number
});

console.log(`Number with partial factorization: ${partial}`);
console.log('Complete factorization:', partial.getFactorization());

console.log('\n5. Advanced Number-Theoretic Operations');
console.log('------------------------------------');

// Modular square root
const square = new UniversalNumber(4);
const modulus = new UniversalNumber(7);

const sqrt = square.modSqrt(modulus);
if (sqrt) {
  console.log(`√${square} mod ${modulus} = ${sqrt}`);
  
  // Verify the result
  const verification = sqrt.multiply(sqrt).mod(modulus);
  console.log(`Verification: ${sqrt}² mod ${modulus} = ${verification}`);
} else {
  console.log(`√${square} mod ${modulus} does not exist`);
}

// Fast multiplication
const num1 = UniversalNumber.fromFactors([
  { prime: 2, exponent: 2 },  // 2^2 = 4
  { prime: 3, exponent: 1 }   // 3^1 = 3
]); // num1 = 12

const num2 = UniversalNumber.fromFactors([
  { prime: 2, exponent: 1 },  // 2^1 = 2
  { prime: 5, exponent: 1 }   // 5^1 = 5
]); // num2 = 10

const fastProduct = UniversalNumber.fastMultiply(num1, num2);
console.log(`${num1} × ${num2} = ${fastProduct} (using fast multiplication)`);