import {
	type Fn,
	firstUpperCase,
	isFunction,
	singleton,
} from '@wang-yige/utils';
import type { StatusRefValue, StatusRefResult, CreateStatusRef } from './type';

export const statusRef = (() => {
	type BeProxy = {
		track: Fn;
		trigger: Fn<[boolean]>;
	};

	const config: PropertyDescriptor = {
		configurable: false,
		enumerable: false,
	};

	function _setProp(_this: any, s: string, value: Function) {
		Object.defineProperty(_this, s, {
			...config,
			value,
		});
	}

	const createStatusRefValue = (
		bool: boolean,
		track: BeProxy['track'],
		trigger: BeProxy['trigger'],
	) => {
		let value: boolean = bool;
		const result = {
			getValue: () => {
				track();
				return value;
			},
			setValue: (v: boolean) => {
				value = v;
				trigger(value);
			},
		};
		Object.defineProperty(result, 'value', {
			configurable: false,
			enumerable: false,
			get: () => {
				return value;
			},
		});
		return result as StatusRefValue;
	};

	const createStatusRef = <T extends string[]>(
		track: BeProxy['track'],
		trigger: BeProxy['trigger'],
		...status: T
	) => {
		const map = new Map<string, StatusRefValue>();
		const _this = Object.create(null) as StatusRefResult<T>;
		const _clear = (key: string) => {
			if (key) {
				map.delete(key);
			}
		};
		_setProp(_this, 'on', () => {
			map.forEach(v => v.setValue(true));
			return _this;
		});
		_setProp(_this, 'off', () => {
			map.forEach(v => v.setValue(false));
			return _this;
		});
		_setProp(_this, 'toggle', () => {
			map.forEach(v => v.setValue(!v.value));
			return _this;
		});
		_setProp(_this, 'stop', () => {
			[...map.keys()].forEach(_clear);
		});
		for (const key of status) {
			map.set(key, createStatusRefValue(false, track, trigger));
			Object.defineProperties(_this, {
				[key]: {
					...config,
					enumerable: true,
					get: () => {
						return map.get(key)!.getValue();
					},
				},
				[`on${firstUpperCase(key)}`]: {
					...config,
					value: () => {
						map.get(key)!.setValue(true);
						return _this;
					},
				},
				[`off${firstUpperCase(key)}`]: {
					...config,
					value: () => {
						map.get(key)!.setValue(false);
						return _this;
					},
				},
				[`toggle${firstUpperCase(key)}`]: {
					...config,
					value: () => {
						const oldValue = map.get(key)!.value;
						map.get(key)!.setValue(!oldValue);
						return _this;
					},
				},
			});
		}
		return _this;
	};

	class StatusRef {
		Proxy(track: BeProxy['track'], trigger: BeProxy['trigger']) {
			const S = singleton(StatusRef, { track, trigger });
			return new S();
		}

		#proxy: BeProxy | undefined;

		constructor(proxy?: BeProxy) {
			if (
				proxy &&
				(!isFunction(proxy.track) || !isFunction(proxy.trigger))
			) {
				throw new TypeError(
					"'proxy' param must be a object with track and trigger function",
				);
			}
			this.#proxy = proxy;
		}

		create<T extends string[]>(...status: T): StatusRefResult<T>;
		create(
			track: BeProxy['track'],
			trigger: BeProxy['trigger'],
		): CreateStatusRef;
		create<T extends string[]>(
			track: BeProxy['track'] | string,
			trigger: BeProxy['trigger'] | string,
			...status: string[]
		): CreateStatusRef | StatusRefResult<T> {
			let _track = this.#proxy?.track;
			let _trigger = this.#proxy?.trigger;
			const _initial = <T extends string[]>(...status: T) => {
				return createStatusRef(_track!, _trigger!, ...status);
			};
			if (isFunction(track) && isFunction(trigger)) {
				_track = track;
				_trigger = trigger;
				return _initial;
			} else {
				if (!isFunction(_track) || !isFunction(_trigger)) {
					throw new Error(
						"If not use 'Proxy' function to create track and trigger, you must pass them as arguments",
					);
				}
			}
			return _initial(...[...new Set(status)]) as StatusRefResult<T>;
		}
	}

	const S = singleton(StatusRef, void 0);
	return new S();
})();
