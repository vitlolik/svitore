# svitore

![example branch parameter](https://github.com/vitlolik/svitore/actions/workflows/ci.yml/badge.svg?branch=master)
[![codecov](https://codecov.io/gh/vitlolik/svitore/branch/master/graph/badge.svg)](https://codecov.io/gh/vitlolik/svitore)

State manager

## Installation

```sh
npm i svitore
```

## Packages

- [svitore-react](https://github.com/vitlolik/svitore-react)

## Examples

- [Counter](https://codesandbox.io/s/counter-t5k6t3)
- [Todo app](https://codesandbox.io/s/todo-mnbd1g)
- [Abort request](https://codesandbox.io/s/abort-request-ptbi4m)

## Documentation

### Entities: [State](#state) | [Event](#event) | [Effect](#effect)

All entity types are extended from a basic abstract [entity](#entity-api) and have it functionality.
See below for a description of the [entity](#entity-api) api.

### State

State is an object that stores any data. It will updated when got new data if they does not equal current data.

#### Methods

1. [get](#get) - get state
2. [set](#set) - set new state
3. [getPrev](#getPrev) - get previous state
4. [reset](#reset) - reset current state

#### Example

```ts
import { State } from "svitore";

const countState = new State(0);

countState.get(); // 0
```

##### get

Get state

```ts
import { State } from "svitore";

const nameState = new State("Name");
const countState = new State(0);

nameState.get(); // 'Name'
countState.get(); // 0
```

##### set

Set new state

```ts
import { State } from "svitore";

const nameState = new State("Name");

nameState.get(); // 'Name'

nameState.set("qwerty");
nameState.get(); // 'qwerty'
```

##### getPrev

Get previous state

```ts
import { State, Event } from "svitore";

const nameState = new State("Name");
const countState = new State(0);

nameState.getPrev(); // 'Name'
countState.getPrev(); // 0

nameState.set("Alex");
countState.set(5);

nameState.getPrev(); // 'Name'
countState.getPrev(); // 0

nameState.set("Den");
countState.set(20);

nameState.getPrev(); // 'Alex'
countState.getPrev(); // 5
```

##### reset

Reset state to default value

```ts
import { State } from "svitore";

const countState = new State(10);
countState.change((state) => state + 1);

countState.get(); // 11

countState.reset();
countState.get(); // 10
```

### Event

Event is an object for send any payload to other entities. For example, to update the state.

#### Methods

1. [dispatch](#dispatch) - trigger event
2. [listen](#listen) - add event listener

#### Fields

1. `calls` - number of event calls
2. `meta` - any data

#### Example

```ts
import { Event } from "svitore";

const change = new Event<string>();
```

##### dispatch

Trigger event

```ts
import { Event } from "svitore";

const change = new Event<string>();

change.dispatch("Alex");
```

##### listen

Add event listener

```ts
import { Event } from "svitore";

const change = new Event<string>();

change.listen((name) => {
  console.log(name); // 'Alex'
});

change.dispatch("Alex");
```

### Effect

Effect is an object for any side effects. It's more complex entity includes [states](#state) and [events](#event)

#### Methods

1. [run](#run) - run effect function

#### Fields

1. `started` - [event](#event) that is triggered when effect function has started
2. `resolved` - [event](#event) that is triggered when effect function is fulfilled
3. `rejected` - [event](#event) that is triggered when effect function is executed with any errors except `AbortError`
4. `finished` - [event](#event) that is triggered when effect function finished
5. `aborted` - [event](#event) that is triggered when effect function has aborted. For example `AbortController.abort()`

6. `statusState` - [state](#state) status that shows process
7. `pendingState` - [state](#state) flag that shows whether the effect is in progress
8. `runningCountState` - [state](#state) that shows count of effect function in progress

#### Example

```ts
import { Effect } from "svitore";

const effect = new Effect(
  () =>
    new Promise<string>((resolve) => {
      setTimeout(() => resolve("Hello World"), 300);
    })
);

// called after effect.run() and when 300 milliseconds have passed
effect.onResolve.listen((value) => {
  console.log(value); // "Hello World"
});

effect.run();
```

##### run

Run effect function

```ts
import { Effect } from "svitore";

const effectFunction = (value: string) =>
  new Promise<string>((resolve) => {
    setTimeout(() => resolve(value.toUpperCase()), 300);
  });

const effect = new Effect(effectFunction);

effect.onResolve.listen((value) => {
  console.log(value); // "HELLO WORLD"
});

const result = await effect.run(); // you can get data here
console.log(result); // "HELLO WORLD"
```
