/**
 * UOR Math-JS Library
 * A JavaScript implementation of the Prime Framework for universal number representation
 */

const UniversalNumber = require('./UniversalNumber');
const PrimeMath = require('./PrimeMath');

// Primary exports
module.exports = {
  UniversalNumber,
  PrimeMath
};

// Optional - Export utility modules for advanced usage
// These are internal APIs that could be useful for specialized applications
module.exports.internal = {
  Factorization: require('./Factorization'),
  Conversion: require('./Conversion'),
  Utils: require('./Utils')
};