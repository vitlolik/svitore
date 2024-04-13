import { describe, expect, test, vi } from "vitest";

import { AbstractState } from "./abstract-state";
import { Entity } from "./entity";

describe("state", () => {
	class State<T> extends AbstractState<T> {
		set(newState: T): void {
			super.notify(newState);
		}
	}

	test("type", () => {
		const state = new State(0);

		expect(state).instanceOf(Entity);
	});

	test("initial state", () => {
		const state = new State("test");

		expect(state.getPrev()).toBe("test");
		expect(state.get()).toBe("test");
	});

	describe("set new state", () => {
		test("should do nothing if state is equal", () => {
			const subscriber = vi.fn();
			const state = new State("test");
			state.subscribe(subscriber);

			state.set("test");

			expect(subscriber).not.toHaveBeenCalled();
		});

		test("should update current and prev state", () => {
			const state = new State("test");

			state.set("new value");

			expect(state.get()).toBe("new value");
			expect(state.getPrev()).toBe("test");
		});

		test("should notify subscribers with new state and state instance", () => {
			const subscriber = vi.fn();
			const state = new State("test");
			state.subscribe(subscriber);

			state.set("new value");

			expect(subscriber).toHaveBeenCalledWith("new value");
		});
	});
});
