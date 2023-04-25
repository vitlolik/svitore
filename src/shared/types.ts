import { Entity } from "./entity";

type ExtractEntitiesTypes<T extends ReadonlyArray<Entity<any>>> = {
	[K in keyof T]: T[K] extends Entity<infer U> ? U : never;
};

export { ExtractEntitiesTypes };
