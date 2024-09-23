import { useState } from 'react';
import { statusRef } from '@/index';

export const reactStatusRef = statusRef.Proxy((_, initial) => {
	const [status, setStatus] = useState(initial);
	return {
		track: () => {
			status;
		},
		trigger: (_$1, _$2, value) => {
			setStatus(value);
		},
	};
});
