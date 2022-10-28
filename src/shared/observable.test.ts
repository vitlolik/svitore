import { describe, it, expect, vi } from "vitest";
import { Observable, Observer } from "./observable";

describe("observable", () => {
	class TestObservable<T = void> extends Observable<T> {
		getObservers() {
			return this.observers;
		}

		observe(observer: Observer<T>) {
			return super.observe(observer);
		}

		notify(params: T) {
			return super.notify(params);
		}
	}

	it("observe", async () => {
		const observable = new TestObservable();
		const observer = vi.fn();

		observable.observe(observer);

		expect(observable.getObservers().size).toBe(1);
		expect(observable.getObservers().has(observer)).toBeTruthy();
	});

	it("unobserve", async () => {
		const observable = new TestObservable();
		const observer = vi.fn();

		const unobserve = observable.observe(observer);
		expect(observable.getObservers().size).toBe(1);

		unobserve();
		expect(observable.getObservers().size).toBe(0);
		expect(observable.getObservers().has(observer)).toBeFalsy();
	});

	it("notify observers", async () => {
		const observable = new TestObservable<string>();
		const observer = vi.fn();
		observable.observe(observer);
		expect(observer).toHaveBeenCalledTimes(0);

		observable.notify("test");
		expect(observer).toHaveBeenCalledTimes(1);
		expect(observer).toHaveBeenCalledWith("test", observable);
	});

	it("notify observers with error in observer", async () => {
		const observable = new TestObservable<string>();
		const observerWithError = () => {
			throw new Error();
		};
		const observer = vi.fn();
		observable.observe(observerWithError);
		observable.observe(observer);

		observable.notify("test");
		expect(observer).toHaveBeenCalledTimes(1);
		expect(observer).toHaveBeenCalledWith("test", observable);
	});

	it("release", async () => {
		const observable = new TestObservable();
		const observer1 = vi.fn();
		const observer2 = vi.fn();

		observable.observe(observer1);
		observable.observe(observer2);

		expect(observable.getObservers().size).toBe(2);

		observable.release()
		expect(observable.getObservers().size).toBe(0);
	});
});
