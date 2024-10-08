import { track, trigger, TrackOpTypes, TriggerOpTypes } from '@vue/reactivity';
import { useStatusRef, type StatusRef } from '@/index';

export type { StatusRef };

export const useVueStatusRef = useStatusRef.Proxy(() => {
	return {
		track: (target, key) => {
			track(target, TrackOpTypes.GET, key);
		},
		trigger: (target, key, status) => {
			trigger(target, TriggerOpTypes.SET, key, status);
		},
	};
});
