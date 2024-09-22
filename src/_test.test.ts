import { describe, expect, it } from 'vitest';
import { statusRef } from '.';

describe('statusRef', () => {
	function track() {
		// console.log('track');
		return 'track';
	}
	function trigger(bool: boolean) {
		// console.log('trigger: ', bool);
		return bool;
	}
	it('use status ref', () => {
		const create = statusRef.create(track, trigger);
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
		const create = statusRef.create(track, trigger);
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
		const create = statusRef.create(track, trigger);
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
