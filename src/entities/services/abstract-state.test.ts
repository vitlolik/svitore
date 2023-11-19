import { describe, it, expect, vi } from "vitest";

import { Entity } from "./entity";
import { AbstractState } from "./abstract-state";

describe("state", () => {
	class State<T> extends AbstractState<T> {
		set(newState: T): void {
			super.set(newState);
		}
	}

	it("type", () => {
		const state = new State(0);

		expect(state).instanceOf(Entity);
	});

	it("initial state", () => {
		const state = new State("test");

		expect(state.getPrev()).toBe("test");
		expect(state.get()).toBe("test");
	});

	describe("set - set new state", () => {
		it("should do nothing if state is equal", () => {
			const subscriber = vi.fn();
			const state = new State("test");
			state.subscribe(subscriber);

			state.set("test");

			expect(subscriber).not.toHaveBeenCalled();
		});

		it("should update current and prev state", () => {
			const state = new State("test");

			state.set("new value");

			expect(state.get()).toBe("new value");
			expect(state.getPrev()).toBe("test");
		});

		it("should notify subscribers with new state and state instance", () => {
			const subscriber = vi.fn();
			const state = new State("test");
			state.subscribe(subscriber);

			state.set("new value");

			expect(subscriber).toHaveBeenCalledWith("new value", state);
		});
	});
});
