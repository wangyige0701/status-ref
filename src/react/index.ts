import { useState } from 'react';
import type { ParseParams, Params, ParseStatusRefResult } from '@/index';
import { StatusRefResult, StatusRef } from '@/index';

export type { StatusRefResult };

export { StatusRef };

/**
 * @example
 * ```tsx
 * import { useReactStatusRef } from 'status-ref/react';
 *
 * export default function Status() {
 * 	const status = useReactStatusRef('loading', 'error');
 * 	return (
 * 		<button onClick={() => status.toggleLoading()}>
 * 			{status.loading ? 'loading' : 'not loading'}
 * 		</button>
 * 	);
 * }
 * ```
 */
export const useReactStatusRef = <T extends Params>(...status: T) => {
	const [bools, setBools] = useState({} as Record<string, boolean>);
	const [useStatusRef, setUseStatusRef] = useState({ value: {} } as {
		value: ParseStatusRefResult<ParseParams<T>>;
	});
	const [initial, setInitial] = useState(false);
	if (!initial) {
		const statusRef = new StatusRef((key, initial) => {
			setBools({ ...bools, [key]: initial });
			return {
				track: (_, key) => {
					return bools[key];
				},
				trigger: (_$1, key, value) => {
					setBools({ ...bools, [key]: value });
				},
			};
		});
		const refs = statusRef.use(...status);
		setUseStatusRef({ value: refs });
		setInitial(true);
	}
	return useStatusRef.value;
};
