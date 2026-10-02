import { STAGE_ORDER, type AcceptanceRanges, type BottleSeed, type BottleResult, type MachineState } from '../types';
import { decideBottle } from './rules';
import { mockVision } from './visionMock';

export const BASE_CYCLE_MS = 8000; // 8s conceptuales

export interface EngineEvents {
	onStage: (stage: MachineState, partial: Partial<BottleResult> & { seed: BottleSeed }) => void;
	onDone: (result: BottleResult) => void;
}

export function runBottle(seed: BottleSeed, ranges: AcceptanceRanges, speed: number, events: EngineEvents): () => void {
	const reading = mockVision(seed);
	const result = decideBottle(reading, ranges);
	const perStage = BASE_CYCLE_MS / STAGE_ORDER.length / speed;
	let cancelled = false;
	const timers: ReturnType<typeof setTimeout>[] = [];

	STAGE_ORDER.forEach((stage, i) => {
		const t = setTimeout(() => {
			if (cancelled) return;

			events.onStage(stage, { ...result, seed: reading });

			if (stage === 'REGISTERING') events.onDone(result);
		}, perStage * (i + 1));
		
		timers.push(t);
	});

	return () => {
		cancelled = true;
		timers.forEach(clearTimeout);
	};
}
