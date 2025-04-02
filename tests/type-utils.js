/**
 * TypeScript helper functions to work with Map<BigInt, BigInt> or objects with factorization property
 */

/**
 * Helper function to cast a factorization result to Map for TypeScript
 * 
 * @param {Map<BigInt, BigInt>|{factorization: Map<BigInt, BigInt>, isNegative: boolean}} factorization 
 * @returns {Map<BigInt, BigInt>}
 */
function asFactorizationMap(factorization) {
  if (factorization instanceof Map) {
    return factorization
  }
  
  // Must be an object with factorization property
  if (factorization && typeof factorization === 'object' && 'factorization' in factorization) {
    return factorization.factorization
  }
  
  // Unknown format, return as is and let runtime error happen if not a map
  return /** @type {Map<BigInt, BigInt>} */ (factorization)
}

module.exports = {
  asFactorizationMap
}