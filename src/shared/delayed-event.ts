import { Event, EventOptions } from "../event";

abstract class DelayedEvent<Payload = void> extends Event<Payload> {
	protected timeoutId: NodeJS.Timeout;

	constructor(protected timeout: number, options?: EventOptions<Payload>) {
		super(options);
	}

	protected clearTimer(): void {
		clearTimeout(this.timeoutId);
	}

	release(): void {
		this.clearTimer();
		super.release();
	}
}

export { DelayedEvent };
