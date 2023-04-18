import { createStore } from "./store";

const main = () => {
	const form = document.getElementById("app") as HTMLFormElement;
	const fistNameInput = document.getElementById(
		"firstName"
	) as HTMLInputElement;
	const secondNameInput = document.getElementById(
		"secondName"
	) as HTMLInputElement;
	const ageInput = document.getElementById("age") as HTMLInputElement;
	const symbolsCount = document.getElementById(
		"symbolsCount"
	) as HTMLSpanElement;
	const resetButton = document.getElementById("reset") as HTMLButtonElement;

	const store = createStore();

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		store.submitted.dispatch();
	});
	fistNameInput.addEventListener("input", (event) => {
		store.changeFirstName.dispatch((event.target as HTMLInputElement).value);
	});
	secondNameInput.addEventListener("input", (event) => {
		store.changeSecondName.dispatch((event.target as HTMLInputElement).value);
	});
	ageInput.addEventListener("input", (event) => {
		store.changeAge.dispatch((event.target as HTMLInputElement).valueAsNumber);
	});
	resetButton.addEventListener("click", () => {
		store.resetEvent.dispatch();
	});

	store.firstNameState.subscribe((value) => {
		fistNameInput.value = value;
	});
	store.secondNameState.subscribe((value) => {
		secondNameInput.value = value;
	});
	store.ageState.subscribe((value) => {
		ageInput.value = value as any;
	});
	store.symbolsCountState.subscribe((value) => {
		symbolsCount.textContent = value.toString();
	});

	fistNameInput.value = store.firstNameState.get();
	secondNameInput.value = store.secondNameState.get();
	ageInput.value = store.ageState.get().toString();
	symbolsCount.textContent = store.symbolsCountState.get().toString();
};

main();
