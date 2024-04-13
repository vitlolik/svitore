import { describe, expect, test, vi } from "vitest";

import { AbstractEvent } from "./abstract-event";
import { Entity } from "./entity";

describe("abstract-event", () => {
	class Event<Payload = void> extends AbstractEvent<Payload> {}

	test("type", () => {
		const event = new Event();

		expect(event).instanceOf(Entity);
	});

	describe("dispatch - call event with payload", () => {
		test("should notify subscribers", () => {
			const event = new Event<number>();
			const subscriber = vi.fn();
			event.subscribe(subscriber);

			expect(subscriber).toBeCalledTimes(0);

			event.dispatch(1);
			expect(subscriber).toHaveBeenCalledOnce();
			expect(subscriber).toHaveBeenCalledWith(1);

			event.dispatch(2);
			expect(subscriber).toBeCalledTimes(2);
			expect(subscriber).toHaveBeenCalledWith(2);

			event.dispatch(0);
			expect(subscriber).toBeCalledTimes(3);
			expect(subscriber).toHaveBeenCalledWith(0);
		});
	});

	describe("applyMiddleware", () => {
		test("should setup middlewares", () => {
			const event = new Event<string>().applyMiddleware((_context, next) =>
				next(),
			);

			const subscriber = vi.fn();
			event.subscribe(subscriber);

			event.dispatch("test");
			expect(subscriber).toHaveBeenCalledOnce();
		});

		test("you can transform data in middleware", () => {
			const event = new Event<string>().applyMiddleware((context, next) => {
				context.value = context.value.toUpperCase();
				next();
			});

			const subscriber = vi.fn();
			event.subscribe(subscriber);

			event.dispatch("test");
			expect(subscriber).toHaveBeenCalledOnce();
			expect(subscriber).toHaveBeenCalledWith("TEST");
		});

		test("tou can stop event, if next function doesn't call", () => {
			const event = new Event<string>().applyMiddleware(
				(_context, _next) => {},
			);

			const subscriber = vi.fn();
			event.subscribe(subscriber);

			event.dispatch("test");
			expect(subscriber).not.toHaveBeenCalledOnce();
		});

		test("tou can pass many middlewares", () => {
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
			expect(subscriber).toHaveBeenCalledWith("-TEST-");
		});

		test("should call error event if error thrown", () => {
			const toShortStringEvent = new Event<Error>();
			const mockErrorEventSubscriber = vi.fn();
			const mockTargetEventSubscriber = vi.fn();
			toShortStringEvent.subscribe(mockErrorEventSubscriber);

			const event = new Event<string>().applyMiddleware((context, next) => {
				if (context.value.length < 3) {
					throw new Error("To short string");
				}

				next();
			}, toShortStringEvent);
			event.subscribe(mockTargetEventSubscriber);

			event.dispatch("Hello!");
			expect(mockErrorEventSubscriber).not.toHaveBeenCalled();
			expect(mockTargetEventSubscriber).toHaveBeenCalledOnce();
			expect(mockTargetEventSubscriber).toHaveBeenCalledWith("Hello!");

			event.dispatch("Hi");
			expect(mockErrorEventSubscriber).toHaveBeenCalledOnce();
			expect(mockErrorEventSubscriber).toHaveBeenCalledWith(
				new Error("To short string"),
			);
			expect(mockTargetEventSubscriber).toHaveBeenCalledTimes(1);
		});

		test("should throw error if error event does not defined", () => {
			const mockTargetEventSubscriber = vi.fn();

			const event = new Event<string>().applyMiddleware((context, next) => {
				if (context.value.length < 3) {
					throw new Error("To short string");
				}

				next();
			});
			event.subscribe(mockTargetEventSubscriber);

			try {
				event.dispatch("Hi");
			} catch (error) {
				expect(error).toEqual(new Error("To short string"));
			}

			expect(mockTargetEventSubscriber).not.toHaveBeenCalled();
		});
	});

	describe("on", () => {
		test("should subscribe on another entity", () => {
			const event = new Event<string>();
			const triggerEvent = new Event<string>();
			const mockDispatch = vi.fn();

			event.on(triggerEvent);
			event.dispatch = mockDispatch;

			triggerEvent.dispatch("test");

			expect(mockDispatch).toHaveBeenCalledOnce();
			expect(mockDispatch).toHaveBeenCalledWith("test");
		});

		test("should subscribe on another entity and transform payload", () => {
			const event = new Event<string>();
			const triggerEvent = new Event<number>();
			const mockDispatch = vi.fn();

			event.on(triggerEvent, (numericValue) => `${numericValue}_test`);
			event.dispatch = mockDispatch;

			triggerEvent.dispatch(10);
			expect(mockDispatch).toHaveBeenCalledOnce();
			expect(mockDispatch).toHaveBeenCalledWith("10_test");
		});
	});
});
