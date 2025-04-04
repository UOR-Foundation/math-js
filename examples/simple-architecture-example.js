/**
 * Simple example demonstrating the enhanced library architecture
 */

const mathjs = require('@uor-foundation/math-js');
const { UniversalNumber } = mathjs;

console.log('Enhanced Architecture Example (Simplified)');
console.log('=========================================');

// 1. Configuration System
console.log('\n1. Configuration System');
console.log('---------------------');

// View default configuration
console.log('Default configuration:');
console.log('- Performance profile:', mathjs.config.performanceProfile);
console.log('- Factorization algorithm:', mathjs.config.factorization.algorithm);

// Update configuration
mathjs.configure({
  performanceProfile: 'precision',
  factorization: {
    algorithm: 'pollard'
  }
});

console.log('\nUpdated configuration:');
console.log('- Performance profile:', mathjs.config.performanceProfile);
console.log('- Factorization algorithm:', mathjs.config.factorization.algorithm);

// 2. Plugin System
console.log('\n2. Plugin System');
console.log('---------------');

// Register a simple plugin
mathjs.registerPlugin('multiply', {
  // Simple multiply function
  byTwo: (n) => {
    const num = new UniversalNumber(n);
    return num.multiply(new UniversalNumber(2));
  },
  
  byThree: (n) => {
    const num = new UniversalNumber(n);
    return num.multiply(new UniversalNumber(3));
  }
});

// Use the plugin
const plugin = mathjs.getPlugin('multiply');
console.log('Using plugin:');
console.log('5 × 2 =', plugin.byTwo(5).toString());
console.log('5 × 3 =', plugin.byThree(5).toString());

// 3. Dynamic Module Loading
console.log('\n3. Dynamic Module Loading');
console.log('------------------------');

const { loadModule, isLoaded } = mathjs.dynamic;

// List registered modules
console.log('Registered modules:', mathjs.dynamic.getRegisteredModules().join(', '));

// Load a module dynamically
console.log('\nLoading Utils module:');
if (isLoaded('Utils')) {
  console.log('Utils module already loaded');
} else {
  const Utils = loadModule('Utils');
  console.log('Utils module loaded successfully');
}

// 4. Domain-Specific APIs
console.log('\n4. Domain-Specific APIs');
console.log('----------------------');

// Number Theory API
const { isPrime } = mathjs.numberTheory;
console.log('Number theory API:');
console.log('Is 17 prime?', isPrime(17));
console.log('Is 25 prime?', isPrime(25));

// Create Universal Numbers for testing
const a = new UniversalNumber(12);
const b = new UniversalNumber(15);

console.log('\nUniversalNumber operations:');
console.log('12 + 15 =', a.add(b).toString());
console.log('12 × 15 =', a.multiply(b).toString());
console.log('15 ÷ 3 =', b.divide(new UniversalNumber(3)).toString());
console.log('12 gcd 15 =', mathjs.numberTheory.gcd(a, b).toString());
console.log('12 lcm 15 =', mathjs.numberTheory.lcm(a, b).toString());

// Factorization
const c = new UniversalNumber(180);
const factors = c.getFactorization();
console.log('\nFactors of 180:', 
  Array.from(factors.entries())
    .map(([prime, exponent]) => `${prime}^${exponent}`)
    .join(' × '));

console.log('\nEnhanced architecture example completed!');