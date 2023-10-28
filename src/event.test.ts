import { describe, it, expect, vi } from "vitest";

import { Event } from "./event";
import { Entity } from "./shared";

describe("event", () => {
	it("type", () => {
		const event = new Event();

		expect(event).instanceOf(Entity);
	});

	it("initial calls", () => {
		const event = new Event();

		expect(event.calls).toBe(0);
	});

	it("initial options", () => {
		const event = new Event();

		expect(event.options).toEqual({});
	});

	describe("dispatch - call event with payload", () => {
		it("should notify subscribers", () => {
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

		it("should increase calls count", () => {
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

		it("can past custom condition for dispatch", () => {
			const event = new Event({ shouldDispatch: (): boolean => false });
			const subscriber = vi.fn();
			event.subscribe(subscriber);

			event.dispatch();
			expect(subscriber).toHaveBeenCalledTimes(0);

			event.dispatch();
			event.dispatch();
			event.dispatch();
			expect(subscriber).toHaveBeenCalledTimes(0);
			expect(event.calls).toBe(0);
		});
	});
});
