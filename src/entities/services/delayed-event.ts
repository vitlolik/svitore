import { AbstractEvent } from "./abstract-event";

abstract class DelayedEvent<Payload = void> extends AbstractEvent<Payload> {
	protected timeoutId: NodeJS.Timeout | number;

	constructor(protected readonly timeout: number) {
		super();
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
