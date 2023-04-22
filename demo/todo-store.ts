import { Event, State } from "../src";

type Todo = {
	id: string;
	title: string;
	isCompleted?: boolean;
};

const todoListState = new State<Todo[]>([]);

const addTodo = new Event<string>();

const deleteTodo = new Event<string>();

const toggleTodo = new Event<string>();

addTodo.subscribe((title) => {
	todoListState.change((todoList) => [
		...todoList,
		{ id: window.crypto.randomUUID(), title },
	]);
});

deleteTodo.subscribe((id) => {
	todoListState.change((todoList) => todoList.filter((todo) => todo.id !== id));
});

toggleTodo.subscribe((id) => {
	todoListState.change((todoList) =>
		todoList.map((todo) =>
			todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
		)
	);
});
