import { Entity, Observer } from "./shared";

type EventOptions<Payload = void, Meta = any> = {
	shouldDispatch?: (event: Event<Payload>) => boolean;
	meta?: Meta;
};

class Event<Payload = void, Meta = any> extends Entity<Payload> {
	calls = 0;
	meta?: Meta;

	constructor(protected options: EventOptions<Payload, Meta> = {}) {
		super();
		this.meta = options.meta;
	}

	private shouldDispatch(): boolean {
		return this.options.shouldDispatch?.(this) ?? true;
	}

	protected fire(payload: Payload): void {
		if (!this.shouldDispatch()) return;

		this.calls++;
		this.notify(payload);
	}

	dispatch(payload: Payload): void {
		this.fire(payload);
	}

	listen(listener: Observer<Payload>) {
		return this.observe(listener);
	}
}

export { Event, EventOptions };
