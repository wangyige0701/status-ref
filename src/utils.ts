import {
	firstUpperCase,
	isArray,
	isBoolean,
	isDef,
	isFunction,
	isString,
} from '@wang-yige/utils';
import type {
	StatusRefValue,
	StatusProxy,
	CreateProxy,
	ListenStatusCallback,
	Params,
	ParseParams,
	ParseParamsResult,
	ParseStatusRefResult,
} from './type';

type TriggerWatch = (key: string) => void;

const __FunctionCheck = new WeakMap<Function, boolean>();

const createStatusRefValue = (
	target: object,
	key: string,
	bool: boolean,
	track: StatusProxy['track'],
	trigger: StatusProxy['trigger'],
	listenOn: ListenStatusCallback[],
	listenOff: ListenStatusCallback[],
	isWatch: boolean,
) => {
	let watchDeps: null | Array<TriggerWatch> = null;
	let value: boolean = bool;
	const result = {
		__isWatch: isWatch,
		getValue: (watch?: TriggerWatch) => {
			if (watch) {
				if (!watchDeps) {
					watchDeps = new Array();
				}
				if (!watchDeps.includes(watch)) {
					watchDeps.push(watch);
				}
			}
			const result = track(target, key);
			if (isDef(result)) {
				return result;
			}
			return value;
		},
		setValue: async (v: boolean) => {
			if (value === v) {
				return;
			}
			value = v;
			trigger(target, key, value);
			const listen = value ? listenOn : listenOff;
			if (watchDeps) {
				watchDeps.forEach(watch => {
					watch && watch(key);
				});
			}
			for (const func of listen) {
				if (func) {
					await func(target, key, value);
				}
			}
		},
	};
	Object.defineProperty(result, 'value', {
		configurable: false,
		enumerable: false,
		get: () => value,
	});
	return result as StatusRefValue;
};

export function parseParams<T extends Params>(initial: boolean, status: T) {
	const result = {} as ParseParamsResult;
	const length = status.length;
	for (let i = 0; i < length; i++) {
		const target = status[i];
		if (isArray(target) && target.length === 2 && isString(target[0])) {
			if (isBoolean(target[1])) {
				// ['test', true]
				result[target[0]] = {
					type: 'boolean',
					data: target[1],
				};
			} else if (isFunction(target[1])) {
				// ['test', (bool) => bool('status1) || !bool('status2')]
				result[target[0]] = {
					type: 'watch',
					data: target[1],
				};
			} else {
				throw new TypeError(
					'The second param must be a boolean or a function\n' +
						'target: ' +
						target[1],
				);
			}
		} else if (isString(target)) {
			result[target] = {
				type: 'boolean',
				data: initial,
			};
		} else {
			throw new TypeError(
				'The status must pass a string of status name, or an array with length of 2\n' +
					'target: ' +
					JSON.stringify(target),
			);
		}
	}
	return result;
}

export const createStatusRef = <T extends Params>(
	createProxy: CreateProxy,
	status: ParseParamsResult,
) => {
	const CONFIG: PropertyDescriptor = {
		configurable: false,
		enumerable: false,
	};
	const _map = new Map<string, StatusRefValue>();
	const _this = Object.create(null) as ParseStatusRefResult<ParseParams<T>>;

	function _setProp(_this: any, s: string, value: Function) {
		Object.defineProperty(_this, s, {
			...CONFIG,
			value,
		});
	}
	_setProp(_this, 'on', () => {
		_map.forEach(v => !v.__isWatch && v.setValue(true));
		return _this;
	});
	_setProp(_this, 'off', () => {
		_map.forEach(v => !v.__isWatch && v.setValue(false));
		return _this;
	});
	_setProp(_this, 'toggle', () => {
		_map.forEach(v => !v.__isWatch && v.setValue(!v.value));
		return _this;
	});

	const keys = Object.keys(status);
	const length = keys.length;
	for (let i = 0; i < length; i++) {
		const key = keys[i];
		const value = status[key];
		const listenOn: ListenStatusCallback[] = [];
		const listenOff: ListenStatusCallback[] = [];
		const isWatch = value.type === 'watch';
		let track: StatusProxy['track'];
		let trigger: StatusProxy['trigger'];
		let initialValue: boolean;
		if (isWatch) {
			const watchFunc = value.data;
			const _use = (_key: string) => {
				if (_key === key) {
					throw new Error(
						`Status can not watch itself, which name is \'${_key}\'`,
					);
				}
				if (!_map.has(_key)) {
					throw new Error(
						`Status \'${_key}\' is not exist, the status name must already been registered`,
					);
				}
				return _map.get(_key)!.getValue(_refresh);
			};
			const _get = (_key: string) => {
				return _map.get(_key)!.value;
			};
			const _refresh = (_key: string) => {
				_map.get(key)!.setValue(watchFunc(_get));
			};
			initialValue = watchFunc(_use);
			if (!isBoolean(initialValue)) {
				throw new Error(
					'In watch mode, the second function param must return a boolean value',
				);
			}
		} else {
			initialValue = value.data;
		}
		const { track: _track, trigger: _trigger } = createProxy(
			key,
			initialValue,
		);
		[track, trigger] = [_track, _trigger];
		if (!__FunctionCheck.get(createProxy)) {
			if (!isFunction(track) || !isFunction(trigger)) {
				throw new TypeError(
					'The Proxy param must be a function which return `track` and `trigger` function',
				);
			}
			__FunctionCheck.set(createProxy, true);
		}
		_map.set(
			key,
			createStatusRefValue(
				_this,
				key,
				initialValue,
				track,
				trigger,
				listenOn,
				listenOff,
				isWatch,
			),
		);

		const Upper = firstUpperCase(key);
		let special = null;
		if (!isWatch) {
			special = {
				[`on${Upper}`]: {
					...CONFIG,
					value: () => {
						_map.get(key)!.setValue(true);
						return _this;
					},
				},
				[`off${Upper}`]: {
					...CONFIG,
					value: () => {
						_map.get(key)!.setValue(false);
						return _this;
					},
				},
				[`toggle${Upper}`]: {
					...CONFIG,
					value: () => {
						const oldValue = _map.get(key)!.value;
						_map.get(key)!.setValue(!oldValue);
						return _this;
					},
				},
			};
		}
		Object.defineProperties(_this, {
			[key]: {
				...CONFIG,
				enumerable: true,
				get: () => {
					return _map.get(key)!.getValue();
				},
			},
			[`listenOn${Upper}`]: {
				...CONFIG,
				value: (
					cb: ListenStatusCallback,
					immediate: boolean = false,
				) => {
					listenOn.push(cb);
					if (immediate && _map.get(key)!.value) {
						cb(_this, key, true);
					}
				},
			},
			[`listenOff${Upper}`]: {
				...CONFIG,
				value: (
					cb: ListenStatusCallback,
					immediate: boolean = false,
				) => {
					listenOff.push(cb);
					if (immediate && !_map.get(key)!.value) {
						cb(_this, key, false);
					}
				},
			},
			...special,
		});
		special = null;
	}
	return _this;
};
