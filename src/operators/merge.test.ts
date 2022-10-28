import { describe, it, expect } from "vitest";
import { merge } from "./merge";
import { State } from "../state";

describe("merge", () => {
	it("type", () => {
		const state1 = new State(5);
		const state2 = new State(5);
		const mergedState = merge(
			[state1, state2],
			(value1, value2) => value1 + value2
		);

		expect(mergedState).instanceOf(State);
	});

	it("initial state", () => {
		const state1 = new State("hello");
		const state2 = new State("!");
		const mergedState = merge(
			[state1, state2],
			(value1, value2) => value1 + " world" + value2
		);

		expect(mergedState.get()).toBe("hello world!");
	});

	it("subscribe to state list", () => {
		const state1 = new State("hello");
		const state2 = new State("world");
		const mergedState = merge(
			[state1, state2],
			(state1, state2) => `${state1} ${state2}`
		);
		expect(mergedState.get()).toBe("hello world");

		state1.inform("HELLO");
		expect(mergedState.get()).toBe("HELLO world");

		state2.inform("WORLD");
		expect(mergedState.get()).toBe("HELLO WORLD");
	});
});
