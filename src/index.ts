import {
	firstUpperCase,
	isBoolean,
	isDef,
	isFunction,
	singleton,
} from '@wang-yige/utils';
import type {
	StatusRefValue,
	StatusRefResult,
	CreateStatusRef,
	StatusProxy,
	CreateProxy,
	ListenStatusCallback,
} from './type';

export const useStatusRef = (() => {
	const CONFIG: PropertyDescriptor = {
		configurable: false,
		enumerable: false,
	};

	const functionCheck = new WeakMap<Function, boolean>();

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
		listenOn: ListenStatusCallback[],
		listenOff: ListenStatusCallback[],
	) => {
		let value: boolean = bool;
		const result = {
			getValue: () => {
				const result = track(target, key);
				if (isDef(result)) {
					return result;
				}
				return value;
			},
			setValue: (v: boolean) => {
				value = v;
				trigger(target, key, value);
				(async () => {
					const list = value ? listenOn : listenOff;
					for (const func of list) {
						await func?.(target, key, value);
					}
				})();
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
			const listenOn: ListenStatusCallback[] = []; //未调用
			const listenOff: ListenStatusCallback[] = [];
			let track: StatusProxy['track'];
			let trigger: StatusProxy['trigger'];
			try {
				const { track: _track, trigger: _trigger } = createProxy(
					key,
					initial,
				);
				if (!functionCheck.get(createProxy)) {
					if (!isFunction(_track) || !isFunction(_trigger)) {
						throw new TypeError(
							'The Proxy param must be a function which return `track` and `trigger` function',
						);
					}
					functionCheck.set(createProxy, true);
				}
				track = _track;
				trigger = _trigger;
			} catch (error) {
				throw error;
			}
			map.set(
				key,
				createStatusRefValue(
					_this,
					key,
					initial,
					track,
					trigger,
					listenOn,
					listenOff,
				),
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
				[`listenOn${firstUpperCase(key)}`]: {
					...CONFIG,
					value: (
						cb: ListenStatusCallback,
						immediate: boolean = false,
					) => {
						listenOn.push(cb);
						if (immediate && map.get(key)!.value) {
							cb(_this, key, true);
						}
					},
				},
				[`listenOff${firstUpperCase(key)}`]: {
					...CONFIG,
					value: (
						cb: ListenStatusCallback,
						immediate: boolean = false,
					) => {
						listenOff.push(cb);
						if (immediate && !map.get(key)!.value) {
							cb(_this, key, false);
						}
					},
				},
			});
		}
		return _this;
	};

	class StatusRef {
		#proxy: CreateProxy | undefined = void 0;
		#initial: boolean = false;

		/**
		 * This `createProxy` function will be checked when the create method called first,
		 * and the firstly called of this function whill be used to checked, with a symbol passed as the first param.
		 */
		Proxy(createProxy: CreateProxy) {
			return new (singleton(StatusRef, createProxy))();
		}

		setInitial(bool: boolean) {
			if (!isBoolean(bool)) {
				throw new TypeError(
					'The value to set initial status must be a Boolean',
				);
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
			this.#proxy = createProxy;
		}

		/**
		 * @param status The status value string.
		 */
		create<T extends string[]>(...status: T): StatusRefResult<T>;
		/**
		 * @param createProxy Function return track and trigger function,
		 * which received the target key and the initial boolean status.
		 * - `track`: If it return a not void value, the result will be used as the status return value.
		 * - `trigger`: Custom trigger logic.
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
				proxy = createProxy;
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

	return new (singleton(StatusRef, void 0))();
})();
