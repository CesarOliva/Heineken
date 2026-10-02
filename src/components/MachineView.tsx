import type { BottleResult, ContainerId, MachineState } from '../types';

const STAGE_LABELS: Record<MachineState, string> = {
    IDLE: 'En espera',
    BOTTLE_DETECTED: 'Presencia',
    WEIGHING: 'Peso',
    MEASURING: 'Dimensiones',
    COLOR_ANALYSIS: 'Cámara color',
    OCR_ANALYSIS: 'OCR marca',
    DECISION: 'Decisión',
    DIVERTING: 'Compuerta',
    DROP: 'Caída',
    REGISTERING: 'Registro',
};

// Orden de los módulos físicos para estado pendiente/activo/completado
const MODULE_ORDER = [
    'tray',
    'presence',
    'scale',
    'measure',
    'color',
    'ocr',
    'decision',
    'gates',
    'bins',
] as const;

type ModuleId = (typeof MODULE_ORDER)[number];

const STAGE_MODULE: Record<MachineState, ModuleId | null> = {
    IDLE: null,
    BOTTLE_DETECTED: 'presence',
    WEIGHING: 'scale',
    MEASURING: 'measure',
    COLOR_ANALYSIS: 'color',
    OCR_ANALYSIS: 'ocr',
    DECISION: 'decision',
    DIVERTING: 'gates',
    DROP: 'gates',
    REGISTERING: 'bins',
};

const BELT_Y = 300;
const BOTTLE_Y = BELT_Y - 11;
const DROP_Y = 392;

const BIN_X = [688, 740, 792, 844, 896];
const BIN_W = 46;
const BIN_Y = 352;
const BIN_H = 96;
const BIN_CENTER = BIN_X.map((x) => x + BIN_W / 2);

const BOTTLE_X: Record<MachineState, number> = {
    IDLE: 75,
    BOTTLE_DETECTED: 180,
    WEIGHING: 285,
    MEASURING: 390,
    COLOR_ANALYSIS: 495,
    OCR_ANALYSIS: 585,
    DECISION: 660,
    DIVERTING: 700,
    DROP: 700,
    REGISTERING: 700,
};

const CONTAINERS: { id: ContainerId; short: string; label: string; color: string }[] = [
    { id: 'verde', short: 'V', label: 'Verde', color: '#22c55e' },
    { id: 'ambar', short: 'A', label: 'Ámbar', color: '#f59e0b' },
    { id: 'transparente', short: 'T', label: 'Transparente', color: '#e2e8f0' },
    { id: 'no-identificado', short: 'N', label: 'No identif.', color: '#a855f7' },
    { id: 'rechazo', short: 'R', label: 'Rechazo', color: '#ef4444' },
];

const AFTER_DECISION: MachineState[] = ['DIVERTING', 'DROP', 'REGISTERING'];

interface Props {
    stage: MachineState;
    current: Partial<BottleResult> | null;
    busy: boolean;
    counts?: Record<ContainerId, number>;
    capacity?: number;
}

