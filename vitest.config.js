import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['./src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
