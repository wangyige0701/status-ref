import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { useStatusRef } from '@/index';

export const useReactStatusRef = useStatusRef.Proxy((_, initial) => {
	let status: boolean;
	let setStatus: Dispatch<SetStateAction<boolean>>;
	return {
		track: () => {
			[status, setStatus] = useState(initial);
			return status;
		},
		trigger: (_$1, _$2, value) => {
			setStatus && setStatus(value);
		},
	};
});
