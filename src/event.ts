import { Entity } from "./shared";

type EventOptions<Payload = void> = {
	[x: string]: any;
	shouldDispatch?: (event: Event<Payload>) => boolean;
};

class Event<Payload = void> extends Entity<Payload> {
	calls = 0;

	constructor(public options: EventOptions<Payload> = {}) {
		super();
	}

	private shouldDispatch(): boolean {
		return this.options.shouldDispatch?.(this) ?? true;
	}

	dispatch(payload: Payload): void {
		if (!this.shouldDispatch()) return;

		this.calls++;
		this.notify(payload);
	}
}

export { Event, EventOptions };
