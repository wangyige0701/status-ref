## status-ref

### A boolean status controller

```bash
npm install status-ref
```

A boolean status controller, can track and trigger status changes.

> The status refresh logic is like the method of vue reactivity system.

### Usage

#### Create a status ref instance.

> First is use static method `StatusRef.create`, and it's recommended to use.

```ts
import { StatusRef } from 'status-ref';

// Pass a function which return `track` and `trigger` methods to `create`,
// and it will return a status ref target.
const useStatusRef = StatusRef.create(() => {
	return {
		track(target: object, key: string) {
			// Where be called when access status.
			// If here return a not void value, it will be used to the status return;
		},
		trigger(target: object, key: string, status: boolean) {
			// Where be called when status changed.
		},
	};
});

// Create a status target.
const status = useStatusRef('loading');
```

> Second is use `new` to create an instance directly.

```ts
const useStatusRef = new StatusRef(() => {
	return {
		track(target: object, key: string) {},
		trigger(target: object, key: string, status: boolean) {},
	};
});

// It need use `use` method to create a status target.
const status = useStatusRef.use('loading');
```

#### Properties

```ts
// The default status value is `false`,
// unless you use the `initial` to change the default value,
// and only the status read property like `loading` is enumerable.
status.loading;

// Operate all of the status.
status.on();
status.off();
status.toggle();

// It also has the following methods for every status.
status.onLoading();
status.offLoading();
status.toggleLoading();

// If the status is matched when register the callback,
// you can pass `true` to the second parameter to immediately call the callback.
status.listenOnLoading(() => {});
status.listenOffLoading(() => {});
```

#### Set initial value

```ts
// You can use `initial` method to set all status initial value.
// The `initial` method only works for the `use` method chained called.
// e.g. useStatusRef.initial(true);
// useStatusRef.use('loding'); ==> The default value is still false
const status = useStatusRef.initial(true).use('loading', 'success');

status.loading; // true
status.success; // true

// Or you can pass in an array with status name and initial value.
const status = useStatusRef(
	'loading',
	['error', false] as const,
	StatusRef.T('success', true),
);
status.loading; // false
status.error; // false
status.success; // true

// For type inference, you should make array be constant,
// or use `StatusRef.T` to create an array.
const status = useStatusRef(
	'loading',
	['success', true] as const,
	StatusRef.T('allow', true),
);
status.loading; // false
status.success; // true
status.allow; // true
```

#### For watch mode

```ts
// When register a watch status, the status name in callback maut already be registered,
// and the watch properties does not have `on`, `off`, `toggle` methods.
const status = useStatusRef(
	'loading',
	// `use` param can get the status value which is registered before.
	['success', use => !use('loading')] as const,
	StatusRef.T('failed', use => !use('success')),
);
status.loading; // false, has `onLoading`, `offLoading`, `toggleLoading` methods.
status.success; // true, does not have `onSuccess`, `offSuccess`, `toggleSuccess` methods.
status.failed; // false
```

#### For `vue`

```vue
<script setup lang="ts">
import { useVueStatusRef } from 'status-ref/vue';

// The usage is same as `useStatusRef`.
const status = useVueStatusRef('loading');
</script>

<template>
	<div @click="status.toggleLoading()">{{ status.loading }}</div>
</template>
```

#### For `react`

```jsx
import { useReactStatusRef } from 'status-ref/react';

// In version 1.0.0, the usage is same as a hook.
export default function App() {
	const status = useReactStatusRef('loading');

	return <div onclick={status.toggleLoading()}>{status.loading}</div>;
}
```