export default function MachineView({ stage, current, busy, counts, capacity = 20 }: Props) {
    const activeModule = busy ? STAGE_MODULE[stage] : null;
    const activeIdx = activeModule ? MODULE_ORDER.indexOf(activeModule) : -1;
    const decided = busy && AFTER_DECISION.includes(stage);
    const target = (decided ? current?.container : undefined) as ContainerId | undefined;

    const stateOf = (m: ModuleId): 'active' | 'done' | 'idle' => {
        if (!busy || activeIdx < 0) return 'idle';
        const i = MODULE_ORDER.indexOf(m);
        if (i === activeIdx || (m === 'bins' && stage === 'REGISTERING')) return 'active';
        return i < activeIdx ? 'done' : 'idle';
    };

    const bottleColor =
        current?.color === 'verde' ? '#22c55e' : current?.color === 'ambar' ? '#f59e0b' : '#e2e8f0';

    // Posición de la botella: avanza por estaciones y cae al contenedor destino
    let bx = BOTTLE_X[stage] ?? 75;
    let by = BOTTLE_Y;
    let bOpacity = 1;
    if (busy && target) {
        const ti = CONTAINERS.findIndex((c) => c.id === target);
        if (stage === 'DROP' || stage === 'REGISTERING') {
            bx = BIN_CENTER[ti];
            by = DROP_Y;
        }
    }
    if (stage === 'REGISTERING') bOpacity = 0.85;

    const accepted = current?.decision === 'accepted';
    // Torreta: azul procesando, verde/rojo solo a partir de la decisión
    const lamp = (on: boolean, color: string) => (on ? color : '#1e293b');

    const rgb = current?.meanRGB ? current.meanRGB.map((v) => Math.max(0, Math.min(255, Math.round(v)))) : null;

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

            <svg viewBox="0 0 960 492" className="w-full rounded-lg border border-slate-700" role="img" aria-label="Máquina clasificadora en corte lateral">
                <style>
                    {`@keyframes scanY {0%{transform:translateY(0)}50%{transform:translateY(36px)}100%{transform:translateY(0)}}
                    .scanline{animation:scanY 1.1s ease-in-out infinite}
                    @keyframes beamFlicker {0%,100%{opacity:1}50%{opacity:.2}}
                    .beam-on{animation:beamFlicker .45s linear infinite}`}
                </style>

                <defs>
                    <linearGradient id="cab" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#1e293b" />
                        <stop offset="1" stopColor="#0f172a" />
                    </linearGradient>
                    <linearGradient id="belt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#334155" />
                        <stop offset="1" stopColor="#1e293b" />
                    </linearGradient>
                </defs>

                {/* ===== Gabinete ===== */}
                <rect x="8" y="8" width="944" height="332" rx="14" fill="url(#cab)" stroke="#475569" strokeWidth="2" />
                {/* remaches */}
                {[24, 936].map((x) =>
                    [24, 324].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#475569" />),
                )}
                {/* placa */}
                <rect x="24" y="20" width="330" height="26" rx="4" fill="#0f172a" stroke="#475569" />
                <text x="34" y="37" fontSize="13" fontWeight="bold" fill="#e2e8f0" fontFamily="monospace">
                    CLASIFICADORA HB-1200 · VIDRIO
                </text>

                {/* ===== Torreta de estado ===== */}
                <g>
                    <rect x="872" y="20" width="66" height="26" rx="4" fill="#0f172a" stroke="#475569" />
                    <text x="905" y="31" fontSize="8" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">TORRETA</text>
                    <circle cx="884" cy="38" r="6" fill={lamp(busy && decided && !accepted, '#ef4444')} stroke="#475569" />
                    <circle cx="899" cy="38" r="6" fill={lamp(!busy, '#eab308')} stroke="#475569" />
                    <circle cx="914" cy="38" r="6" fill={lamp(busy && decided && accepted, '#22c55e')} stroke="#475569" />
                    <circle cx="929" cy="38" r="6" fill={lamp(busy && !decided, '#3b82f6')} stroke="#475569" className={busy && !decided ? 'beam-on' : undefined} />
                </g>

                {/* ===== Cinta de diagrama con guías a cada módulo ===== */}
                <StripLabels getState={stateOf} />

                {/* ===== Banda transportadora ===== */}
                <rect x="30" y={BELT_Y} width="660" height="10" rx="2" fill="url(#belt)" stroke="#475569" />
                {Array.from({ length: 22 }, (_, i) => 44 + i * 30).map((x) => (
                    <g key={x}>
                        <circle cx={x} cy={BELT_Y + 16} r="5" fill="#0f172a" stroke="#64748b" />
                        <circle cx={x} cy={BELT_Y + 16} r="1.5" fill="#64748b" />
                    </g>
                ))}

                {/* ===== 1. Charola de entrada ===== */}
                <g opacity={busy ? 1 : 0.55}>
                    <polygon points="30,300 120,282 120,292 30,310" fill="#334155" stroke="#64748b" />
                    {[48, 70, 92].map((x) => (
                        <circle key={x} cx={x} cy={296 - (x - 30) * 0.2} r="5" fill="#0f172a" stroke="#64748b" />
                    ))}
                </g>

                {/* ===== 2. Sensor de presencia ===== */}
                <PresenceModule state={stateOf('presence')} current={current} />

                {/* ===== 3. Celda de carga ===== */}
                <ScaleModule state={stateOf('scale')} weight={current?.weight} />

                {/* ===== 4. Barrera de luz (dimensiones) ===== */}
                <MeasureModule
                    state={stateOf('measure')}
                    height={current?.height}
                    diameter={current?.diameter}
                />

                {/* ===== 5. Color RGB (cámara) ===== */}
                <ColorModule state={stateOf('color')} rgb={rgb} swatch={bottleColor} colorName={current?.color} />

                {/* ===== 6. OCR ===== */}
                <OcrModule state={stateOf('ocr')} ocrText={current?.ocrText} brand={current?.brand} />

                {/* ===== 7. Decisión + compuertas ===== */}
                <DecisionModule state={stateOf('decision')} decided={decided} target={target} accepted={accepted} />

                {/* ===== Compuertas / chutes ===== */}
                <g>
                    <circle cx="700" cy="322" r="7" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
                    {CONTAINERS.map((c, i) => {
                        const isTarget = decided && target === c.id;
                        return (
                            <line
                                key={c.id}
                                x1="700"
                                y1="328"
                                x2={BIN_CENTER[i]}
                                y2={BIN_Y}
                                stroke={isTarget ? '#facc15' : '#475569'}
                                strokeWidth={isTarget ? 3 : 1.5}
                                strokeDasharray={isTarget ? undefined : '5 4'}
                            />
                        );
                    })}
                    {CONTAINERS.map((c, i) => {
                        const isTarget = stateOf('gates') === 'active' && decided && target === c.id;
                        return (
                            <g key={c.id} transform={`translate(700 322) rotate(${isTarget ? -32 + i * 3 : -8 + i * 4})`}>
                                <rect x="0" y="-2" width="26" height="4" rx="2" fill={isTarget ? '#facc15' : '#64748b'} />
                            </g>
                        );
                    })}
                </g>

                {/* ===== 9. Contenedores + sensores de nivel ===== */}
                {CONTAINERS.map((c, i) => {
                    const n = counts?.[c.id] ?? 0;
                    const fill = Math.min(1, n / capacity);
                    const full = n >= capacity;
                    const isTarget = stateOf('bins') === 'active' && decided && target === c.id;
                    return (
                        <g key={c.id}>
                            <rect
                                x={BIN_X[i]}
                                y={BIN_Y}
                                width={BIN_W}
                                height={BIN_H}
                                rx="4"
                                fill="#0f172a"
                                stroke={isTarget ? '#facc15' : '#475569'}
                                strokeWidth={isTarget ? 2.5 : 1.5}
                            />
                            <rect
                                x={BIN_X[i] + 4}
                                y={BIN_Y + 4 + (BIN_H - 8) * (1 - fill)}
                                width={BIN_W - 8}
                                height={(BIN_H - 8) * fill}
                                rx="2"
                                fill={c.color}
                                opacity="0.85"
                            />
                            {/* sensor de nivel */}
                            <circle
                                cx={BIN_X[i] + BIN_W - 8}
                                cy={BIN_Y + 8}
                                r="4"
                                fill={full ? '#eab308' : '#22c55e'}
                                className={full ? 'beam-on' : undefined}
                            />
                            <text x={BIN_CENTER[i]} y={BIN_Y + BIN_H + 17} fontSize="10" textAnchor="middle" fontFamily="monospace">
                                <tspan fill={c.color} fontWeight="bold">{c.short}</tspan>
                                <tspan fill="#94a3b8"> · {n}/{capacity}</tspan>
                            </text>
                        </g>
                    );
                })}
                <text x="815" y={BIN_Y - 8} fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">
                    9 · CONTENEDORES + NIVEL (V/A/T/N/R)
                </text>

                {/* ===== Botella (cuello hacia adelante →) ===== */}
                {busy && (
                    <g
                        style={{
                            transform: `translate(${bx}px, ${by}px)`,
                            transition: 'transform 0.6s ease-in-out, opacity 0.4s',
                            opacity: bOpacity,
                        }}
                    >
                        <rect x="-23" y="-9" width="30" height="18" rx="3" fill={bottleColor} opacity="0.9" stroke="#f8fafc" strokeWidth="1" />
                        <polygon points="7,-9 15,-4 15,4 7,9" fill={bottleColor} opacity="0.9" stroke="#f8fafc" strokeWidth="1" />
                        <rect x="15" y="-4" width="8" height="8" fill={bottleColor} opacity="0.9" stroke="#f8fafc" strokeWidth="1" />
                        <rect x="23" y="-5" width="4" height="10" rx="1" fill="#94a3b8" />
                        <rect x="-18" y="-5" width="18" height="10" rx="1" fill="#f8fafc" opacity="0.85" />
                        <text x="-9" y="3" fontSize="7" fontWeight="bold" fill="#0f172a" textAnchor="middle" fontFamily="monospace">
                            {(current?.brand ?? '?').slice(0, 4)}
                        </text>
                        <line x1="-21" y1="-6" x2="-21" y2="6" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
                    </g>
                )}

                {/* piso */}
                <line x1="8" y1="452" x2="952" y2="452" stroke="#334155" strokeWidth="3" />
            </svg>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-xs">
                <Live label="Peso" value={current?.weight != null ? `${current.weight} g` : '—'} />
                <Live label="Altura × Ø" value={current?.height != null ? `${current.height} × ${current.diameter} cm` : '—'} />
                <Live label="RGB" value={rgb ? rgb.join(', ') : '—'} />
            </div>
        </div>
    );
}

