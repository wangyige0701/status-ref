import { track, trigger, TrackOpTypes, TriggerOpTypes } from '@vue/reactivity';
import { statusRef } from '@/index';

export const vueStatusRef = statusRef.Proxy(() => {
	return {
		track: (target, key) => {
			track(target, TrackOpTypes.GET, key);
		},
		trigger: (target, key, status) => {
			trigger(target, TriggerOpTypes.SET, key, status);
		},
	};
});
