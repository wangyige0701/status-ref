import React from 'react';
import { useReactStatusRef } from '@/react';

export default function Status() {
	const status = useReactStatusRef('loading', 'initial');

	return (
		<div style={{ width: '100px' }}>
			<div data-testid="change">{status.loading + ''}</div>
			<button data-testid="change_btn" onClick={() => status.onLoading()}>
				点击
			</button>
			<button
				data-testid="change_btn2"
				onClick={() => status.toggleLoading()}
			>
				点击
			</button>
			<div data-testid="toggle">{status.initial + ''}</div>
			<button data-testid="toggle_btn" onClick={() => status.toggle()}>
				点击
			</button>
		</div>
	);
}
