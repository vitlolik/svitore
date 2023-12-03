import { describe, expect, vi, test } from "vitest";
import { Entity } from "./entity";

describe("entity", () => {
	class TestEntity<T = void> extends Entity<T> {
		trigger<EntityPayload>(
			entity: Entity<EntityPayload>,
			subscriber: (payload: EntityPayload) => void
		): this {
			return super.trigger(entity, subscriber);
		}
		notify(params: T): void {
			return super.notify(params);
		}
	}

	test("should subscribe on entity and entity should notify subscribers", () => {
		const mockSubscriber = vi.fn();
		const secondMockSubscriber = vi.fn();

		const entity = new TestEntity<string>();
		entity.subscribe(mockSubscriber);

		entity.notify("test");
		expect(mockSubscriber).toHaveBeenCalledOnce();
		expect(mockSubscriber).toHaveBeenCalledWith("test");

		entity.subscribe(secondMockSubscriber);

		entity.notify("test");
		expect(mockSubscriber).toHaveBeenCalledTimes(2);
		expect(mockSubscriber).toHaveBeenCalledWith("test");
		expect(secondMockSubscriber).toHaveBeenCalledOnce();
		expect(secondMockSubscriber).toHaveBeenCalledWith("test");
	});

	test("should unsubscribe", () => {
		const mockSubscriber = vi.fn();
		const secondMockSubscriber = vi.fn();

		const entity = new TestEntity<string>();
		const unsubscribeFirst = entity.subscribe(mockSubscriber);
		entity.subscribe(secondMockSubscriber);

		unsubscribeFirst();
		entity.unsubscribe(secondMockSubscriber);

		entity.notify("test");
		expect(mockSubscriber).not.toHaveBeenCalled();
		expect(secondMockSubscriber).not.toHaveBeenCalled();
	});

	test("should show error in console if some subscriber has an error", () => {
		const consoleErrorSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		const entity = new TestEntity<string>();

		const firstSubscriber = vi.fn();
		const secondSubscriber = vi.fn(() => {
			throw new Error("error inside secondSubscriber");
		});
		const thirdSubscriber = vi.fn();

		entity.subscribe(firstSubscriber);
		entity.subscribe(secondSubscriber);
		entity.subscribe(thirdSubscriber);

		entity.notify("test");

		expect(thirdSubscriber).toHaveBeenCalledOnce();
		expect(secondSubscriber).toHaveBeenCalledOnce();
		expect(thirdSubscriber).toHaveBeenCalledOnce();

		expect(consoleErrorSpy).toHaveBeenCalledOnce();
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"[svitore]",
			"Entity",
			"Some subscriber have an error",
			new Error("error inside secondSubscriber")
		);

		vi.clearAllMocks();
	});

	test("should set trigger for entity. Trigger should notify target entity", () => {
		const entity = new TestEntity();
		const anotherEntity = new TestEntity();

		const mockSubscriber = vi.fn();
		entity.trigger(anotherEntity, mockSubscriber);

		anotherEntity.notify();

		expect(mockSubscriber).toHaveBeenCalledOnce();
	});

	test("should unsubscribe all subscriber and remove them. Also unsubscribe an remove all triggers", () => {
		const entity = new TestEntity<string>();
		const secondEntity = new TestEntity();

		const firstSubscriber = vi.fn();
		const secondSubscriber = vi.fn();
		const thirdSubscriber = vi.fn();
		const triggerSubscriber = vi.fn();

		entity.subscribe(firstSubscriber);
		entity.subscribe(secondSubscriber);
		entity.subscribe(thirdSubscriber);
		entity.trigger(secondEntity, triggerSubscriber);

		entity.release();

		entity.notify("test");
		secondEntity.notify();

		expect(firstSubscriber).not.toHaveBeenCalled();
		expect(secondSubscriber).not.toHaveBeenCalled();
		expect(thirdSubscriber).not.toHaveBeenCalled();
	});
});
