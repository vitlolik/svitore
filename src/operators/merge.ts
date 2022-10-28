import { State } from "../state";

export function merge<TResult, A, B>(
	stateLists: [State<A>, State<B>],
	selector: (a: A, b: B) => TResult
): State<TResult>;

export function merge<TResult, A, B, C>(
	stateLists: [State<A>, State<B>, State<C>],
	selector: (a: A, b: B, c: C) => TResult
): State<TResult>;

export function merge<TResult, A, B, C, D>(
	stateLists: [State<A>, State<B>, State<C>, State<D>],
	selector: (a: A, b: B, c: C, d: D) => TResult
): State<TResult>;

export function merge<TResult, A, B, C, D, E>(
	stateLists: [State<A>, State<B>, State<C>, State<D>, State<E>],
	selector: (a: A, b: B, c: C, d: D, e: E) => TResult
): State<TResult>;

export function merge<TResult, A, B, C, D, E, F>(
	stateLists: [State<A>, State<B>, State<C>, State<D>, State<E>, State<F>],
	selector: (a: A, b: B, c: C, d: D, e: E, f: F) => TResult
): State<TResult>;

export function merge<TResult, A, B, C, D, E, F, G>(
	stateLists: [
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

export function merge<TResult, A, B, C, D, E, F, G, H>(
	stateLists: [
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

export function merge<TResult, A, B, C, D, E, F, G, H, I>(
	stateLists: [
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

export function merge<TResult, A, B, C, D, E, F, G, H, I, J>(
	stateLists: [
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

export function merge<TState>(
	stateLists: State[],
	selector: (...args: any[]) => TState
): State<TState> {
	const getStateData = (stateLists: State[]) =>
		selector(...stateLists.map((state) => state.get()));

	const newState = new State(getStateData(stateLists));

	stateLists.forEach((state) => {
		state.channel({
			target: newState,
			map: () => getStateData(stateLists),
		});
	});

	return newState;
}
