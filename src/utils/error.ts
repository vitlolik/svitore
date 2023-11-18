import { PACKAGE_LABEL } from "../constants";

class SvitoreError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "SvitoreError";
	}
}

const logError = (...args: any[]): void =>
	console.error(PACKAGE_LABEL, ...args);

export { SvitoreError, logError };
