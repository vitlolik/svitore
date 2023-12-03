import { describe, test, expect, vi } from "vitest";

import { State } from "./state";
import { Event } from "./event";

describe("state", () => {
	test("reset state to default value", () => {
		const event = new Event<string>();
		const resetEvent = new Event();
		const state = new State("test").changeOn(event).resetOn(resetEvent);

		event.dispatch("new state");
		event.dispatch("one more new state");
		resetEvent.dispatch();

		expect(state.get()).toBe("test");
	});

	describe("changeOn", () => {
		test("should subscribe on event", () => {
			const event = new Event<string>();
			const state = new State("test").changeOn(event);

			event.dispatch("new state");

			expect(state.get()).toBe("new state");
			expect(state.getPrev()).toBe("test");
		});

		test("should unsubscribe from event, if release has been called", () => {
			const event1 = new Event<string>();
			const event2 = new Event<string>();
			const state = new State("test").changeOn(event1).changeOn(event2);

			state.release();

			event1.dispatch("new test");
			expect(state.get()).toBe("test");

			event2.dispatch("new new test");
			expect(state.get()).toBe("test");
		});

		test("should skip subscriber if it already exist", () => {
			const event1 = new Event<string>();
			const mockSelector = vi.fn<[string], string>();

			const state = new State("test")
				.changeOn(event1)
				.changeOn(event1, mockSelector);

			event1.dispatch("new test");
			event1.dispatch("new new test");

			expect(state.get()).toBe("new new test");
			expect(mockSelector).not.toHaveBeenCalled();
		});
	});
});
