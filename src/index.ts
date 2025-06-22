import { isBoolean, isFunction } from '@wang-yige/utils';
import type {
	StatusRefResult,
	CreateProxy,
	Params,
	WatchModeFunc,
	UseStatusRef,
	StatusRefImplement,
	InitialStatusRef,
	ParseStatusRefResult,
	ParseParams,
} from './type';
import { createStatusRef, parseParams } from './utils';

export type { StatusRefResult, Params, ParseStatusRefResult, ParseParams };

export class StatusRef implements StatusRefImplement {
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
	 * useStatusRef.initial(true).use('loading');
	 * ```
	 */
	constructor(createProxy: CreateProxy) {
		if (!createProxy || !isFunction(createProxy)) {
			throw new TypeError(
				'`createProxy` must be a function: ' + createProxy,
			);
		}
		this.#proxy = createProxy;
	}

	/**
	 * Reset the default boolean value of the status ref.
	 * - Default value is `false`.
	 * - The `initial` method only works for the `use` method chained called.
	 */
	initial(bool: boolean) {
		if (!isBoolean(bool)) {
			throw new TypeError(
				'Initial status must be a boolean.\nBut input target: ' + bool,
			);
		}
		return {
			use: <T extends Params>(...status: T) => {
				return createStatusRef<T>(
					this.#proxy,
					parseParams(bool, status),
				);
			},
		} as InitialStatusRef;
	}

	/**
	 * Create the status ref with input status name.
	 * @param status The status to be created.
	 * @example
	 * ```ts
	 * const status = statusRef.use('loading');
	 * status.loading; // false
	 * status.onLoading(); // status.loading => true
	 * ```
	 */
	use<T extends Params>(...status: T) {
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
	 * useStatusRef.initial(true).use('loading');
	 * useStatusRef('loading');
	 * ```
	 */
	static create(createProxy: CreateProxy) {
		const statusRef = new StatusRef(createProxy);
		const _use = <T extends Params>(...status: T) => {
			return statusRef.use(...status);
		};
		_use.initial = (bool: boolean) => {
			return statusRef.initial(bool);
		};
		return _use as UseStatusRef;
	}

	/**
	 * To create a custom initial value status, used to type inference.
	 * In ts, can use `as const` to assertion and needn't use `StatusRef.T`.
	 * - Return an array of `[string, boolean]`.
	 * @param {string} status convert to string.
	 */
	static T<T extends string, V extends boolean | WatchModeFunc>(
		status: T,
		bool: V,
	): [T, V] {
		return [String(status) as T, bool];
	}
}
