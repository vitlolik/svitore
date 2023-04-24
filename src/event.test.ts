import { describe, it, expect, vi } from "vitest";
import { Event } from "./event";
import { Entity } from "./shared/entity";

describe("event", () => {
	it("type", () => {
		const event = new Event();

		expect(event).instanceOf(Entity);
	});

	it("initial state", () => {
		const event = new Event();

		expect(event.calls).toBe(0);
		expect(event.options).toEqual({});
	});

	it("subscribe", () => {
		const event = new Event<number>();
		const subscriber = vi.fn();
		event.subscribe(subscriber);

		expect(subscriber).toBeCalledTimes(0);

		event.dispatch(1);
		expect(subscriber).toBeCalledTimes(1);
		expect(subscriber).toHaveBeenCalledWith(1, event);

		event.dispatch(2);
		expect(subscriber).toBeCalledTimes(2);
		expect(subscriber).toHaveBeenCalledWith(2, event);

		event.dispatch(0);
		expect(subscriber).toBeCalledTimes(3);
		expect(subscriber).toHaveBeenCalledWith(0, event);
	});

	it("calls count", () => {
		const event = new Event();

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

	it("shouldDispatch", () => {
		const event = new Event({ shouldDispatch: (): boolean => false });
		const subscriber = vi.fn();
		event.subscribe(subscriber);

		event.dispatch();
		expect(subscriber).toBeCalledTimes(0);

		event.dispatch();
		event.dispatch();
		event.dispatch();
		expect(subscriber).toBeCalledTimes(0);
		expect(event.calls).toBe(0);
	});
});
