## status-ref

### A boolean status controller

```bash
npm install status-ref
```

A boolean status controller, can track and trigger status changes.

> The status refresh logic is like the method of vue reactivity system.

### Usage

```ts
import { StatusRef } from 'status-ref';

// Pass a function which return track and trigger methods to `create` function,
// and it will return a status ref object.
const useStatusRef = StatusRef.create(() => {
	return {
		track(target: object, key: string) {
			// where be called when use status
			// If here return a not void value, it will be used to the status return;
		},
		trigger(target: object, key: string, status: boolean) {
			// where be called when status changed
		},
	};
});

const status = useStatusRef('loading');

// Default is false, unless you use the `initial` to change the default value.
// And only the `loading` property is enumerable.
status.loading;

// It also has the following methods.
status.onLoading();
status.offLoading();
status.toggleLoading();
status.on();
status.off();
status.toggle();
// If the status is matched when register the callback,
// you can pass `true` to the second parameter to immediately call the callback.
status.listenOnLoading(() => {});
status.listenOffLoading(() => {});
```

> Set initial value

```ts
// You can use `initial` function to set all status initial value.
const status = useStatusRef.initial(true).use('loading', 'success');
status.loading; // true
status.success; // true

// Or you can pass in an array with status name and initial value.
const status = useStatusRef('loading', ['error', false], ['success', true]);
status.loading; // false
status.error; // false
status.success; // true
```

> For `vue`

```html
<script setup>
	import { useVueStatusRef } from 'status-ref';

	// The usage is same as `useStatusRef`.
	const status = useVueStatusRef('loading');
</script>

<template>
	<div @click="status.toggleLoading()">{ status.loading }</div>
</template>
```

> For `react`

```jsx
import { useReactStatusRef } from 'status-ref';

// It must out of the component, otherwise it will be recreated every time the component is rendered.
const status = useReactStatusRef('loading');

export default function App() {
	return <div onclick={status.toggleLoading()}>{status.loading}</div>;
}
```
