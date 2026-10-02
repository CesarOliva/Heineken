import type { BottleSeed } from '../types';

export interface VisionReading extends BottleSeed {}
	export function mockVision(seed: BottleSeed): VisionReading {
	const jitter = (v: number, amt: number) => v + (Math.random() * 2 - 1) * amt;
	return {
		...seed,
		height: Math.max(0, jitter(seed.height, 0.4)),
		diameter: Math.max(0, jitter(seed.diameter, 0.2)),
		weight: Math.max(0, jitter(seed.weight, 4)),
		lightTransmission: Math.max(0, Math.min(100, jitter(seed.lightTransmission, 1.2))),
	};
}
