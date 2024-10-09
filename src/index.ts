import { singleton } from '@wang-yige/utils';
import type { StatusRefResult, CreateProxy, Params, ParseParams } from './type';
import { createStatusRef, parseParams } from './utils';

export type { StatusRefResult };

export const StatusRef = (() => {
	class StatusRef {
		#proxy: CreateProxy;
		#initial: boolean = false;

		constructor(createProxy: CreateProxy) {
			this.#proxy = createProxy;
		}

		use<T extends Params>(
			status: T,
			initial: boolean = this.#initial,
		): StatusRefResult<ParseParams<T>> {
			if (!this.#proxy) {
				throw new Error(
					'Need use `create` function to pass track and trigger methods',
				);
			}
			return createStatusRef(this.#proxy, parseParams(initial, status));
		}

		/**
		 * @param createProxy Function return track and trigger function,
		 * which received the target key and the initial boolean status.
		 * - `track`: If it return a not void value, the result will be used as the status return value.
		 * - `trigger`: Custom trigger logic.
		 */
		static create(createProxy: CreateProxy) {
			const statusRef = new (singleton(StatusRef, createProxy))();
			const _use = <T extends Params>(...status: T) => {
				return statusRef.use(status);
			};
			_use.initial = (bool: boolean) => {
				return {
					use: <T extends Params>(...status: T) => {
						return statusRef.use(status, bool);
					},
				};
			};
			return _use;
		}
	}

	return singleton(StatusRef) as typeof StatusRef;
})();
