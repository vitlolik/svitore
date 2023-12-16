# Effect

Entity for async operations or side effects

_Has the same api as [AbstractEntity](/entities/abstract-entity)_

## constructor

```ts
type EffectOptions = {
  isAutoCancelable?: boolean;
};

type EffectFunction<Params, Result> = (
  params: Params,
  signal: AbortSignal
) => Promise<Result>;

function constructor(
  fn: EffectFunction<Params, Result>,
  options?: EffectOptions
): Effect<Params, Result, ErrorType>;
```

## run (method)

Run effect function

**Interface:**

```ts
function run(params: Params): Promise<void>;
```

**Example:**

```ts
const $m = new SvitoreModule();

const effect = $m.Effect(() => Promise.resolve());

effect.run();
```

## fulfilled (property)

[Event](/entities/event) that fires when the promise in the effect function is successfully resolved.

**Interface:**

```ts
fulfilled: Event<{ params: Params; result: Result }>;
```

**Example:**

```ts
const $m = new SvitoreModule();

const effect = $m.Effect(() => Promise.resolve("ok"));

effect.fulfilled.subscribe(({ result }) => console.log(result));

effect.run(); // log: "ok", after resolve
```

## pending (property)

[State](/entities/state) that shows pending state

**Interface:**

```ts
pending: State<boolean>;
```

**Example:**

```ts
const $m = new SvitoreModule();

const effect = $m.Effect(
  () =>
    new Promise((resolve) => {
      globalThis.setTimeout(() => resolve("ok"), 300);
    })
);

effect.pending.get(); // false

effect.run();

effect.pending.get(); // true
```

## rejected (property)

[Event](/entities/event) that fires when the promise in the effect function is rejected.

**Interface:**

```ts
rejected: Event<{ params: Params; error: ErrorType }>;
```

**Example:**

```ts
const $m = new SvitoreModule();

const effect = $m.Effect(() => Promise.reject(new Error("error")));

effect.rejected.subscribe(({ error }) => console.log(error.message));

effect.run(); // log: "error", after reject
```

## on (method)

Set a trigger to run the effect

**Interface:**

```ts
function on<EntityPayload extends Params>(entity: Entity<EntityPayload>): this;
```

```ts
function on<EntityPayload>(
  entity: Entity<EntityPayload>,
  selector: (payload: EntityPayload) => Params
): this;
```

**Example:**

Common:

```ts
const $m = new SvitoreModule();

const effect = $m.Effect(() => Promise.resolve("ok"));
const trigger = $m.Event();

effect.fulfilled.subscribe(({ result }) => console.log(result));
effect.on(trigger);

trigger.dispatch(); // log: "ok", after resolve
```

Advanced:

```ts
const $m = new SvitoreModule();

const effect = $m.Effect((value: string) => Promise.resolve(`ok-${value}`));
const trigger = $m.Event<number>();

effect.fulfilled.subscribe(({ result }) => console.log(result));
effect.on(trigger, (value) => value.toString());

trigger.dispatch(10); // log: "ok-10", after resolve
```

## cancel (method)

Cancel the effect function with an abort signal

**Interface:**

```ts
function cancel(): void;
```

**Example:**

```ts
const fetchUsers: EffectFunction<void, User[]> = async (_params, signal) => {
  const response = await fetch("/api/users", { signal });
  const json = await response.json();

  return json as User[];
};

const $m = new SvitoreModule();

const effect = $m.Effect(fetchUsers);

effect.run();
effect.cancel();
```
