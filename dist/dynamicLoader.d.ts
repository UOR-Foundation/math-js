/**
 * Register a module with the dynamic loader
 * @param {string} name - Module name
 * @param {Object} definition - Module definition with dependencies and factory function
 */
export function registerModule(name: string, definition: any): void;
/**
 * Load a module (and its dependencies) dynamically
 * @param {string} name - The name of the module to load
 * @returns {Object} The loaded module
 */
export function loadModule(name: string): any;
/**
 * Clear the module cache
 * @param {string} [name] - Optional module name to clear, if omitted all modules are cleared
 */
export function clearCache(name?: string): void;
/**
 * Check if a module is loaded
 * @param {string} name - The module name
 * @returns {boolean} True if the module is loaded
 */
export function isLoaded(name: string): boolean;
/**
 * Get list of all registered modules
 * @returns {Array<string>} Array of module names
 */
export function getRegisteredModules(): Array<string>;
//# sourceMappingURL=dynamicLoader.d.ts.map