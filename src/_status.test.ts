import { describe, expect, expectTypeOf, it } from 'vitest';
import { StatusRef, type StatusRefResult } from '.';
import { delay, type Fn } from '@wang-yige/utils';

describe('StatusRef', () => {
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
		const useStatusRef = StatusRef.create(createProxy);
		const status = useStatusRef('loading', 'visible');
		expect(status.loading).toBe(false);
		status.onLoading();
		expect(status.loading).toBe(true);
		status.offLoading();
		expect(status.loading).toBe(false);
		status.offLoading();
		expect(status.loading).toBe(false);
		status.toggleLoading();
		expect(status.loading).toBe(true);
		expect({ ...status }).toEqual({ loading: true, visible: false });
	});

	it('initial value', () => {
		const useStatusRef = StatusRef.create(createProxy);
		const status = useStatusRef('loading', 'initial').on();
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
		const useStatusRef = StatusRef.create(createProxy);
		const status = useStatusRef('loading', 'initial').onInitial();
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
		const useStatusRef = StatusRef.create(createProxy);
		const status = useStatusRef('loading');
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

	it('set initial value', () => {
		const useStatusRef = StatusRef.create(createProxy);
		const status = useStatusRef('loading', ['initial', true]);
		expect(status.loading).toBe(false);
		expect(status.initial).toBe(true);
		status.toggle();
		expect(status.loading).toBe(true);
		expect(status.initial).toBe(false);
	});

	it('set full initial value', () => {
		const useStatusRef = StatusRef.create(createProxy);
		const status = useStatusRef.initial(true).use('loading', 'success');
		expect(status.loading).toBe(true);
		expect(status.success).toBe(true);
		status.toggleLoading();
		expect(status.loading).toBe(false);
		expect(status.success).toBe(true);
	});

	it('check type', () => {
		type Status = StatusRefResult<['loading']>;
		expectTypeOf<Fn<[], Status>>().toMatchTypeOf<Status['onLoading']>();
	});
});
