import type { BottleResult, MachineState } from '../types';
import { STAGE_ORDER } from '../types';

const STAGE_LABELS: Record<MachineState, string> = {
    IDLE: 'En espera',
    BOTTLE_DETECTED: 'Presencia',
    WEIGHING: 'Peso',
    MEASURING: 'Dimensiones',
    GLASS_ANALYSIS: 'Transmisión',
    COLOR_ANALYSIS: 'Cámara color',
    OCR_ANALYSIS: 'OCR marca',
    DECISION: 'Decisión',
    DIVERTING: 'Compuerta',
    DROP: 'Caída',
    REGISTERING: 'Registro',
};

const STATIONS = STAGE_ORDER.filter((s) => s !== 'REGISTERING');

interface Props {
    stage: MachineState;
    current: Partial<BottleResult> | null;
    busy: boolean;
}

export default function MachineView({ stage, current, busy }: Props) {
    const activeIdx = STAGE_ORDER.indexOf(stage);
    const progress = stage === 'IDLE' ? 0 : (activeIdx + 1) / STAGE_ORDER.length;

    const bottleColor =
        current?.color === 'verde'
        ? '#22c55e'
        : current?.color === 'ambar'
            ? '#f59e0b'
            : '#e2e8f0';

    return (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-sm tracking-wide text-slate-300">MÁQUINA · CORTE LATERAL · 1.2 m</h2>

                <span
                    className={`text-xs px-2 py-1 rounded-full ${
                        !busy ? 'bg-slate-800 text-slate-300' : 'bg-blue-900 text-blue-200 animate-pulse'
                    }`}
                >
                    {!busy ? 'IDLE · En espera' : `${stage} · ${STAGE_LABELS[stage] ?? stage}`}
                </span>
            </div>

            <div className="relative h-44 rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 overflow-hidden">
                <div className="absolute inset-x-2 top-2 flex justify-between gap-1">
                    {STATIONS.map((s, i) => {
                        const isActive = s === stage;
                        const isDone = activeIdx > i && stage !== 'IDLE';

                        return (
                            <div key={s} className="flex-1 text-center">
                                <div
                                    className={`text-[10px] leading-tight rounded px-1 py-1 border ${
                                        isActive
                                        ? 'bg-yellow-500/20 border-yellow-400 text-yellow-200'
                                        : isDone
                                            ? 'bg-green-500/15 border-green-500 text-green-300'
                                            : 'bg-slate-800 border-slate-700 text-slate-400'
                                    }`}
                                >
                                    {STAGE_LABELS[s]}
                                </div>

                                <div className="mx-auto mt-1 h-6 w-px bg-slate-600" />
                            </div>
                        );
                    })}
                </div>

                <div className="absolute left-2 right-2 bottom-10 h-2 rounded bg-slate-700" />
                
                <div
                    className="absolute left-2 bottom-10 h-2 rounded bg-emerald-500/70 transition-all duration-500"
                    style={{ width: `calc((100% - 16px) * ${progress})` }}
                />

                {busy && (
                    <div
                        className="absolute bottom-12 transition-all duration-500"
                        style={{ left: `calc(8px + (100% - 40px) * ${progress})` }}
                        title="Botella en proceso"
                    >
                        <div className="relative">
                            <div
                                className="w-6 h-12 rounded-t-md rounded-b-sm border-2 border-white/70"
                                style={{ backgroundColor: bottleColor }}
                            >
                                <div className="mx-auto mt-0 h-2 w-2 bg-slate-900/60 rounded-b" />

                                <div className="mx-1 mt-2 h-4 rounded-sm bg-white/50 text-[7px] text-center text-slate-900 font-bold leading-4 overflow-hidden">
                                    {current?.brand?.slice(0, 4) ?? '?'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!busy && <div className="absolute bottom-12 left-2 text-xs text-slate-500">◀ charola de entrada (eqt hacia adelante)</div>}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                <Live label="Peso" value={current?.weight != null ? `${current.weight} g` : '—'} />
                <Live label="Altura × Ø" value={current?.height != null ? `${current.height} × ${current.diameter} cm` : '—'} />
                <Live label="Transmitancia" value={current?.lightTransmission != null ? `${current.lightTransmission} %` : '—'} />
                <Live label="RGB" value={current?.meanRGB ? current.meanRGB.map(Math.round).join(', ') : '—'} />
            </div>
        </div>
    );
}

function Live({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded bg-slate-800/70 border border-slate-700 px-2 py-1.5">
            <div className="text-slate-500 text-[10px] uppercase">{label}</div>
            <div className="text-slate-100 font-mono">{value}</div>
        </div>
    );
}
