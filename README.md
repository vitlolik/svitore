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

## App examples

- [Github user search](https://codesandbox.io/p/sandbox/search-github-users-forked-93dh8n)

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
2. [subscribe](#subscribe) - add event listener

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

##### subscribe

Add event listener

```ts
import { Event } from "svitore";

const change = new Event<string>();

change.subscribe((name) => {
  console.log(name); // 'Alex'
});

change.dispatch("Alex");
```

### Effect

Effect is an object for any side effects.

#### Methods

1. [run](#run) - run effect function

#### Fields

...README in-progress
