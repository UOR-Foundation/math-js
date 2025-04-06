/**
 * Update configuration with custom settings
 * @param {Object} options - Configuration options to update
 * @returns {Object} The updated configuration object
 */
export function configure(options: any): any;
/**
 * Reset configuration to default values
 * @returns {Object} The reset configuration object
 */
export function resetConfig(): any;
/**
 * Get the current configuration
 * @returns {Object} The current configuration (read-only)
 */
export function getConfig(): any;
declare let currentConfig: any;
export { currentConfig as config };
//# sourceMappingURL=config.d.ts.map