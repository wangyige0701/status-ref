import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { StatusRefResult, StatusRef } from '@/index';

export type { StatusRefResult };

export const useReactStatusRef = StatusRef.create((_, initial) => {
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
