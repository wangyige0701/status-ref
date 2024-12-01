import type {
	FirstElement,
	RestElements,
	Fn,
	Awaitable,
} from '@wang-yige/utils';

export type StatusRefValue = {
	__isWatch: boolean;
	getValue: (watch?: (key: string) => void) => boolean;
	setValue: (value: boolean) => any;
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

type StatusRefMultiple<T extends string[], ALL extends string[]> = T extends []
	? {}
	: T['length'] extends 1
		? StatusRefSingle<FirstElement<T> & string, ALL>
		: StatusRefSingle<FirstElement<T> & string, ALL> &
				StatusRefMultiple<RestElements<T>, ALL>;

type StatusRefWatch<
	W extends string[],
	ALL extends string[],
> = W['length'] extends 0
	? {}
	: StatusRefWatch<RestElements<W>, ALL> & { [K in W[0]]: boolean } & {
			[K in W[0] as
				| `listenOn${Capitalize<K>}`
				| `listenOff${Capitalize<K>}`]: ListenFunction<ALL>;
		};

type WatchModeFunc = Fn<[bool: Fn<[key: string], boolean>], boolean>;

export type Params = (string | [string, boolean] | [string, WatchModeFunc])[];

export type ParseParamsResult = Record<
	string,
	| {
			type: 'watch';
			data: WatchModeFunc;
	  }
	| {
			type: 'boolean';
			data: boolean;
	  }
>;

// prettier-ignore
export type ParseParams<
	T extends Params,
	Result extends { status: string[], watch: string[] } = { status: [], watch: [] },
	F = FirstElement<T>,
> = T['length'] extends 0
	? Result
	: F extends [string, WatchModeFunc]
		? ParseParams<RestElements<T>, { status: Result['status'], watch: [...Result['watch'], F[0]] }>
		: F extends [string, boolean]
			? ParseParams<RestElements<T>, { status: [...Result['status'], F[0]], watch: Result['watch'] }>
			: F extends string
				? ParseParams<RestElements<T>, { status: [...Result['status'], F], watch: Result['watch']}>
				: never;

export type ParseStatusRefResult<
	T extends { status: string[]; watch: string[] },
> = StatusRefResult<T['status'], T['watch']>;

export type StatusRefResult<
	T extends string[],
	W extends string[] = [],
> = StatusRefMultiple<T, T> & {
	on: () => StatusRefResult<T, W>;
	off: () => StatusRefResult<T, W>;
	toggle: () => StatusRefResult<T, W>;
} & StatusRefWatch<W, W>;
