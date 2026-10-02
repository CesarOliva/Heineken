export type BottleColor = 'verde' | 'ambar' | 'transparente';
export type ContainerId = 'verde' | 'ambar' | 'transparente' | 'no-identificado' | 'rechazo';
export type Decision = 'accepted' | 'rejected';

export interface BottleResult {
    timestamp: string;
    brand: string;
    color: BottleColor;
    height: number; // cm
    diameter: number; // cm
    weight: number; // g
    meanRGB: [number, number, number];
    ocrText: string;
    decision: Decision;
    rejectionReason?: string;
    container: ContainerId;
}

export interface BottleSeed {
    height: number;
    diameter: number;
    weight: number;
    meanRGB: [number, number, number];
    trueColor: BottleColor;
    ocrText: string;
    hasLabel: boolean;
    brandCandidate: string | null; // null = no identificada
}

/** Rangos de aceptación estándar de la máquina (README §9). No editables. */
export interface AcceptanceRanges {
    minHeight: number; // cm
    maxHeight: number; // cm
    minDiameter: number; // cm
    maxDiameter: number; // cm
    minWeight: number; // g
    maxWeight: number; // g
}

export const STANDARD_RANGES: AcceptanceRanges = {
    minHeight: 15,
    maxHeight: 35,
    minDiameter: 5,
    maxDiameter: 10,
    minWeight: 180,
    maxWeight: 250,
};

export interface SimParams {
    speed: number; // 0.5 | 1 | 2 | 5
    containerCapacity: number; // botellas por contenedor antes de warning
    gapSec: number; // pausa entre botella y botella en modo automático
}

export const DEFAULT_PARAMS: SimParams = {
    speed: 1,
    containerCapacity: 20,
    gapSec: 1,
};

export type MachineState =
    | 'IDLE'
    | 'BOTTLE_DETECTED'
    | 'WEIGHING'
    | 'MEASURING'
    | 'COLOR_ANALYSIS'
    | 'OCR_ANALYSIS'
    | 'DECISION'
    | 'DIVERTING'
    | 'DROP'
    | 'REGISTERING';

export const STAGE_ORDER: MachineState[] = [
    'BOTTLE_DETECTED',
    'WEIGHING',
    'MEASURING',
    'COLOR_ANALYSIS',
    'OCR_ANALYSIS',
    'DECISION',
    'DIVERTING',
    'DROP',
    'REGISTERING',
];

export interface Counters {
    byColor: Record<BottleColor, number>;
    byBrand: Record<string, number>;
    received: number;
    accepted: number;
    rejected: number;
    byContainer: Record<ContainerId, number>;
}

export function emptyCounters(): Counters {
    return {
        byColor: { verde: 0, ambar: 0, transparente: 0 },
        byBrand: {},
        received: 0,
        accepted: 0,
        rejected: 0,
        byContainer: {
            verde: 0,
            ambar: 0,
            transparente: 0,
            'no-identificado': 0,
            rechazo: 0,
        },
    };
}
