import { track, trigger, TrackOpTypes, TriggerOpTypes } from '@vue/reactivity';
import { useStatusRef } from '@/index';

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
