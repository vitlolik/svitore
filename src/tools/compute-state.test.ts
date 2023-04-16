import { describe, it, expect } from "vitest";
import { computeState } from "./compute-state";
import { State } from "../state";

describe("computeState", () => {
	it("type", () => {
		const state1 = new State(5);
		const state2 = new State(5);
		const mergedState = computeState(
			[state1, state2],
			(value1, value2) => value1 + value2
		);

		expect(mergedState).instanceOf(State);
	});

	it("initial state", () => {
		const state1 = new State("hello");
		const state2 = new State("!");
		const mergedState = computeState(
			[state1, state2],
			(value1, value2) => value1 + " world" + value2
		);

		expect(mergedState.get()).toBe("hello world!");
	});

	it("subscribe to state list", () => {
		const state1 = new State("hello");
		const state2 = new State("world");
		const computed = computeState(
			[state1, state2],
			(state1, state2) => `${state1} ${state2}`
		);
		expect(computed.get()).toBe("hello world");

		state1.set("HELLO");
		expect(computed.get()).toBe("HELLO world");

		state2.set("WORLD");
		expect(computed.get()).toBe("HELLO WORLD");
	});
});
