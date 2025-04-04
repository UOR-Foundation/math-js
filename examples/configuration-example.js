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
// Create a number for testing
const largeNumber = math.UniversalNumber.fromNumber(123456789);
console.log(`Using number: ${largeNumber.toString()}`);

// Time a factorization operation
console.log('\n4. Timing a factorization operation:');
const start = Date.now();
// Create a composite number with known factors
const factor1 = math.UniversalNumber.fromNumber(12345);
const factor2 = math.UniversalNumber.fromNumber(67890);
const composite = factor1.multiply(factor2);
console.log(`Factorizing composite number: ${composite.toString()}`);
const factorizationResult = math.UniversalNumber.factorize(composite).getFactorization();

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
    algorithm: 'pollard',
    // Configure factorization method thresholds
    thresholds: {
      // Use simple trial division for numbers up to 8 digits
      trialDivision: 8,
      // Use optimized trial division up to 16 digits
      optimizedTrialDivision: 16,
      // Use Pollard's Rho algorithm up to 30 digits
      pollardRho: 30,
      // Use ECM for numbers up to 60 digits
      ecm: 60
    }
  },
  primalityTesting: {
    millerRabinRounds: 30
  }
};

math.configure(customProfile);
console.log('Custom profile applied successfully.');
console.log('Current factorization algorithm:', math.config.factorization.algorithm);
console.log('Current primality testing rounds:', math.config.primalityTesting.millerRabinRounds);

// Show factorization thresholds
console.log('\n8. Configured factorization method thresholds:');
const factConfig = math.getConfig().factorization;
console.log('Trial division threshold:', factConfig.thresholds.trialDivision, 'digits');
console.log('Optimized trial division threshold:', factConfig.thresholds.optimizedTrialDivision, 'digits');
console.log('Pollard\'s Rho threshold:', factConfig.thresholds.pollardRho, 'digits');
console.log('Elliptic Curve Method threshold:', factConfig.thresholds.ecm, 'digits');
console.log('Quadratic Sieve threshold:', factConfig.thresholds.quadraticSieve, 'digits');

console.log('\nConfiguration example completed.');