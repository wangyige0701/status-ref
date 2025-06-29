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
		const status = useStatusRef(
			'loading',
			['success', true] as const,
			StatusRef.T('initial', true),
		);
		expect(status.loading).toBe(false);
		expect(status.initial).toBe(true);
		status.toggle();
		expect(status.loading).toBe(true);
		expect(status.initial).toBe(false);
		expect(status.success).toBe(false);
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
		const useStatusRef = StatusRef.create(createProxy);
		const status = useStatusRef('a', 'b', 'c', 'd', 'e', 'f');
		expectTypeOf(status.f).toExtend<boolean>();
		type Status = StatusRefResult<['loading']>;
		expectTypeOf<Fn<[], Status>>().toExtend<Status['onLoading']>();
	});

	it('use new to instantiate', () => {
		const useStatus = new StatusRef(createProxy);
		const status = useStatus.use('loading', 'success');
		expect(status.loading).toBe(false);
		expect(status.success).toBe(false);
		status.toggle();
		expect(status.loading).toBe(true);
		status.toggleSuccess();
		expect(status.success).toBe(false);
		status.onLoading();
		expect(status.loading).toBe(true);
	});

	it('check initial status for instance', () => {
		const useStatus = new StatusRef(createProxy);
		const status = useStatus.initial(true).use('loading', 'success');
		expect(status.loading).toBe(true);
		expect(status.success).toBe(true);
		const status2 = useStatus.use('loading');
		expect(status2.loading).toBe(false);
	});

	it('check custom status for instance', () => {
		const useStatus = new StatusRef(createProxy);
		const status = useStatus.use(
			'loading',
			['success', true] as const,
			StatusRef.T('error', true),
		);
		expect(status.loading).toBe(false);
		expect(status.success).toBe(true);
		expect(status.error).toBe(true);
		status.toggleSuccess().toggleLoading().toggleError();
		expect(status.loading).toBe(true);
		expect(status.success).toBe(false);
		expect(status.error).toBe(false);
	});

	it('use watch mode', () => {
		const useStatus = new StatusRef(createProxy);
		const status = useStatus.use(
			'loading',
			'end',
			['success', use => !use('loading') && use('end')] as const,
			StatusRef.T('failed', use => !use('success')),
		);
		let i = 0;
		let j = 0;
		const closeOn = status.listenOnSuccess(() => {
			i++;
		});
		const closeOff = status.listenOffEnd(() => {
			j++;
		}, true);
		expect(status.loading).toBe(false);
		expect(status.end).toBe(false);
		expect(status.success).toBe(false);
		expect(status.failed).toBe(true);

		status.onEnd();
		expect(status.loading).toBe(false);
		expect(status.end).toBe(true);
		expect(status.success).toBe(true);
		expect(status.failed).toBe(false);
		expect(i).toBe(1);

		status.onLoading();
		expect(status.loading).toBe(true);
		expect(status.end).toBe(true);
		expect(status.success).toBe(false);
		expect(status.failed).toBe(true);
		expect(i).toBe(1);

		closeOn();
		status.offLoading();
		expect(status.loading).toBe(false);
		expect(status.end).toBe(true);
		expect(status.success).toBe(true);
		expect(status.failed).toBe(false);
		expect(i).toBe(1);

		status.offEnd();
		expect(status.loading).toBe(false);
		expect(status.end).toBe(false);
		expect(status.success).toBe(false);
		expect(status.failed).toBe(true);
		expect(i).toBe(1);
		expect(j).toBe(2);

		closeOff();
		status.onEnd();
		status.offEnd();
		expect(j).toBe(2);
	});
});
