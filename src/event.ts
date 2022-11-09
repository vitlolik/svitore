import { Entity } from "./shared/entity";
import { State } from "./state";
import { EventOptions } from "./types";

const noCalled = Symbol("no called");

class Event<TPayload extends any = void, TMeta extends any = any> extends Entity<TPayload> {
	calls = 0;
	prevPayload: TPayload | typeof noCalled = noCalled;
	payload: TPayload | typeof noCalled = noCalled;
	meta?: TMeta;

	constructor(protected options: EventOptions<TMeta> = {}) {
		super();
		this.meta = options.meta;
	}

	private shouldDispatch(): boolean {
		if (this.options.once && this.calls === 1) return false;

		return true;
	}

	inform(payload: TPayload): void {
		this.fire(payload);
	}

	fire(payload: TPayload): void {
		if (!this.shouldDispatch()) return;

		this.calls++;
		this.prevPayload = this.payload;
		this.payload = payload;
		this.notify(payload);
	}

	direct<A, TTargetParams extends any>(options: {
		data: State<A>;
		map: (a: A) => TTargetParams;
		target: Entity<TTargetParams> | Entity<TTargetParams>[];
	}): () => void;

	direct<A, B, TTargetParams extends any>(options: {
		data: [State<A>, State<B>];
		map: (a: A, b: B) => TTargetParams;
		target: Entity<TTargetParams> | Entity<TTargetParams>[];
	}): () => void;

	direct<A, B, C, TTargetParams extends any>(options: {
		data: [State<A>, State<B>, State<C>];
		map: (a: A, b: B, c: C) => TTargetParams;
		target: Entity<TTargetParams> | Entity<TTargetParams>[];
	}): () => void;

	direct<A, B, C, D, TTargetParams extends any>(options: {
		data: [State<A>, State<B>, State<C>, State<D>];
		map: (a: A, b: B, c: C, d: D) => TTargetParams;
		target: Entity<TTargetParams> | Entity<TTargetParams>[];
	}): () => void;

	direct<A, B, C, D, E, TTargetParams extends any>(options: {
		data: [State<A>, State<B>, State<C>, State<D>, State<E>];
		map: (a: A, b: B, c: C, d: D, e: E) => TTargetParams;
		target: Entity<TTargetParams> | Entity<TTargetParams>[];
	}): () => void;

	direct<A, B, C, D, E, F, TTargetParams extends any>(options: {
		data: [State<A>, State<B>, State<C>, State<D>, State<E>, State<F>];
		map: (a: A, b: B, c: C, d: D, e: E, f: F) => TTargetParams;
		target: Entity<TTargetParams> | Entity<TTargetParams>[];
	}): () => void;

	direct<A, B, C, D, E, F, TTargetParams extends any>(options: {
		data: [State<A>, State<B>, State<C>, State<D>, State<E>, State<F>];
		map: (a: A, b: B, c: C, d: D, e: E, f: F) => TTargetParams;
		target: Entity<TTargetParams> | Entity<TTargetParams>[];
	}): () => void;

	direct<A, B, C, D, E, F, G, TTargetParams extends any>(options: {
		data: [
			State<A>,
			State<B>,
			State<C>,
			State<D>,
			State<E>,
			State<F>,
			State<G>
		];
		map: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => TTargetParams;
		target: Entity<TTargetParams> | Entity<TTargetParams>[];
	}): () => void;

	direct<A, B, C, D, E, F, G, H, TTargetParams extends any>(options: {
		data: [
			State<A>,
			State<B>,
			State<C>,
			State<D>,
			State<E>,
			State<F>,
			State<G>,
			State<H>
		];
		map: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => TTargetParams;
		target: Entity<TTargetParams> | Entity<TTargetParams>[];
	}): () => void;

	direct<A, B, C, D, E, F, G, H, I, TTargetParams extends any>(options: {
		data: [
			State<A>,
			State<B>,
			State<C>,
			State<D>,
			State<E>,
			State<F>,
			State<G>,
			State<H>,
			State<I>
		];
		map: (
			a: A,
			b: B,
			c: C,
			d: D,
			e: E,
			f: F,
			g: G,
			h: H,
			i: I
		) => TTargetParams;
		target: Entity<TTargetParams> | Entity<TTargetParams>[];
	}): () => void;

	direct<A, B, C, D, E, F, G, H, I, J, TTargetParams extends any>(options: {
		data: [
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
		];
		map: (
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
		) => TTargetParams;
		target: Entity<TTargetParams> | Entity<TTargetParams>[];
	}): () => void;

	direct<TData extends any, TTargetParams extends any>({
		data,
		map,
		target,
	}: {
		data: State<TData> | State<TData>[];
		map: (...payload: TData[]) => TTargetParams;
		target: Entity<TTargetParams> | Entity<TTargetParams>[];
	}): () => void {
		const targetList = Array.isArray(target) ? target : [target];
		const dataList = Array.isArray(data) ? data : [data];

		return this.channel({
			target: targetList,
			map: () => map(...dataList.map((state) => state.get())),
		});
	}
}

export { Event, noCalled };
