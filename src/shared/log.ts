export const LOG_PREFIX = "[svitore]" as const;

const logError = (...args: any[]): void => console.error(LOG_PREFIX, ...args);

export { logError };
