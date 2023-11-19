import { ComputedState, Event, Middleware, State, Svitore } from "../src";

type Store = {
	changeFirstName: Event<string>;
	changeSecondName: Event<string>;
	changeAge: Event<number>;
	submitted: Event<void>;
	resetEvent: Event<void>;

	symbolsCountState: ComputedState<[State<string>, State<string>], number>;
	firstNameState: State<string>;
	secondNameState: State<string>;
	ageState: State<number>;
};

const createStore = (): Store => {
	const demoFormModule = Svitore.initModule("demo form");

	const logMiddleware: Middleware<any> = (context, next) => {
		console.log(context);
		next();
	};

	const changeFirstName = demoFormModule
		.initEvent<string>()
		.applyMiddleware(logMiddleware);

	const changeSecondName = demoFormModule
		.initEvent<string>()
		.applyMiddleware(logMiddleware);
	const changeAge = demoFormModule.initEvent<number>();
	const submitted = demoFormModule.initEvent();
	const resetEvent = demoFormModule.initEvent();
	const debouncedSubmitEvent = demoFormModule.initDebouncedEvent(500);
	const throttledSubmitEvent = demoFormModule.initThrottledEvent(500);

	debouncedSubmitEvent.subscribe(() => {
		console.log("debouncedSubmitEvent called");
	});
	throttledSubmitEvent.subscribe(() => {
		console.log("throttledSubmitEvent called");
	});

	const submitEffect = demoFormModule.initEffect(
		(
			data: {
				firstName: State<string>;
				secondName: State<string>;
				symbolsCount: ComputedState<[State<string>, State<string>], number>;
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

	const firstNameState = demoFormModule
		.initPersistState("", "firstName", window.sessionStorage)
		.changeOn(changeFirstName);

	const secondNameState = demoFormModule
		.initPersistState("", "lastName", window.sessionStorage)
		.changeOn(changeSecondName);
	const ageState = demoFormModule
		.initPersistState(1, "age", window.sessionStorage)
		.changeOn(changeAge);

	const symbolsCountState = demoFormModule.initComputedState(
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
	});

	resetEvent.subscribe(() => {
		demoFormModule.resetState.dispatch();
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
