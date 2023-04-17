import { Event, EventOptions } from "./event";

class DebouncedEvent<Payload = void, Meta = any> extends Event<Payload, Meta> {
	private timeoutId: NodeJS.Timeout;

	constructor(private timeout: number, options?: EventOptions<Payload, Meta>) {
		super(options);
	}

	dispatch(payload: Payload): void {
		clearTimeout(this.timeoutId);
		this.timeoutId = setTimeout(() => super.dispatch(payload), this.timeout);
	}
}

export { DebouncedEvent };
