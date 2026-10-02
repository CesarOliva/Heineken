import type { BottleResult } from '../types';

export const CSV_HEADER = [
    'timestamp',
    'marca',
    'color',
    'altura',
    'diametro',
    'peso',
    'decision',
    'motivo_rechazo',
    'contenedor',
] as const;

export function toCSVRow(r: BottleResult): string {
    const decision = r.decision === 'accepted' ? 'Aceptada' : 'Rechazada';
    const color = r.color === 'ambar' ? 'Ambar' : r.color === 'verde' ? 'Verde' : 'Transparente';
    const container =
        r.container === 'no-identificado'
        ? 'No identificado'
        : r.container === 'rechazo'
            ? 'Rechazo'
            : color;

    const esc = (v: string | number) => {
        const s = String(v);
        return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    };

    return [
        r.timestamp,
        r.brand,
        color,
        r.height,
        r.diameter,
        r.weight,
        decision,
        r.rejectionReason ?? '',
        container,
    ]
    .map(esc)
    .join(',');
}

export function toCSV(results: BottleResult[]): string {
    return [CSV_HEADER.join(','), ...results.map(toCSVRow)].join('\n');
}

export function downloadCSV(results: BottleResult[]): void {
    const blob = new Blob([toCSV(results)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `botellas_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
