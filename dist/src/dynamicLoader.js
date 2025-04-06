/**
 * Dynamic module loader for the Prime Framework
 * Enables selective loading of modules for performance optimization
 * @module dynamicLoader
 */
// Cache for loaded modules
const moduleCache = new Map();
// Registry of module definitions and dependencies
const moduleRegistry = new Map();
/**
 * Register a module with the dynamic loader
 * @param {string} name - Module name
 * @param {Object} definition - Module definition with dependencies and factory function
 */
function registerModule(name, definition) {
    if (typeof name !== 'string' || !name) {
        throw new Error('Module name must be a non-empty string');
    }
    if (!definition || typeof definition !== 'object') {
        throw new Error('Module definition must be an object');
    }
    if (typeof definition.factory !== 'function') {
        throw new Error('Module definition must have a factory function');
    }
    if (!Array.isArray(definition.dependencies)) {
        definition.dependencies = [];
    }
    moduleRegistry.set(name, definition);
}
/**
 * Load a module (and its dependencies) dynamically
 * @param {string} name - The name of the module to load
 * @returns {Object} The loaded module
 */
function loadModule(name) {
    // Check if the module is already loaded
    if (moduleCache.has(name)) {
        return moduleCache.get(name);
    }
    // Check if the module is registered
    if (!moduleRegistry.has(name)) {
        throw new Error(`Module "${name}" is not registered`);
    }
    const definition = moduleRegistry.get(name);
    const dependencies = definition.dependencies || [];
    // Load dependencies
    const loadedDeps = dependencies.map(dep => loadModule(dep));
    // Instantiate the module
    const module = definition.factory(...loadedDeps);
    // Cache the module
    moduleCache.set(name, module);
    return module;
}
/**
 * Clear the module cache
 * @param {string} [name] - Optional module name to clear, if omitted all modules are cleared
 */
function clearCache(name) {
    if (name) {
        moduleCache.delete(name);
    }
    else {
        moduleCache.clear();
    }
}
/**
 * Check if a module is loaded
 * @param {string} name - The module name
 * @returns {boolean} True if the module is loaded
 */
function isLoaded(name) {
    return moduleCache.has(name);
}
/**
 * Get list of all registered modules
 * @returns {Array<string>} Array of module names
 */
function getRegisteredModules() {
    return Array.from(moduleRegistry.keys());
}
// Register core modules
registerModule('UniversalNumber', {
    dependencies: ['Factorization', 'Utils'],
    factory: () => require('./UniversalNumber')
});
registerModule('PrimeMath', {
    dependencies: ['UniversalNumber', 'Utils'],
    factory: () => require('./PrimeMath')
});
registerModule('Factorization', {
    dependencies: ['Utils'],
    factory: () => require('./Factorization')
});
registerModule('Conversion', {
    dependencies: ['Utils'],
    factory: () => require('./Conversion')
});
registerModule('Utils', {
    dependencies: [],
    factory: () => require('./Utils')
});
module.exports = {
    registerModule,
    loadModule,
    clearCache,
    isLoaded,
    getRegisteredModules
};
