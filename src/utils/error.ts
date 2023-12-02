import { PACKAGE_LABEL } from "../constants";

class SvitoreError extends Error {
	constructor(message?: string) {
		super(message);

		this.name = "SvitoreError";
	}
}

class ModuleExistsError extends SvitoreError {
	constructor(name: string) {
		super(`Module with name "${name}" already exists`);
	}
}

const logError = (...args: any[]): void =>
	globalThis.console.error(PACKAGE_LABEL, ...args);

export { logError, SvitoreError, ModuleExistsError };
