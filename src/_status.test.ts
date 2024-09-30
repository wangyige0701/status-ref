import { describe, expect, it } from 'vitest';
import { useStatusRef } from '.';
import { delay } from '@wang-yige/utils';

describe('useStatusRef', () => {
	function track(target: object, key: string) {
		// console.log('track => ', 'key: ', key);
	}
	function trigger(target: object, key: string, bool: boolean) {
		// console.log('trigger => ', 'key: ', key, 'value: ', bool);
	}
	let i = 0;
	function createProxy() {
		const index = ++i;
		// console.log('createProxy => ', index);
		return {
			track,
			trigger,
		};
	}
	it('use status ref', () => {
		const create = useStatusRef.create(createProxy);
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
		const create = useStatusRef.create(createProxy);
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
		const create = useStatusRef.create(createProxy);
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

	it('trigger by callback', async () => {
		const create = useStatusRef.create(createProxy);
		const status = create('loading');
		let i = 0;
		status.listenOnLoading(() => {
			i = 1;
		});
		status.listenOffLoading(() => {
			i = 2;
		});
		status.onLoading();
		await delay(0);
		expect(i).toBe(1);
		status.offLoading();
		await delay(0);
		expect(i).toBe(2);
	});
});
