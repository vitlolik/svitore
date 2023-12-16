# EffectRunner

Entity for conveniently running and canceling effects.

_Has the same api as [AbstractEntity](/entities/abstract-entity)_

## constructor

```ts
type CallbackParams<Params, Result, ErrorType> = {
  rejected: number;
  fulfilled: number;
  params: Params;
  result: Result | null;
  error: ErrorType | null;
};

type EffectRunnerOptions<Params, Result, ErrorType> = {
  delay: (params: CallbackParams<Params, Result, ErrorType>) => number;
  until: (params: CallbackParams<Params, Result, ErrorType>) => boolean;
};

function constructor(
  effect: Effect<Params, Result, ErrorType>,
  options: EffectRunnerOptions<Params, Result, ErrorType>
): EffectRunner<Params, Result, ErrorType>;
```

## start (method)

Starts running the effect

**Interface:**

```ts
function start(params: Params): void;
```

**Example:**

Run infinitely every 3 seconds

```ts
const $m = new SvitoreModule();

const effect = $m.Effect(() => Promise.resolve("ok"));
const effectRunner = $m.EffectRunner(effect, {
  delay: () => 3000,
  until: () => true,
});

effectRunner.start();
```

Run until there are 3 fulfilled

```ts
const $m = new SvitoreModule();

const effect = $m.Effect(() => Promise.resolve("ok"));
const effectRunner = $m.EffectRunner(effect, {
  delay: () => 3000,
  until: ({ fulfilled }) => fulfilled < 3,
});

effectRunner.start();
```

Run until there are 3 rejected

```ts
const $m = new SvitoreModule();

const effect = $m.Effect(() => Promise.reject(new Error("error")));
const effectRunner = $m.EffectRunner(effect, {
  delay: () => 3000,
  until: ({ rejected }) => rejected < 3,
});

effectRunner.start();
```

Increase the delay each time

```ts
const $m = new SvitoreModule();

const effect = $m.Effect(() => Promise.resolve("ok"));
const effectRunner = $m.EffectRunner(effect, {
  delay: ({ fulfilled }) => fulfilled * 1000,
  until: ({ fulfilled }) => fulfilled < 3,
});

effectRunner.start();
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

const effect = $m.Effect(() => Promise.resolve("ok"));
const effectRunner = $m.EffectRunner(effect, {
  delay: () => 3000,
  until: () => true,
});

effectRunner.pending.get(); // false

effectRunner.start();

effectRunner.pending.get(); // true
```

## stop (method)

Stop runner and cancel effect

**Interface:**

```ts
function stop(): void;
```

**Example:**

```ts
const $m = new SvitoreModule();

const effect = $m.Effect(() => Promise.resolve("ok"));
const effectRunner = $m.EffectRunner(effect, {
  delay: () => 3000,
  until: () => true,
});

effectRunner.start();
effectRunner.stop();
```

## on (method)

Set a trigger to start the effect runner

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
const effectRunner = $m.EffectRunner(effect, {
  delay: () => 3000,
  until: () => true,
});
const trigger = $m.Event();

effectRunner.on(trigger);

trigger.dispatch();
```

Advanced:

```ts
const $m = new SvitoreModule();

const effect = $m.Effect((value: string) => Promise.resolve(`ok-${value}`));
const effectRunner = $m.EffectRunner(effect, {
  delay: () => 3000,
  until: () => true,
});
const trigger = $m.Event<number>();

effectRunner.on(trigger, (value) => value.toString());

trigger.dispatch(10);
```
