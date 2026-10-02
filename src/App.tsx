import { useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_PARAMS, STANDARD_RANGES, emptyCounters, type BottleResult, type MachineState, type SimParams } from './types';
import { randomBottleSeed } from './simulation/randomBottle';
import { runBottle } from './simulation/engine';
import { downloadCSV } from './simulation/csv';
import MachineView from './components/MachineView';
import ControlsPanel from './components/ControlsPanel';
import CountersPanel from './components/CountersPanel';
import ResultDisplay from './components/ResultDisplay';
import ContainersView from './components/ContainersView';
import EventLog from './components/EventLog';
import StandardsFooter from './components/StandardsFooter';

export default function App() {
	const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
	const [results, setResults] = useState<BottleResult[]>([]);
	const [stage, setStage] = useState<MachineState>('IDLE');
	const [current, setCurrent] = useState<Partial<BottleResult> | null>(null);
	const [busy, setBusy] = useState(false);
	const [running, setRunning] = useState(false);
	const cancelRef = useRef<(() => void) | null>(null);
	const gapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const runningRef = useRef(false);
	const paramsRef = useRef(params);
	paramsRef.current = params;

	const counters = useMemo(() => {
		const c = emptyCounters();

		for (const r of results) {
			c.received += 1;

			if (r.decision === 'accepted') c.accepted += 1;
			else c.rejected += 1;

			c.byColor[r.color] += 1;
			c.byBrand[r.brand] = (c.byBrand[r.brand] ?? 0) + 1;
			c.byContainer[r.container] += 1;
		}
		return c;
	}, [results]);

	const last = results.length > 0 ? results[results.length - 1] : null;

	const runNext = () => {
		if (!runningRef.current) return;

		const seed = randomBottleSeed();
		setBusy(true);

		const snapshot = { ...paramsRef.current };
		cancelRef.current?.();
		cancelRef.current = runBottle(seed, STANDARD_RANGES, snapshot.speed, {
			onStage: (s, partial) => {
				setStage(s);
				setCurrent(partial);
			},
			onDone: (result) => {
				setResults((prev) => [...prev, result]);
				setBusy(false);
				setStage('IDLE');
				setCurrent(null);

				if (!runningRef.current) return;
				// Pausa configurable entre botella y botella (escalada por velocidad).
				const gapMs = (paramsRef.current.gapSec * 1000) / paramsRef.current.speed;
				gapTimerRef.current = setTimeout(() => {
					if (runningRef.current) runNext();
				}, gapMs);
			},
		});
	};

	const start = () => {
		if (runningRef.current) return;
		runningRef.current = true;
		setRunning(true);
		runNext();
	};

	const pause = () => {
		runningRef.current = false;
		setRunning(false);
		cancelRef.current?.();
		if (gapTimerRef.current) clearTimeout(gapTimerRef.current);
		setBusy(false);
		setStage('IDLE');
	};

	// Limpieza al desmontar.
	useEffect(() => {
		return () => {
			runningRef.current = false;
			cancelRef.current?.();
			if (gapTimerRef.current) clearTimeout(gapTimerRef.current);
		};
	}, []);

	return (
		<div className="min-h-screen">
			<header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
					<div>
						<h1 className="font-bold text-lg">🟢 Clasificadora de Botellas de Vidrio <span className="text-slate-400 font-normal">· HEINEKEN · MVP</span></h1>
						<p className="text-xs text-slate-400">Medición física + visión RGB + OCR simulado · Separación por color · Trazabilidad en CSV</p>
					</div>
					<div className="text-xs text-slate-400">
						<span className={running ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
							{running ? '● Simulación en marcha (auto)' : '○ Simulación detenida'}
						</span>
						{' '}· Ciclo base 8s · Velocidad {params.speed}x
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="lg:col-span-2 space-y-4">
					<MachineView stage={stage} current={current} busy={busy} counts={counters.byContainer} capacity={params.containerCapacity} />
					<ContainersView counters={counters} capacity={params.containerCapacity} />
					<EventLog results={results} />
				</div>

				<div className="space-y-4">
					<ResultDisplay last={last} busy={busy} />
					<ControlsPanel
						params={params}
						onChange={setParams}
						running={running}
						onStart={start}
						onPause={pause}
						onDownload={() => downloadCSV(results)}
						count={results.length}
					/>
					<CountersPanel counters={counters} />
				</div>
			</main>

			<StandardsFooter />
		</div>
	);
}
