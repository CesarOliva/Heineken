import { describe, expect, it } from 'vitest';
import { decideBottle } from './rules';
import { STANDARD_RANGES, type BottleSeed } from '../types';

const base: BottleSeed = {
    height: 23.4,
    diameter: 6.2,
    weight: 221,
    meanRGB: [70, 150, 70],
    trueColor: 'verde',
    ocrText: 'HEINEKEN',
    hasLabel: true,
    brandCandidate: 'Heineken',
};

describe('rules (README §20, rangos estándar, color por RGB)', () => {
    it('Heineken + Verde -> contenedor Verde', () => {
        const r = decideBottle(base, STANDARD_RANGES);
        expect(r.decision).toBe('accepted');
        expect(r.container).toBe('verde');
    });

    it('sin etiqueta -> No identificado aunque sea verde', () => {
        const r = decideBottle({ ...base, brandCandidate: null, ocrText: '' }, STANDARD_RANGES);
        expect(r.decision).toBe('accepted');
        expect(r.container).toBe('no-identificado');
    });

    it('altura fuera de rango estándar (15–35) -> rechazo', () => {
        const r = decideBottle({ ...base, height: 40.2 }, STANDARD_RANGES);
        expect(r.decision).toBe('rejected');
        expect(r.container).toBe('rechazo');
        expect(r.rejectionReason).toMatch(/Altura/);
    });

    it('peso fuera de rango estándar (180–250) -> rechazo', () => {
        const r = decideBottle({ ...base, weight: 100 }, STANDARD_RANGES);
        expect(r.decision).toBe('rejected');
        expect(r.rejectionReason).toMatch(/Peso/);
    });

    it('el color se establece solo por RGB', () => {
        const ambar = decideBottle({ ...base, meanRGB: [220, 110, 30] }, STANDARD_RANGES);
        expect(ambar.color).toBe('ambar');
        expect(ambar.container).toBe('ambar');
        const transp = decideBottle({ ...base, meanRGB: [225, 225, 220] }, STANDARD_RANGES);
        expect(transp.color).toBe('transparente');
        expect(transp.container).toBe('transparente');
    });

    it('límites exactos del estándar son aceptados', () => {
        const atMin = decideBottle(
            { ...base, height: 15, diameter: 5, weight: 180 },
            STANDARD_RANGES,
        );
        expect(atMin.decision).toBe('accepted');
        const atMax = decideBottle(
            { ...base, height: 35, diameter: 10, weight: 250 },
            STANDARD_RANGES,
        );
        expect(atMax.decision).toBe('accepted');
    });
});
