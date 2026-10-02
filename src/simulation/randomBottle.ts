import type { BottleSeed } from '../types';
import { BRANDS } from './brands';

function rand(min: number, max: number): number {
    return min + Math.random() * (max - min);
}
function pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

const RGB_BASE = {
    verde: [70, 150, 70] as [number, number, number],
    ambar: [220, 110, 30] as [number, number, number],
    transparente: [225, 225, 220] as [number, number, number],
};

function noisy(rgb: [number, number, number]): [number, number, number] {
    const j = () => rand(-14, 14);
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    return [clamp(rgb[0] + j()), clamp(rgb[1] + j()), clamp(rgb[2] + j())];
}

export function randomBottleSeed(): BottleSeed {
    const roll = Math.random();
    const anomalous = roll > 0.90;

    const cRoll = Math.random();
    const trueColor = cRoll < 0.4 ? 'verde' : cRoll < 0.7 ? 'ambar' : 'transparente';

    // Marca: 75% catálogo, 15% no identificada, 10% fuera de catálogo
    const bRoll = Math.random();
    let brandCandidate: string | null;
    let ocrText: string;
    let hasLabel = true;

    if (bRoll < 0.75) {
        brandCandidate = pick(BRANDS);
        ocrText = Math.random() < 0.85 ? brandCandidate.toUpperCase() : brandCandidate;
    } else if (bRoll < 0.9) {
        brandCandidate = null;
        hasLabel = Math.random() < 0.5;
        ocrText = hasLabel ? 'ETIQUETA ILEGIBLE ***' : '';
    } else {
        brandCandidate = null;
        ocrText = pick(['CORONA EXTRA', 'MODELO', 'VICTORIA', 'PACIFICO']);
    }

    let height = rand(19, 32);
    let diameter = rand(5.5, 8.5);
    let weight = rand(190, 245);

    if (anomalous) {
        // Anomalías físicas detectables por peso/dimensiones (botella rota o no válida)
        if (Math.random() < 0.5) {
            weight = Math.random() < 0.5 ? rand(80, 175) : rand(255, 400); // rota
        } else {
            height = Math.random() < 0.5 ? rand(8, 14.5) : rand(35.5, 45); // rota
            weight = rand(120, 300);
        }
    }

    return {
        height,
        diameter,
        weight,
        meanRGB: noisy(RGB_BASE[trueColor]),
        trueColor,
        ocrText,
        hasLabel,
        brandCandidate,
    };
}
