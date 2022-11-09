# svitore

## Installation

```sh
npm i svitore
```

<!-- **React**

```sh
npm i svitore svitore-react
``` -->

## Documentation

### Entities: [State](#state) | [Event](#event) | [Effect](#effect)

All entity types are extended from a basic abstract [entity](#entity-api) and have it functionality.
See below for a description of the [entity](#entity-api) api.

### State

State is an object that stores any data. It will updated when got new data if they does not equal current data.

#### Methods

1. [on](#on) - add event listener to state for data updating
2. [onReset](#onReset) - add reset event to state for reset data(special case ot the [on](#on))
3. [map](#map) - create a state based on the current
4. [get](#get) - get state
5. [getPrev](#getPrev) - get previous state

#### Example

```ts
import { State } from "svitore";

const $count = new State(0);

$count.get(); // 0
```

##### on

Add event listener to state for data updating

```ts
import { State, Event } from 'svitore';

const incremented = new Event();
const updated = new Event<number>();

const $count = new State(0)
  .on(incremented, (, state) => state + 1)
  .on(updated);

$count.get(); // 0

incremented.fire();
incremented.fire();
$count.get(); // 2

updated.fire(10);
$count.get(); // 10
```

##### onReset

Add reset event to state for reset data(special case ot the [on](#on))

```ts
import { State, Event } from 'svitore';

const incremented = new Event();
const reset = new Event();

const $count = new State(0)
  .on(incremented, (, state) => state + 1)
  .onReset(reset);

$count.get(); // 0

incremented.fire();
incremented.fire();
$count.get(); // 2

reset.fire();
$count.get(); // 0
```

##### map

Create a state based on the current

```ts
import { State, Event } from 'svitore';

const incremented = new Event();
const changedDouble = new Event<number>();

const $count = new State(0).on(incremented, (, state) => state + 1);

const $doubleCount = $count.map(count => count * 2).on(changedDouble);

$count.get(); // 0
$doubleCount.get(); // 0

incremented.fire();
$count.get(); // 1
$doubleCount.get(); // 2

incremented.fire();
incremented.fire();
$count.get(); // 3
$doubleCount.get(); // 6

changedDouble.fire(10);
$count.get(); // 3
$doubleCount.get(); // 10
```

##### get

Get state

```ts
import { State } from "svitore";

const $name = new State("Name");
const $count = new State(0);

$name.get(); // 'Name'
$count.get(); // 0
```

##### getPrev

Get previous state

```ts
import { State, Event } from "svitore";

const changedName = new Event<string>();
const changedCount = new Event<number>();

const $name = new State("Name").on(changedName);
const $count = new State(0).on(changedCount);

$name.getPrev(); // 'Name'
$count.getPrev(); // 0

changedName.fire("Alex");
changedCount.fire(5);

$name.getPrev(); // 'Name'
$count.getPrev(); // 0

changedName.fire("Den");
changedCount.fire(20);

$name.getPrev(); // 'Alex'
$count.getPrev(); // 5
```

### Event

Event is an object for send any payload to other entities. For example, to update the state.

#### Methods

1. [fire](#fire) - trigger event
2. [direct](#direct) - transfer [state](#state) data to target by event

#### Fields

1. `calls` - number of event calls
2. `prevPayload` - previous data with which the event was called
3. `payload` - data with which the event was last called
4. `meta` - any data

#### Example

```ts
import { Event } from "svitore";

const change = new Event<string>();
```

##### fire

Trigger event

```ts
import { Event } from "svitore";

const change = new Event<string>();

// called after submit.fire("Alex")
change.subscribe((name) => {
  console.log(name); // 'Alex'
});

change.fire("Alex");
```

##### direct

Transfer [state](#state) data to target by event

```ts
import { Event, State } from "svitore";

const submit = new Event<string>();
const $name = new State("Alex");
const $age = new State(20);
const target = new Event<{ name: string; age: number }>();

submit.direct({
  data: [$name, $age],
  map: (name, age) => ({ name, age }),
  target,
});

// called after submit.fire()
target.subscribe((value) => {
  console.log(value); // { name: 'Alex'; age: 20 }
});

submit.fire();
```

### Effect

Effect is an object for any side effects. It's more complex entity includes [states](#state) and [events](#event)

#### Methods

1. [run](#run) - run effect function
2. [onReset](#onReset) - reset the internal state of the effect

#### Fields

1. `started` - [event](#event) that is triggered when effect function has started
2. `resolved` - [event](#event) that is triggered when effect function is fulfilled
3. `rejected` - [event](#event) that is triggered when effect function is executed with any errors except `AbortError`
4. `finished` - [event](#event) that is triggered when effect function finished
5. `aborted` - [event](#event) that is triggered when effect function has aborted. For example `AbortController.abort()`

6. `$status` - [state](#state) status that shows process
7. `$pending` - [state](#state) flag that shows whether the effect is in progress
8. `$runningCount` - [state](#state) that shows count of effect function in progress

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
effect.resolved.subscribe((value) => {
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

effect.resolved.subscribe((value) => {
  console.log(value); // "HELLO WORLD"
});

const result = await effect.run(); // you can get data here
console.log(result); // "HELLO WORLD"
```

### Entity Api

All entity types: [State](#state), [Event](#event), [Effect](#effect) have it functionality

#### Methods

1. [subscribe](#subscribe) - subscribe to entity behavior. Subscriber will be notified:

- For [State](#state) - with new state
- For [Event](#event) - with event payload
- For [Event](#event) - with effect function params

2. [inform](#inform) - receive payload and notifies all subscribers, also:

- For [State](#state) - update state
- For [Event](#event) - fire event
- For [Event](#event) - run effect

3. [channel](#channel) - create a connection/channel between entities
