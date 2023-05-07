type ErrorHandler<ErrorType> = (error: ErrorType) => void;

class Validator<Payload = any, ErrorType = any> {
	private handleError?: ErrorHandler<ErrorType>;
	constructor(private validatorFunction: (args: Payload) => Payload) {}

	call(payload: Payload): { hasError: boolean; payload: Payload } {
		try {
			return { hasError: false, payload: this.validatorFunction(payload) };
		} catch (error) {
			this.handleError?.(error as ErrorType);
			return { hasError: true, payload };
		}
	}

	onError(handleError: ErrorHandler<ErrorType>): this {
		this.handleError = handleError;

		return this;
	}
}

export { Validator };
