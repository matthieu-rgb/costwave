// Direction B — Mission Control
// Data-dense cockpit/observatoire, phosphor-cyan accent, monospace-forward,
// tight grids, Bloomberg-terminal-modernised. IBM Plex Mono + Inter.

const MCColors = {
  bg:        '#07090B',
  bgRaised:  '#0B0E11',
  panel:     '#0D1115',
  border:    '#1A2128',
  borderSoft:'#11161B',
  grid:      '#0F1418',
  text:      '#D8E1E8',
  textDim:   '#7B8893',
  textMute:  '#4C5963',
  accent:    '#5EE6D0',  // phosphor cyan
  accentDim: '#2C7A6E',
  amber:     '#E8B86B',
  red:       '#F26B6B',
  green:     '#5EE6A0',
};

const mcMono = `'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace`;
const mcSans = `'Inter', -apple-system, sans-serif`;

const MCIcon = ({ d, size = 14, c = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const MI = {
  radar:   <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 2v20M2 12h20"/></>,
  bolt:    <><path d="M13 2L3 14h8l-1 8 10-12h-8z"/></>,
  layers:  <><path d="M12 2l9 5-9 5-9-5z"/><path d="M3 12l9 5 9-5"/></>,
  flow:    <><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h6a4 4 0 0 1 4 4v6"/></>,
  alert:   <><path d="M12 9v4M12 17h.01M10.3 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0z"/></>,
  term:    <><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></>,
  power:   <><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></>,
  search:  <><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></>,
  arrUp:   <><path d="M12 19V5M5 12l7-7 7 7"/></>,
  arrDn:   <><path d="M12 5v14M19 12l-7 7-7-7"/></>,
  dot:     <><circle cx="12" cy="12" r="3" fill="currentColor"/></>,
  bell:    <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
  filter:  <><polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5 22 3"/></>,
  pause:   <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>,
};

// Multi-line area chart
function MCStackedChart() {
  const days = 30;
  const series = React.useMemo(() => {
    const make = (base, vol) => Array.from({ length: days }, (_, i) =>
      Math.max(0, base + Math.sin(i * 0.4) * vol + (Math.random() - 0.5) * vol * 1.4 + i * 0.15)
    );
    return {
      anthropic: make(8, 3),
      openai:    make(5, 2),
      groq:      make(2, 1),
      mistral:   make(1.2, 0.6),
    };
  }, []);
  const W = 760, H = 220, pad = { l: 36, r: 12, t: 14, b: 26 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  const stacked = [];
  for (let i = 0; i < days; i++) {
    let acc = 0;
    const layer = {};
    ['mistral', 'groq', 'openai', 'anthropic'].forEach((k) => {
      layer[k] = { from: acc, to: acc + series[k][i] };
      acc = layer[k].to;
    });
    layer.total = acc;
    stacked.push(layer);
  }
  const max = Math.max(...stacked.map((s) => s.total)) * 1.05;
  const x = (i) => pad.l + (i / (days - 1)) * innerW;
  const y = (v) => pad.t + innerH - (v / max) * innerH;

  const layerPath = (k) => {
    const top = stacked.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(s[k].to).toFixed(1)}`).join(' ');
    const bot = stacked.map((s, i) => `L${x(days - 1 - i).toFixed(1)} ${y(stacked[days - 1 - i][k].from).toFixed(1)}`).join(' ');
    return top + bot + 'Z';
  };
  const linePath = (k) => stacked.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(s[k].to).toFixed(1)}`).join(' ');

  const layers = [
    { k: 'mistral',   c: MCColors.amber,     name: 'mistral' },
    { k: 'groq',      c: '#A78BFA',          name: 'groq' },
    { k: 'openai',    c: MCColors.green,     name: 'openai' },
    { k: 'anthropic', c: MCColors.accent,    name: 'anthropic' },
  ];

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        {layers.map((l) => (
          <linearGradient key={l.k} id={`mc-${l.k}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={l.c} stopOpacity="0.32" />
            <stop offset="100%" stopColor={l.c} stopOpacity="0.04" />
          </linearGradient>
        ))}
      </defs>
      {/* grid */}
      {[0, 1, 2, 3, 4].map((i) => {
        const v = max * (i / 4);
        return (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)}
                  stroke={MCColors.border} strokeWidth="1" strokeDasharray="2 4" opacity="0.5" />
            <text x={pad.l - 6} y={y(v) + 3} textAnchor="end"
                  fontSize="9" fontFamily={mcMono} fill={MCColors.textMute}>{`$${v.toFixed(0).padStart(3, ' ')}`}</text>
          </g>
        );
      })}
      {[0, 5, 10, 15, 20, 25, 29].map((i) => (
        <text key={i} x={x(i)} y={H - 8} textAnchor="middle"
              fontSize="9" fontFamily={mcMono} fill={MCColors.textMute}>{`d-${29 - i}`}</text>
      ))}
      {layers.map((l) => (
        <g key={l.k}>
          <path d={layerPath(l.k)} fill={`url(#mc-${l.k})`} />
          <path d={linePath(l.k)} stroke={l.c} strokeWidth="1" fill="none" />
        </g>
      ))}
      {/* live cursor */}
      <line x1={x(28)} x2={x(28)} y1={pad.t} y2={pad.t + innerH} stroke={MCColors.accent} strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
      <circle cx={x(28)} cy={y(stacked[28].total)} r="3" fill={MCColors.bg} stroke={MCColors.accent} strokeWidth="1.5" />
      <text x={x(28) - 6} y={y(stacked[28].total) - 8} textAnchor="end" fontSize="10" fontFamily={mcMono} fill={MCColors.accent}>${stacked[28].total.toFixed(2)}</text>
    </svg>
  );
}

// Activity heatmap with values
function MCHeatmap() {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const data = React.useMemo(() => days.map((_, di) =>
    Array.from({ length: 24 }, (_, h) => {
      const work = h >= 8 && h <= 20 ? 1 : 0.1;
      const wknd = di >= 5 ? 0.25 : 1;
      return +(Math.random() * work * wknd * 100).toFixed(0);
    })
  ), []);
  return (
    <div style={{ fontFamily: mcMono, fontSize: 9, color: MCColors.textMute }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4, paddingLeft: 32 }}>
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} style={{ flex: 1, textAlign: 'center', visibility: h % 4 === 0 ? 'visible' : 'hidden' }}>{`${String(h).padStart(2, '0')}`}</div>
        ))}
      </div>
      {data.map((row, di) => (
        <div key={di} style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 2 }}>
          <div style={{ width: 30, color: MCColors.textDim }}>{days[di]}</div>
          <div style={{ display: 'flex', gap: 2, flex: 1 }}>
            {row.map((v, hi) => {
              const a = Math.min(0.95, 0.05 + (v / 100) * 0.95);
              return <div key={hi} style={{
                flex: 1, height: 16, borderRadius: 1,
                background: v < 5 ? MCColors.borderSoft : `rgba(94, 230, 208, ${a})`,
                border: v >= 80 ? `1px solid ${MCColors.accent}` : 'none',
              }} />;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function MCNav({ icon, label, active, badge }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, height: 30,
      padding: '0 12px',
      background: active ? `linear-gradient(90deg, rgba(94,230,208,0.08) 0%, transparent 100%)` : 'transparent',
      borderLeft: `2px solid ${active ? MCColors.accent : 'transparent'}`,
      color: active ? MCColors.text : MCColors.textDim,
      fontFamily: mcMono, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase',
      cursor: 'pointer',
    }}>
      <MCIcon d={icon} size={13} c={active ? MCColors.accent : MCColors.textMute} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{
          fontSize: 9, padding: '1px 5px', borderRadius: 2,
          background: active ? MCColors.accent : MCColors.borderSoft,
          color: active ? MCColors.bg : MCColors.textDim,
        }}>{badge}</span>
      )}
    </div>
  );
}

