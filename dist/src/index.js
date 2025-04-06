/**
 * UOR Math-JS Library
 * A JavaScript implementation of the Prime Framework for universal number representation
 * @module math-js
 */
const UniversalNumber = require('./UniversalNumber');
const PrimeMath = require('./PrimeMath');
const Factorization = require('./Factorization');
const Conversion = require('./Conversion');
const Utils = require('./Utils');
// Import central configuration system
const configSystem = require('./config');
// Import dynamic loader
const dynamicLoader = require('./dynamicLoader');
/**
 * Update configuration with custom settings
 * @param {Object} options - Configuration options to update
 * @returns {Object} The updated configuration object
 */
function configure(options) {
    return configSystem.configure(options);
}
/**
 * Creates a stream processor for handling sequences of UniversalNumbers
 * @param {Function} transformer - Function to apply to each number in the stream
 * @returns {Object} A stream processing object with methods: pipe, map, filter, reduce
 */
function createStream(transformer) {
    // Simple stream implementation for processing sequences of numbers
    const stream = {
        /**
         * Pipe the output of this stream to another transformer
         * @param {Function} nextTransformer - The next transformation to apply
         * @returns {Object} A new stream with the combined transformations
         */
        pipe(nextTransformer) {
            return createStream(value => nextTransformer(transformer(value)));
        },
        /**
         * Map each value in the stream using a transform function
         * @param {Function} fn - Mapping function
         * @returns {Object} A new stream with the mapping applied
         */
        map(fn) {
            return createStream(value => fn(transformer(value)));
        },
        /**
         * Filter values in the stream
         * @param {Function} predicate - Function returning true for values to keep
         * @returns {Object} A new stream with the filter applied
         */
        filter(predicate) {
            return createStream(value => {
                const result = transformer(value);
                return predicate(result) ? result : null;
            });
        },
        /**
         * Process a sequence of values
         * @param {Array|Iterable} values - The values to process
         * @returns {Array} The processed values
         */
        process(values) {
            const results = [];
            for (const value of values) {
                const result = transformer(value);
                if (result !== null) {
                    results.push(result);
                }
            }
            return results;
        },
        /**
         * Reduce a sequence of values to a single result
         * @param {Array|Iterable} values - The values to process
         * @param {Function} reducer - Reduction function (acc, value) => newAcc
         * @param {*} initialValue - Initial accumulator value
         * @returns {*} The final accumulated result
         */
        reduce(values, reducer, initialValue) {
            let accumulator = initialValue;
            for (const value of values) {
                const result = transformer(value);
                if (result !== null) {
                    accumulator = reducer(accumulator, result);
                }
            }
            return accumulator;
        }
    };
    return stream;
}
/**
 * Creates an asynchronous processor for expensive operations
 * @param {Function} operation - The operation to perform asynchronously
 * @param {Object} options - Options for the async operation
 * @returns {Promise} A promise that resolves with the operation result
 */
function createAsync(operation, options = {}) {
    const opOptions = { ...configSystem.config.async, ...options };
    return new Promise((resolve, reject) => {
        let isCompleted = false;
        let timeoutId = null;
        // Set timeout if specified
        if (opOptions.defaultTimeout > 0) {
            timeoutId = setTimeout(() => {
                if (!isCompleted) {
                    isCompleted = true;
                    reject(new Error('Operation timed out'));
                }
            }, opOptions.defaultTimeout);
        }
        // Function to handle completion
        const complete = (err, result) => {
            if (isCompleted)
                return;
            isCompleted = true;
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
            }
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        };
        // Use a microtask to start the operation
        Promise.resolve().then(() => {
            try {
                // For simple operations, just run them directly
                const result = operation();
                // Handle the case where the operation returns a Promise
                if (result instanceof Promise) {
                    result.then(result => complete(null, result), err => complete(err));
                }
                else {
                    complete(null, result);
                }
            }
            catch (err) {
                complete(err);
            }
        });
    });
}
// Export the plugin registry for extension
const plugins = new Map();
/**
 * Register a plugin with the library
 * @param {string} name - Unique name for the plugin
 * @param {Object} plugin - Plugin implementation
 */
function registerPlugin(name, plugin) {
    if (typeof name !== 'string' || !name) {
        throw new Error('Plugin name must be a non-empty string');
    }
    if (!plugin || typeof plugin !== 'object') {
        throw new Error('Plugin must be an object');
    }
    if (plugins.has(name)) {
        throw new Error(`Plugin "${name}" is already registered`);
    }
    plugins.set(name, plugin);
}
/**
 * Get a registered plugin by name
 * @param {string} name - The name of the plugin to retrieve
 * @returns {Object} The plugin instance
 */
