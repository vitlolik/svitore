import { PACKAGE_LABEL } from "../constants";

const logError = (...args: any[]): void =>
	globalThis.console.error(PACKAGE_LABEL, ...args);

export { logError };
