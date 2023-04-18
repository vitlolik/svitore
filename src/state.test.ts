import { describe, it, expect } from "vitest";
import { Entity } from "./shared/entity";
import { State } from "./state";

describe("state", () => {
	class TestState<T = void> extends State<T> {
		getDefaultState(): T {
			return this.defaultState;
		}

		setNotify(notify: (params: T) => void): void {
			this.notify = notify;
		}
	}

	it("type", () => {
		const state = new TestState(0);

		expect(state).instanceOf(Entity);
	});

	it("initial state", () => {
		const state = new TestState("test");

		expect(state.getDefaultState()).toBe("test");
		expect(state.getPrev()).toBe("test");
		expect(state.get()).toBe("test");
	});

	it("get prev state", () => {
		const state = new TestState("test");
		expect(state.getPrev()).toBe("test");

		state.set("new");
		expect(state.getPrev()).toBe("test");

		state.set("new new new");
		expect(state.getPrev()).toBe("new");
	});

	it("get state", () => {
		const state = new TestState("test");
		expect(state.get()).toBe("test");

		state.set("new");
		expect(state.get()).toBe("new");
	});
});
