import { describe, it, expect } from 'vitest';
import React, { useEffect, useState } from 'react';
import { useReactStatusRef } from '.';

describe('useReactStatusRef', () => {
	it('should use status', () => {
		const status = useReactStatusRef.create('loading');
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
