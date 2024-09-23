import { describe, expect, it } from 'vitest';
import { statusRef } from '.';

describe('statusRef', () => {
	function track(key: string) {
		console.log('track => ', 'key: ', key);
		return 'track';
	}
	function trigger(key: string, bool: boolean) {
		console.log('trigger => ', 'key: ', key, 'value: ', bool);
		return bool;
	}
	let i = 0;
	function createProxy() {
		const index = ++i;
		console.log('createProxy => ', index);
		return {
			track,
			trigger,
		};
	}
	it('use status ref', () => {
		const create = statusRef.create(createProxy);
		const status = create('loading');
		expect(status.loading).toBe(false);
		status.onLoading();
		expect(status.loading).toBe(true);
		status.offLoading();
		expect(status.loading).toBe(false);
		status.offLoading();
		expect(status.loading).toBe(false);
		status.toggleLoading();
		expect(status.loading).toBe(true);
	});

	it('initial value', () => {
		const create = statusRef.create(createProxy);
		const status = create('loading', 'initial').on();
		expect(status.loading).toBe(true);
		expect(status.initial).toBe(true);
		status.off();
		expect(status.loading).toBe(false);
		expect(status.initial).toBe(false);
		status.toggle();
		expect(status.loading).toBe(true);
		expect(status.initial).toBe(true);
	});

	it('initial one value', () => {
		const create = statusRef.create(createProxy);
		const status = create('loading', 'initial').onInitial();
		expect(status.loading).toBe(false);
		expect(status.initial).toBe(true);
		status.offInitial();
		expect(status.loading).toBe(false);
		expect(status.initial).toBe(false);
		status.toggleInitial();
		status.toggleLoading();
		expect(status.loading).toBe(true);
		expect(status.initial).toBe(true);
		status.toggleInitial();
		status.toggle();
		expect(status.loading).toBe(false);
		expect(status.initial).toBe(true);
	});
});