function getPlugin(name) {
    if (!plugins.has(name)) {
        throw new Error(`Plugin "${name}" is not registered`);
    }
    return plugins.get(name);
}
// Primary exports - Core API
module.exports = {
    // Main classes
    UniversalNumber,
    PrimeMath,
    // Configuration system
    configure,
    config: configSystem.config,
    resetConfig: configSystem.resetConfig,
    getConfig: configSystem.getConfig,
    // Stream processing
    createStream,
    // Asynchronous processing
    createAsync,
    // Plugin system
    registerPlugin,
    getPlugin,
    // Dynamic loading capability
    dynamic: dynamicLoader
};
// Export utility modules for advanced usage
// These are internal APIs that could be useful for specialized applications
module.exports.internal = {
    Factorization,
    Conversion,
    Utils
};
// Create specialized domain-specific APIs
module.exports.numberTheory = {
    /**
     * Check if a number is prime
     * @param {UniversalNumber|BigInt|number|string} n - The number to check
     * @returns {boolean} True if the number is prime
     */
    isPrime(n) {
        const num = n instanceof UniversalNumber ? n : new UniversalNumber(n);
        return num.isIntrinsicPrime();
    },
    /**
     * Get the prime factorization of a number
     * @param {UniversalNumber|BigInt|number|string} n - The number to factorize
     * @returns {Map<BigInt, BigInt>} Map of prime factors to exponents
     */
    factorize(n) {
        const num = n instanceof UniversalNumber ? n : new UniversalNumber(n);
        return num.getFactorization();
    },
    /**
     * Find the next prime number after a given value
     * @param {UniversalNumber|BigInt|number|string} n - The starting value
     * @returns {UniversalNumber} The next prime number
     */
    nextPrime(n) {
        return PrimeMath.nextPrime(n);
    },
    /**
     * Calculate the greatest common divisor of two numbers
     * @param {UniversalNumber|BigInt|number|string} a - First number
     * @param {UniversalNumber|BigInt|number|string} b - Second number
     * @returns {UniversalNumber} The GCD
     */
    gcd(a, b) {
        return PrimeMath.gcd(a, b);
    },
    /**
     * Calculate the least common multiple of two numbers
     * @param {UniversalNumber|BigInt|number|string} a - First number
     * @param {UniversalNumber|BigInt|number|string} b - Second number
     * @returns {UniversalNumber} The LCM
     */
    lcm(a, b) {
        return PrimeMath.lcm(a, b);
    }
};
// Create a cryptography-focused API
module.exports.crypto = {
    /**
     * Generate a random prime number of specified bit length
     * @param {number} bits - Bit length of the prime
     * @param {Object} options - Generation options
     * @returns {UniversalNumber} A random prime number
     */
    randomPrime(bits, options = {}) {
        return PrimeMath.randomPrime(bits, options);
    },
    /**
     * Modular exponentiation (a^b mod n)
     * @param {UniversalNumber|BigInt|number|string} base - The base
     * @param {UniversalNumber|BigInt|number|string} exponent - The exponent
     * @param {UniversalNumber|BigInt|number|string} modulus - The modulus
     * @returns {UniversalNumber} The result of modular exponentiation
     */
    modPow(base, exponent, modulus) {
        const baseNum = base instanceof UniversalNumber ? base : new UniversalNumber(base);
        return baseNum.modPow(exponent, modulus);
    },
    /**
     * Modular multiplicative inverse (a^-1 mod n)
     * @param {UniversalNumber|BigInt|number|string} a - The number
     * @param {UniversalNumber|BigInt|number|string} n - The modulus
     * @returns {UniversalNumber} The modular inverse if it exists
     */
    modInverse(a, n) {
        const num = a instanceof UniversalNumber ? a : new UniversalNumber(a);
        return num.modInverse(n);
    }
};
// Create analysis/statistics API
module.exports.analysis = {
    /**
     * Create a sequence of numbers
     * @param {number} start - Start of the sequence
     * @param {number} end - End of the sequence (inclusive)
     * @param {number} step - Step size (default: 1)
     * @returns {Array<UniversalNumber>} Array of UniversalNumbers
     */
    sequence(start, end, step = 1) {
        const result = [];
        for (let i = start; i <= end; i += step) {
            result.push(new UniversalNumber(i));
        }
        return result;
    },
    /**
     * Calculate the sum of an array of numbers
     * @param {Array<UniversalNumber|BigInt|number|string>} numbers - The numbers to sum
     * @returns {UniversalNumber} The sum
     */
    sum(numbers) {
        if (!Array.isArray(numbers) || numbers.length === 0) {
            // Can't use UniversalNumber(0), so return 1-1 instead for empty arrays
            return new UniversalNumber(1).subtract(new UniversalNumber(1));
        }
        // Start with the first item instead of 0
        const firstNum = numbers[0] instanceof UniversalNumber ?
            numbers[0] :
            new UniversalNumber(numbers[0]);
        if (numbers.length === 1) {
            return firstNum;
        }
        // Starting from index 1 since we already have index 0
        return numbers.slice(1).reduce((acc, val) => {
            const num = val instanceof UniversalNumber ? val : new UniversalNumber(val);
            return acc.add(num);
        }, firstNum);
    },
    /**
     * Calculate the product of an array of numbers
     * @param {Array<UniversalNumber|BigInt|number|string>} numbers - The numbers to multiply
     * @returns {UniversalNumber} The product
     */
    product(numbers) {
        if (!Array.isArray(numbers) || numbers.length === 0) {
            return new UniversalNumber(1);
        }
        // For the first item
        const firstNum = numbers[0] instanceof UniversalNumber ?
            numbers[0] :
            new UniversalNumber(numbers[0]);
        if (numbers.length === 1) {
            return firstNum;
        }
        // Multiply remaining items
        return numbers.slice(1).reduce((acc, val) => {
            const num = val instanceof UniversalNumber ? val : new UniversalNumber(val);
            return acc.multiply(num);
        }, firstNum);
    }
};
