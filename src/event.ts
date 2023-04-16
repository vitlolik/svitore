import { Entity, Observer } from "./shared";

type EventOptions<TPayload = void, TMeta = any> = {
	shouldDispatch?: (event: Event<TPayload>) => boolean;
	meta?: TMeta;
};

class Event<
	TPayload extends any = void,
	TMeta extends any = any
> extends Entity<TPayload> {
	calls = 0;
	meta?: TMeta;

	constructor(protected options: EventOptions<TPayload, TMeta> = {}) {
		super();
		this.meta = options.meta;
	}

	private shouldDispatch(): boolean {
		return this.options.shouldDispatch?.(this) ?? true;
	}

	protected fire(payload: TPayload): void {
		if (!this.shouldDispatch()) return;

		this.calls++;
		this.notify(payload);
	}

	dispatch(payload: TPayload): void {
		this.fire(payload);
	}

	listen(listener: Observer<TPayload>) {
		return this.observe(listener);
	}
}

export { Event, EventOptions };
