import { describe, expect, test, vi } from "vitest";

import { ComputedState } from "./computed-state";
import { Event } from "./event";
import { AbstractState } from "./services";
import { State } from "./state";

describe("computeState", () => {
	test("type", () => {
		const state1 = new State(5);
		const state2 = new State(5);

		const mergedState = new ComputedState(
			[state1, state2],
			(value1, value2) => value1 + value2,
		);

		expect(mergedState).instanceOf(AbstractState);
	});

	test("initial state", () => {
		const state1 = new State("hello");
		const state2 = new State("!");
		const mergedState = new ComputedState(
			[state1, state2],
			(value1, value2) => `${value1} world${value2}`,
		);

		expect(mergedState.get()).toBe("hello world!");
	});

	test("subscribe to state list", () => {
		const event1 = new Event<string>();
		const event2 = new Event<string>();

		const state1 = new State("hello").changeOn(event1);
		const state2 = new State("world").changeOn(event2);
		const computed = new ComputedState(
			[state1, state2],
			(state1, state2) => `${state1} ${state2}`,
		);
		expect(computed.get()).toBe("hello world");

		event1.dispatch("HELLO");
		expect(computed.get()).toBe("HELLO world");

		event2.dispatch("WORLD");
		expect(computed.get()).toBe("HELLO WORLD");
	});

	test("should only call the selector function once if there are no subscribers", () => {
		const event1 = new Event<string>();
		const event2 = new Event<string>();

		const state1 = new State("hello").changeOn(event1);
		const state2 = new State("world").changeOn(event2);
		const selector = vi.fn((state1, state2) => `${state1} ${state2}`);
		new ComputedState([state1, state2], selector);

		expect(selector).toHaveBeenCalledOnce();

		event1.dispatch("HELLO");
		expect(selector).toHaveBeenCalledOnce();

		event2.dispatch("WORLD");
		expect(selector).toHaveBeenCalledOnce();
	});

	test("should call the selector function if there are no subscribers, but we call the get method", () => {
		const event1 = new Event<string>();
		const event2 = new Event<string>();

		const state1 = new State("hello").changeOn(event1);
		const state2 = new State("world").changeOn(event2);
		const selector = vi.fn((state1, state2) => `${state1} ${state2}`);
		const computed = new ComputedState([state1, state2], selector);

		expect(selector).toHaveBeenCalledOnce();

		event1.dispatch("HELLO");
		expect(selector).toHaveBeenCalledOnce();

		event2.dispatch("WORLD");
		expect(selector).toHaveBeenCalledOnce();

		const result = computed.get();
		expect(selector).toHaveBeenCalledTimes(2);
		expect(result).toBe("HELLO WORLD");
	});

	test("should notify subscribers", () => {
		const event1 = new Event<string>();
		const event2 = new Event<string>();

		const state1 = new State("hello").changeOn(event1);
		const state2 = new State("world").changeOn(event2);
		const subscriber1 = vi.fn();
		const subscriber2 = vi.fn();
		const computed = new ComputedState(
			[state1, state2],
			(state1, state2) => `${state1} ${state2}`,
		);
		computed.subscribe(subscriber1);
		computed.subscribe(subscriber2);

		event1.dispatch("HELLO");
		expect(subscriber1).toHaveBeenCalledOnce();
		expect(subscriber1).toHaveBeenCalledWith("HELLO world");

		expect(subscriber2).toHaveBeenCalledOnce();
		expect(subscriber2).toHaveBeenCalledWith("HELLO world");

		event2.dispatch("WORLD");
		expect(subscriber1).toHaveBeenCalledTimes(2);
		expect(subscriber1).toHaveBeenCalledWith("HELLO WORLD");

		expect(subscriber2).toHaveBeenCalledTimes(2);
		expect(subscriber2).toHaveBeenCalledWith("HELLO WORLD");
	});

	test("should unsubscribe from the state list", () => {
		const event1 = new Event<string>();
		const event2 = new Event<string>();

		const state1 = new State("hello").changeOn(event1);
		const state2 = new State("world").changeOn(event2);

		const computed = new ComputedState([state1, state2], (value1, value2) =>
			`${value1} ${value2}`.toUpperCase(),
		);

		expect(computed.get()).toBe("HELLO WORLD");

		computed.release();

		event1.dispatch("foo");
		event2.dispatch("bar");

		expect(computed.get()).toBe("HELLO WORLD");
	});
});
