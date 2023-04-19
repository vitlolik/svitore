import { Event, EventOptions } from "./event";

class ThrottledEvent<Payload = void> extends Event<Payload> {
	private isThrottled = false;
	private savedParams: Payload | null = null;

	constructor(private timeout: number, options?: EventOptions<Payload>) {
		super(options);
	}

	dispatch(payload: Payload): void {
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
