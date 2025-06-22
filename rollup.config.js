import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';

let posi = 0;

const enteries = ['src/index.ts', 'src/vue/index.ts', 'src/react/index.ts'];

const delPluin = () => (posi++ === 0 ? [del({ targets: ['dist/*'] })] : []);
const aliasPluin = alias({
	entries: [{ find: /^@\/(.+)$/, replacement: 'status-ref/$1' }],
	customResolver: source => {
		let id = source;
		if (source.startsWith('status-ref') && source.endsWith('/index')) {
			id = source.slice(0, -6);
			return {
				id,
				external: 'relative',
			};
		}
		return null;
	},
});
const plugins = [
	aliasPluin,
	resolve({
		preferBuiltins: true,
		rootDir: 'src',
	}),
	typescript(),
	commonjs(),
	esbuild({
		target: 'node14',
	}),
];

/** @type {import('rollup').RollupOptions[]} */
export default [
	...enteries.map((input, index) => {
		/** @type {() => import('rollup').RollupOptions} */
		const config = () => ({
			input,
			output: [
				{
					file: input.replace('src/', 'dist/').replace('.ts', '.mjs'),
					format: 'esm',
				},
				{
					file: input.replace('src/', 'dist/').replace('.ts', '.cjs'),
					format: 'cjs',
				},
			],
			external: [],
			plugins: [...delPluin(), ...plugins],
		});
		if (index === 0) {
			return {
				...config(),
				external: ['@wang-yige/utils'],
			};
		}
		if (index === 1) {
			return {
				...config(),
				external: ['vue', '@wang-yige/utils'],
			};
		}
		if (index === 2) {
			return {
				...config(),
				external: ['react'],
			};
		}
		return config();
	}),
	...enteries.map((input, index) => {
		/** @type {() => import('rollup').RollupOptions} */
		const config = () => ({
			input,
			output: [
				{
					file: input
						.replace('src/', 'dist/')
						.replace('.ts', '.d.mts'),
					format: 'esm',
				},
				{
					file: input
						.replace('src/', 'dist/')
						.replace('.ts', '.d.cts'),
					format: 'cjs',
				},
				{
					file: input
						.replace('src/', 'dist/')
						.replace('.ts', '.d.ts'),
					format: 'esm',
				},
			],
			external: [],
			plugins: [
				...delPluin(),
				aliasPluin,
				typescript(),
				dts({ respectExternal: true }),
			],
		});
		if (index === 0) {
			return {
				...config(),
				external: ['@wang-yige/utils'],
			};
		}
		if (index === 1) {
			return {
				...config(),
				external: ['vue', '@wang-yige/utils'],
			};
		}
		if (index === 2) {
			return {
				...config(),
				external: ['react', '@wang-yige/utils'],
			};
		}
		return config();
	}),
];
