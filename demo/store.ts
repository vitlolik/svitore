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

const logMiddleware: Middleware<any> = (context, next) => {
	console.log(context);
	next();
};

const createStore = (): Store => {
	// define
	const demoFormModule = Svitore.createModule("demo form");

	const changeFirstName = demoFormModule.createEvent<string>();
	const changeSecondName = demoFormModule.createEvent<string>();
	const changeAge = demoFormModule.createEvent<number>();
	const submitted = demoFormModule.createEvent();
	const resetEvent = demoFormModule.createEvent();
	const debouncedSubmitEvent = demoFormModule.createDebouncedEvent(500);
	const throttledSubmitEvent = demoFormModule.createThrottledEvent(500);

	const firstNameState = demoFormModule.createPersistState(
		"",
		"firstName",
		window.sessionStorage
	);
	const secondNameState = demoFormModule.createPersistState(
		"",
		"lastName",
		window.sessionStorage
	);
	const ageState = demoFormModule.createPersistState(
		1,
		"age",
		window.sessionStorage
	);

	const symbolsCountState = demoFormModule.createComputedState(
		firstNameState,
		secondNameState,
		(firstName, secondName) =>
			firstName.trim().length + secondName.trim().length
	);

	const logEffect = demoFormModule.createEffect(() => {
		console.log("УРА !");

		return Promise.resolve();
	});
	const logEffectRunner = demoFormModule.createEffectRunner(logEffect, {
		delay: ({ successfulCount }) => successfulCount * 1500,
		successfulCount: 3,
	});

	// logic
	changeFirstName.applyMiddleware(logMiddleware);
	changeSecondName.applyMiddleware(logMiddleware);

	ageState.changeOn(changeAge);
	firstNameState.changeOn(changeFirstName);
	secondNameState.changeOn(changeSecondName);

	logEffectRunner.subscribe(console.log);

	debouncedSubmitEvent.subscribe(() => {
		console.log("debouncedSubmitEvent called");
	});
	throttledSubmitEvent.subscribe(() => {
		console.log("throttledSubmitEvent called");
	});

	debouncedSubmitEvent.trigger(submitted);
	throttledSubmitEvent.trigger(submitted);
	logEffectRunner.trigger(submitted);

	resetEvent.subscribe(() => {
		demoFormModule.resetState();
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
