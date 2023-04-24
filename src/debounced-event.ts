import { DelayedEvent } from "./delayed-event";

class DebouncedEvent<Payload = void> extends DelayedEvent<Payload> {
	dispatch(payload: Payload): void {
		this.clearTimer();
		this.timeoutId = setTimeout(() => super.dispatch(payload), this.timeout);
	}
}

export { DebouncedEvent };
