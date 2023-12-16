# PersistState

Entity to store a state and save the value in the storage

_Has the same api as [State](/entities/state)_

## constructor

```ts
function constructor(
  state: T,
  storageKey: string,
  storage?: Storage // globalThis.Storage
): PersistState<T>;
```

**Example:**

```ts
const $m = new SvitoreModule();

const firstName = $m.PersistState(
  "Alex",
  "firstName",
  globalThis.sessionStorage
);
```

This code means to create a state with a default value of `"Alex"` and store the value in the storage by the key `"firstName"`

::: info
By default `localStorage` is used, but you can use any storage, including your own custom storage by implementing the `Storage` interface
:::

## clear (method)

Delete state from storage

**Interface:**

```ts
function clear(): void;
```
