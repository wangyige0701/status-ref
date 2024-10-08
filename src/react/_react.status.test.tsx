import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Status from './_components/status';

/**
 * @vitest-environment jsdom
 */

describe('useReactStatusRef', () => {
	it('should use status', async () => {
		const { getByTestId } = render(<Status />);
		const changeEl = getByTestId('change');
		const changeElBtn = getByTestId('change_btn');
		const changeElBtn2 = getByTestId('change_btn2');
		const toggleEl = getByTestId('toggle');
		const toggleElBtn = getByTestId('toggle_btn');
		fireEvent.click(changeElBtn);
		await waitFor(() => {});
		expect(changeEl.textContent).toBe('true');
		fireEvent.click(changeElBtn);
		await waitFor(() => {});
		expect(changeEl.textContent).toBe('true');
		fireEvent.click(changeElBtn2);
		await waitFor(() => {});
		expect(changeEl.textContent).toBe('false');
		fireEvent.click(changeElBtn2);
		await waitFor(() => {});
		expect(changeEl.textContent).toBe('true');

		fireEvent.click(toggleElBtn);
		await waitFor(() => {});
		expect(toggleEl.textContent).toBe('true');
		expect(changeEl.textContent).toBe('false');
	});
});
