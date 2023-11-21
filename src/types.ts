import { AbstractState, Entity } from "./entities/services";

type ExtractEntitiesTypes<T extends ReadonlyArray<Entity<any>>> = {
	[K in keyof T]: T[K] extends Entity<infer U> ? U : never;
};

type SelectorCallback<
	StateList extends ReadonlyArray<AbstractState<any>>,
	Result = void
> = (...args: ExtractEntitiesTypes<StateList>) => Result;

export { SelectorCallback };
