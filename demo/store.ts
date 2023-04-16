import { Effect, Event, State, computeState } from "../src";

const createStore = () => {
	const changeFirstName = new Event<string>();
	const changeSecondName = new Event<string>();
	const submitted = new Event();
	const resetEvent = new Event();

	const submitEffect = new Effect(
		(data: {
			firstName: State<string>;
			secondName: State<string>;
			symbolsCount: State<number>;
		}) =>
			new Promise<void>((resolve) => {
				setTimeout(() => {
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
					resolve();
				}, 3000);
			})
	);

	const firstNameState = new State("");
	const secondNameState = new State("");

	changeFirstName.subscribe(firstNameState.set);
	changeSecondName.subscribe(secondNameState.set);

	const symbolsCountState = computeState(
		[firstNameState, secondNameState],
		(firstName, secondName) =>
			firstName.trim().length + secondName.trim().length
	);

	submitted.subscribe(() => {
		submitEffect.run({
			firstName: firstNameState,
			secondName: secondNameState,
			symbolsCount: symbolsCountState,
		});
	});

	resetEvent.subscribe(() => {
		firstNameState.reset();
		secondNameState.reset();
	});

	return {
		changeFirstName,
		changeSecondName,
		submitted,
		resetEvent,
		firstNameState,
		secondNameState,
		symbolsCountState,
	};
};

export { createStore };