function MCKpi({ label, value, unit, delta, deltaSign, mini }) {
  return (
    <div style={{
      padding: '12px 14px', background: MCColors.panel,
      border: `1px solid ${MCColors.border}`,
      display: 'flex', flexDirection: 'column', gap: 8,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, ${MCColors.accent} 0%, transparent 60%)`, opacity: 0.4,
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: mcMono, fontSize: 9, color: MCColors.textMute, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</span>
        {delta && (
          <span style={{
            fontFamily: mcMono, fontSize: 9,
            color: deltaSign === 'up' ? MCColors.red : MCColors.green,
            display: 'inline-flex', alignItems: 'center', gap: 2,
          }}>
            <MCIcon d={deltaSign === 'up' ? MI.arrUp : MI.arrDn} size={9} />
            {delta}
          </span>
        )}
      </div>
      <div style={{ display: 'baseline', display: 'flex', gap: 4, alignItems: 'baseline' }}>
        <span style={{ fontFamily: mcMono, fontSize: 22, color: MCColors.text, letterSpacing: -0.5, fontWeight: 500 }}>{value}</span>
        {unit && <span style={{ fontFamily: mcMono, fontSize: 11, color: MCColors.textMute }}>{unit}</span>}
      </div>
      {mini && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {mini.map((v, i) => (
            <div key={i} style={{
              flex: 1, height: 18, background: `rgba(94, 230, 208, ${0.1 + v * 0.6})`,
              borderTop: `1px solid rgba(94, 230, 208, ${0.4 + v * 0.5})`,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

function MCWorkflow({ id, name, status, type, latency, cost, tokens }) {
  const dot = status === 'ok' ? MCColors.green : status === 'run' ? MCColors.accent : status === 'warn' ? MCColors.amber : MCColors.red;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '50px 18px 1fr 80px 80px 80px 70px',
      alignItems: 'center', gap: 8, padding: '7px 14px',
      borderBottom: `1px solid ${MCColors.borderSoft}`,
      fontFamily: mcMono, fontSize: 11,
    }}>
      <span style={{ color: MCColors.textMute, fontSize: 10 }}>{id}</span>
      <div style={{ position: 'relative', width: 8, height: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: 99, background: dot, position: 'absolute', top: 1, left: 1 }} />
        {status === 'run' && <div style={{ width: 8, height: 8, borderRadius: 99, background: dot, position: 'absolute', opacity: 0.4, animation: 'mc-pulse 1.4s infinite' }} />}
      </div>
      <span style={{ color: MCColors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      <span style={{ color: MCColors.textDim, fontSize: 10, textTransform: 'uppercase' }}>{type}</span>
      <span style={{ color: MCColors.textDim, fontSize: 10, textAlign: 'right' }}>{latency}ms</span>
      <span style={{ color: MCColors.textDim, fontSize: 10, textAlign: 'right' }}>{tokens}</span>
      <span style={{ color: MCColors.text, textAlign: 'right' }}>${cost}</span>
    </div>
  );
}

function DashboardMission({ mobile = false }) {
  const [time, setTime] = React.useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const tStr = time.toUTCString().slice(17, 25);

  if (mobile) return <DashboardMissionMobile />;

  return (
    <div style={{
      width: 1280, height: 820, background: MCColors.bg, color: MCColors.text,
      fontFamily: mcSans, display: 'flex', overflow: 'hidden', borderRadius: 6,
      backgroundImage: `radial-gradient(${MCColors.grid} 1px, transparent 1px)`,
      backgroundSize: '20px 20px',
    }}>
      <style>{`
        @keyframes mc-pulse { 0% { transform: scale(1); opacity: 0.5 } 100% { transform: scale(2.5); opacity: 0 } }
        @keyframes mc-blink { 50% { opacity: 0.3 } }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: 200, borderRight: `1px solid ${MCColors.border}`,
        background: MCColors.bg, display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '14px 14px 16px', borderBottom: `1px solid ${MCColors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 24, height: 24, border: `1px solid ${MCColors.accent}`,
              display: 'grid', placeItems: 'center', position: 'relative',
            }}>
              <div style={{ width: 8, height: 8, background: MCColors.accent, animation: 'mc-blink 2s infinite' }} />
            </div>
            <div>
              <div style={{ fontFamily: mcMono, fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>COSTWAVE</div>
              <div style={{ fontFamily: mcMono, fontSize: 8, color: MCColors.textMute, letterSpacing: 1 }}>v1.4.2</div>
            </div>
          </div>
          <div style={{ fontFamily: mcMono, fontSize: 9, color: MCColors.textMute, letterSpacing: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>UTC</span>
              <span style={{ color: MCColors.accent }}>{tStr}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span>WORKSPACE</span>
              <span style={{ color: MCColors.text }}>ACME</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 0 8px 0' }}>
          <div style={{ padding: '0 14px 6px', fontFamily: mcMono, fontSize: 8, color: MCColors.textMute, letterSpacing: 1.5 }}>// MONITOR</div>
          <MCNav icon={MI.radar} label="Overview" active />
          <MCNav icon={MI.bolt}  label="Providers" badge="5" />
          <MCNav icon={MI.layers} label="Workflows" badge="14" />
          <MCNav icon={MI.flow}  label="Agents" badge="3" />
          <MCNav icon={MI.alert} label="Alerts" badge="2" />
          <div style={{ padding: '12px 14px 6px', fontFamily: mcMono, fontSize: 8, color: MCColors.textMute, letterSpacing: 1.5 }}>// CONFIG</div>
          <MCNav icon={MI.term} label="Console" />
          <MCNav icon={MI.power} label="Settings" />
        </div>

        <div style={{ flex: 1 }} />

        <div style={{
          margin: 12, padding: 10, border: `1px solid ${MCColors.border}`,
          background: MCColors.panel, fontFamily: mcMono, fontSize: 9,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: MCColors.textMute, marginBottom: 6 }}>
            <span>BUDGET</span>
            <span style={{ color: MCColors.accent }}>70.6%</span>
          </div>
          <div style={{ height: 4, background: MCColors.borderSoft, marginBottom: 6, position: 'relative', overflow: 'hidden' }}>
            <div style={{
              width: '70.6%', height: '100%',
              background: `linear-gradient(90deg, ${MCColors.accent} 0%, ${MCColors.amber} 100%)`,
            }} />
            {[50, 75, 90].map((p) => (
              <div key={p} style={{ position: 'absolute', left: `${p}%`, top: 0, bottom: 0, width: 1, background: MCColors.bg }} />
            ))}
          </div>
          <div style={{ color: MCColors.text }}>$847.32 / $1200.00</div>
          <div style={{ color: MCColors.textMute, marginTop: 2 }}>9d 4h remaining</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header bar */}
        <header style={{
          height: 38, borderBottom: `1px solid ${MCColors.border}`,
          display: 'flex', alignItems: 'center', padding: '0 14px', gap: 12,
          background: MCColors.bg, fontFamily: mcMono, fontSize: 10,
        }}>
          <span style={{ color: MCColors.accent, letterSpacing: 1 }}>● LIVE</span>
          <span style={{ color: MCColors.textDim }}>OVERVIEW</span>
          <span style={{ color: MCColors.textMute }}>/</span>
          <span style={{ color: MCColors.text }}>30D</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', border: `1px solid ${MCColors.border}`, color: MCColors.textDim }}>
            <MCIcon d={MI.search} size={11} />
            <span>filter:provider…</span>
            <kbd style={{ marginLeft: 8, padding: '0 4px', background: MCColors.borderSoft, color: MCColors.textMute }}>/</kbd>
          </div>
          {['1H', '24H', '7D', '30D', '90D'].map((p) => (
            <span key={p} style={{
              padding: '4px 10px', cursor: 'pointer',
              color: p === '30D' ? MCColors.accent : MCColors.textDim,
              borderBottom: p === '30D' ? `1px solid ${MCColors.accent}` : '1px solid transparent',
            }}>{p}</span>
          ))}
          <div style={{ width: 1, height: 16, background: MCColors.border }} />
          <span style={{ color: MCColors.textDim, display: 'flex' }}><MCIcon d={MI.bell} size={13} /></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: MCColors.text, fontSize: 10 }}>
            <span style={{ width: 6, height: 6, background: MCColors.green }} />
            JM@ACME
          </span>
        </header>

        {/* Body */}
        <div style={{ flex: 1, padding: 12, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
            <MCKpi label="MTD COST" value="847.32" unit="USD" delta="+38.4%" deltaSign="up" mini={[0.2, 0.3, 0.4, 0.3, 0.5, 0.6, 0.5, 0.7, 0.8, 0.7, 0.9]} />
            <MCKpi label="TOKENS"   value="42.8M" delta="+12.0%" deltaSign="up" mini={[0.3, 0.4, 0.4, 0.5, 0.5, 0.6, 0.5, 0.7, 0.7, 0.8, 0.9]} />
            <MCKpi label="REQ/MIN"  value="184"  unit="rpm"   delta="+4.2%" deltaSign="up" mini={[0.5, 0.4, 0.6, 0.7, 0.5, 0.6, 0.8, 0.7, 0.9, 0.6, 0.8]} />
            <MCKpi label="P95 LAT"  value="1.42" unit="s"     delta="-8.1%" deltaSign="down" mini={[0.6, 0.5, 0.7, 0.6, 0.5, 0.4, 0.5, 0.4, 0.3, 0.4, 0.3]} />
            <MCKpi label="WORKERS"  value="14"   unit="3 run" />
            <MCKpi label="ALERTS"   value="2"    unit="1 crit" delta="-40%" deltaSign="down" />
          </div>

          {/* Chart + side panels */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 8 }}>
            <div style={{ background: MCColors.panel, border: `1px solid ${MCColors.border}`, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <span style={{ fontFamily: mcMono, fontSize: 10, color: MCColors.textMute, letterSpacing: 1 }}>SPEND.STACKED</span>
                  <div style={{ display: 'flex', gap: 12, fontFamily: mcMono, fontSize: 9 }}>
                    {[
                      { c: MCColors.accent, n: 'anthropic', v: '412.18' },
                      { c: MCColors.green, n: 'openai', v: '241.04' },
                      { c: '#A78BFA', n: 'groq', v: '118.92' },
                      { c: MCColors.amber, n: 'mistral', v: '52.18' },
                    ].map((s) => (
                      <span key={s.n} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: MCColors.textDim }}>
                        <span style={{ width: 8, height: 2, background: s.c }} />
                        {s.n} <span style={{ color: MCColors.text }}>${s.v}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <span style={{ fontFamily: mcMono, fontSize: 9, color: MCColors.accent, animation: 'mc-blink 2s infinite' }}>● LIVE</span>
              </div>
              <MCStackedChart />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Alerts */}
              <div style={{ background: MCColors.panel, border: `1px solid ${MCColors.border}`, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: mcMono, fontSize: 10, color: MCColors.textMute, letterSpacing: 1 }}>ALERTS</span>
                  <span style={{ fontFamily: mcMono, fontSize: 9, color: MCColors.red }}>2 ACTIVE</span>
                </div>
                {[
                  { lvl: 'CRIT', c: MCColors.red,   n: 'anthropic > 90% budget',  t: '12m' },
                  { lvl: 'WARN', c: MCColors.amber, n: 'workflow.invoice latency', t: '47m' },
                ].map((a, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0',
                    borderBottom: i === 0 ? `1px solid ${MCColors.borderSoft}` : 'none',
                    fontFamily: mcMono, fontSize: 10,
                  }}>
                    <span style={{ width: 28, color: a.c, fontSize: 9 }}>{a.lvl}</span>
                    <span style={{ flex: 1, color: MCColors.text }}>{a.n}</span>
                    <span style={{ color: MCColors.textMute, fontSize: 9 }}>{a.t}</span>
                  </div>
                ))}
              </div>

              {/* Provider table */}
              <div style={{ background: MCColors.panel, border: `1px solid ${MCColors.border}`, padding: '10px 12px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: mcMono, fontSize: 10, color: MCColors.textMute, letterSpacing: 1 }}>PROVIDERS · TOP 5</span>
                  <span style={{ fontFamily: mcMono, fontSize: 9, color: MCColors.textMute }}>$847.32</span>
                </div>
                {[
                  { n: 'anthropic', v: '412.18', p: 48.6, c: MCColors.accent },
                  { n: 'openai',    v: '241.04', p: 28.4, c: MCColors.green },
                  { n: 'groq',      v: '118.92', p: 14.0, c: '#A78BFA' },
                  { n: 'mistral',   v: '52.18',  p: 6.2,  c: MCColors.amber },
                  { n: 'google',    v: '23.00',  p: 2.7,  c: MCColors.textDim },
                ].map((p, i) => (
                  <div key={i} style={{ padding: '6px 0', fontFamily: mcMono, fontSize: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ color: MCColors.text }}>{p.n}</span>
                      <span style={{ color: MCColors.text }}>${p.v} <span style={{ color: MCColors.textMute }}>{p.p}%</span></span>
                    </div>
                    <div style={{ height: 2, background: MCColors.borderSoft }}>
                      <div style={{ width: `${p.p}%`, height: '100%', background: p.c }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Heatmap + workflows */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flex: 1, minHeight: 240 }}>
            <div style={{ background: MCColors.panel, border: `1px solid ${MCColors.border}`, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: mcMono, fontSize: 10, color: MCColors.textMute, letterSpacing: 1 }}>ACTIVITY.HEATMAP · 7D × 24H</span>
                <span style={{ fontFamily: mcMono, fontSize: 9, color: MCColors.textMute }}>2,341 calls</span>
              </div>
              <MCHeatmap />
            </div>

            <div style={{ background: MCColors.panel, border: `1px solid ${MCColors.border}`, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${MCColors.border}`, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: mcMono, fontSize: 10, color: MCColors.textMute, letterSpacing: 1 }}>WORKFLOWS.RECENT</span>
                <span style={{ fontFamily: mcMono, fontSize: 9, color: MCColors.textMute }}>14 total · 3 active</span>
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: '50px 18px 1fr 80px 80px 80px 70px',
                gap: 8, padding: '6px 14px',
                fontFamily: mcMono, fontSize: 8, color: MCColors.textMute, letterSpacing: 1,
                borderBottom: `1px solid ${MCColors.border}`,
              }}>
                <span>ID</span><span /><span>NAME</span><span>TYPE</span>
                <span style={{ textAlign: 'right' }}>LAT</span>
                <span style={{ textAlign: 'right' }}>TOK</span>
                <span style={{ textAlign: 'right' }}>COST</span>
              </div>
              <div style={{ overflow: 'auto', flex: 1 }}>
                <MCWorkflow id="#1284" name="claude-code/refactor-auth" status="run" type="agent" latency="—" tokens="184k" cost="2.41" />
                <MCWorkflow id="#1283" name="n8n/daily-digest" status="ok" type="n8n" latency="847" tokens="12k" cost="0.18" />
                <MCWorkflow id="#1282" name="invoice-extractor.py" status="ok" type="script" latency="2120" tokens="48k" cost="0.74" />
                <MCWorkflow id="#1281" name="claude-code/review-pr-2841" status="ok" type="agent" latency="—" tokens="284k" cost="3.92" />
                <MCWorkflow id="#1280" name="n8n/slack-summarizer" status="bad" type="n8n" latency="err" tokens="0" cost="0.00" />
                <MCWorkflow id="#1279" name="embed-knowledge-base" status="ok" type="script" latency="14k" tokens="891k" cost="11.40" />
                <MCWorkflow id="#1278" name="n8n/lead-enricher" status="warn" type="n8n" latency="4210" tokens="22k" cost="0.34" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardMissionMobile() {
  return (
    <div style={{
      width: 390, height: 844, background: MCColors.bg, color: MCColors.text,
      fontFamily: mcSans, display: 'flex', flexDirection: 'column',
      borderRadius: 6, overflow: 'hidden',
    }}>
      <style>{`@keyframes mcm-blink { 50% { opacity: 0.3 } }`}</style>
      <div style={{
        height: 38, padding: '0 18px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', fontFamily: mcMono, fontSize: 11, color: MCColors.text,
      }}>
        <span>9:41</span>
        <span style={{ color: MCColors.accent, fontSize: 9, animation: 'mcm-blink 2s infinite' }}>● LIVE 09:41:22 UTC</span>
      </div>

      <div style={{
        padding: '8px 16px', borderBottom: `1px solid ${MCColors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, border: `1px solid ${MCColors.accent}`, display: 'grid', placeItems: 'center' }}>
            <div style={{ width: 8, height: 8, background: MCColors.accent }} />
          </div>
          <span style={{ fontFamily: mcMono, fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>COSTWAVE</span>
        </div>
        <div style={{ display: 'flex', gap: 12, color: MCColors.textDim }}>
          <MCIcon d={MI.search} size={16} />
          <MCIcon d={MI.bell}   size={16} />
        </div>
      </div>

      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${MCColors.border}` }}>
        <div style={{ fontFamily: mcMono, fontSize: 9, color: MCColors.textMute, letterSpacing: 1.5 }}>// MTD.SPEND</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          <span style={{ fontFamily: mcMono, fontSize: 30, color: MCColors.text, letterSpacing: -1 }}>$847.32</span>
          <span style={{ fontFamily: mcMono, fontSize: 11, color: MCColors.red }}>↑ 38.4%</span>
        </div>
        <div style={{ height: 4, background: MCColors.borderSoft, marginTop: 10, position: 'relative' }}>
          <div style={{ width: '70%', height: '100%', background: `linear-gradient(90deg, ${MCColors.accent}, ${MCColors.amber})` }} />
          {[50, 75, 90].map((p) => (
            <div key={p} style={{ position: 'absolute', left: `${p}%`, top: -2, bottom: -2, width: 1, background: MCColors.bg }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: mcMono, fontSize: 9, color: MCColors.textMute }}>
          <span>$847 / $1200 BUDGET</span>
          <span style={{ color: MCColors.accent }}>70.6%</span>
        </div>
      </div>

      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${MCColors.border}` }}>
        <div style={{ fontFamily: mcMono, fontSize: 9, color: MCColors.textMute, letterSpacing: 1.5, marginBottom: 8 }}>// PROVIDERS</div>
        {[
          { n: 'anthropic', v: '412.18', p: 48.6, c: MCColors.accent },
          { n: 'openai',    v: '241.04', p: 28.4, c: MCColors.green },
          { n: 'groq',      v: '118.92', p: 14.0, c: '#A78BFA' },
        ].map((p, i) => (
          <div key={i} style={{ padding: '5px 0', fontFamily: mcMono, fontSize: 11 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ color: MCColors.text }}>{p.n}</span>
              <span style={{ color: MCColors.text }}>${p.v} <span style={{ color: MCColors.textMute }}>{p.p}%</span></span>
            </div>
            <div style={{ height: 2, background: MCColors.borderSoft }}>
              <div style={{ width: `${p.p}%`, height: '100%', background: p.c }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 16px', flex: 1, overflow: 'hidden' }}>
        <div style={{ fontFamily: mcMono, fontSize: 9, color: MCColors.textMute, letterSpacing: 1.5, marginBottom: 8 }}>// LIVE.FEED</div>
        {[
          { id: '#1284', n: 'claude/refactor', s: 'run', c: '2.41' },
          { id: '#1283', n: 'n8n/digest', s: 'ok', c: '0.18' },
          { id: '#1282', n: 'invoice.py', s: 'ok', c: '0.74' },
          { id: '#1280', n: 'n8n/slack', s: 'bad', c: '0.00' },
        ].map((w, i) => {
          const dot = w.s === 'ok' ? MCColors.green : w.s === 'run' ? MCColors.accent : MCColors.red;
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '50px 14px 1fr 60px',
              alignItems: 'center', gap: 8, padding: '7px 0',
              borderBottom: `1px solid ${MCColors.borderSoft}`,
              fontFamily: mcMono, fontSize: 11,
            }}>
              <span style={{ color: MCColors.textMute, fontSize: 9 }}>{w.id}</span>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: dot }} />
              <span style={{ color: MCColors.text }}>{w.n}</span>
              <span style={{ color: MCColors.text, textAlign: 'right' }}>${w.c}</span>
            </div>
          );
        })}
      </div>

      <div style={{
        height: 70, borderTop: `1px solid ${MCColors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '8px 0 18px',
      }}>
        {[
          { i: MI.radar, l: 'OVR', a: true },
          { i: MI.bolt,  l: 'PRV' },
          { i: MI.layers,l: 'WFL' },
          { i: MI.alert, l: 'ALR' },
        ].map((it, idx) => (
          <div key={idx} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: it.a ? MCColors.accent : MCColors.textMute,
            fontFamily: mcMono, fontSize: 9, letterSpacing: 1,
          }}>
            <MCIcon d={it.i} size={17} />
            <span>{it.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

window.DashboardMission = DashboardMission;
window.DashboardMissionMobile = DashboardMissionMobile;
