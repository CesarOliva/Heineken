import type { Counters } from '../types';

export default function CountersPanel({ counters }: { counters: Counters }) {
    return (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
            <h2 className="font-semibold text-sm text-slate-300 tracking-wide">CONTEOS EN TIEMPO REAL</h2>
            
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded bg-green-900/40 border border-green-700 p-2">
                    <div className="text-2xl font-bold text-green-300">{counters.byColor.verde}</div>
                    <div className="text-xs text-green-400">Verde</div>
                </div>

                <div className="rounded bg-amber-900/40 border border-amber-700 p-2">
                    <div className="text-2xl font-bold text-amber-300">{counters.byColor.ambar}</div>
                    <div className="text-xs text-amber-400">Ámbar</div>
                </div>

                <div className="rounded bg-slate-700/40 border border-slate-500 p-2">
                    <div className="text-2xl font-bold text-slate-200">{counters.byColor.transparente}</div>
                    <div className="text-xs text-slate-300">Transparente</div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded bg-slate-800 p-2">Recibidas<div className="text-lg font-bold">{counters.received}</div></div>
                <div className="rounded bg-slate-800 p-2">Aceptadas<div className="text-lg font-bold text-green-300">{counters.accepted}</div></div>
                <div className="rounded bg-slate-800 p-2">Rechazadas<div className="text-lg font-bold text-red-300">{counters.rejected}</div></div>
            </div>

            <div className="text-xs">
                <div className="text-slate-400 uppercase text-[10px] mb-1">Por marca</div>

                <div className="max-h-32 overflow-auto space-y-0.5">
                    {Object.entries(counters.byBrand).sort((a, b) => b[1] - a[1]).map(([brand, n]) => (
                        <div key={brand} className="flex justify-between bg-slate-800/60 rounded px-2 py-0.5">
                        <span className="truncate">{brand}</span>
                        <b>{n}</b>
                        </div>
                    ))}

                    {Object.keys(counters.byBrand).length === 0 && <span className="text-slate-500">Sin datos</span>}
                </div>
            </div>
        </div>
    );
}
