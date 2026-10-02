import type { AcceptanceRanges, BottleColor, BottleResult, BottleSeed, ContainerId } from '../types';
import { UNIDENTIFIED } from './brands';

export function classifyColorRGB(r: number, g: number, b: number): BottleColor {
    // Reglas simplificadas
    // Transparente: R≈G≈B (diferencia max < 25)
    // Verde: G > R y G > B
    // Ámbar: R y G elevados, B reducido

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    if (max - min < 25) return 'transparente';
    if (g > r && g > b) return 'verde';
    if (r >= 120 && g >= 70 && b < 110) return 'ambar';
    if (r > b && g > b) return 'ambar';
    return 'verde';
}

export interface PhysicsCheck {
    ok: boolean;
    reason?: string;
}

export function validatePhysics(
    seed: Pick<BottleSeed, 'weight' | 'height' | 'diameter'>,
    p: AcceptanceRanges,
): PhysicsCheck {
    if (seed.weight < p.minWeight || seed.weight > p.maxWeight)
        return { ok: false, reason: 'Peso fuera de rango' };
    if (seed.height < p.minHeight || seed.height > p.maxHeight)
        return { ok: false, reason: 'Altura fuera de rango' };
    if (seed.diameter < p.minDiameter || seed.diameter > p.maxDiameter)
        return { ok: false, reason: 'Diámetro fuera de rango' };
    return { ok: true };
}

export function resolveContainer(color: BottleColor, brand: string, rejected: boolean): ContainerId {
    if (rejected) return 'rechazo';
    if (brand === UNIDENTIFIED) return 'no-identificado';

    return color;
}

export function decideBottle(seed: BottleSeed, params: AcceptanceRanges): BottleResult {
    const physics = validatePhysics(seed, params);
    let decision: BottleResult['decision'] = 'accepted';
    let reason: string | undefined;

    if (!physics.ok) {
        decision = 'rejected';
        reason = physics.reason;
    }

    // El color se establece exclusivamente por RGB (classifyColorRGB).
    const [r, g, b] = seed.meanRGB;
    const color = classifyColorRGB(r, g, b);
    const brand = seed.brandCandidate ?? UNIDENTIFIED;
    const container = resolveContainer(color, brand, decision === 'rejected');

    return {
        timestamp: new Date().toISOString(),
        brand,
        color,
        height: round1(seed.height),
        diameter: round1(seed.diameter),
        weight: Math.round(seed.weight),
        meanRGB: seed.meanRGB,
        ocrText: seed.ocrText,
        decision,
        rejectionReason: reason ?? '',
        container,
    };
}

function round1(n: number): number {
    return Math.round(n * 10) / 10;
}
