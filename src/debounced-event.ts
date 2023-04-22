import { Event, EventOptions } from "./event";

class DebouncedEvent<Payload = void> extends Event<Payload> {
	private timeoutId: NodeJS.Timeout;

	constructor(private timeout: number, options?: EventOptions<Payload>) {
		super(options);
	}

	dispatch(payload: Payload): void {
		clearTimeout(this.timeoutId);
		this.timeoutId = setTimeout(() => super.dispatch(payload), this.timeout);
	}

	release(): void {
		clearTimeout(this.timeoutId);
		super.release();
	}
}

export { DebouncedEvent };
