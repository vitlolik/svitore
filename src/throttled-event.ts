import { Event, EventOptions } from "./event";

class ThrottledEvent<
	TPayload extends any = void,
	TMeta extends any = any
> extends Event<TPayload, TMeta> {
	private isThrottled = false;
	private savedParams: TPayload | null = null;

	constructor(
		private timeout: number,
		options?: EventOptions<TPayload, TMeta>
	) {
		super(options);
	}

	dispatch(payload: TPayload): void {
		if (this.isThrottled) {
			this.savedParams = payload;
			return;
		}

		super.dispatch(payload);
		this.isThrottled = true;

		setTimeout(() => {
			this.isThrottled = false;
			if (this.savedParams) {
				this.dispatch(this.savedParams);
				this.savedParams = null;
			}
		}, this.timeout);
	}
}

export { ThrottledEvent };
