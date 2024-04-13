import { DelayedEvent } from "./services";

const noValue = Symbol("noValue");

class ThrottledEvent<Payload = void> extends DelayedEvent<Payload> {
	private isThrottled = false;
	private savedParams: Payload | typeof noValue = noValue;

	override dispatch(payload: Payload): void {
		if (this.isThrottled) {
			this.pending = true;
			this.savedParams = payload;
			return;
		}

		super.dispatch(payload);
		this.isThrottled = true;

		this.timer = globalThis.setTimeout(() => {
			this.isThrottled = false;
			this.pending = false;
			if (this.savedParams !== noValue) {
				this.dispatch(this.savedParams);
				this.savedParams = noValue;
			}
		}, this.timeout);
	}
}

export { ThrottledEvent };
