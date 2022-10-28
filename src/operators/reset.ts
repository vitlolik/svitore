import { Event } from "../event";
import { State } from "../state";

const reset = ({
	trigger,
	target,
}: {
	trigger: Event<any> | Event<any>[];
	target: State<any> | State<any>[];
}) => {
	const triggerList: Event<any>[] = Array.isArray(trigger)
		? trigger
		: [trigger];
	const targetList: State<any>[] = Array.isArray(target) ? target : [target];

	triggerList.forEach((trigger) => {
		targetList.forEach((target) => {
			target.onReset(trigger);
		});
	});
};

export { reset };
