import type { BottleResult } from '../types';

interface Props {
	last: BottleResult | null;
	busy: boolean;
}

export default function ResultDisplay({ last, busy }: Props) {
	// Mientras hay una botella en proceso solo se muestra "procesando".
	// El resultado aparece únicamente al terminar (busy === false).
	if (busy) {
		return (
			<div className="rounded-xl border p-4 bg-blue-900/40 text-blue-100 border-blue-500 animate-pulse">
				<div className="flex items-center justify-between">
					<h2 className="font-bold text-sm tracking-wide">PANTALLA · RESULTADO</h2>
					<span className="text-2xl">🔄</span>
				</div>
				<p className="mt-1 text-lg font-semibold">Procesando…</p>
				<div className="mt-1 text-sm opacity-80">Analizando botella en la máquina…</div>
			</div>
		);
	}

	const accepted = last?.decision === 'accepted';
	const color = !last
		? 'bg-slate-800 text-slate-300 border-slate-700'
		: accepted
			? 'bg-green-600 text-white border-green-400'
			: 'bg-red-600 text-white border-red-400';

	return (
		<div className={`rounded-xl border p-4 ${color}`}>
			<div className="flex items-center justify-between">
				<h2 className="font-bold text-sm tracking-wide">PANTALLA · RESULTADO</h2>
				<span className="text-2xl">{!last ? '💤' : accepted ? '🟢' : '🔴'}</span>
			</div>

			<p className="mt-1 text-lg font-semibold">
				{!last ? 'Sin botellas aún' : accepted ? 'Botella ACEPTADA' : 'Botella RECHAZADA'}
			</p>

			{last && (
				<div className="mt-1 text-sm opacity-90">
					{last.brand} · {last.color} → contenedor <b>{containerLabel(last.container)}</b>
					{last.rejectionReason && <span> · Motivo: {last.rejectionReason}</span>}
				</div>
			)}
		</div>
	);
}

function containerLabel(c: BottleResult['container']): string {
	if (c === 'no-identificado') return 'No identificado';
	if (c === 'rechazo') return 'Rechazo';
	return c[0].toUpperCase() + c.slice(1);
}
