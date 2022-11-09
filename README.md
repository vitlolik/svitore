# svitore

## Installation

```sh
npm i svitore
```

**React**

```sh
npm i svitore svitore-react
```

## Documentation

### Entities: [State](#state) | [Event](#event) | [Effect](#effect)

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
2. [direct](#direct) - transfer some data to target by event

#### Fields

1. `calls` - number of event calls
2. `prevPayload` - previous data with which the event was called
3. `payload` - data with which the event was last called
4. `meta` - any data

### Effect

Effect is an object for any side effects. It's more complex entity includes [states](#state) and [events](#event)

#### Methods

1. [run](#run) - run effect function
2. [onReset](#onReset) - reset the internal state of the effect

#### Fields

1. `started` - [event](#event) that is triggered when effect function has started
2. `resolved` - [event](#event) that is triggered when effect function is fulfilled
3. `rejected` - [event](#event) that is triggered when effect function is executed with any errors
4. `finished` - [event](#event) that is triggered when effect function finished
5. `aborted` - [event](#event) that is triggered when effect function has aborted. For example `AbortController.abort()`

6. `$status` - [state](#state) status that shows process
7. `$pending` - [state](#state) flag that shows whether the effect is in progress
8. `$runningCount` - [state](#state) that shows count of effect function in progress
