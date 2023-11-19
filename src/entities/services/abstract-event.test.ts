import { describe, it, expect, vi } from "vitest";

import { Entity } from "./entity";
import { AbstractEvent } from "./abstract-event";

describe("abstract-event", () => {
	class Event<Payload = void> extends AbstractEvent<Payload> {}

	it("type", () => {
		const event = new Event();

		expect(event).instanceOf(Entity);
	});

	describe("dispatch - call event with payload", () => {
		it("should notify subscribers", () => {
			const event = new Event<number>();
			const subscriber = vi.fn();
			event.subscribe(subscriber);

			expect(subscriber).toBeCalledTimes(0);

			event.dispatch(1);
			expect(subscriber).toHaveBeenCalledOnce();
			expect(subscriber).toHaveBeenCalledWith(1, event);

			event.dispatch(2);
			expect(subscriber).toBeCalledTimes(2);
			expect(subscriber).toHaveBeenCalledWith(2, event);

			event.dispatch(0);
			expect(subscriber).toBeCalledTimes(3);
			expect(subscriber).toHaveBeenCalledWith(0, event);
		});
	});

	describe("applyMiddleware", () => {
		it("should setup middlewares", () => {
			const event = new Event<string>().applyMiddleware((_context, next) =>
				next()
			);

			const subscriber = vi.fn();
			event.subscribe(subscriber);

			event.dispatch("test");
			expect(subscriber).toHaveBeenCalledOnce();
		});

		it("you can transform data in middleware", () => {
			const event = new Event<string>().applyMiddleware((context, next) => {
				context.value = context.value.toUpperCase();
				next();
			});

			const subscriber = vi.fn();
			event.subscribe(subscriber);

			event.dispatch("test");
			expect(subscriber).toHaveBeenCalledOnce();
			expect(subscriber).toHaveBeenCalledWith("TEST", event);
		});

		it("tou can stop event, if next function doesn't call", () => {
			const event = new Event<string>().applyMiddleware(
				(_context, _next) => {}
			);

			const subscriber = vi.fn();
			event.subscribe(subscriber);

			event.dispatch("test");
			expect(subscriber).not.toHaveBeenCalledOnce();
		});

		it("tou can pass many middlewares", () => {
			const event = new Event<string>()
				.applyMiddleware((context, next) => {
					context.value = context.value.toUpperCase();
					next();
				})
				.applyMiddleware((context, next) => {
					context.value = `-${context.value}-`;
					next();
				});

			const subscriber = vi.fn();
			event.subscribe(subscriber);

			event.dispatch("test");
			expect(subscriber).toHaveBeenCalledOnce();
			expect(subscriber).toHaveBeenCalledWith("-TEST-", event);
		});
	});
});
