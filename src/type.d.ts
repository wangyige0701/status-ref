import type {
	ElementOf,
	FirstElement,
	RestElements,
	Fn,
} from '@wang-yige/utils';

export type StatusRefValue = {
	getValue: () => boolean;
	setValue: (value: boolean) => void;
	value: boolean;
};

export type CreateStatusRef = {
	<T extends string[]>(...status: T): StatusRefResult<T>;
};

export type StatusProxy = {
	track: Fn<[target: object, key: string]>;
	trigger: Fn<[target: object, key: string, status: boolean]>;
};

export type CreateProxy = Fn<
	[key: string | undefined, initial: boolean | undefined],
	StatusProxy
>;

type StatusRefSingle<T extends string, ALL extends string[]> = {
	[K in T]: boolean;
} & {
	[K in T as
		| `on${Capitalize<K>}`
		| `off${Capitalize<K>}`
		| `toggle${Capitalize<K>}`]: () => StatusRefResult<ALL>;
};

type StatusRefMultiple<T extends string[], ALL = T> = T extends []
	? {}
	: T['length'] extends 1
		? StatusRefSingle<FirstElement<T>, ALL>
		: StatusRefSingle<FirstElement<T>, ALL> &
				StatusRefMultiple<RestElements<T>, ALL>;

export type StatusRefResult<T extends string[]> = StatusRefMultiple<T> & {
	on: () => StatusRefResult<T>;
	off: () => StatusRefResult<T>;
	toggle: () => StatusRefResult<T>;
	stop: () => void;
};
