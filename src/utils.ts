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
	StatusRefResult,
	StatusProxy,
	CreateProxy,
	ListenStatusCallback,
	Params,
	ParseParams,
} from './type';

const CONFIG: PropertyDescriptor = {
	configurable: false,
	enumerable: false,
};

const functionCheck = new WeakMap<Function, boolean>();

function setProp(_this: any, s: string, value: Function) {
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

export function parseParams<T extends Params>(initial: boolean, status: T) {
	const result = {} as Record<string, boolean>;
	const length = status.length;
	for (let i = 0; i < length; i++) {
		const target = status[i];
		if (
			isArray(target) &&
			target.length === 2 &&
			isString(target[0]) &&
			isBoolean(target[1])
		) {
			result[target[0]] = target[1];
		} else if (isString(target)) {
			result[target] = initial;
		} else {
			throw new TypeError(
				'The status must pass a string of status name,' +
					' or an array which first element is a string of status name' +
					' and the second element is a boolean value\n' +
					'target: ' +
					JSON.stringify(target),
			);
		}
	}
	return result;
}

export const createStatusRef = <T extends Params>(
	createProxy: CreateProxy,
	status: Record<string, boolean>,
) => {
	const map = new Map<string, StatusRefValue>();
	const _this = Object.create(null) as StatusRefResult<ParseParams<T>>;
	const _clear = (key: string) => {
		if (key) {
			map.delete(key);
		}
	};
	setProp(_this, 'on', () => {
		map.forEach(v => v.setValue(true));
		return _this;
	});
	setProp(_this, 'off', () => {
		map.forEach(v => v.setValue(false));
		return _this;
	});
	setProp(_this, 'toggle', () => {
		map.forEach(v => v.setValue(!v.value));
		return _this;
	});
	setProp(_this, 'stop', () => {
		[...map.keys()].forEach(_clear);
	});
	const keys = Object.keys(status);
	const length = keys.length;
	for (let i = 0; i < length; i++) {
		const key = keys[i];
		const initial = status[key];
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
