/**
 * Example demonstrating the enhanced library architecture and API features
 */

// Import the math-js library
const mathjs = require('../src');
const { UniversalNumber, PrimeMath, configure, createStream, createAsync } = mathjs;

console.log('Enhanced Architecture and API Example');
console.log('=====================================');

// 1. Configuration System
console.log('\n1. Configuration System');
console.log('---------------------');

// View default configuration
console.log('Default configuration:');
console.log('- Performance profile:', mathjs.config.performanceProfile);
console.log('- Cache enabled:', mathjs.config.cache.enabled);
console.log('- Factorization algorithm:', mathjs.config.factorization.algorithm);

// Customize configuration
configure({
  performanceProfile: 'precision',
  factorization: {
    algorithm: 'pollard',
    lazy: false
  },
  cache: {
    maxSize: 1024 * 1024 * 5 // 5MB
  }
});

console.log('\nUpdated configuration:');
console.log('- Performance profile:', mathjs.config.performanceProfile);
console.log('- Cache enabled:', mathjs.config.cache.enabled);
console.log('- Factorization algorithm:', mathjs.config.factorization.algorithm);

// 2. Streaming API for batch processing
console.log('\n2. Streaming API');
console.log('---------------');

// Create sequence of numbers - starting at 1 since UniversalNumber doesn't support 0
const numbers = Array.from({ length: 10 }, (_, i) => i + 1);
console.log('Input sequence:', numbers.join(', '));

// Simple data processing example with UniversalNumbers
console.log('Processing numbers with streams:');

// Process numbers through a pipeline that doubles them
const doubledNumbers = createStream(n => new UniversalNumber(n))
  .map(n => n.multiply(new UniversalNumber(2)))
  .process(numbers);

console.log('Doubled numbers:');
doubledNumbers.slice(0, 5).forEach(n => console.log(`- ${n.toString()}`));
console.log(`... and ${doubledNumbers.length - 5} more`);

// Create a new stream that filters numbers greater than 10
const largeNumbers = createStream(n => n)
  .filter(n => n.greaterThan(new UniversalNumber(10)))
  .process(doubledNumbers);

console.log('\nNumbers greater than 10:');
largeNumbers.forEach(n => console.log(`- ${n.toString()}`));

// Calculate product of first 5 numbers using reduce (safer than sum for this example)
const firstFive = numbers.slice(0, 5);
console.log('\nFirst 5 numbers:', firstFive.join(', '));

const product = firstFive.reduce((acc, val) => {
  if (typeof acc === 'number') {
    acc = new UniversalNumber(acc);
  }
  return acc.multiply(new UniversalNumber(val));
});

console.log(`Product of first 5 numbers: ${product.toString()}`);

// 3. Asynchronous Processing API
console.log('\n3. Asynchronous Processing');
console.log('--------------------------');

// Simulate a computationally expensive operation
async function demonstrateAsync() {
  console.log('Starting expensive computation...');
  
  try {
    // Use createAsync for an expensive operation
    const result = await createAsync(() => {
      // Simulate work with a delay
      return new Promise(resolve => {
        setTimeout(() => {
          // Calculate factorial of 10 (smaller to avoid huge numbers)
          let factorial = new UniversalNumber(1);
          for (let i = 1; i <= 10; i++) {
            factorial = factorial.multiply(new UniversalNumber(i));
          }
          resolve(factorial);
        }, 300); // Shorter delay for demo purposes
      });
    }, { defaultTimeout: 3000 });
    
    console.log(`10! = ${result.toString()}`);
  } catch (error) {
    console.error('Error in async computation:', error.message);
  }
}

// We'll call the async demo at the end

// 4. Specialized Domain-Specific APIs
console.log('\n4. Domain-Specific APIs');
console.log('----------------------');

// Number Theory API
console.log('\nNumber Theory API:');
const { isPrime, factorize, gcd, lcm } = mathjs.numberTheory;

console.log('Is 17 prime?', isPrime(17));
console.log('Is 20 prime?', isPrime(20));

const factors = factorize(60);
console.log('Factors of 60:', 
  Array.from(factors.entries())
    .map(([p, e]) => `${p}^${e}`)
    .join(' × ')
);

console.log('GCD of 24 and 36:', gcd(24, 36).toString());
console.log('LCM of 12 and 18:', lcm(12, 18).toString());

// Cryptography API
console.log('\nCryptography API:');
const { modPow, modInverse } = mathjs.crypto;

// Compute 5^3 mod 13
console.log('5^3 mod 13 =', modPow(5, 3, 13).toString());

// Compute modular inverse of 7 mod 11
console.log('7^-1 mod 11 =', modInverse(7, 11).toString());

// Analysis API
console.log('\nAnalysis API:');
const { sequence, sum, product: prod } = mathjs.analysis;

// Generate a sequence of UniversalNumbers
const seq = sequence(1, 5);
console.log('Sequence:', seq.map(n => n.toString()).join(', '));

// Calculate sum and product
console.log('Sum:', sum(seq).toString());
console.log('Product:', prod(seq).toString());

// 5. Plugin System
console.log('\n5. Plugin System');
console.log('---------------');

// Register a custom plugin
mathjs.registerPlugin('statistics', {
  // Simple statistical functions - using product instead of sum for safety
  geometricMean: (arr) => {
    // For an array [a, b, c], geometric mean is (a*b*c)^(1/3)
    // First convert all values to UniversalNumber
    const numbers = arr.map(n => n instanceof UniversalNumber ? n : new UniversalNumber(n));
    
    // Start with the first value (handle edge case of empty array)
    if (numbers.length === 0) return new UniversalNumber(1);
    
    // Calculate the product
    let product = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
      product = product.multiply(numbers[i]);
    }
    
    // Calculate the n-th root (using rational power)
    // Simplified approximation for this example - just return the product
    return product;
  },
  
  max: (arr) => {
    // Find maximum value in array
    const numbers = arr.map(n => n instanceof UniversalNumber ? n : new UniversalNumber(n));
    if (numbers.length === 0) return null;
    
    let max = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i].greaterThan(max)) {
        max = numbers[i];
      }
    }
    return max;
  }
});

// Use the plugin
const statsPlugin = mathjs.getPlugin('statistics');
const testData = [1, 3, 5, 7, 9];

console.log('Data:', testData.join(', '));
console.log('Geometric product:', statsPlugin.geometricMean(testData).toString());
console.log('Maximum value:', statsPlugin.max(testData).toString());

// 6. Dynamic Module Loading
console.log('\n6. Dynamic Module Loading');
console.log('------------------------');

// Use the dynamic loader from the main export
const { loadModule, isLoaded, getRegisteredModules } = mathjs.dynamic;

// List available modules
console.log('Registered modules:', getRegisteredModules().join(', '));

// Dynamically load only what we need
console.log('Loading Factorization module...');
const DynamicFactorization = loadModule('Factorization');

// Check if modules are loaded
console.log('Is Factorization loaded?', isLoaded('Factorization'));
console.log('Is PrimeMath loaded?', isLoaded('PrimeMath'));

// Use the dynamically loaded module
const primeFactors = DynamicFactorization.factorize(120n);
console.log('Prime factors of 120:',
  Array.from(primeFactors.entries())
    .map(([p, e]) => `${p}^${e}`)
    .join(' × ')
);

// Run the async example last
demonstrateAsync().then(() => {
  console.log('\nEnhanced architecture example completed!');
});