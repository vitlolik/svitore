import { describe, it, expect, vi } from "vitest";
import { Event, EventOptions } from "./event";
import { Entity } from "./shared/entity";

describe("event", () => {
	class TestEvent<T = void> extends Event<T> {
		getOptions(): EventOptions<T, any> {
			return this.options;
		}

		notify = vi.fn();
	}

	it("type", () => {
		const event = new TestEvent();

		expect(event).instanceOf(Entity);
	});

	it("initial state", () => {
		const event = new TestEvent();

		expect(event.calls).toBe(0);
		expect(event.getOptions()).toEqual({});
	});

	it("notify", () => {
		const event = new TestEvent<number>();
		expect(event.notify).toBeCalledTimes(0);

		event.dispatch(1);
		expect(event.notify).toBeCalledTimes(1);
		expect(event.notify).toHaveBeenCalledWith(1);

		event.dispatch(2);
		expect(event.notify).toBeCalledTimes(2);
		expect(event.notify).toHaveBeenCalledWith(2);

		event.dispatch(0);
		expect(event.notify).toBeCalledTimes(3);
		expect(event.notify).toHaveBeenCalledWith(0);
	});

	it("calls count", () => {
		const event = new TestEvent();

		expect(event.calls).toBe(0);

		event.dispatch();
		expect(event.calls).toBe(1);

		event.dispatch();
		event.dispatch();
		expect(event.calls).toBe(3);

		event.dispatch();
		event.dispatch();
		event.dispatch();
		expect(event.calls).toBe(6);
	});

	it("options", () => {
		const event = new TestEvent({ meta: "Test" });

		expect(event.getOptions()).toEqual({ meta: "Test" });
	});

	it("shouldDispatch", () => {
		const event = new TestEvent({ shouldDispatch: (): boolean => false });
		expect(event.notify).toBeCalledTimes(0);

		event.dispatch();
		expect(event.notify).toBeCalledTimes(0);

		event.dispatch();
		event.dispatch();
		event.dispatch();
		expect(event.notify).toBeCalledTimes(0);
		expect(event.calls).toBe(0);
	});
});
