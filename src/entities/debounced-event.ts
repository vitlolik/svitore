import { DelayedEvent } from "./services";

class DebouncedEvent<Payload = void> extends DelayedEvent<Payload> {
	constructor(timeout: number) {
		super(timeout);
	}

	override dispatch(payload: Payload): void {
		this.pending = true;

		this.clearTimer();
		this.timer = globalThis.setTimeout(() => {
			super.dispatch(payload);
			this.pending = false;
		}, this.timeout);
	}
}

export { DebouncedEvent };
