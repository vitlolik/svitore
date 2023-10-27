type ErrorHandler<ErrorType> = (error: ErrorType) => void;

class Middleware<Payload = any, ErrorType = any> {
	private onError?: ErrorHandler<ErrorType>;
	constructor(private middlewareFunction: (args: Payload) => Payload) {}

	call(payload: Payload): Payload {
		try {
			return this.middlewareFunction(payload);
		} catch (error) {
			this.onError?.(error as ErrorType);
			throw error;
		}
	}

	catch(onError: ErrorHandler<ErrorType>): this {
		this.onError = onError;

		return this;
	}
}

export { Middleware };
