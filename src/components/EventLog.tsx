import type { BottleResult } from '../types';

export default function EventLog({ results }: { results: BottleResult[] }) {
	const last = [...results].slice(-8).reverse();
	return (
		<div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
			<h2 className="font-semibold text-sm text-slate-300 tracking-wide mb-2">ÚLTIMAS BOTELLAS</h2>

			{last.length === 0 && <p className="text-xs text-slate-500">Aún no hay registros.</p>}

			<div className="space-y-1 text-xs max-h-56 overflow-auto">
				{last.map((r, i) => (
					<div key={`${r.timestamp}-${i}`} className="flex items-center gap-2 bg-slate-800/60 rounded px-2 py-1">
						<span>{r.decision === 'accepted' ? '🟢' : '🔴'}</span>
						<span className="truncate flex-1">
							{r.brand} · {r.color} · {r.weight}g · {r.lightTransmission}% → <b>{r.container}</b>
						</span>
						<span className="text-slate-500 font-mono">{r.timestamp.slice(11, 19)}</span>
					</div>
				))}
			</div>
		</div>
	);
}