# AbstractEntity

The base entity.
You cannot create an instance of it, but every entity in `svitore` inherits its behavior

## subscribe (method)

Subscribe to entity

**Interface:**

```ts
function subscribe(subscriber: (data: T) => void): () => void;
```

## unsubscribe (method)

Unsubscribe from entity

**Interface:**

```ts
function unsubscribe(subscriber: ((data: T) => void) | Entity<any>): void;
```

## release (method)

Remove all subscribers

**Interface:**

```ts
function release(): void;
```
