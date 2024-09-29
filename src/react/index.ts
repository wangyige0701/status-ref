import { useState } from 'react';
import { useStatusRef } from '@/index';

export const useReactStatusRef = useStatusRef.Proxy((_, initial) => {
	const [status, setStatus] = useState(initial);
	return {
		track: () => {
			return status;
		},
		trigger: (_$1, _$2, value) => {
			setStatus(value);
		},
	};
});
