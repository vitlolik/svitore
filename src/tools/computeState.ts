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

export function computeState<TResult, A, B, C, D, E, F>(
	states: [State<A>, State<B>, State<C>, State<D>, State<E>, State<F>],
	selector: (a: A, b: B, c: C, d: D, e: E, f: F) => TResult
): State<TResult>;

export function computeState<TResult, A, B, C, D, E, F, G>(
	states: [
		State<A>,
		State<B>,
		State<C>,
		State<D>,
		State<E>,
		State<F>,
		State<G>
	],
	selector: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => TResult
): State<TResult>;

export function computeState<TResult, A, B, C, D, E, F, G, H>(
	states: [
		State<A>,
		State<B>,
		State<C>,
		State<D>,
		State<E>,
		State<F>,
		State<G>,
		State<H>
	],
	selector: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => TResult
): State<TResult>;

export function computeState<TResult, A, B, C, D, E, F, G, H, I>(
	states: [
		State<A>,
		State<B>,
		State<C>,
		State<D>,
		State<E>,
		State<F>,
		State<G>,
		State<H>,
		State<I>
	],
	selector: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => TResult
): State<TResult>;

export function computeState<TResult, A, B, C, D, E, F, G, H, I, J>(
	states: [
		State<A>,
		State<B>,
		State<C>,
		State<D>,
		State<E>,
		State<F>,
		State<G>,
		State<H>,
		State<I>,
		State<J>
	],
	selector: (
		a: A,
		b: B,
		c: C,
		d: D,
		e: E,
		f: F,
		g: G,
		h: H,
		i: I,
		j: J,
		...rest: any[]
	) => TResult
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
