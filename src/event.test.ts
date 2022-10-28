import { describe, it, expect, vi } from "vitest";
import { Event, noCalled } from "./event";
import { Entity } from "./shared/entity";
import { State } from "./state";

describe("event", () => {
	class TestEvent<T = void> extends Event<T> {
		getOptions() {
			return this.options;
		}

		notify = vi.fn();
	}

	it("type", () => {
		const event = new TestEvent();

		expect(event).instanceOf(Entity);
	});

	it("initial state", () => {
		const event = new TestEvent();

		expect(event.calls).toBe(0);
		expect(event.prevPayload).toBe(noCalled);
		expect(event.payload).toBe(noCalled);
		expect(event.getOptions()).toEqual({});
	});

	it("notify", () => {
		const event = new TestEvent<number>();
		expect(event.notify).toBeCalledTimes(0);

		event.fire(1);
		expect(event.notify).toBeCalledTimes(1);
		expect(event.notify).toHaveBeenCalledWith(1);

		event.fire(2);
		expect(event.notify).toBeCalledTimes(2);
		expect(event.notify).toHaveBeenCalledWith(2);

		event.fire(0);
		expect(event.notify).toBeCalledTimes(3);
		expect(event.notify).toHaveBeenCalledWith(0);
	});

	it("calls count", () => {
		const event = new TestEvent();

		expect(event.calls).toBe(0);

		event.fire();
		expect(event.calls).toBe(1);

		event.fire();
		event.fire();
		expect(event.calls).toBe(3);

		event.fire();
		event.fire();
		event.fire();
		expect(event.calls).toBe(6);
	});

	it("prevParams", () => {
		const event = new TestEvent<string>();

		expect(event.prevPayload).toBe(noCalled);

		event.fire("first");
		event.fire("second");
		expect(event.prevPayload).toBe("first");

		event.fire("third");
		event.fire("fourth");
		event.fire("fifth");
		event.fire("sixth");
		expect(event.prevPayload).toBe("fifth");
	});

	it("params", () => {
		const event = new TestEvent<number>();

		expect(event.payload).toBe(noCalled);

		event.fire(1);
		expect(event.payload).toBe(1);

		event.fire(2);
		expect(event.payload).toBe(2);

		event.fire(3);
		expect(event.payload).toBe(3);
	});

	it("options", () => {
		const event = new TestEvent({ once: true });

		expect(event.getOptions()).toEqual({ once: true });
	});

	it("once", () => {
		const event = new TestEvent({ once: true });
		expect(event.notify).toBeCalledTimes(0);

		event.fire();
		expect(event.notify).toBeCalledTimes(1);

		event.fire();
		event.fire();
		event.fire();
		expect(event.notify).toBeCalledTimes(1);
		expect(event.calls).toBe(1);
	});

	describe("direct", () => {
		it("should cal channel method", () => {
			const sourceEvent = new Event();
			sourceEvent.channel = vi.fn();
			const target = new Event();
			const $name = new State("Alex");

			sourceEvent.direct({ data: $name, map: (name) => name, target });

			expect(sourceEvent.channel).toHaveBeenCalledTimes(1);
		});

		it("should direct data to to target", () => {
			const sourceEvent = new Event();
			const target = new Event<string>();
			target.fire = vi.fn();
			const $name = new State("Alex");

			sourceEvent.direct({ data: $name, map: (name) => name, target });

			sourceEvent.fire();

			expect(target.fire).toHaveBeenCalledTimes(1);
			expect(target.fire).toHaveBeenCalledWith("Alex");
		});

		it("should map data before direct", () => {
			const sourceEvent = new Event();
			const target = new Event<{ name: string }>();
			target.fire = vi.fn();
			const $name = new State("Alex");

			sourceEvent.direct({ data: $name, map: (name) => ({ name }), target });

			sourceEvent.fire();

			expect(target.fire).toHaveBeenCalledTimes(1);
			expect(target.fire).toHaveBeenCalledWith({ name: "Alex" });
		});

		it("should work with data list", () => {
			const sourceEvent = new Event();
			const target = new Event<{ name: string; age: number }>();
			target.fire = vi.fn();

			const $name = new State("Alex");
			const $age = new State(28);

			sourceEvent.direct({
				data: [$name, $age],
				map: (name, age) => ({ name, age }),
				target,
			});

			sourceEvent.fire();

			expect(target.fire).toHaveBeenCalledTimes(1);
			expect(target.fire).toHaveBeenCalledWith({ name: "Alex", age: 28 });
		});

		it("should work with target list", () => {
			const sourceEvent = new Event();
			const target1 = new Event<string>();
			target1.fire = vi.fn();

			const target2 = new Event<string>();
			target2.fire = vi.fn();

			const $name = new State("Alex");

			sourceEvent.direct({
				data: $name,
				map: (name) => name,
				target: [target1, target2],
			});

			sourceEvent.fire();

			expect(target1.fire).toHaveBeenCalledTimes(1);
			expect(target1.fire).toHaveBeenCalledWith("Alex");

			expect(target2.fire).toHaveBeenCalledTimes(1);
			expect(target2.fire).toHaveBeenCalledWith("Alex");
		});
	});
});
