type Observer<T = void> = (data: T, instance: Observable<T>) => void;

abstract class Observable<T = void> {
	protected observers: Set<Observer<T>> = new Set();

	protected observe(observer: Observer<T>) {
		this.observers.add(observer);

		return () => {
			this.observers.delete(observer);
		};
	}

	protected notify(params: T) {
		this.observers.forEach((observer) => {
			try {
				observer(params, this);
			} catch (error) {
				console.error(error);
			}
		});
	}

	release() {
		this.observers = new Set();
	}
}

export { Observable, Observer };
