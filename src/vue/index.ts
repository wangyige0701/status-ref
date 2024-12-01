import { track, trigger, TrackOpTypes, TriggerOpTypes } from '@vue/reactivity';
import { type StatusRefResult, StatusRef } from '@/index';

export type { StatusRefResult };

export { StatusRef };

export const useVueStatusRef = StatusRef.create(() => {
	return {
		track: (target, key) => {
			track(target, TrackOpTypes.GET, key);
		},
		trigger: (target, key, status) => {
			trigger(target, TriggerOpTypes.SET, key, status);
		},
	};
});
