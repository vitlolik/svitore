import { describe, it, expect, vi } from "vitest";

import { Event } from "./event";
import { Entity } from "./services";

describe("event", () => {
	it("type", () => {
		const event = new Event();

		expect(event).instanceOf(Entity);
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
	});
});
