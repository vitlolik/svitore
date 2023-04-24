import { DelayedEvent } from "./delayed-event";

class ThrottledEvent<Payload = void> extends DelayedEvent<Payload> {
	private isThrottled = false;
	private savedParams: Payload | null = null;

	dispatch(payload: Payload): void {
		if (this.isThrottled) {
			this.savedParams = payload;
			return;
		}

		super.dispatch(payload);
		this.isThrottled = true;

		this.timeoutId = setTimeout(() => {
			this.isThrottled = false;
			if (this.savedParams) {
				this.dispatch(this.savedParams);
				this.savedParams = null;
			}
		}, this.timeout);
	}
}

export { ThrottledEvent };
