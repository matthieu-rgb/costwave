// Screen 7 — Workflow Detail · Mission Control
// Detail d'UN workflow specifique. Re-utilise mc-tokens.jsx + WORKFLOWS,
// SOURCES, SourceBadge, StatusPill, MCSpark exposes par screen-6.
// Pas de Recharts external — graphe maison en SVG (cost bars + duration line).
// 0px radius cards, phosphor reserve a la run live, lucide stroke 1.5.

// ─── Mock detail data ───────────────────────────────────────────────────────

// On focus sur claude-code/refactor-auth (WF-001)
const WF_DETAIL = {
  id: 'WF-001',
  name: 'claude-code/refactor-auth',
  src: 'claude.code',
  status: 'RUNNING',
  description: 'Refactor authentication module across 4 sub-services. Triggered on push to main.',
  schedule: 'on-push · main',
  owner: 'shubham@costwave.io',
  created: '2026-03-12',
  // KPIs
  runsWeek: 14,
  runsMonth: 58,
  successRate: 96.5,
  avgDuration: 4.2,    // s
  costMonth: 12.84,
  costPerRun: 0.221,
  // 30 derniers runs (cost $, duration s)
  runs30: [
    { c: 0.18, d: 3.2 }, { c: 0.22, d: 4.1 }, { c: 0.21, d: 3.8 }, { c: 0.19, d: 3.4 },
    { c: 0.24, d: 4.6 }, { c: 0.20, d: 3.9 }, { c: 0.18, d: 3.1 }, { c: 0.26, d: 5.2 },
    { c: 0.22, d: 4.0 }, { c: 0.19, d: 3.5 }, { c: 0.21, d: 3.9 }, { c: 0.23, d: 4.3 },
    { c: 0.18, d: 3.2 }, { c: 0.32, d: 6.4 }, { c: 0.28, d: 5.5 }, { c: 0.20, d: 3.7 },
    { c: 0.19, d: 3.4 }, { c: 0.21, d: 3.8 }, { c: 0.24, d: 4.5 }, { c: 0.22, d: 4.1 },
    { c: 0.19, d: 3.3 }, { c: 0.18, d: 3.0 }, { c: 0.21, d: 3.8 }, { c: 0.23, d: 4.2 },
    { c: 0.20, d: 3.6 }, { c: 0.18, d: 3.2 }, { c: 0.22, d: 4.0 }, { c: 0.41, d: 8.2 },
    { c: 0.24, d: 4.4 }, { c: 0.21, d: 3.9 },
  ],
};

// 50 derniers runs avec metadata
const RUN_LIST = [
  { id: '0xA4F2-9C81', start: '2026-04-30 14:22:08', dur: 3.9,  tin:  4218, tout: 12842, cost: 0.21, status: 'RUNNING' },
  { id: '0xA4F2-9C72', start: '2026-04-30 13:48:02', dur: 4.1,  tin:  4382, tout: 13104, cost: 0.22, status: 'OK' },
  { id: '0xA4F2-9C68', start: '2026-04-30 12:14:54', dur: 8.2,  tin: 12482, tout: 28104, cost: 0.41, status: 'OK' },
  { id: '0xA4F2-9C5A', start: '2026-04-30 11:02:38', dur: 4.4,  tin:  4622, tout: 13892, cost: 0.24, status: 'OK' },
  { id: '0xA4F2-9C4F', start: '2026-04-30 09:38:14', dur: 4.0,  tin:  4214, tout: 12702, cost: 0.22, status: 'OK' },
  { id: '0xA4F2-9C42', start: '2026-04-30 08:24:52', dur: 3.2,  tin:  3814, tout: 11428, cost: 0.18, status: 'OK' },
  { id: '0xA4F2-9C38', start: '2026-04-29 22:18:46', dur: 3.6,  tin:  4012, tout: 11984, cost: 0.20, status: 'OK' },
  { id: '0xA4F2-9C2D', start: '2026-04-29 18:42:11', dur: 4.2,  tin:  4488, tout: 13242, cost: 0.23, status: 'OK' },
  { id: '0xA4F2-9C24', start: '2026-04-29 17:08:54', dur: 6.4,  tin:  8214, tout: 22841, cost: 0.32, status: 'FAILED' },
  { id: '0xA4F2-9C18', start: '2026-04-29 14:52:18', dur: 3.8,  tin:  4182, tout: 12482, cost: 0.21, status: 'OK' },
  { id: '0xA4F2-9C0C', start: '2026-04-29 12:24:08', dur: 3.0,  tin:  3782, tout: 11284, cost: 0.18, status: 'OK' },
  { id: '0xA4F2-9BFE', start: '2026-04-29 09:18:34', dur: 3.3,  tin:  3914, tout: 11724, cost: 0.19, status: 'OK' },
];