type ModState = 'active' | 'done' | 'idle';

function modColors(state: ModState): { box: string; glow: boolean } {
    if (state === 'active') return { box: '#facc15', glow: true };
    if (state === 'done') return { box: '#22c55e', glow: false };
    return { box: '#475569', glow: false };
}

const STRIP: { id: ModuleId; n: string; title: string; bx: number; linkY: number }[] = [
    { id: 'tray', n: '1', title: 'CHAROLA', bx: 40, linkY: 270 },
    { id: 'presence', n: '2', title: 'PRESENCIA', bx: 177, linkY: 248 },
    { id: 'scale', n: '3', title: 'PESO', bx: 255, linkY: 226 },
    { id: 'measure', n: '4', title: 'DIMENSIONES', bx: 375, linkY: 232 },
    { id: 'color', n: '5', title: 'RGB', bx: 495, linkY: 222 },
    { id: 'ocr', n: '6', title: 'OCR', bx: 586, linkY: 258 },
    { id: 'decision', n: '7', title: 'DECISIÓN', bx: 660, linkY: 258 },
];

/* Cinta superior de diagrama: insignia + título por módulo con guía punteada */
function StripLabels({ getState }: { getState: (m: ModuleId) => ModState }) {
    return (
        <g>
            {STRIP.map((s) => {
                const st = getState(s.id);
                const c = modColors(st);
                return (
                    <g key={s.id}>
                        <line x1={s.bx} y1="80" x2={s.bx} y2={s.linkY} stroke="#475569" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
                        <circle cx={s.bx} cy={70} r="8" fill="#0f172a" stroke={c.box} strokeWidth={st === 'active' ? 2.5 : 1.5} />
                        <text x={s.bx} y={73.5} fontSize="9" fontWeight="bold" fill={c.box} textAnchor="middle" fontFamily="monospace">
                            {st === 'done' ? '✓' : s.n}
                        </text>
                        <text x={s.bx + 12} y={73.5} fontSize="8.5" fontWeight="bold" fill={st === 'idle' ? '#64748b' : '#e2e8f0'} fontFamily="monospace">
                            {s.title}
                        </text>
                        <circle cx={s.bx} cy={s.linkY} r="2" fill={c.box} />
                    </g>
                );
            })}
        </g>
    );
}

