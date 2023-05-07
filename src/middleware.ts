type ErrorHandler<ErrorType> = (error: ErrorType) => void;

class Middleware<Payload = any, ErrorType = any> {
	private handleError?: ErrorHandler<ErrorType>;
	constructor(private middlewareFunction: (args: Payload) => Payload) {}

	call(payload: Payload): { hasError: boolean; payload: Payload } {
		try {
			return { hasError: false, payload: this.middlewareFunction(payload) };
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

export { Middleware };