const RECENT_ERRORS = [
  {
    id: '0xA4F2-9C24',
    when: '2026-04-29 17:08:54',
    code: 'TIMEOUT',
    msg: 'sub-agent products timed out after 6400ms',
    trace: [
      'at AgentRuntime.exec (runtime/agent.ts:482)',
      'at orchestrate (runtime/orchestrator.ts:128)',
      'at Workflow.run (workflow/run.ts:64)',
    ],
  },
  {
    id: '0xA4F2-9B7C',
    when: '2026-04-28 16:22:08',
    code: 'RATE_LIMIT',
    msg: '429 Too Many Requests · anthropic.api · retry exhausted (3/3)',
    trace: [
      'at HTTPClient.fetch (http/client.ts:112)',
      'at AnthropicProvider.complete (providers/anthropic.ts:78)',
      'at AgentRuntime.exec (runtime/agent.ts:421)',
    ],
  },
  {
    id: '0xA4F2-9AEE', when: '2026-04-26 11:48:02', code: 'INVALID_INPUT',
    msg: 'malformed JSON in payload.context.files[3].content',
    trace: ['at validateInput (validators/payload.ts:42)', 'at Workflow.run (workflow/run.ts:48)'],
  },
  {
    id: '0xA4F2-9A88', when: '2026-04-24 08:14:18', code: 'TIMEOUT',
    msg: 'sub-agent shared timed out after 8200ms',
    trace: ['at AgentRuntime.exec (runtime/agent.ts:482)', 'at orchestrate (runtime/orchestrator.ts:128)'],
  },
  {
    id: '0xA4F2-9A14', when: '2026-04-22 19:32:48', code: 'PROVIDER_5XX',
    msg: '503 Service Unavailable · upstream provider · circuit breaker tripped',
    trace: ['at HTTPClient.fetch (http/client.ts:112)', 'at AnthropicProvider.complete (providers/anthropic.ts:78)'],
  },
];

// ─── Status pill for runs ───────────────────────────────────────────────────

function RunStatusPill({ status }) {
  const map = {
    RUNNING: { c: MC.phosphor, bd: 'hsl(170 73% 24%)', bg: 'hsl(170 73% 8%)', blink: true },
    OK:      { c: MC.green,    bd: 'hsl(150 71% 24%)', bg: 'hsl(150 71% 7%)', blink: false },
    FAILED:  { c: MC.red,      bd: 'hsl(0 60% 28%)',   bg: 'hsl(0 60% 10%)',  blink: false },
  }[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 7px',
      border: `1px solid ${map.bd}`, background: map.bg, color: map.c,
      fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: 99, background: map.c,
        boxShadow: `0 0 5px ${map.c}`,
        animation: map.blink ? 'mc-blink 1.4s infinite' : 'none',
      }}/>
      {status}
    </span>
  );
}

// ─── KPI card ───────────────────────────────────────────────────────────────

