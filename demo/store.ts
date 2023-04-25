import {
	Effect,
	Event,
	PersistState,
	State,
	ComputeState,
	DebouncedEvent,
	ThrottledEvent,
} from "../src";

type Store = {
	changeFirstName: Event<string>;
	changeSecondName: Event<string>;
	changeAge: Event<number>;
	submitted: Event<void>;
	resetEvent: Event<void>;

	symbolsCountState: State<number>;
	firstNameState: State<string>;
	secondNameState: State<string>;
	ageState: State<number>;
};

const createStore = (): Store => {
	const changeFirstName = new Event<string>();
	const changeSecondName = new Event<string>();
	const changeAge = new Event<number>();
	const submitted = new Event();
	const resetEvent = new Event();
	const debouncedSubmitEvent = new DebouncedEvent(500);
	const throttledSubmitEvent = new ThrottledEvent(500);

	debouncedSubmitEvent.subscribe(() => {
		console.log("debouncedSubmitEvent called");
	});
	throttledSubmitEvent.subscribe(() => {
		console.log("throttledSubmitEvent called");
	});

	const submitEffect = new Effect(
		(
			data: {
				firstName: State<string>;
				secondName: State<string>;
				symbolsCount: State<number>;
			},
			abortController
		) =>
			new Promise<void>((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					console.log(
						JSON.stringify(
							{
								firstName: data.firstName.get(),
								secondName: data.secondName.get(),
								symbolsCount: data.symbolsCount.get(),
							},
							null,
							2
						)
					);
					if (Math.random() > 0.5) {
						resolve();
					} else reject();
				}, 3000);

				abortController.signal.onabort = (): void => {
					const error = new Error();
					error.name = "AbortError";

					clearTimeout(timeoutId);
					console.log("aborted", timeoutId);
					reject(error);
				};
			}),
		{ isAutoAbort: true }
	);

	submitEffect.isPending.subscribe((v) => console.log("pendingState", v));

	submitEffect.subscribe((data) => {
		console.log(`subscribe | ${data.state}`, data);
	});

	const firstNameState = new PersistState(
		"",
		"firstName",
		window.sessionStorage
	);
	const secondNameState = new PersistState(
		"",
		"lastName",
		window.sessionStorage
	);
	const ageState = new PersistState(1, "age", window.sessionStorage);

	changeFirstName.subscribe((value) => firstNameState.set(value));
	changeSecondName.subscribe((value) => secondNameState.set(value));
	changeAge.subscribe((value) => ageState.set(value));

	const symbolsCountState = new ComputeState(
		firstNameState,
		secondNameState,
		(firstName, secondName) =>
			firstName.trim().length + secondName.trim().length
	);

	submitted.subscribe(() => {
		submitEffect.run({
			firstName: firstNameState,
			secondName: secondNameState,
			symbolsCount: symbolsCountState,
		});
		debouncedSubmitEvent.dispatch();
		throttledSubmitEvent.dispatch();

		// setTimeout(() => {
		// 	submitEffect.release();
		// }, 1000);
	});

	resetEvent.subscribe(() => {
		firstNameState.reset();
		secondNameState.reset();
		ageState.reset();
	});

	return {
		changeFirstName,
		changeSecondName,
		submitted,
		resetEvent,
		firstNameState,
		secondNameState,
		symbolsCountState,
		ageState,
		changeAge,
	};
};

export { createStore };
