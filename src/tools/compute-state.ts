import { State } from "../state";

export function computeState<TResult, A>(
	states: [State<A>],
	selector: (a: A) => TResult
): State<TResult>;

export function computeState<TResult, A, B>(
	states: [State<A>, State<B>],
	selector: (a: A, b: B) => TResult
): State<TResult>;

export function computeState<TResult, A, B, C>(
	states: [State<A>, State<B>, State<C>],
	selector: (a: A, b: B, c: C) => TResult
): State<TResult>;

export function computeState<TResult, A, B, C, D>(
	states: [State<A>, State<B>, State<C>, State<D>],
	selector: (a: A, b: B, c: C, d: D) => TResult
): State<TResult>;

export function computeState<TResult, A, B, C, D, E>(
	states: [State<A>, State<B>, State<C>, State<D>, State<E>],
	selector: (a: A, b: B, c: C, d: D, e: E) => TResult
): State<TResult>;

export function computeState<TState>(
	states: State<any>[],
	selector: (...args: any[]) => TState
): State<TState> {
	const getStateData = () => selector(...states.map((state) => state.get()));

	const newState = new State(getStateData());

	states.forEach((state) => {
		state.subscribe(() => {
			newState.set(getStateData());
		});
	});

	return newState;
}
