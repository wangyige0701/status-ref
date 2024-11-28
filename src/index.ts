import { isBoolean, isFunction } from '@wang-yige/utils';
import type {
	StatusRefResult,
	CreateProxy,
	Params,
	ParseParams,
	ParseStatusRefResult,
} from './type';
import { createStatusRef, parseParams } from './utils';

export type { StatusRefResult };

export class StatusRef {
	#proxy: CreateProxy;
	#initial: boolean = false;

	/**
	 * Create a status ref instance which can be directly called to create status refs.
	 * - The initial method can be called to set the initial status.
	 * @param createProxy A function return an object with `track` and `trigger` methods implement.
	 * - `track`: If the return value is not void, the result will be used as the status getter return.
	 * - `trigger`: Custom trigger logic.
	 * @example
	 * ```ts
	 * const useStatusRef = new StatusRef(() => {
	 * 	return {
	 * 		track(target: object, key: string) {},
	 * 		trigger(target: object, key: string, status: boolean) {},
	 * 	};
	 * });
	 * ```
	 */
	constructor(createProxy: CreateProxy) {
		if (!createProxy || !isFunction(createProxy)) {
			throw new TypeError('`createProxy` must be a function');
		}
		this.#proxy = createProxy;
	}

	/**
	 * Set all status initial value to the `bool`.
	 */
	initial(bool: boolean) {
		if (!isBoolean(bool)) {
			throw new TypeError(
				'Initial status must be a boolean\ntarget: ' + bool,
			);
		}
		return {
			use: <T extends Params>(...status: T) => {
				return createStatusRef<T>(
					this.#proxy,
					parseParams(bool, status),
				);
			},
		};
	}

	/**
	 * Pass in status to create a status target.
	 * @param status A string or an array of `[string, boolean]`.
	 * @example
	 * ```ts
	 * const status = useStatusRef.use('loading', ['error', true], StausRef.T('initial', true));
	 * status.loading; // false
	 * status.error; // true
	 * status.initial; // true
	 * status.onLoading().offError().toggleInitial();
	 * status.on().off().toggle();
	 * status.listenOnLoading(() => {});
	 * status.listenOffLoading(() => {});
	 * ```
	 */
	use<T extends Params>(...status: T): ParseStatusRefResult<ParseParams<T>> {
		if (!this.#proxy) {
			throw new Error(
				'Need use `create` function to pass track and trigger methods',
			);
		}
		return createStatusRef<T>(
			this.#proxy,
			parseParams(this.#initial, status),
		);
	}

	/**
	 * Create a status ref instance which can be directly called to create status refs.
	 * - The initial method can be called to set the initial status.
	 * @param createProxy A function return an object with `track` and `trigger` methods implement.
	 * - `track`: If the return value is not void, the result will be used as the status getter return.
	 * - `trigger`: Custom trigger logic.
	 * @example
	 * ```ts
	 * const useStatusRef = StatusRef.create(() => {
	 * 	return {
	 * 		track(target: object, key: string) {},
	 * 		trigger(target: object, key: string, status: boolean) {},
	 * 	};
	 * });
	 * ```
	 */
	static create(createProxy: CreateProxy) {
		const statusRef = new StatusRef(createProxy);
		/**
		 * Pass in status to create a status ref object.
		 * @param status A string or an array of `[string, boolean]`.
		 * @example
		 * ```ts
		 * const status = useStatusRef.use('loading', ['error', true], StausRef.T('initial', true));
		 * status.loading; // false
		 * status.error; // true
		 * status.initial; // true
		 * status.onLoading().offError().toggleInitial();
		 * status.on().off().toggle();
		 * status.listenOnLoading(() => {});
		 * status.listenOffLoading(() => {});
		 * ```
		 */
		const _use = <T extends Params>(...status: T) => {
			return statusRef.use(...status);
		};
		/**
		 * Set all status initial value to the `bool`.
		 */
		_use.initial = (bool: boolean) => {
			return statusRef.initial(bool);
		};
		return _use;
	}

	/**
	 * To create a custom initial value status,
	 * used to type inference.
	 * - Return an array of `[string, boolean]`.
	 * @param {string} status convert to string.
	 */
	static T<T extends string>(status: T, bool: boolean): [T, boolean] {
		return [String(status) as T, bool];
	}
}
