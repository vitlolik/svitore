type Observer<TParams = void> = (
	data: TParams,
	instance: Observable<TParams>
) => void;

abstract class Observable<TParams = void> {
	protected observers: Set<Observer<TParams>> = new Set();

	protected observe(observer: Observer<TParams>) {
		this.observers.add(observer);

		return () => {
			this.observers.delete(observer);
		};
	}

	protected notify(params: TParams) {
		this.observers.forEach((observer) => {
			try {
				observer(params, this);
			} catch (error) {}
		});
	}

	release = () => {
		this.observers = new Set();
	};
}

export { Observable, Observer };
