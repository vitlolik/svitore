import { describe, it, expect, vi } from "vitest";
import { Observable } from "./observable";
import { Entity } from "./entity";

describe("entity", () => {
	class TestEntity<T = void> extends Entity<T> {
		observe = vi.fn();
	}

	it("type", () => {
		const entity = new TestEntity();
		Entity.ENTITIES = [];

		expect(entity).instanceOf(Observable);
	});

	it("should add entity instance to static variable", () => {
		const entity1 = new TestEntity();
		const entity2 = new TestEntity();
		const entity3 = new TestEntity();

		expect(Entity.ENTITIES).toHaveLength(3);
		expect(Entity.ENTITIES).toEqual([entity1, entity2, entity3]);
	});

	it("subscribe - should call observe from parent class", () => {
		const subscriber = (): void => undefined;

		const entity = new TestEntity();
		entity.subscribe(subscriber);

		expect(entity.observe).toHaveBeenCalledTimes(1);
		expect(entity.observe).toHaveBeenCalledWith(subscriber);
	});
});
