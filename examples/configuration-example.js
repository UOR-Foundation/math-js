/**
 * Configuration example for the math-js library
 * Demonstrates how to use the global configuration system to optimize library behavior
 */

// Import the library
const math = require('../src/index');

console.log('Math-JS Configuration Example');
console.log('=============================');

// Display current (default) configuration
console.log('\n1. Current default configuration:');
console.log('Prime cache size:', math.config.cache.maxPrimeCacheSize);
console.log('Factorization cache size:', math.config.cache.maxFactorizationCacheSize);
console.log('Performance profile:', math.config.performanceProfile);

// Update configuration for speed
console.log('\n2. Updating configuration for speed optimization:');
math.configure({
  performanceProfile: 'speed',
  cache: {
    maxSize: 1024 * 1024 * 20, // 20MB
    maxPrimeCacheSize: 200000  // Larger prime cache
  }
});

// Display the updated configuration
console.log('New prime cache size:', math.config.cache.maxPrimeCacheSize);
console.log('New performance profile:', math.config.performanceProfile);

// Example computation with optimized settings
console.log('\n3. Performing computation with optimized settings:');
const largeNumber = math.crypto.randomPrime(512);
console.log(`Generated a 512-bit prime number: ${largeNumber.toString().substring(0, 20)}...`);

// Time a factorization operation on a composite number
console.log('\n4. Timing a factorization operation:');
const start = Date.now();
const composite = largeNumber.multiply(math.crypto.randomPrime(256));
const factorizationResult = math.numberTheory.factorize(composite);

console.log(`Factorization completed in ${Date.now() - start}ms`);
console.log('Factorization result:');
for (const [prime, exponent] of factorizationResult.entries()) {
  console.log(`  ${prime} ^ ${exponent}`);
}

// Configure for memory optimization
console.log('\n5. Configuring for memory optimization:');
math.configure({
  memory: {
    optimizeMemory: true,
    useCompactRepresentation: true
  },
  cache: {
    maxPrimeCacheSize: 10000,
    maxFactorizationCacheSize: 500
  }
});

console.log('Memory optimization enabled:', math.config.memory.optimizeMemory);
console.log('Reduced prime cache size:', math.config.cache.maxPrimeCacheSize);

// Reset configuration to defaults
console.log('\n6. Resetting configuration to defaults:');
math.resetConfig();
console.log('Reset prime cache size:', math.config.cache.maxPrimeCacheSize);
console.log('Reset performance profile:', math.config.performanceProfile);

// Create a custom performance profile
console.log('\n7. Creating a custom configuration profile:');
const customProfile = {
  performanceProfile: 'balanced',
  cache: {
    maxPrimeCacheSize: 50000,
    maxFactorizationCacheSize: 800
  },
  factorization: {
    completeSizeLimit: 150,
    algorithm: 'pollard'
  },
  primalityTesting: {
    millerRabinRounds: 30
  }
};

math.configure(customProfile);
console.log('Custom profile applied successfully.');
console.log('Current factorization algorithm:', math.config.factorization.algorithm);
console.log('Current primality testing rounds:', math.config.primalityTesting.millerRabinRounds);

console.log('\nConfiguration example completed.');