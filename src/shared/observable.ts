import { logError } from "./error";

type Observer<T = void> = (data: T, instance: Observable<T>) => void;

abstract class Observable<T = void> {
	protected observers: Set<Observer<T>> = new Set();

	protected observe(observer: Observer<T>): () => void {
		this.observers.add(observer);

		return () => {
			this.observers.delete(observer);
		};
	}

	protected notify(params: T): void {
		this.observers.forEach((observer) => {
			try {
				observer(params, this);
			} catch (error) {
				logError(error);
			}
		});
	}

	release(): void {
		this.observers = new Set();
	}
}

export { Observable, Observer };
