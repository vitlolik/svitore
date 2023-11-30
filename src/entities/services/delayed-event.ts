import { AbstractEvent } from "./abstract-event";

abstract class DelayedEvent<Payload = void> extends AbstractEvent<Payload> {
	protected timer: NodeJS.Timeout | number;
	pending = false;

	constructor(protected readonly timeout: number) {
		super();
	}

	protected clearTimer(): void {
		clearTimeout(this.timer);
	}

	release(): void {
		this.clearTimer();
		super.release();
	}
}

export { DelayedEvent };
