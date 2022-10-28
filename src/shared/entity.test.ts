import { describe, it, expect, vi } from "vitest";
import { Event } from "../event";
import { Entity } from "./entity";

describe("entity", () => {
	class CleanEntity<T> extends Entity<T> {}
	class TestEntity<T = void> extends Entity<T> {
		observe = vi.fn();

		getDependencies() {
			return this.dependencies;
		}

		_deleteDependency(entity: Entity<any>) {
			this.deleteDependency(entity);
		}

		_addDependency<T, TResult>(
			entity: Entity<T>,
			subscribe: (data: T) => TResult
		) {
			this.addDependency(entity, subscribe);
		}

		setAddDependency(
			addDependencyFunc: (entity: Entity<any>, subscriber: any) => void
		) {
			this.addDependency = addDependencyFunc;
		}

		setNotify(notify: () => void) {
			this.notify = notify;
		}
	}

	it("initial state", () => {
		const entity = new TestEntity();

		expect(entity.getDependencies().size).toBe(0);
	});

	it("add dependency", () => {
		const entity = new TestEntity();
		const dependencyEvent = new Event();
		const subscribe = vi.fn();
		entity._addDependency(dependencyEvent, subscribe);

		dependencyEvent.fire();

		expect(entity.getDependencies().size).toBe(1);
		expect(subscribe).toHaveBeenCalledTimes(1);
	});

	it("delete dependency", () => {
		const entity = new TestEntity();
		const dependencyEvent = new Event();
		const subscribe = vi.fn();

		entity._addDependency(dependencyEvent, subscribe);
		expect(entity.getDependencies().size).toBe(1);
		dependencyEvent.fire();

		entity._deleteDependency(dependencyEvent);
		expect(subscribe).toHaveBeenCalledTimes(1);
		dependencyEvent.fire();
		dependencyEvent.fire();
		expect(subscribe).toHaveBeenCalledTimes(1);
		expect(entity.getDependencies().size).toBe(0);
	});

	it("inform", () => {
		const entity = new TestEntity<number>();
		const notify = vi.fn();
		entity.setNotify(notify);

		entity.inform(10);
		expect(notify).toHaveBeenCalledTimes(1);
		expect(notify).toHaveBeenCalledWith(10);
	});

	it("subscribe", () => {
		const entity = new TestEntity();
		const subscriber = vi.fn();
		entity.subscribe(subscriber);

		expect(entity.observe).toBeCalledWith(subscriber);
	});

	describe("channel", () => {
		it("target depends on source", () => {
			const entity = new TestEntity<number>();
			const target = new TestEntity<number>();

			entity.channel({ target });

			expect(target.getDependencies().size).toBe(1);
			expect(target.getDependencies().has(entity)).toBeTruthy();
		});

		it("should work with array", () => {
			const entity = new TestEntity<number>();
			const target1 = new TestEntity<number>();
			const target2 = new TestEntity<number>();

			entity.channel({ target: [target1, target2] });

			expect(target1.getDependencies().size).toBe(1);
			expect(target1.getDependencies().has(entity)).toBeTruthy();

			expect(target2.getDependencies().size).toBe(1);
			expect(target2.getDependencies().has(entity)).toBeTruthy();
		});

		it("should filter calls", () => {
			const entity = new CleanEntity<number>();
			const target = new CleanEntity<number>();
			const subscriber = vi.fn();

			target.subscribe((value) => {
				subscriber(value);
			});

			entity.channel({ target, filter: (value: number) => value > 5 });

			entity.inform(1);
			expect(subscriber).toHaveBeenCalledTimes(0);

			entity.inform(3);
			expect(subscriber).toHaveBeenCalledTimes(0);

			entity.inform(6);
			expect(subscriber).toHaveBeenCalledTimes(1);
			expect(subscriber).toHaveBeenCalledWith(6);

			entity.inform(10);
			expect(subscriber).toHaveBeenCalledTimes(2);
			expect(subscriber).toHaveBeenCalledWith(10);
		});

		it("should map payload", () => {
			const entity = new CleanEntity<number>();
			const target = new CleanEntity<string>();
			const subscriber = vi.fn();

			target.subscribe((value) => {
				subscriber(value);
			});

			entity.channel({ target, map: (payload) => payload.toString() });

			entity.inform(1);
			expect(subscriber).toHaveBeenCalledTimes(1);
			expect(subscriber).toHaveBeenCalledWith("1");

			entity.inform(3);
			expect(subscriber).toHaveBeenCalledTimes(2);
			expect(subscriber).toHaveBeenCalledWith("3");
		});

		it("should filter and map payload", () => {
			const entity = new CleanEntity<string>();
			const target = new CleanEntity<string>();
			const subscriber = vi.fn();

			target.subscribe((value) => {
				subscriber(value);
			});

			entity.channel({
				target,
				filter: (payload: string) => payload.includes("hello"),
				map: (payload: string) => payload.toUpperCase(),
			});

			entity.inform("lol");
			expect(subscriber).toHaveBeenCalledTimes(0);

			entity.inform("world");
			expect(subscriber).toHaveBeenCalledTimes(0);

			entity.inform("hello world");
			expect(subscriber).toHaveBeenCalledTimes(1);
			expect(subscriber).toHaveBeenCalledWith("HELLO WORLD");
		});

		it("should off listen", () => {
			const entity = new CleanEntity<string>();
			const target = new CleanEntity<string>();
			const subscriber = vi.fn();

			target.subscribe((value) => {
				subscriber(value);
			});

			const offChanel = entity.channel({ target });
			offChanel();

			entity.inform("lol");
			entity.inform("world");
			entity.inform("hello world");
			expect(subscriber).toHaveBeenCalledTimes(0);
		});
	});

	it("release", () => {
		const entity = new TestEntity();
		const dependencyEvent1 = new Event();
		const dependencyEvent2 = new Event();
		const subscribe1 = vi.fn();
		const subscribe2 = vi.fn();

		entity._addDependency(dependencyEvent1, subscribe1);
		entity._addDependency(dependencyEvent2, subscribe2);
		expect(entity.getDependencies().size).toBe(2);

		dependencyEvent1.fire();
		dependencyEvent2.fire();

		entity.release();
		expect(subscribe1).toHaveBeenCalledTimes(1);
		expect(subscribe2).toHaveBeenCalledTimes(1);
		expect(entity.getDependencies().size).toBe(0);

		dependencyEvent1.fire();
		dependencyEvent2.fire();

		expect(subscribe1).toHaveBeenCalledTimes(1);
		expect(subscribe2).toHaveBeenCalledTimes(1);
	});
});
