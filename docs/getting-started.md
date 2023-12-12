# Getting Started

## Installation

::: code-group

```bash [npm]
npm add svitore
```

```bash [pnpm]
pnpm add svitore
```

```bash [yarn]
yarn add svitore
```

:::

## First app

Now we will write our first application using `svitore`.

It will be a small application, but it will touch on some mechanics that are often used in frontend development.
We will implement a search for user information on GitHub based on their nickname.
We will not implement the view part, instead, we will focus on writing the logic.

The logic description in svitore begins with creating a [module](/module).
You don't need to know what a module or other entities we will create in this lesson are right now. You can find their descriptions later in the documentation.
As I see it, all the code we write will be understandable without knowledge of the svitore API.

```ts
const $module = new SvitoreModule("githubSearchModule");
```

Not bad already!
Now let's think about what we need for our application.

1. A [state](/entities/state) where we will store what the user enters, and then display this text in the input, as well as send a request to the GitHub API with this state.
2. [Event](/entities/event)s that modify this state.
3. We need to send a request to the GitHub API.
4. Process the response and display the data. In other words, we need another state.

Let's go!

For now, let's forget about the GitHub API request and implement the first two points. Describe our entities.

```ts
type GitHubUser = {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
};

const gitHubUsers = $module.State<GitHubUser[]>([]);
const search = $module.State("");

const searchChanged = $module.Event<string>();
const githubUsersUpdated = $module.Event<GitHubUser[]>();
```

Let's connect our entities.

```ts
gitHubUsers.changeOn(githubUsersUpdated);
search.changeOn(searchChanged);
```

::: info
This code means:

1. Save the payload from the `githubUsersUpdated` event into the `gitHubUsers` state.
2. Save the payload from the `searchChanged` event into the `search` state.
   :::

Let's check that everything is working.

```ts
search.subscribe(console.log);
gitHubUsers.subscribe(console.log);

searchChanged.dispatch("foo");
githubUsersUpdated.dispatch([
  {
    id: 1,
    login: "test",
    avatar_url: "/test-url.png",
    html_url: "/test-url.html",
  },
]);
```

Check if the logs have appeared in the console.

Now, we need to implement the request and, upon changes in the search, send a request to the GitHub API.
Let's create a file `./api.ts` and declare a function there that will make a request to the GitHub API.

```ts
const fetchGitHubUsers = async (searchValue: string) => {
  const response = await fetch(
    `https://api.github.com/search/users?${new URLSearchParams({
      q: searchValue,
    })}`
  );

  if (!response.ok) throw new Error("Fetch error");

  const json = await response.json();

  return json.items;
};

export { fetchGitHubUsers };
```

To handle asynchronous operations or side effects in svitore, there is an entity called [Effect](/entities/effect).

Let's create our first Effect.

```ts
const fetchGitHubUsersEffect = $module.Effect<string, GitHubUser[]>(
  fetchGitHubUsers
);
```

::: info
This code means:

1. The effect will be invoked with an argument of type `string`.
2. You can subscribe to the `fulfilled` event and get the result.
   :::

Let's connect our entities.

```ts
fetchGitHubUsersEffect.on(searchChanged);

githubUsersUpdated.on(fetchGitHubUsersEffect.fulfilled, ({ result }) => result);
```

Our application is already functioning.
You can call `searchChanged` with some text and see the result in the console.

```ts
searchChanged.dispatch("a");
```

This is all the code we have right now.

```ts
import { SvitoreModule } from "svitore";
import { fetchGitHubUsers } from "./api";

type GitHubUser = {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
};

const $module = new SvitoreModule("githubSearchModule");

const gitHubUsers = $module.State<GitHubUser[]>([]);
const search = $module.State("");

const searchChanged = $module.Event<string>();
const githubUsersUpdated = $module.Event<GitHubUser[]>();
const fetchGitHubUsersEffect = $module.Effect<string, GitHubUser[]>(
  fetchGitHubUsers
);

search.subscribe(console.log);
gitHubUsers.subscribe(console.log);

gitHubUsers.changeOn(githubUsersUpdated);
search.changeOn(searchChanged);

fetchGitHubUsersEffect.on(searchChanged);

githubUsersUpdated.on(fetchGitHubUsersEffect.fulfilled, ({ result }) => result);
```

