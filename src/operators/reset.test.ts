import { describe, it, vi, expect } from "vitest";
import { Event } from "../event";
import { State } from "../state";
import { reset } from "./reset";

describe("reset", () => {
	it("should set on reset event", () => {
		const state = new State(10);
		state.onReset = vi.fn();

		const trigger = new Event();

		reset({ trigger, target: state });

		expect(state.onReset).toHaveBeenCalledTimes(1);
	});

	it("should work with list", () => {
		const state1 = new State(0);
		const state2 = new State("");
		const trigger1 = new Event();
		const trigger2 = new Event();

		state1.inform(10);
		state2.inform("test");

		reset({ trigger: [trigger1, trigger2], target: [state1, state2] });

		expect(state1.get()).toBe(10);
		expect(state2.get()).toBe("test");

		trigger1.fire();
		expect(state1.get()).toBe(0);
		expect(state2.get()).toBe("");

		state1.inform(100);
		state2.inform("hello");
		expect(state1.get()).toBe(100);
		expect(state2.get()).toBe("hello");

		trigger2.fire();
		expect(state1.get()).toBe(0);
		expect(state2.get()).toBe("");
	});
});
