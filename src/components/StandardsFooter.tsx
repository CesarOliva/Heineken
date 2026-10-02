import { STANDARD_RANGES } from '../types';

export default function StandardsFooter() {
    const r = STANDARD_RANGES;
    return (
        <footer className="border-t border-slate-800 bg-slate-900/80 mt-6">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <h2 className="font-semibold text-xs tracking-wide text-slate-300 mb-2">
                    RANGOS ACEPTABLES ESTÁNDAR
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="rounded bg-slate-800/70 border border-slate-700 px-3 py-2">
                        <div className="text-slate-500 text-[10px] uppercase">Altura</div>
                        <div className="text-slate-100 font-mono font-semibold">
                            {r.minHeight} – {r.maxHeight} cm
                        </div>
                    </div>
                    <div className="rounded bg-slate-800/70 border border-slate-700 px-3 py-2">
                        <div className="text-slate-500 text-[10px] uppercase">Diámetro</div>
                        <div className="text-slate-100 font-mono font-semibold">
                            {r.minDiameter} – {r.maxDiameter} cm
                        </div>
                    </div>
                    <div className="rounded bg-slate-800/70 border border-slate-700 px-3 py-2">
                        <div className="text-slate-500 text-[10px] uppercase">Peso</div>
                        <div className="text-slate-100 font-mono font-semibold">
                            {r.minWeight} – {r.maxWeight} g
                        </div>
                    </div>
                    <div className="rounded bg-slate-800/70 border border-slate-700 px-3 py-2">
                        <div className="text-slate-500 text-[10px] uppercase">Transmisión de luz</div>
                        <div className="text-slate-100 font-mono font-semibold">
                            ≥ {r.minTransmission} %
                        </div>
                    </div>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                    Simulación conceptual, no especificación industrial. La marca no determina el contenedor
                    (solo color / no-identificado / rechazo).
                </p>
            </div>
        </footer>
    );
}
