import { ComputedState, Effect } from "./entities";
import { Entity } from "./entities/services";
import { State } from "./entities";

const isState = <T>(entity: Entity<T>): entity is State<T> => {
	return entity instanceof State;
};

const isComputedState = <StateList extends ReadonlyArray<State<any>>, T>(
	entity: Entity<any>
): entity is ComputedState<StateList, T> => {
	return entity instanceof ComputedState;
};

const isSimpleState = <T>(entity: Entity<any>): entity is State<T> => {
	return isState(entity) && !isComputedState(entity);
};

const isEffect = <Params, Result, Error>(
	entity: Entity<any>
): entity is Effect<Params, Result, Error> => {
	return entity instanceof Effect;
};

export { isState, isSimpleState, isEffect, isComputedState };