/* ---- 2. Sensor de presencia: arco fotoeléctrico con haz ---- */
function PresenceModule({ state, current }: { state: ModState; current: Partial<BottleResult> | null }) {
    const c = modColors(state);
    const beamOn = state === 'active';
    return (
        <g>
            <line x1="170" y1="258" x2="170" y2={BELT_Y} stroke="#64748b" strokeWidth="4" />
            <line x1="190" y1="258" x2="190" y2={BELT_Y} stroke="#64748b" strokeWidth="4" />
            <rect x="163" y="248" width="34" height="12" rx="2" fill="#0f172a" stroke={c.box} strokeWidth={state === 'active' ? 2 : 1} />
            <line
                x1="180"
                y1="260"
                x2="180"
                y2={BELT_Y}
                stroke={beamOn ? '#ef4444' : '#7f1d1d'}
                strokeWidth="2"
                strokeDasharray={beamOn ? undefined : '3 3'}
                className={beamOn ? 'beam-on' : undefined}
            />
            {state !== 'idle' && (
                <text x="180" y="330" fontSize="8.5" fill={state === 'active' ? '#fca5a5' : '#4ade80'} textAnchor="middle" fontFamily="monospace">
                    {state === 'active' ? '◉ HAZ INTERRUMPIDO' : '✓ botella detectada'}
                </text>
            )}
            {current && state !== 'idle' && <circle cx="198" cy="254" r="3" fill="#22c55e" />}
        </g>
    );
}

