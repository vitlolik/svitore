import { Entity } from "./shared";
import { Validator } from "./validator";

type EventOptions<Payload = void> = {
	[x: string]: any;
	shouldDispatch?: (event: Event<Payload>) => boolean;
};

class Event<Payload = void> extends Entity<Payload> {
	private validatorChain: Validator<Payload>[] = [];
	calls = 0;

	constructor(public options: EventOptions<Payload> = {}) {
		super();
	}

	private callValidators(payload: Payload): {
		hasError: boolean;
		payload: Payload;
	} {
		let result: Payload = payload;
		let hasError = false;

		for (const validator of this.validatorChain) {
			const validatorResult = validator.call(result);
			hasError = validatorResult.hasError;
			if (hasError) break;

			result = validatorResult.payload;
		}

		return { hasError, payload: result };
	}

	private shouldDispatch(): boolean {
		return this.options.shouldDispatch?.(this) ?? true;
	}

	dispatch(payload: Payload): void {
		if (!this.shouldDispatch()) return;

		const validatorsResult = this.callValidators(payload);
		if (validatorsResult.hasError) return;

		this.calls++;
		this.notify(validatorsResult.payload);
	}

	applyValidators(validatorChain: Validator<Payload>[]): this {
		this.validatorChain = validatorChain;
		return this;
	}
}

export { Event, EventOptions };