function KpiCard({ label, value, unit, sub, accent }) {
  return (
    <div style={{
      flex: 1, background: MC.panel, border: `1px solid ${MC.border}`,
      padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0,
    }}>
      <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: MC.textMute }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          fontFamily: MC_FONT_MONO, fontSize: 22, color: accent || MC.text,
          fontWeight: 500, ...MC_TABULAR,
        }}>{value}</span>
        {unit && <span style={{ fontFamily: MC_FONT_MONO, fontSize: 11, color: MC.textDim }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textDim, ...MC_TABULAR }}>{sub}</div>}
    </div>
  );
}

// ─── Cost / Duration combo chart ────────────────────────────────────────────

function CostDurationChart({ data }) {
  const W = 800, H = 220;
  const padL = 44, padR = 44, padT = 14, padB = 24;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const maxC = Math.max(...data.map(d => d.c)) * 1.15;
  const maxD = Math.max(...data.map(d => d.d)) * 1.15;
  const barW = innerW / data.length * 0.6;
  const stepX = innerW / data.length;

  // line points
  const linePts = data.map((d, i) => {
    const x = padL + stepX * i + stepX / 2;
    const y = padT + innerH - (d.d / maxD) * innerH;
    return [x, y];
  });

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      {/* grid horizontal */}
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
        const y = padT + innerH * (1 - p);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={MC.borderSoft} strokeWidth="0.6"/>
            <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="8" fontFamily={MC_FONT_MONO} fill={MC.textMute} letterSpacing="0.5">
              ${(maxC * p).toFixed(2)}
            </text>
            <text x={W - padR + 6} y={y + 3} fontSize="8" fontFamily={MC_FONT_MONO} fill={MC.textMute} letterSpacing="0.5">
              {(maxD * p).toFixed(1)}s
            </text>
          </g>
        );
      })}

      {/* cost bars */}
      {data.map((d, i) => {
        const x = padL + stepX * i + (stepX - barW) / 2;
        const h = (d.c / maxC) * innerH;
        const y = padT + innerH - h;
        const isAnomaly = d.c > 0.30;
        return (
          <rect key={i} x={x} y={y} width={barW} height={h}
            fill={isAnomaly ? MC.amber : MC.text} opacity={isAnomaly ? 0.85 : 0.55}/>
        );
      })}

      {/* duration line */}
      <polyline
        points={linePts.map(p => p.join(',')).join(' ')}
        fill="none" stroke={MC.phosphor} strokeWidth="1.2" opacity="0.9"/>
      {linePts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="1.6" fill={MC.phosphor}/>
      ))}

      {/* x labels (every 5 runs) */}
      {data.map((d, i) => {
        if (i % 5 !== 0) return null;
        const x = padL + stepX * i + stepX / 2;
        return (
          <text key={i} x={x} y={H - 8} textAnchor="middle"
            fontSize="8" fontFamily={MC_FONT_MONO} fill={MC.textMute} letterSpacing="0.5">
            -{data.length - i}
          </text>
        );
      })}

      {/* axis labels */}
      <text x={padL} y={padT - 4} fontSize="8" fontFamily={MC_FONT_MONO} fill={MC.text} letterSpacing="1">COST.PER.RUN ($)</text>
      <text x={W - padR} y={padT - 4} textAnchor="end" fontSize="8" fontFamily={MC_FONT_MONO} fill={MC.phosphor} letterSpacing="1">DURATION (s)</text>
    </svg>
  );
}

// ─── Top bar ────────────────────────────────────────────────────────────────

