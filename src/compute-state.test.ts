import { describe, it, expect } from "vitest";
import { ComputeState } from "./compute-state";
import { State } from "./state";
import { SvitoreError } from "./shared";

describe("computeState", () => {
	it("type", () => {
		const state1 = new State(5);
		const state2 = new State(5);

		const mergedState = new ComputeState(
			state1,
			state2,
			(value1, value2) => value1 + value2
		);

		expect(mergedState).instanceOf(State);
	});

	it("initial state", () => {
		const state1 = new State("hello");
		const state2 = new State("!");
		const mergedState = new ComputeState(
			state1,
			state2,
			(value1, value2) => value1 + " world" + value2
		);

		expect(mergedState.get()).toBe("hello world!");
	});

	it("subscribe to state list", () => {
		const state1 = new State("hello");
		const state2 = new State("world");
		const computed = new ComputeState(
			state1,
			state2,
			(state1, state2) => `${state1} ${state2}`
		);
		expect(computed.get()).toBe("hello world");

		state1.set("HELLO");
		expect(computed.get()).toBe("HELLO world");

		state2.set("WORLD");
		expect(computed.get()).toBe("HELLO WORLD");
	});

	it("should be readonly, can not change the state", () => {
		const state = new State("world");
		const computed = new ComputeState(state, (state) => state.toUpperCase());

		try {
			computed.set("");
		} catch (error) {
			expect(error).toBeInstanceOf(SvitoreError);
		}
		try {
			computed.reset();
		} catch (error) {
			expect(error).toBeInstanceOf(SvitoreError);
		}
	});

	it("clone - should clone state with others state list", () => {
		const state1 = new State("hello");
		const state2 = new State("world");
		const computed = new ComputeState(state1, state2, (value1, value2) =>
			`${value1} ${value2}`.toUpperCase()
		);

		const newState1 = new State("foo");
		const newState2 = new State("bar");

		const cloned = computed.clone([newState1, newState2]);

		expect(cloned.get()).toBe("FOO BAR");
	});

	it("release - should unsubscribe from the state list", () => {
		const state1 = new State("hello");
		const state2 = new State("world");

		const computed = new ComputeState(state1, state2, (value1, value2) =>
			`${value1} ${value2}`.toUpperCase()
		);

		expect(computed.get()).toBe("HELLO WORLD");

		computed.release();

		state1.set("foo");
		state2.set("bar");

		expect(computed.get()).toBe("HELLO WORLD");
	});
});