/* ---- 3. Celda de carga: plataforma + resorte + display ---- */
function ScaleModule({ state, weight }: { state: ModState; weight?: number }) {
    const c = modColors(state);
    const compress = state === 'active' ? 3 : 0;
    return (
        <g>
            <rect x="253" y="226" width="64" height="20" rx="3" fill="#0f172a" stroke={c.box} strokeWidth={state === 'active' ? 2 : 1} />
            <text x="285" y="240" fontSize="10" fill={state === 'active' ? '#facc15' : '#94a3b8'} textAnchor="middle" fontFamily="monospace">
                {weight != null ? `${weight} g` : '––– g'}
            </text>
            <rect x="260" y={BELT_Y - 6 + compress} width="50" height="7" rx="1" fill="#64748b" stroke={c.box} />
            <polygon points={`267,${BELT_Y + 1 + compress} 303,${BELT_Y + 1 + compress} 295,${BELT_Y + 22} 275,${BELT_Y + 22}`} fill="#334155" stroke="#64748b" />
            <polyline
                points={`273,${BELT_Y + 4 + compress} 279,${BELT_Y + 9 + compress} 273,${BELT_Y + 14 + compress} 279,${BELT_Y + 19 + compress}`}
                fill="none"
                stroke={state === 'active' ? '#facc15' : '#475569'}
                strokeWidth="1.5"
            />
        </g>
    );
}

/* ---- 4. Barrera de luz: pórtico con haces de medición ---- */
function MeasureModule({ state, height, diameter }: { state: ModState; height?: number; diameter?: number }) {
    const c = modColors(state);
    const beams = [252, 264, 276, 288, 296];
    return (
        <g>
            <line x1="373" y1="240" x2="373" y2={BELT_Y} stroke="#64748b" strokeWidth="4" />
            <line x1="407" y1="240" x2="407" y2={BELT_Y} stroke="#64748b" strokeWidth="4" />
            <rect x="367" y="232" width="46" height="10" rx="2" fill="#0f172a" stroke={c.box} strokeWidth={state === 'active' ? 2 : 1} />
            {beams.map((y) => (
                <line
                    key={y}
                    x1="373"
                    y1={y}
                    x2="407"
                    y2={y}
                    stroke={state === 'active' ? '#ef4444' : '#7f1d1d'}
                    strokeWidth="1"
                    strokeDasharray="4 2"
                    opacity={state === 'idle' ? 0.35 : 1}
                />
            ))}
            <rect x="361" y="316" width="58" height="18" rx="2" fill="#0f172a" stroke={c.box} />
            <text x="390" y="329" fontSize="8.5" fill="#e2e8f0" textAnchor="middle" fontFamily="monospace">
                {height != null ? `${height}×${diameter}cm` : '–––'}
            </text>
        </g>
    );
}

