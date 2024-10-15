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
const status = useStatusRef.initial(true).use('loading', 'success');
status.loading; // true
status.success; // true

// Or you can pass in an array with status name and initial value.
const status = useStatusRef('loading', ['error', false], ['success', true]);
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

#### For `vue`

```html
<script setup>
	import { useVueStatusRef } from 'status-ref/vue';

	// The usage is same as `useStatusRef`.
	const status = useVueStatusRef('loading');
</script>

<template>
	<div @click="status.toggleLoading()">{ status.loading }</div>
</template>
```

#### For `react`

```jsx
import { useReactStatusRef } from 'status-ref/react';

// It must out of the component,
// otherwise it will be recreated every time the component is rendered.
const status = useReactStatusRef('loading');

export default function App() {
	return <div onclick={status.toggleLoading()}>{status.loading}</div>;
}
```
