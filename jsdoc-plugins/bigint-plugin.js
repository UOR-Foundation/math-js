/**
 * JSDoc plugin to handle BigInt serialization
 */

exports.handlers = {
  /**
   * Converts BigInt values in DocComments to strings
   */
  parseBegin: function() {
    // Save the original JSON.stringify
    const originalStringify = JSON.stringify;
    
    // Override JSON.stringify to handle BigInt values
    JSON.stringify = function(value) {
      return originalStringify(value, (_, v) => {
        // Convert BigInt to string
        if (typeof v === 'bigint') {
          return v.toString() + 'n';
        }
        return v;
      });
    };
  }
};