/* ---- 5. Color: cámara cenital + cono + barras RGB ---- */
function ColorModule({
    state,
    rgb,
    swatch,
    colorName,
}: {
    state: ModState;
    rgb: number[] | null;
    swatch: string;
    colorName?: string;
}) {
    const c = modColors(state);
    const bars = rgb ?? [0, 0, 0];
    const barColors = ['#ef4444', '#22c55e', '#3b82f6'];
    return (
        <g>
            <rect x="479" y="222" width="32" height="24" rx="3" fill="#0f172a" stroke={c.box} strokeWidth={state === 'active' ? 2 : 1} />
            <circle cx="495" cy="234" r="6" fill="#0f172a" stroke={state === 'active' ? '#38bdf8' : '#475569'} strokeWidth="2" />
            <circle cx="495" cy="234" r="2.5" fill={state === 'active' ? '#38bdf8' : '#1e293b'} />
            <polygon
                points="487,246 503,246 515,298 475,298"
                fill={state === 'active' ? '#38bdf8' : '#0f172a'}
                opacity={state === 'active' ? 0.18 : 0.4}
                stroke={state === 'active' ? '#38bdf8' : '#475569'}
                strokeDasharray="4 3"
            />
            {bars.map((v, i) => (
                <g key={i}>
                    <rect x={477 + i * 12} y="316" width="8" height="18" rx="1" fill="#0f172a" stroke="#475569" />
                    <rect
                        x={477 + i * 12}
                        y={316 + 18 - (18 * v) / 255}
                        width="8"
                        height={(18 * v) / 255}
                        rx="1"
                        fill={barColors[i]}
                    />
                </g>
            ))}
            <rect x="515" y="316" width="18" height="18" rx="2" fill={rgb ? swatch : '#0f172a'} stroke="#64748b" />
            <text x="504" y="348" fontSize="8.5" fill="#e2e8f0" textAnchor="middle" fontFamily="monospace">
                {colorName ? colorName.toUpperCase() : '–––'}
            </text>
        </g>
    );
}

/* ---- 6. OCR: marco escáner con línea láser ---- */
function OcrModule({ state, ocrText, brand }: { state: ModState; ocrText?: string; brand?: string }) {
    const c = modColors(state);
    const short = (ocrText ?? '').slice(0, 14);
    return (
        <g>
            <rect
                x="573"
                y="258"
                width="26"
                height="44"
                rx="2"
                fill="none"
                stroke={c.box}
                strokeWidth={state === 'active' ? 2 : 1.5}
                strokeDasharray="5 3"
            />
            {[[573, 258], [599, 258], [573, 302], [599, 302]].map(([x, y], i) => (
                <g key={i}>
                    <line x1={x} y1={y} x2={x + (x < 586 ? 8 : -8)} y2={y} stroke={c.box} strokeWidth="2.5" />
                    <line x1={x} y1={y} x2={x} y2={y + (y < 280 ? 8 : -8)} stroke={c.box} strokeWidth="2.5" />
                </g>
            ))}
            {state === 'active' && (
                <line x1="574" y1="260" x2="598" y2="260" stroke="#4ade80" strokeWidth="2" className="scanline" />
            )}
            <rect x="536" y="316" width="106" height="18" rx="2" fill="#0f172a" stroke={c.box} />
            <text x="589" y="329" fontSize="8.5" fill="#e2e8f0" textAnchor="middle" fontFamily="monospace">
                {short ? `“${short}”` : '–––'}
            </text>
            {brand && state !== 'idle' && (
                <text x="589" y="348" fontSize="8.5" fill="#4ade80" textAnchor="middle" fontFamily="monospace">
                    → {brand}
                </text>
            )}
        </g>
    );
}

/* ---- 7. Decisión: tablero de control ---- */
function DecisionModule({
    state,
    decided,
    target,
    accepted,
}: {
    state: ModState;
    decided: boolean;
    target?: ContainerId;
    accepted?: boolean;
}) {
    const c = modColors(state);
    const label = !decided ? '···' : target === 'rechazo' ? '→ R' : target === 'no-identificado' ? '→ N' : `→ ${target?.[0].toUpperCase()}`;
    return (
        <g>
            <rect x="640" y="258" width="42" height="52" rx="4" fill="#0f172a" stroke={c.box} strokeWidth={state === 'active' ? 2.5 : 1.5} />
            <rect x="645" y="264" width="32" height="20" rx="2" fill="#020617" stroke="#475569" />
            <text x="661" y="278" fontSize="11" fontWeight="bold" fill={!decided ? '#475569' : accepted ? '#4ade80' : '#f87171'} textAnchor="middle" fontFamily="monospace">
                {label}
            </text>
            <circle cx="652" cy="295" r="3.5" fill={state === 'active' ? '#facc15' : '#1e293b'} stroke="#475569" className={state === 'active' ? 'beam-on' : undefined} />
            <circle cx="670" cy="295" r="3.5" fill={decided ? (accepted ? '#22c55e' : '#ef4444') : '#1e293b'} stroke="#475569" />
        </g>
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
