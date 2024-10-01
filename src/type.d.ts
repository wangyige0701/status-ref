import type {
	FirstElement,
	RestElements,
	Fn,
	Awaitable,
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
	/**
	 * If the track function dont't return a void value,
	 * the getter function will return this.
	 * - If the status need an object to track, it will return the object.
	 */
	track: Fn<[target: object, key: string], any>;
	/**
	 * When status changed, this function will be called.
	 */
	trigger: Fn<[target: object, key: string, status: boolean], any>;
};

export type CreateProxy = Fn<[key: string, initial: boolean], StatusProxy>;

export type ListenStatusCallback = Fn<
	[target: object, key: string, status: boolean],
	Awaitable<void>
>;

/**
 * @param cb The callback function to be executed when the status change to expected.
 * @param immediate Whether to execute the callback immediately if the status is already expected.
 * - default is false.
 */
type ListenFunction<ALL extends string[]> = Fn<
	[cb: ListenStatusCallback, immediate?: boolean],
	StatusRefResult<ALL>
>;

type StatusRefSingle<T extends string, ALL extends string[]> = {
	[K in T]: boolean;
} & {
	[K in T as
		| `on${Capitalize<K>}`
		| `off${Capitalize<K>}`
		| `toggle${Capitalize<K>}`]: () => StatusRefResult<ALL>;
} & {
	[K in T as
		| `listenOn${Capitalize<K>}`
		| `listenOff${Capitalize<K>}`]: ListenFunction<ALL>;
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
