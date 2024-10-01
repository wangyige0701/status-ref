## status-ref

### A boolean status controller

```bash
npm install status-ref
```

A boolean status controller, can track and trigger status changes.

> The status refresh logic is like the method of vue reactivity system.

```ts
import { useStatusRef } from 'status-ref';

const statusRef = useStatusRef.create(() => {
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

const status = statusRef('loading');

// default is false, unless you use the useStatusRef.setInitial() to change the default value.
// And only the `loading` property is enumerable.
status.loading;

// It has the following methods.
status.onLoading();
status.offLoading();
status.toggleLoading();
status.on();
status.off();
status.toggle();
status.listenOnLoading(() => {});
status.listenOffLoading(() => {});
```

```html
<script setup>
	import { useVueStatusRef } from 'status-ref';

	const status = useVueStatusRef.create('loading');
</script>

<template>
	<div @click="status.toggleLoading()">{ status.loading }</div>
</template>
```

```jsx
import { useReactStatusRef } from 'status-ref';

// It must out of the component, otherwise it will be recreated every time the component is rendered.
const status = useReactStatusRef.create('loading');

export default function App() {
	return <div onclick={status.toggleLoading()}>{status.loading}</div>;
}
```