function WFDTopBar() {
  return (
    <header style={{
      height: 40, padding: '0 18px',
      borderBottom: `1px solid ${MC.border}`,
      display: 'flex', alignItems: 'center', gap: 14,
      fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textDim,
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <MCI d={ICON.flow} size={12} c={MC.text}/>
        <span style={{ color: MC.text, letterSpacing: 1.5, fontWeight: 600 }}>COSTWAVE</span>
      </span>
      <span style={{ color: MC.textMute }}>/</span>
      <span style={{ color: MC.textDim, letterSpacing: 1, cursor: 'pointer' }}>workflows</span>
      <span style={{ color: MC.textMute }}>/</span>
      <span style={{ color: MC.text, letterSpacing: 0.3 }}>{WF_DETAIL.name}</span>
      <span style={{ flex: 1 }}/>
      <span style={{ color: MC.textMute, letterSpacing: 1.5 }}>WORKFLOW.ID</span>
      <span style={{ color: MC.text, ...MC_TABULAR }}>{WF_DETAIL.id}</span>
    </header>
  );
}

// ─── Detail header ──────────────────────────────────────────────────────────

function DetailHeader() {
  return (
    <div style={{ padding: '14px 18px', borderBottom: `1px solid ${MC.border}`, background: MC.panel,
      display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: MC_FONT_MONO, fontSize: 18, color: MC.text, letterSpacing: 0.3, fontWeight: 500 }}>{WF_DETAIL.name}</span>
          <SourceBadge src={WF_DETAIL.src}/>
          <StatusPill status={WF_DETAIL.status}/>
        </div>
        <div style={{ fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textDim, letterSpacing: 0.3 }}>{WF_DETAIL.description}</div>
        <div style={{ display: 'flex', gap: 16, fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1 }}>
          <span>SCHEDULE <span style={{ color: MC.textDim }}>{WF_DETAIL.schedule}</span></span>
          <span>OWNER <span style={{ color: MC.textDim }}>{WF_DETAIL.owner}</span></span>
          <span>CREATED <span style={{ color: MC.textDim, ...MC_TABULAR }}>{WF_DETAIL.created}</span></span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <DetailAction icon={ICON.power} label="PAUSE"/>
        <DetailAction icon={ICON.refresh} label="RUN.NOW"/>
        <DetailAction icon={ICON.edit} label="EDIT"/>
        <DetailAction icon={ICON.trash} label="DELETE" tone="danger"/>
      </div>
    </div>
  );
}

function DetailAction({ icon, label, tone }) {
  const c = tone === 'danger' ? MC.red : MC.text;
  return (
    <button style={{
      padding: '6px 11px',
      background: 'transparent',
      border: `1px solid ${tone === 'danger' ? 'hsl(0 60% 28%)' : MC.border}`,
      color: c,
      fontFamily: MC_FONT_MONO, fontSize: 9.5, letterSpacing: 1, fontWeight: 500,
      cursor: 'pointer', borderRadius: 2,
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      <MCI d={icon} size={11}/>
      {label}
    </button>
  );
}

// ─── KPI row ────────────────────────────────────────────────────────────────

function KpiRow() {
  return (
    <div style={{ display: 'flex', gap: 8, padding: 12, borderBottom: `1px solid ${MC.border}` }}>
      <KpiCard label="RUNS.WEEK"     value={WF_DETAIL.runsWeek} sub={`${WF_DETAIL.runsMonth} this month`}/>
      <KpiCard label="SUCCESS.RATE"  value={WF_DETAIL.successRate.toFixed(1)} unit="%" sub="last 50 runs" accent={MC.green}/>
      <KpiCard label="AVG.DURATION"  value={WF_DETAIL.avgDuration.toFixed(1)} unit="s" sub="p50 across 30d"/>
      <KpiCard label="COST.MTD"      value={`$${WF_DETAIL.costMonth.toFixed(2)}`} sub="↑ 12.4% vs last month" accent={MC.text}/>
      <KpiCard label="COST.PER.RUN"  value={`$${WF_DETAIL.costPerRun.toFixed(4)}`} sub="avg over 30 runs"/>
    </div>
  );
}

// ─── Runs table ─────────────────────────────────────────────────────────────

const RUN_COLS = [
  { k: 'id',      l: 'RUN.ID',      w: '14%', a: 'left' },
  { k: 'start',   l: 'STARTED.AT',  w: '17%', a: 'left' },
  { k: 'dur',     l: 'DURATION',    w: '9%',  a: 'right' },
  { k: 'tin',     l: 'TOKENS.IN',   w: '12%', a: 'right' },
  { k: 'tout',    l: 'TOKENS.OUT',  w: '12%', a: 'right' },
  { k: 'cost',    l: 'COST',        w: '10%', a: 'right' },
  { k: 'status',  l: 'STATUS',      w: '12%', a: 'left' },
  { k: 'expand',  l: '',            w: '14%', a: 'right' },
];

function RunsTable() {
  const [expanded, setExpanded] = React.useState('0xA4F2-9C81');
  return (
    <div style={{ background: MC.panel, border: `1px solid ${MC.border}` }}>
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${MC.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: MC.text, fontWeight: 600 }}>// RECENT.RUNS</span>
        <span style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1, ...MC_TABULAR }}>SHOWING 12 / 50</span>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: RUN_COLS.map(c => c.w).join(' '),
        background: MC.bg, borderBottom: `1px solid ${MC.border}`,
      }}>
        {RUN_COLS.map((c, i) => (
          <div key={i} style={{
            padding: '7px 12px', textAlign: c.a,
            fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: MC.textMute,
          }}>{c.l}</div>
        ))}
      </div>
      {RUN_LIST.map((r) => {
        const isExp = expanded === r.id;
        return (
          <React.Fragment key={r.id}>
            <div onClick={() => setExpanded(isExp ? null : r.id)} style={{
              display: 'grid', gridTemplateColumns: RUN_COLS.map(c => c.w).join(' '),
              borderBottom: `1px solid ${MC.borderSoft}`,
              borderLeft: r.status === 'RUNNING' ? `2px solid ${MC.phosphor}`
                        : r.status === 'FAILED' ? `2px solid ${MC.red}`
                        : '2px solid transparent',
              cursor: 'pointer',
              background: isExp ? MC.panel2 : 'transparent',
            }}>
              <div style={{ padding: '7px 12px', fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.text, ...MC_TABULAR }}>{r.id}</div>
              <div style={{ padding: '7px 12px', fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textDim, ...MC_TABULAR }}>{r.start}</div>
              <div style={{ padding: '7px 12px', textAlign: 'right', fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.text, ...MC_TABULAR }}>{r.dur.toFixed(1)}s</div>
              <div style={{ padding: '7px 12px', textAlign: 'right', fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textDim, ...MC_TABULAR }}>{r.tin.toLocaleString()}</div>
              <div style={{ padding: '7px 12px', textAlign: 'right', fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textDim, ...MC_TABULAR }}>{r.tout.toLocaleString()}</div>
              <div style={{ padding: '7px 12px', textAlign: 'right', fontFamily: MC_FONT_MONO, fontSize: 11, color: MC.text, fontWeight: 500, ...MC_TABULAR }}>${r.cost.toFixed(2)}</div>
              <div style={{ padding: '7px 12px' }}><RunStatusPill status={r.status}/></div>
              <div style={{ padding: '6px 12px', textAlign: 'right', fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1 }}>
                {isExp ? '▾ COLLAPSE' : '▸ EXPAND'}
              </div>
            </div>
            {isExp && (
              <div style={{
                padding: '12px 18px',
                background: MC.bg,
                borderBottom: `1px solid ${MC.borderSoft}`,
                borderLeft: r.status === 'RUNNING' ? `2px solid ${MC.phosphor}`
                          : r.status === 'FAILED' ? `2px solid ${MC.red}`
                          : '2px solid transparent',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
              }}>
                <div style={{ background: MC.panel, border: `1px solid ${MC.border}`, padding: 10 }}>
                  <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1.5, marginBottom: 6 }}>INPUT.PREVIEW</div>
                  <pre style={{ margin: 0, fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textDim, lineHeight: 1.5, whiteSpace: 'pre-wrap', maxHeight: 110, overflow: 'hidden', ...MC_TABULAR }}>
{`{
  "task": "refactor-auth",
  "branch": "main",
  "commit": "a4f29c81b8e2",
  "files": [
    "src/auth/session.ts",
    "src/auth/login.ts",
    "src/auth/middleware.ts"
  ],
  "context_size": 4218
} ...`}
                  </pre>
                </div>
                <div style={{ background: MC.panel, border: `1px solid ${MC.border}`, padding: 10 }}>
                  <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1.5, marginBottom: 6 }}>OUTPUT.PREVIEW</div>
                  <pre style={{ margin: 0, fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textDim, lineHeight: 1.5, whiteSpace: 'pre-wrap', maxHeight: 110, overflow: 'hidden', ...MC_TABULAR }}>
{`{
  "status": "${r.status.toLowerCase()}",
  "files_modified": 4,
  "lines_added": 184,
  "lines_removed": 92,
  "tests_passed": "28/28",
  "summary": "Extracted session logic into shared..."
} ...`}
                  </pre>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Recent errors panel ────────────────────────────────────────────────────

function RecentErrors() {
  return (
    <div style={{ background: MC.panel, border: `1px solid ${MC.border}` }}>
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${MC.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: MC.text, fontWeight: 600 }}>// RECENT.ERRORS</span>
        <span style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.red, letterSpacing: 1, ...MC_TABULAR }}>5 LAST.30D</span>
      </div>
      <div>
        {RECENT_ERRORS.map((e, i) => (
          <div key={i} style={{
            padding: '10px 14px',
            borderBottom: i < RECENT_ERRORS.length - 1 ? `1px solid ${MC.borderSoft}` : 'none',
            borderLeft: `2px solid ${MC.red}`,
            display: 'flex', flexDirection: 'column', gap: 5,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                padding: '2px 7px', border: `1px solid hsl(0 60% 28%)`, background: 'hsl(0 60% 10%)',
                color: MC.red, fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1,
              }}>{e.code}</span>
              <span style={{ fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.text, ...MC_TABULAR }}>{e.id}</span>
              <span style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, ...MC_TABULAR }}>{e.when}</span>
            </div>
            <div style={{ fontFamily: MC_FONT_MONO, fontSize: 10.5, color: MC.text, letterSpacing: 0.3 }}>{e.msg}</div>
            <div style={{
              fontFamily: MC_FONT_MONO, fontSize: 9.5, color: MC.textDim, lineHeight: 1.7,
              paddingLeft: 10, borderLeft: `1px solid ${MC.borderSoft}`,
            }}>
              {e.trace.map((t, j) => (
                <div key={j} style={{ ...MC_TABULAR }}>
                  <span style={{ color: MC.textMute }}>{(j + 1).toString().padStart(2, '0')}</span>{'  '}
                  {t}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main screen ────────────────────────────────────────────────────────────

function ScreenWorkflowDetail({ mobile }) {
  if (mobile) return <ScreenWorkflowDetailMobile/>;
  return (
    <div style={{
      width: 1280, height: 820, background: MC.bg, color: MC.text,
      fontFamily: MC_FONT_SANS, display: 'flex', flexDirection: 'column',
      backgroundImage: MC_GRID_BG, backgroundSize: MC_GRID_SIZE,
      borderRadius: 6, overflow: 'hidden',
    }}>
      <MCAnims/>
      <WFDTopBar/>
      <DetailHeader/>
      <KpiRow/>
      <div style={{ flex: 1, padding: 12, overflow: 'auto', minHeight: 0,
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignContent: 'start' }}>
        {/* Chart full width */}
        <div style={{ gridColumn: '1 / -1', background: MC.panel, border: `1px solid ${MC.border}` }}>
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${MC.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: MC.text, fontWeight: 600 }}>// COST × DURATION · LAST 30 RUNS</span>
            <div style={{ display: 'flex', gap: 14, fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, background: MC.text, opacity: 0.7 }}/> COST.PER.RUN
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, background: MC.amber, opacity: 0.85 }}/> ANOMALY &gt;$0.30
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 12, height: 1.5, background: MC.phosphor }}/> DURATION
              </span>
            </div>
          </div>
          <div style={{ padding: 14 }}>
            <CostDurationChart data={WF_DETAIL.runs30}/>
          </div>
        </div>
        {/* Runs table left, errors right */}
        <div><RunsTable/></div>
        <div><RecentErrors/></div>
      </div>
    </div>
  );
}

function ScreenWorkflowDetailMobile() {
  return (
    <div style={{
      width: 390, height: 844, background: MC.bg, color: MC.text,
      fontFamily: MC_FONT_SANS, display: 'flex', flexDirection: 'column',
      backgroundImage: MC_GRID_BG, backgroundSize: MC_GRID_SIZE,
      borderRadius: 6, overflow: 'hidden',
    }}>
      <MCAnims/>
      <div style={{ height: 38, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: MC_FONT_MONO, fontSize: 11 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <MCI d={ICON.arrLeft} size={12} c={MC.textDim}/>
          <span style={{ color: MC.textDim }}>workflows</span>
        </span>
        <RunStatusPill status="RUNNING"/>
      </div>
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${MC.border}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SourceBadge src={WF_DETAIL.src}/>
        <div style={{ fontFamily: MC_FONT_MONO, fontSize: 13, color: MC.text, letterSpacing: 0.3 }}>{WF_DETAIL.name}</div>
        <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1 }}>{WF_DETAIL.id} · on-push main</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: MC.border, borderBottom: `1px solid ${MC.border}` }}>
        <MiniKpi l="RUNS.7D"    v={WF_DETAIL.runsWeek}/>
        <MiniKpi l="SUCCESS"    v={`${WF_DETAIL.successRate}%`} c={MC.green}/>
        <MiniKpi l="AVG.DUR"    v={`${WF_DETAIL.avgDuration}s`}/>
        <MiniKpi l="COST.MTD"   v={`$${WF_DETAIL.costMonth.toFixed(2)}`}/>
      </div>
      <div style={{ padding: 10, borderBottom: `1px solid ${MC.border}` }}>
        <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: MC.textMute, marginBottom: 6 }}>// COST × DURATION · 30 RUNS</div>
        <CostDurationChart data={WF_DETAIL.runs30}/>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
        <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: MC.textMute, padding: '0 4px 6px' }}>// RECENT.RUNS</div>
        {RUN_LIST.slice(0, 5).map((r) => (
          <div key={r.id} style={{
            padding: '8px 10px', background: MC.panel, border: `1px solid ${MC.border}`,
            borderLeft: r.status === 'RUNNING' ? `2px solid ${MC.phosphor}`
                      : r.status === 'FAILED' ? `2px solid ${MC.red}`
                      : `1px solid ${MC.border}`,
            marginBottom: 6, display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.text, ...MC_TABULAR }}>{r.id}</span>
              <RunStatusPill status={r.status}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textDim, ...MC_TABULAR }}>
              <span>{r.start.split(' ')[1]} · {r.dur.toFixed(1)}s</span>
              <span style={{ color: MC.text }}>${r.cost.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniKpi({ l, v, c }) {
  return (
    <div style={{ background: MC.panel, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontFamily: MC_FONT_MONO, fontSize: 8.5, letterSpacing: 1.5, color: MC.textMute }}>{l}</span>
      <span style={{ fontFamily: MC_FONT_MONO, fontSize: 16, color: c || MC.text, ...MC_TABULAR, fontWeight: 500 }}>{v}</span>
    </div>
  );
}

window.ScreenWorkflowDetail = ScreenWorkflowDetail;
window.ScreenWorkflowDetailMobile = ScreenWorkflowDetailMobile;
