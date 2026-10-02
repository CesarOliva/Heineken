import type { SimParams } from '../types';

interface Props {
    params: SimParams;
    onChange: (p: SimParams) => void;
    running: boolean;
    onStart: () => void;
    onPause: () => void;
    onDownload: () => void;
    count: number;
}

export default function ControlsPanel({ params, onChange, running, onStart, onPause, onDownload, count }: Props) {
    const set = (k: keyof SimParams, v: number) => onChange({ ...params, [k]: v });
    return (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
            <h2 className="font-semibold text-sm text-slate-300 tracking-wide">CONTROLES DE SIMULACIÓN</h2>

            <div>
                <label className="text-xs text-slate-400">Velocidad: {params.speed}x (8s base)</label>

                <div className="flex gap-1 mt-1">
                    {[0.5, 1, 2, 5].map((s) => (
                        <button
                        key={s}
                        onClick={() => set('speed', s)}
                        className={`flex-1 text-xs py-1.5 rounded border ${params.speed === s ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                        >
                        {s}x
                        </button>
                    ))}
                </div>
            </div>

            <Slider label={`Pausa entre botellas (${params.gapSec} s)`} min={0} max={5} step={0.5} value={params.gapSec} onChange={(v) => set('gapSec', v)} />

            <Slider label={`Capacidad contenedor (${params.containerCapacity})`} min={5} max={50} step={1} value={params.containerCapacity} onChange={(v) => set('containerCapacity', v)} />

            {!running ? (
                <button
                    onClick={onStart}
                    className="w-full py-2.5 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-500"
                >
                    ▶ Iniciar simulación
                </button>
            ) : (
                <button
                    onClick={onPause}
                    className="w-full py-2.5 rounded-lg font-semibold bg-amber-600 hover:bg-amber-500"
                >
                    ⏸ Pausar simulación
                </button>
            )}
            <button
                onClick={onDownload}
                disabled={count === 0}
                className="w-full py-2 rounded-lg text-sm bg-slate-700 hover:bg-slate-600 disabled:opacity-40"
            >
                ⬇ Descargar CSV ({count} registros)
            </button>
        </div>
    );
}

function Slider({ label, min, max, step, value, onChange }: { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }) {
    return (
        <div>
            <label className="text-xs text-slate-400">{label}</label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full accent-emerald-500"
            />
        </div>
    );
}
