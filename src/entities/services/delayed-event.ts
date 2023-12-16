import { AbstractEvent } from "./abstract-event";

abstract class DelayedEvent<Payload = void> extends AbstractEvent<Payload> {
	protected timer: NodeJS.Timeout | number;
	pending = false;

	constructor(protected readonly timeout: number) {
		super();
	}

	protected clearTimer(): void {
		globalThis.clearTimeout(this.timer);
	}

	override release(): void {
		this.pending = false;
		this.clearTimer();
		super.release();
	}
}

export { DelayedEvent };
