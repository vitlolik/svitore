import { describe, it, expect, vi } from "vitest";
import { Event } from "./event";
import { Entity } from "./shared/entity";
import { State } from "./state";

describe("state", () => {
	class TestState<T = void> extends State<T> {
		getDefaultState() {
			return this.defaultState;
		}

		setNotify(notify: (params: T) => void) {
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

		state.inform("new");
		expect(state.getPrev()).toBe("test");

		state.inform("new new new");
		expect(state.getPrev()).toBe("new");
	});

	it("get state", () => {
		const state = new TestState("test");
		expect(state.get()).toBe("test");

		state.inform("new");
		expect(state.get()).toBe("new");
	});

	describe("inform", () => {
		it("updated state data", () => {
			const state = new TestState("test");
			const notify = vi.fn();
			state.setNotify(notify);

			state.inform("new test value");
			expect(state.getDefaultState()).toBe("test");
			expect(state.getPrev()).toBe("test");
			expect(state.get()).toBe("new test value");
			expect(notify).toHaveBeenCalledTimes(1);
			expect(notify).toHaveBeenCalledWith("new test value");

			state.inform("another new test value");
			expect(state.getDefaultState()).toBe("test");
			expect(state.getPrev()).toBe("new test value");
			expect(state.get()).toBe("another new test value");
			expect(notify).toHaveBeenCalledTimes(2);
			expect(notify).toHaveBeenCalledWith("another new test value");

			state.inform("one more new test value");
			expect(state.getDefaultState()).toBe("test");
			expect(state.getPrev()).toBe("another new test value");
			expect(state.get()).toBe("one more new test value");
			expect(notify).toHaveBeenCalledTimes(3);
			expect(notify).toHaveBeenCalledWith("one more new test value");
		});

		it("do not call notify, if state not changed", () => {
			const state = new TestState("test");
			const notify = vi.fn();
			state.setNotify(notify);

			state.inform("new value");
			expect(notify).toHaveBeenCalledTimes(1);

			state.inform("new value");
			state.inform("new value");
			state.inform("new value");
			expect(notify).toHaveBeenCalledTimes(1);
		});
	});

	describe("on", () => {
		it("called channel on event", () => {
			const state = new State(0);
			const event = new Event();
			event.channel = vi.fn<any>();

			state.on(event, vi.fn());
			expect(event.channel).toHaveBeenCalledTimes(1);
		});

		it("return instance of state", () => {
			const state = new TestState(0);

			const instance = state.on(new Event(), vi.fn());

			expect(instance).toBe(state);
		});

		it("call getNewState", () => {
			const state = new State(0);
			const getNewState = vi.fn();
			const incrementEvent = new Event<10>();

			state.on(incrementEvent, getNewState);
			incrementEvent.fire(10);

			expect(getNewState).toHaveBeenCalledTimes(1);
			expect(getNewState).toHaveBeenCalledWith(10, 0);
		});

		it("set state from event", () => {
			const state = new State(0);
			const change = new Event<number>();
			state.on(change, (value) => value);

			change.fire(1);
			expect(state.get()).toBe(1);

			change.fire(2);
			expect(state.get()).toBe(2);
		});
	});

	describe("onReset", () => {
		it("called on method", () => {
			const state = new State(0);
			const event = new Event();
			state.on = vi.fn<any>();

			state.onReset(event);

			expect(state.on).toHaveBeenCalledTimes(1);
		});

		it("reset state", () => {
			const state = new State("default");
			const event = new Event();
			state.onReset(event);

			state.inform("updated");
			state.inform("new");

			event.fire();

			expect(state.get()).toBe("default");
		});
	});

	describe("map", () => {
		it("called selector state", () => {
			const state = new State(0);
			const selector = vi.fn();

			state.map(selector);
			expect(selector).toHaveBeenCalledTimes(1);
			expect(selector).toHaveBeenCalledWith(0);
		});

		it("subscribe to base state", () => {
			const state = new State(0);
			state.subscribe = vi.fn();

			state.map(vi.fn());
			expect(state.subscribe).toHaveBeenCalledTimes(1);
		});

		it("return new state", () => {
			const state = new State(0);

			const newState = state.map((state) => state + 1);
			expect(newState).instanceOf(State);
		});

		it("react to base state", () => {
			const baseState = new State(0);
			const newState = baseState.map((state) => state + 1);

			baseState.inform(1);
			expect(newState.get()).toBe(2);

			baseState.inform(100);
			expect(newState.get()).toBe(101);

			baseState.inform(999);
			expect(newState.get()).toBe(1000);
		});
	});
});
