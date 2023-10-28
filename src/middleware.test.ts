import { describe, it, expect, vi } from "vitest";

import { Middleware } from "./middleware";

describe("middleware", () => {
	it("call - should call function with payload", () => {
		const mockFn = vi.fn<[number]>((value) => value);
		const middleware = new Middleware(mockFn);
		middleware.call(10);

		expect(mockFn).toHaveBeenCalledTimes(1);
		expect(mockFn).toHaveBeenCalledWith(10);
	});

	it("call - should return specific object", () => {
		const middleware = new Middleware<number>((value) => value);
		const result = middleware.call(10);

		expect(result).toEqual({ hasError: false, payload: 10 });
	});

	it("call - should return correct hasError", () => {
		const middleware = new Middleware<string>((value) => {
			throw new Error(value);
		});
		const result = middleware.call("test");

		expect(result).toEqual({ hasError: true, payload: "test" });
	});

	it("should call the onError handler if an error occurs", () => {
		const mockErrorHandler = vi.fn();
		const middleware = new Middleware<string>((value) => {
			throw new Error(`Test error: ${value}`);
		});
		middleware.onError(mockErrorHandler);
		middleware.call("test");

		expect(mockErrorHandler).toHaveBeenCalledTimes(1);
		expect(mockErrorHandler).toHaveBeenCalledWith(
			new Error("Test error: test")
		);
	});
});
