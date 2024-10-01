import React from 'react';
import { useReactStatusRef } from '@/react';

const status = useReactStatusRef.create('loading', 'initial');

export default function Status() {
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
