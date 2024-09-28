import { describe, it, expect } from 'vitest';
import { ref, effect } from '@vue/reactivity';
import { useVueStatusRef } from '.';

describe('useVueStatusRef', () => {
	it('should use status', async () => {
		const status = useVueStatusRef.create('loading', 'initial');
		const loading = ref(false);
		const initial = ref(true);
		effect(() => {
			loading.value = status.loading;
			initial.value = status.initial;
		});
		expect(status.loading).toBe(false);
		status.onLoading();
		expect(status.loading).toBe(true);
		expect(loading.value).toBe(true);
		expect(initial.value).toBe(false);
		status.toggle();
		expect(status.loading).toBe(false);
		expect(status.initial).toBe(true);
		expect(loading.value).toBe(false);
		expect(initial.value).toBe(true);
	});
});
