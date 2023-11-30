import { describe, it, expect, vi } from "vitest";
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

	it("should add entity instance to static variable", () => {
		const entity1 = new TestEntity();
		const entity2 = new TestEntity();
		const entity3 = new TestEntity();

		expect(Entity.ENTITIES).toHaveLength(3);
		expect(Entity.ENTITIES).toEqual([entity1, entity2, entity3]);
	});

	it("should subscribe", () => {
		const mockSubscriber = vi.fn();

		const entity = new TestEntity<string>();
		entity.subscribe(mockSubscriber);

		entity.notify("test");

		expect(mockSubscriber).toHaveBeenCalledOnce();
		expect(mockSubscriber).toHaveBeenCalledWith("test");
	});

	it("should subscribe on entity", () => {
		const entity = new TestEntity();
		const anotherEntity = new TestEntity();

		const mockSubscriber = vi.fn();
		entity.trigger(anotherEntity, mockSubscriber);

		anotherEntity.notify();

		expect(mockSubscriber).toHaveBeenCalledOnce();
	});
});
