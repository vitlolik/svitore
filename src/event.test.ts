import { describe, it, expect, vi } from "vitest";

import { Event } from "./event";
import { Entity } from "./shared";
import { Middleware } from "./middleware";

describe("event", () => {
	it("type", () => {
		const event = new Event();

		expect(event).instanceOf(Entity);
	});

	it("initial calls", () => {
		const event = new Event();

		expect(event.calls).toBe(0);
	});

	it("initial options", () => {
		const event = new Event();

		expect(event.options).toEqual({});
	});

	describe("dispatch - call event with payload", () => {
		it("should notify subscribers", () => {
			const event = new Event<number>();
			const subscriber = vi.fn();
			event.subscribe(subscriber);

			expect(subscriber).toBeCalledTimes(0);

			event.dispatch(1);
			expect(subscriber).toBeCalledTimes(1);
			expect(subscriber).toHaveBeenCalledWith(1, event);

			event.dispatch(2);
			expect(subscriber).toBeCalledTimes(2);
			expect(subscriber).toHaveBeenCalledWith(2, event);

			event.dispatch(0);
			expect(subscriber).toBeCalledTimes(3);
			expect(subscriber).toHaveBeenCalledWith(0, event);
		});

		it("should increase calls count", () => {
			const event = new Event();

			expect(event.calls).toBe(0);

			event.dispatch();
			expect(event.calls).toBe(1);

			event.dispatch();
			event.dispatch();
			expect(event.calls).toBe(3);

			event.dispatch();
			event.dispatch();
			event.dispatch();
			expect(event.calls).toBe(6);
		});

		it("can past custom condition for dispatch", () => {
			const event = new Event({ shouldDispatch: (): boolean => false });
			const subscriber = vi.fn();
			event.subscribe(subscriber);

			event.dispatch();
			expect(subscriber).toHaveBeenCalledTimes(0);

			event.dispatch();
			event.dispatch();
			event.dispatch();
			expect(subscriber).toHaveBeenCalledTimes(0);
			expect(event.calls).toBe(0);
		});
	});

	describe("validator", () => {
		it("should call validator chain", () => {
			const middlewareFunc1 = vi.fn((payload) => payload);
			const middlewareFunc2 = vi.fn((payload) => payload);

			const event = new Event<number>().setMiddlewareChain([
				new Middleware(middlewareFunc1),
				new Middleware(middlewareFunc2),
			]);

			event.dispatch(10);

			expect(middlewareFunc1).toHaveBeenCalledTimes(1);
			expect(middlewareFunc2).toHaveBeenCalledTimes(1);
			expect(middlewareFunc1).toHaveBeenCalledWith(10);
			expect(middlewareFunc2).toHaveBeenCalledWith(10);
		});

		it("should mutate payload inside chain", () => {
			const middlewareFunc1 = vi.fn((payload) => payload + 1);
			const middlewareFunc2 = vi.fn((payload) => payload);

			const event = new Event<number>().setMiddlewareChain([
				new Middleware(middlewareFunc1),
				new Middleware(middlewareFunc2),
			]);

			event.dispatch(10);

			expect(middlewareFunc1).toHaveBeenCalledWith(10);
			expect(middlewareFunc2).toHaveBeenCalledWith(11);
		});

		it("should break the chain if there is an error", () => {
			const middlewareFunc1 = vi.fn((_payload) => {
				throw new Error();
			});
			const middlewareFunc2 = vi.fn((payload) => payload);

			const event = new Event<number>().setMiddlewareChain([
				new Middleware(middlewareFunc1),
				new Middleware(middlewareFunc2),
			]);

			event.dispatch(10);

			expect(middlewareFunc1).toHaveBeenCalledTimes(1);
			expect(middlewareFunc2).toHaveBeenCalledTimes(0);
		});

		it("should not notify subscribers if there is an error inside chain", () => {
			const middlewareFunc1 = (_payload: number): number => {
				throw new Error();
			};
			const middlewareFunc2 = (payload: number): number => payload;
			const mockSubscriber = vi.fn();

			const event = new Event<number>().setMiddlewareChain([
				new Middleware(middlewareFunc1),
				new Middleware(middlewareFunc2),
			]);
			event.subscribe(mockSubscriber);

			event.dispatch(10);

			expect(mockSubscriber).toHaveBeenCalledTimes(0);
		});
	});
});
