import { describe, it, expect } from 'vitest';
import { useEffect, useState } from 'react';
import { reactStatusRef } from '.';

describe('reactStatusRef', () => {
	it('should use status', () => {
		const status = reactStatusRef.create('loading');
		const [loading, setLoading] = useState(false);
		useEffect(() => {
			loading;
			setLoading(status.loading);
		});
		expect(loading).toBe(true);
		status.offLoading();
		expect(loading).toBe(false);
		expect(status.loading).toBe(false);
	});
});