The application works, but there are a few problems

1. With each triggering of the searchChanged event, the fetchGitHubUsersEffect is invoked, which makes a request to the GitHub API. If we imagine typing on the keyboard, a request will be sent with each keystroke, which is not desirable. We need something like debounce.
2. It would be correct to cancel the previous request to avoid a race condition.
3. It is desirable to perform some validation before sending the request and not send the request if we invoke the Effect with an empty string.

All these issues can be solved out of the box using svitore.

Let's start by creating a [debounced event](/entities/debounced-event) called `requestSent` and calling it with each invocation of `searchChanged`.
Also, let's make our `fetchGitHubUsersEffect` depend on this event.

```ts
const githubUsersUpdated = $module.Event<GitHubUser[]>();
const requestSent = $module.DebouncedEvent<string>(300); // [!code ++]
const fetchGitHubUsersEffect = $module.Effect<string, GitHubUser[]>(
  fetchGitHubUsers
);
```

```ts
gitHubUsers.changeOn(githubUsersUpdated);
searchState.changeOn(searchChanged);

requestSent.on(searchChanged); // [!code ++]
fetchGitHubUsersEffect.on(requestSent); // [!code ++]
fetchGitHubUsersEffect.on(searchChanged); // [!code --]
githubUsersUpdated.on(fetchGitHubUsersEffect.fulfilled, ({ result }) => result);
```

Effect support auto-cancellation, which will help us cancel previous requests.

```ts
const fetchGitHubUsersEffect = $module.Effect<string, GitHubUser[]>(
  fetchGitHubUsers,
  { isAutoCancelable: true } // [!code ++]
);
```

And events support middleware handlers where we can validate or transform our data in some way.

```ts
const fetchGitHubUsersEffect = $module.Effect<string, GitHubUser[]>(
  fetchGitHubUsers,
  { isAutoCancelable: true }
);

/* [!code ++:7] */ requestSent.applyMiddleware((context, next) => {
  const value = context.value.trim();
  if (value) {
    context.value = value;
    next();
  }
});

gitHubUsers.changeOn(githubUsersUpdated);
searchState.changeOn(searchChanged);
```

Now everything is great :slightly_smiling_face:

The entire code:

::: code-group

```ts [github-search-module.ts]
import { SvitoreModule } from "svitore";
import { fetchGitHubUsers } from "./api";

type GitHubUser = {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
};

const $module = new SvitoreModule("gitHubSearchModule");

const gitHubUsers = $module.State<GitHubUser[]>([]);
const searchState = $module.State("");

const searchChanged = $module.Event<string>();
const githubUsersUpdated = $module.Event<GitHubUser[]>();
const requestSent = $module.DebouncedEvent<string>(300);
const fetchGitHubUsersEffect = $module.Effect<string, GitHubUser[]>(
  fetchGitHubUsers,
  { isAutoCancelable: true }
);

requestSent.applyMiddleware((context, next) => {
  const value = context.value.trim();
  if (value) {
    context.value = value;
    next();
  }
});

gitHubUsers.changeOn(githubUsersUpdated);
searchState.changeOn(searchChanged);

requestSent.on(searchChanged);
fetchGitHubUsersEffect.on(requestSent);
githubUsersUpdated.on(fetchGitHubUsersEffect.fulfilled, ({ result }) => result);

searchChanged.dispatch("a");
```

```ts [api.ts]
const fetchGitHubUsers = async (searchValue: string) => {
  const response = await fetch(
    `https://api.github.com/search/users?${new URLSearchParams({
      q: searchValue,
    })}`
  );

  if (!response.ok) throw new Error("Fetch error");

  const json = await response.json();

  return json.items;
};

export { fetchGitHubUsers };
```

:::

You can check the implementation of this application on [CodeSandbox](https://codesandbox.io/p/devbox/search-github-users-forked-93dh8n) with React, using the [svitore-react](/react/getting-started) library
