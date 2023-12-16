import { AbstractState, Entity } from "./services";

type ExtractEntitiesTypes<T extends ReadonlyArray<Entity<any>>> = {
	[K in keyof T]: T[K] extends AbstractState<infer U> ? U : never;
};

type SelectorCallback<
	StateList extends ReadonlyArray<AbstractState<any>>,
	Result = void
> = (...args: ExtractEntitiesTypes<StateList>) => Result;

export { SelectorCallback, ExtractEntitiesTypes };
