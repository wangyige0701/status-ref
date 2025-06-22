import { customRef } from 'vue';
import { VOID_FUNCTION, type Fn } from '@wang-yige/utils';
import { type StatusRefResult, StatusRef } from '@/index';

export type { StatusRefResult };

export { StatusRef };

/**
 * @example
 * ```vue
 * <template>
 * 	<div v-if="statusRef.loading">Loading...</div>
 * 	<div v-else-if="statusRef.success">Success!</div>
 * 	<div v-else>Error!</div>
 * </template>
 * <script setup lang="ts">
 * import { useVueStatusRef } from 'StatusRef/vue';
 *
 * const status = useVueStatusRef('loading', ['success', true] as const);
 * status.loading // false
 * status.success // true
 *
 * status.toggleLoading();
 * </script>
 * ```
 */
export const useVueStatusRef = StatusRef.create((_, initial) => {
	let track: Fn;
	let trigger: Fn;
	let bool: boolean = initial;
	customRef(($1, $2) => {
		(track = $1), (trigger = $2);
		return { get: VOID_FUNCTION, set: VOID_FUNCTION };
	});
	return {
		track: () => {
			track();
			return bool;
		},
		trigger: (_$1, _$2, status) => {
			bool = status;
			trigger();
		},
	};
});
