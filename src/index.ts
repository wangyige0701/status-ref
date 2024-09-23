import {
	firstUpperCase,
	isBoolean,
	isFunction,
	singleton,
} from '@wang-yige/utils';
import type {
	StatusRefValue,
	StatusRefResult,
	CreateStatusRef,
	StatusProxy,
	CreateProxy,
} from './type';

export const statusRef = (() => {
	const CONFIG: PropertyDescriptor = {
		configurable: false,
		enumerable: false,
	};

	function _setProp(_this: any, s: string, value: Function) {
		Object.defineProperty(_this, s, {
			...CONFIG,
			value,
		});
	}

	const createStatusRefValue = (
		target: object,
		key: string,
		bool: boolean,
		track: StatusProxy['track'],
		trigger: StatusProxy['trigger'],
	) => {
		let value: boolean = bool;
		const result = {
			getValue: () => {
				track(target, key);
				return value;
			},
			setValue: (v: boolean) => {
				value = v;
				trigger(target, key, value);
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
		initial: boolean,
		createProxy: CreateProxy,
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
			const { track, trigger } = createProxy(key, initial);
			map.set(
				key,
				createStatusRefValue(_this, key, initial, track, trigger),
			);
			Object.defineProperties(_this, {
				[key]: {
					...CONFIG,
					enumerable: true,
					get: () => {
						return map.get(key)!.getValue();
					},
				},
				[`on${firstUpperCase(key)}`]: {
					...CONFIG,
					value: () => {
						map.get(key)!.setValue(true);
						return _this;
					},
				},
				[`off${firstUpperCase(key)}`]: {
					...CONFIG,
					value: () => {
						map.get(key)!.setValue(false);
						return _this;
					},
				},
				[`toggle${firstUpperCase(key)}`]: {
					...CONFIG,
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

	function checkProxy(createProxy: CreateProxy) {
		const { track, trigger } = createProxy(void 0, void 0);
		if (!isFunction(track) || !isFunction(trigger)) {
			throw new TypeError(
				"'createProxy' param must be a Function return track and trigger function",
			);
		}
		return createProxy;
	}

	class StatusRef {
		#proxy: CreateProxy | undefined = void 0;
		#initial: boolean = false;

		Proxy(createProxy: CreateProxy) {
			const S = singleton(StatusRef, createProxy);
			return new S();
		}

		setInitial(bool: boolean) {
			if (!isBoolean(bool)) {
				throw new TypeError('param must be a Boolean');
			}
			this.#initial = bool;
		}

		/**
		 * The global status initial value, use in every instance. Can be modified by `setInitial` method.
		 * - Default is `false`.
		 */
		get initial() {
			return this.#initial;
		}

		constructor(createProxy?: CreateProxy) {
			if (isFunction(createProxy)) {
				this.#proxy = checkProxy(createProxy);
			}
		}

		/**
		 * @param status The status value string.
		 */
		create<T extends string[]>(...status: T): StatusRefResult<T>;
		/**
		 * @param createProxy Function return track and trigger function,
		 * which received the target key and the initial boolean status.
		 */
		create(createProxy: CreateProxy): CreateStatusRef;
		create<T extends string[]>(
			createProxy: CreateProxy | string,
			...status: string[]
		): CreateStatusRef | StatusRefResult<T> {
			let proxy = this.#proxy;
			const _initial = <T extends string[]>(...status: T) => {
				return createStatusRef(this.#initial, proxy!, ...status);
			};
			if (isFunction(createProxy)) {
				proxy = checkProxy(createProxy);
				return _initial;
			} else if (!proxy) {
				throw new Error(
					"If not use 'Proxy' function to create track and trigger, you must pass them as arguments",
				);
			}
			return _initial(
				...[...new Set([createProxy, ...status])],
			) as StatusRefResult<T>;
		}
	}

	const S = singleton(StatusRef, void 0);
	return new S();
})();
