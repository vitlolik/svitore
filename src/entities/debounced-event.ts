import { DelayedEvent } from "./services";

class DebouncedEvent<Payload = void> extends DelayedEvent<Payload> {
	constructor(timeout: number) {
		super(timeout);
	}

	dispatch(payload: Payload): void {
		this.clearTimer();
		this.timeoutId = setTimeout(() => super.dispatch(payload), this.timeout);
	}
}

export { DebouncedEvent };
