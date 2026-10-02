import type { ContainerId, Counters } from '../types';

const CONTAINERS: { id: ContainerId; label: string; color: string }[] = [
    { id: 'verde', label: 'Verde', color: 'bg-green-500' },
    { id: 'ambar', label: 'Ámbar', color: 'bg-amber-500' },
    { id: 'transparente', label: 'Transparente', color: 'bg-slate-300' },
    { id: 'no-identificado', label: 'No identificado', color: 'bg-purple-500' },
    { id: 'rechazo', label: 'Rechazo', color: 'bg-red-500' },
];

export default function ContainersView({ counters, capacity }: { counters: Counters; capacity: number }) {
    return (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <h2 className="font-semibold text-sm text-slate-300 tracking-wide mb-2">CONTENEDORES + NIVEL</h2>

            <div className="grid grid-cols-5 gap-2">
                {CONTAINERS.map((c) => {
                    const n = counters.byContainer[c.id];
                    const fill = Math.min(100, (n / capacity) * 100);
                    const full = n >= capacity;

                    return (
                        <div key={c.id} className={`rounded border p-1.5 text-center ${full ? 'border-yellow-400 bg-yellow-500/10' : 'border-slate-700 bg-slate-800/50'}`}>
                            <div className="text-[11px] font-semibold truncate">{c.label}</div>
                            <div className="text-lg font-bold">{n}</div>
                            <div className="h-14 rounded bg-slate-900 border border-slate-700 relative overflow-hidden mt-1">
                                <div className={`absolute bottom-0 inset-x-0 ${c.color} opacity-80 transition-all`} style={{ height: `${fill}%` }} />
                            </div>
                            <div className="text-[10px] mt-1 text-slate-400">{full ? '⚠ LLENO' : `${Math.round(fill)}%`}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
