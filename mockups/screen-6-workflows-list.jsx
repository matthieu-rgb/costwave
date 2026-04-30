// Screen 6 — Workflows List · Mission Control
// Vue LISTE de tous les workflows automatises, toutes sources confondues.
// Re-utilise mc-tokens.jsx : MC, MC_FONT_MONO, MC_FONT_SANS, MC_TABULAR,
//                            MCI, ICON, MCBadge, MCDot, MCPanelHead, MCAnims,
//                            MC_GRID_BG, MC_GRID_SIZE.
//
// Discipline : phosphor reserve aux workflows en RUNNING.
// 0px radius cards, border-left 2px reservee aux statuts, lucide stroke 1.5.

// ─── Data fictive coherente ─────────────────────────────────────────────────

const SOURCES = {
  'claude.code':    { label: 'CLAUDE.CODE',     c: MC.phosphor, icon: ICON.bolt },
  'n8n':            { label: 'N8N',             c: MC.amber,    icon: ICON.flow },
  'github.actions': { label: 'GITHUB.ACTIONS',  c: MC.violet,   icon: ICON.github },
  'cron':           { label: 'CRON',            c: '#7BA8E8',   icon: ICON.refresh },
  'python.script':  { label: 'PYTHON.SCRIPT',   c: MC.green,    icon: ICON.term },
};

const WORKFLOWS = [
  { id: 'WF-001', name: 'claude-code/refactor-auth',          src: 'claude.code',    status: 'RUNNING', last: '2m ago',   runs: 14,   err: 0.0,  cost: 12.84,  spark: [4,6,5,9,7,11,12] },
  { id: 'WF-002', name: 'claude-code/migrate-db-schema',      src: 'claude.code',    status: 'IDLE',    last: '4h ago',   runs: 3,    err: 0.0,  cost: 8.42,   spark: [2,3,4,2,3,4,3] },
  { id: 'WF-003', name: 'claude-code/generate-tests',         src: 'claude.code',    status: 'RUNNING', last: '12s ago',  runs: 47,   err: 2.1,  cost: 34.18,  spark: [12,14,11,18,16,22,21] },
  { id: 'WF-004', name: 'n8n/daily-tldr-digest',              src: 'n8n',            status: 'IDLE',    last: '7h ago',   runs: 7,    err: 0.0,  cost: 4.21,   spark: [1,1,1,1,1,1,1] },
  { id: 'WF-005', name: 'n8n/slack-alert',                    src: 'n8n',            status: 'RUNNING', last: '34s ago',  runs: 284,  err: 0.4,  cost: 1.87,   spark: [42,38,44,41,39,46,48] },
  { id: 'WF-006', name: 'n8n/notion-sync-incidents',          src: 'n8n',            status: 'FAILING', last: '11m ago',  runs: 96,   err: 14.6, cost: 6.32,   spark: [12,14,11,18,16,22,21] },
  { id: 'WF-007', name: 'n8n/sendgrid-onboarding',            src: 'n8n',            status: 'IDLE',    last: '1d ago',   runs: 18,   err: 0.0,  cost: 2.04,   spark: [3,2,3,2,3,3,2] },
  { id: 'WF-008', name: 'github-actions/ci-tests',            src: 'github.actions', status: 'RUNNING', last: '1m ago',   runs: 156,  err: 3.2,  cost: 22.14,  spark: [22,24,21,28,26,32,31] },
  { id: 'WF-009', name: 'github-actions/deploy-staging',      src: 'github.actions', status: 'IDLE',    last: '2h ago',   runs: 12,   err: 0.0,  cost: 3.42,   spark: [0,1,0,1,1,0,1] },
  { id: 'WF-010', name: 'github-actions/release-publish',     src: 'github.actions', status: 'FAILING', last: '38m ago',  runs: 4,    err: 25.0, cost: 1.18,   spark: [0,0,1,0,1,0,0] },
  { id: 'WF-011', name: 'cron/db-backup-daily',               src: 'cron',           status: 'IDLE',    last: '6h ago',   runs: 7,    err: 0.0,  cost: 0.84,   spark: [1,1,1,1,1,1,1] },
  { id: 'WF-012', name: 'cron/cache-warmer',                  src: 'cron',           status: 'IDLE',    last: '14m ago',  runs: 168,  err: 0.6,  cost: 0.42,   spark: [24,24,24,24,24,24,24] },
  { id: 'WF-013', name: 'python/rss-feed-parser',             src: 'python.script',  status: 'RUNNING', last: '52s ago',  runs: 336,  err: 1.2,  cost: 5.72,   spark: [48,46,52,49,47,54,52] },
  { id: 'WF-014', name: 'python/scrape-pricing-page',         src: 'python.script',  status: 'IDLE',    last: '3h ago',   runs: 24,   err: 4.2,  cost: 1.96,   spark: [3,4,3,4,3,4,3] },
];

// ─── Sparkline ──────────────────────────────────────────────────────────────

function MCSpark({ data, color = MC.phosphor, w = 70, h = 18 }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = i * stepX;
    const y = h - ((v - min) / range) * (h - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1" opacity="0.85"/>
      <circle cx={(data.length - 1) * stepX} cy={h - ((data[data.length - 1] - min) / range) * (h - 2) - 1}
        r="1.6" fill={color}/>
    </svg>
  );
}

// ─── Filter chips ───────────────────────────────────────────────────────────

function MCChip({ active, onClick, color, children, count }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 9px',
      background: active ? MC.panel2 : 'transparent',
      border: `1px solid ${active ? (color || MC.text) : MC.border}`,
      color: active ? (color || MC.text) : MC.textDim,
      fontFamily: MC_FONT_MONO, fontSize: 9.5, letterSpacing: 1,
      textTransform: 'uppercase', cursor: 'pointer',
      borderRadius: 2, ...MC_TABULAR,
    }}>
      {children}
      {count !== undefined && (
        <span style={{ color: MC.textMute, fontSize: 9 }}>{count}</span>
      )}
    </button>
  );
}

// ─── Status pill ────────────────────────────────────────────────────────────

function StatusPill({ status }) {
  const map = {
    RUNNING: { c: MC.phosphor, bd: 'hsl(170 73% 24%)', bg: 'hsl(170 73% 8%)', dot: 'mc-blink 1.4s infinite' },
    IDLE:    { c: MC.textDim,  bd: MC.border,           bg: 'transparent',     dot: 'none' },
    FAILING: { c: MC.red,      bd: 'hsl(0 60% 28%)',    bg: 'hsl(0 60% 10%)',  dot: 'mc-blink 1.4s infinite' },
  }[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 8px',
      border: `1px solid ${map.bd}`, background: map.bg, color: map.c,
      fontFamily: MC_FONT_MONO, fontSize: 9.5, letterSpacing: 1,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: 99, background: map.c,
        boxShadow: `0 0 5px ${map.c}`, animation: map.dot,
      }}/>
      {status}
    </span>
  );
}

// ─── Source badge ───────────────────────────────────────────────────────────

function SourceBadge({ src }) {
  const s = SOURCES[src];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 8px',
      border: `1px solid ${MC.border}`, background: MC.panel,
      color: s.c,
      fontFamily: MC_FONT_MONO, fontSize: 9.5, letterSpacing: 1,
    }}>
      <MCI d={s.icon} size={11} c={s.c}/>
      <span>{s.label}</span>
    </span>
  );
}

// ─── Top filter bar ─────────────────────────────────────────────────────────

function FiltersBar({ activeSrc, setActiveSrc, activeStatus, setActiveStatus, view, setView, search, setSearch, total }) {
  const counts = {};
  WORKFLOWS.forEach(w => { counts[w.src] = (counts[w.src] || 0) + 1; });
  const statusCounts = {
    RUNNING: WORKFLOWS.filter(w => w.status === 'RUNNING').length,
    IDLE:    WORKFLOWS.filter(w => w.status === 'IDLE').length,
    FAILING: WORKFLOWS.filter(w => w.status === 'FAILING').length,
  };
  return (
    <div style={{ borderBottom: `1px solid ${MC.border}`, background: MC.panel }}>
      {/* Row 1 : search + view toggle */}
      <div style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${MC.borderSoft}` }}>
        <span style={{ fontFamily: MC_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: MC.text, fontWeight: 600 }}>// WORKFLOWS</span>
        <span style={{ fontFamily: MC_FONT_MONO, fontSize: 9.5, color: MC.textMute, letterSpacing: 1, ...MC_TABULAR }}>{total} TOTAL · 5 RUNNING · 2 FAILING</span>

        <div style={{ flex: 1 }}/>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 10px', border: `1px solid ${MC.border}`, background: MC.bg,
          minWidth: 280, borderRadius: 2,
        }}>
          <MCI d={ICON.search} size={12} c={MC.textMute}/>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search workflows...   /"
            style={{
              flex: 1, background: 'transparent', border: 0, outline: 0,
              color: MC.text, fontFamily: MC_FONT_MONO, fontSize: 11, letterSpacing: 0.3,
            }}/>
          <kbd style={{
            padding: '1px 5px', border: `1px solid ${MC.border}`,
            color: MC.textMute, fontFamily: MC_FONT_MONO, fontSize: 8.5,
            letterSpacing: 0.5, borderRadius: 2,
          }}>/</kbd>
        </div>

        {/* View toggle */}
        <div style={{ display: 'inline-flex', border: `1px solid ${MC.border}`, borderRadius: 2 }}>
          {['table', 'cards'].map((v) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '5px 10px',
              background: view === v ? MC.panel2 : 'transparent',
              color: view === v ? MC.text : MC.textDim,
              border: 0,
              fontFamily: MC_FONT_MONO, fontSize: 9.5, letterSpacing: 1,
              textTransform: 'uppercase', cursor: 'pointer',
            }}>{v}</button>
          ))}
        </div>

        <button style={{
          padding: '5px 12px',
          background: MC.text, color: MC.bg, border: 0,
          fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1, fontWeight: 600,
          textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <MCI d={ICON.plus} size={11} c={MC.bg}/>
          NEW.WORKFLOW
        </button>
      </div>

      {/* Row 2 : source chips */}
      <div style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', borderBottom: `1px solid ${MC.borderSoft}` }}>
        <span style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1.5, marginRight: 4 }}>SOURCE</span>
        <MCChip active={activeSrc === null} onClick={() => setActiveSrc(null)} count={WORKFLOWS.length}>ALL</MCChip>
        {Object.entries(SOURCES).map(([k, s]) => (
          <MCChip key={k} active={activeSrc === k} onClick={() => setActiveSrc(activeSrc === k ? null : k)} color={s.c} count={counts[k] || 0}>
            {s.label}
          </MCChip>
        ))}
        <span style={{ flex: 1 }}/>
        <span style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1.5 }}>GROUP.BY</span>
        <select style={{
          padding: '3px 8px', background: MC.bg, color: MC.text, border: `1px solid ${MC.border}`,
          fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 0.5, borderRadius: 2,
        }} defaultValue="source">
          <option value="none">none</option>
          <option value="source">source</option>
          <option value="status">status</option>
        </select>
      </div>

      {/* Row 3 : status chips */}
      <div style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1.5, marginRight: 4 }}>STATUS</span>
        <MCChip active={activeStatus === null} onClick={() => setActiveStatus(null)} count={WORKFLOWS.length}>ALL</MCChip>
        <MCChip active={activeStatus === 'RUNNING'} onClick={() => setActiveStatus(activeStatus === 'RUNNING' ? null : 'RUNNING')} color={MC.phosphor} count={statusCounts.RUNNING}>● RUNNING</MCChip>
        <MCChip active={activeStatus === 'IDLE'} onClick={() => setActiveStatus(activeStatus === 'IDLE' ? null : 'IDLE')} count={statusCounts.IDLE}>IDLE</MCChip>
        <MCChip active={activeStatus === 'FAILING'} onClick={() => setActiveStatus(activeStatus === 'FAILING' ? null : 'FAILING')} color={MC.red} count={statusCounts.FAILING}>● FAILING</MCChip>
        <span style={{ flex: 1 }}/>
        <span style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1.5, ...MC_TABULAR }}>SHOWING {WORKFLOWS.length}/{WORKFLOWS.length}</span>
      </div>
    </div>
  );
}

// ─── Table view ─────────────────────────────────────────────────────────────

const COLS = [
  { k: 'name',   l: 'WORKFLOW',         w: '24%', a: 'left' },
  { k: 'src',    l: 'SOURCE',           w: '12%', a: 'left' },
  { k: 'status', l: 'STATUS',           w: '10%', a: 'left' },
  { k: 'last',   l: 'LAST.RUN',         w: '9%',  a: 'left' },
  { k: 'runs',   l: 'RUNS.7D',          w: '8%',  a: 'right' },
  { k: 'err',    l: 'ERROR.RATE',       w: '9%',  a: 'right' },
  { k: 'cost',   l: 'COST.MTD',         w: '10%', a: 'right' },
  { k: 'spark',  l: 'COST.7D',          w: '10%', a: 'left' },
  { k: 'act',    l: '',                 w: '8%',  a: 'right' },
];

function WorkflowsTable({ rows }) {
  const groups = {};
  rows.forEach((r) => {
    if (!groups[r.src]) groups[r.src] = [];
    groups[r.src].push(r);
  });

  const [collapsed, setCollapsed] = React.useState({});
  const [expanded, setExpanded] = React.useState(null);

  return (
    <div style={{ background: MC.panel, border: `1px solid ${MC.border}` }}>
      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: COLS.map(c => c.w).join(' '),
        background: MC.bg, borderBottom: `1px solid ${MC.border}`,
      }}>
        {COLS.map((c, i) => (
          <div key={i} style={{
            padding: '8px 12px', textAlign: c.a,
            fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: MC.textMute,
          }}>{c.l}</div>
        ))}
      </div>

      {/* Groups */}
      {Object.entries(groups).map(([srcKey, items]) => {
        const src = SOURCES[srcKey];
        const isCollapsed = collapsed[srcKey];
        const totalCost = items.reduce((s, w) => s + w.cost, 0);
        return (
          <div key={srcKey}>
            {/* Group header */}
            <div onClick={() => setCollapsed({ ...collapsed, [srcKey]: !isCollapsed })} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 12px', background: MC.panel2,
              borderBottom: `1px solid ${MC.borderSoft}`, cursor: 'pointer',
            }}>
              <MCI d={isCollapsed ? ICON.chev : ICON.chevDn} size={11} c={MC.textDim}/>
              <MCI d={src.icon} size={11} c={src.c}/>
              <span style={{ fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: src.c }}>{src.label}</span>
              <span style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1, ...MC_TABULAR }}>{items.length} WORKFLOWS</span>
              <span style={{ flex: 1 }}/>
              <span style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1 }}>SUBTOTAL</span>
              <span style={{ fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.text, ...MC_TABULAR }}>${totalCost.toFixed(2)}</span>
            </div>

            {/* Rows */}
            {!isCollapsed && items.map((r, i) => {
              const isExp = expanded === r.id;
              const errColor = r.err === 0 ? MC.textDim : r.err < 5 ? MC.amber : MC.red;
              const sparkColor = r.status === 'RUNNING' ? MC.phosphor : r.status === 'FAILING' ? MC.red : MC.textDim;
              return (
                <React.Fragment key={r.id}>
                  <div onClick={() => setExpanded(isExp ? null : r.id)} style={{
                    display: 'grid', gridTemplateColumns: COLS.map(c => c.w).join(' '),
                    borderBottom: `1px solid ${MC.borderSoft}`,
                    borderLeft: r.status === 'RUNNING' ? `2px solid ${MC.phosphor}`
                              : r.status === 'FAILING' ? `2px solid ${MC.red}`
                              : '2px solid transparent',
                    cursor: 'pointer',
                    background: isExp ? MC.panel2 : 'transparent',
                  }}>
                    {/* name */}
                    <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: MC_FONT_MONO, fontSize: 10.5, color: MC.text, letterSpacing: 0.3 }}>{r.name}</span>
                    </div>
                    {/* src */}
                    <div style={{ padding: '8px 12px' }}>
                      <SourceBadge src={r.src}/>
                    </div>
                    {/* status */}
                    <div style={{ padding: '8px 12px' }}>
                      <StatusPill status={r.status}/>
                    </div>
                    {/* last */}
                    <div style={{ padding: '8px 12px', fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textDim, ...MC_TABULAR }}>{r.last}</div>
                    {/* runs */}
                    <div style={{ padding: '8px 12px', fontFamily: MC_FONT_MONO, fontSize: 10.5, color: MC.text, textAlign: 'right', ...MC_TABULAR }}>{r.runs}</div>
                    {/* err */}
                    <div style={{ padding: '8px 12px', fontFamily: MC_FONT_MONO, fontSize: 10.5, color: errColor, textAlign: 'right', ...MC_TABULAR }}>{r.err.toFixed(1)}%</div>
                    {/* cost */}
                    <div style={{ padding: '8px 12px', fontFamily: MC_FONT_MONO, fontSize: 11, color: MC.text, textAlign: 'right', ...MC_TABULAR, fontWeight: 500 }}>${r.cost.toFixed(2)}</div>
                    {/* spark */}
                    <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center' }}>
                      <MCSpark data={r.spark} color={sparkColor}/>
                    </div>
                    {/* actions */}
                    <div style={{ padding: '6px 12px', display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      <RowAction icon={ICON.chev} label="DETAIL"/>
                      <RowAction icon={r.status === 'RUNNING' ? ICON.power : ICON.refresh} label={r.status === 'RUNNING' ? 'PAUSE' : 'RUN'}/>
                      <RowAction icon={ICON.edit} label="EDIT"/>
                    </div>
                  </div>
                  {isExp && (
                    <div style={{
                      padding: '12px 18px 14px 18px',
                      borderBottom: `1px solid ${MC.borderSoft}`,
                      borderLeft: r.status === 'RUNNING' ? `2px solid ${MC.phosphor}`
                                : r.status === 'FAILING' ? `2px solid ${MC.red}`
                                : '2px solid transparent',
                      background: MC.bg,
                      fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textDim,
                      display: 'flex', gap: 32,
                    }}>
                      <div>
                        <div style={{ color: MC.textMute, letterSpacing: 1.5, fontSize: 9 }}>WORKFLOW.ID</div>
                        <div style={{ color: MC.text, marginTop: 3, ...MC_TABULAR }}>{r.id}</div>
                      </div>
                      <div>
                        <div style={{ color: MC.textMute, letterSpacing: 1.5, fontSize: 9 }}>AVG.DURATION</div>
                        <div style={{ color: MC.text, marginTop: 3, ...MC_TABULAR }}>{(r.runs > 50 ? 1.2 : 4.8).toFixed(1)}s</div>
                      </div>
                      <div>
                        <div style={{ color: MC.textMute, letterSpacing: 1.5, fontSize: 9 }}>COST.PER.RUN</div>
                        <div style={{ color: MC.text, marginTop: 3, ...MC_TABULAR }}>${(r.cost / r.runs).toFixed(4)}</div>
                      </div>
                      <div style={{ flex: 1 }}/>
                      <div style={{ color: MC.textMute, letterSpacing: 1, fontSize: 9 }}>// click to open detail view →</div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function RowAction({ icon, label }) {
  return (
    <button onClick={(e) => e.stopPropagation()} style={{
      padding: '4px 6px', background: 'transparent', border: `1px solid transparent`,
      color: MC.textMute, cursor: 'pointer', borderRadius: 2,
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontFamily: MC_FONT_MONO, fontSize: 8.5, letterSpacing: 1,
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = MC.border; e.currentTarget.style.color = MC.text; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = MC.textMute; }}
    >
      <MCI d={icon} size={11}/>
    </button>
  );
}

// ─── Cards view ─────────────────────────────────────────────────────────────

function WorkflowsCards({ rows }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
    }}>
      {rows.map((r) => {
        const errColor = r.err === 0 ? MC.textDim : r.err < 5 ? MC.amber : MC.red;
        const sparkColor = r.status === 'RUNNING' ? MC.phosphor : r.status === 'FAILING' ? MC.red : MC.textDim;
        return (
          <div key={r.id} style={{
            background: MC.panel,
            border: `1px solid ${MC.border}`,
            borderLeft: r.status === 'RUNNING' ? `2px solid ${MC.phosphor}`
                      : r.status === 'FAILING' ? `2px solid ${MC.red}`
                      : `1px solid ${MC.border}`,
            padding: 12, display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <SourceBadge src={r.src}/>
              <StatusPill status={r.status}/>
            </div>
            <div style={{ fontFamily: MC_FONT_MONO, fontSize: 12, color: MC.text, letterSpacing: 0.3 }}>{r.name}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontFamily: MC_FONT_MONO, fontSize: 9.5, ...MC_TABULAR }}>
              <Mini l="LAST" v={r.last} c={MC.textDim}/>
              <Mini l="RUNS" v={r.runs} c={MC.text}/>
              <Mini l="ERR" v={`${r.err.toFixed(1)}%`} c={errColor}/>
              <Mini l="COST" v={`$${r.cost.toFixed(2)}`} c={MC.text}/>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
              <span style={{ fontFamily: MC_FONT_MONO, fontSize: 8.5, letterSpacing: 1.5, color: MC.textMute }}>COST.7D</span>
              <MCSpark data={r.spark} color={sparkColor} w={120}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Mini({ l, v, c }) {
  return (
    <div>
      <div style={{ color: MC.textMute, letterSpacing: 1.5, fontSize: 8.5 }}>{l}</div>
      <div style={{ color: c, marginTop: 2 }}>{v}</div>
    </div>
  );
}

// ─── Top bar (app shell) ────────────────────────────────────────────────────

function WFTopBar() {
  return (
    <header style={{
      height: 40, padding: '0 18px',
      borderBottom: `1px solid ${MC.border}`,
      display: 'flex', alignItems: 'center', gap: 18,
      fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textDim,
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <MCI d={ICON.flow} size={12} c={MC.text}/>
        <span style={{ color: MC.text, letterSpacing: 1.5, fontWeight: 600 }}>COSTWAVE</span>
        <span style={{ color: MC.textMute }}>/</span>
        <span style={{ color: MC.textDim, letterSpacing: 1 }}>workflows</span>
      </span>
      <span style={{ flex: 1 }}/>
      <span style={{ color: MC.textMute, letterSpacing: 1.5 }}>MTD.SPEND</span>
      <span style={{ color: MC.text, ...MC_TABULAR }}>$105.66</span>
      <span style={{ color: MC.textMute }}>·</span>
      <span style={{ color: MC.textMute, letterSpacing: 1.5 }}>14 WORKFLOWS</span>
    </header>
  );
}

// ─── Main screen ────────────────────────────────────────────────────────────

function ScreenWorkflowsList({ mobile }) {
  if (mobile) return <ScreenWorkflowsListMobile/>;

  const [activeSrc, setActiveSrc] = React.useState(null);
  const [activeStatus, setActiveStatus] = React.useState(null);
  const [view, setView] = React.useState('table');
  const [search, setSearch] = React.useState('');

  const rows = WORKFLOWS.filter((w) => {
    if (activeSrc && w.src !== activeSrc) return false;
    if (activeStatus && w.status !== activeStatus) return false;
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{
      width: 1280, height: 820, background: MC.bg, color: MC.text,
      fontFamily: MC_FONT_SANS, display: 'flex', flexDirection: 'column',
      backgroundImage: MC_GRID_BG, backgroundSize: MC_GRID_SIZE,
      borderRadius: 6, overflow: 'hidden',
    }}>
      <MCAnims/>
      <WFTopBar/>
      <FiltersBar
        activeSrc={activeSrc} setActiveSrc={setActiveSrc}
        activeStatus={activeStatus} setActiveStatus={setActiveStatus}
        view={view} setView={setView}
        search={search} setSearch={setSearch}
        total={WORKFLOWS.length}/>
      <div style={{ flex: 1, padding: 12, overflow: 'auto', minHeight: 0 }}>
        {view === 'table' ? <WorkflowsTable rows={rows}/> : <WorkflowsCards rows={rows}/>}
      </div>
    </div>
  );
}

// ─── Mobile ─────────────────────────────────────────────────────────────────

function ScreenWorkflowsListMobile() {
  return (
    <div style={{
      width: 390, height: 844, background: MC.bg, color: MC.text,
      fontFamily: MC_FONT_SANS, display: 'flex', flexDirection: 'column',
      backgroundImage: MC_GRID_BG, backgroundSize: MC_GRID_SIZE,
      borderRadius: 6, overflow: 'hidden',
    }}>
      <MCAnims/>
      <div style={{ height: 38, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: MC_FONT_MONO, fontSize: 11 }}>
        <span>9:41</span>
        <span style={{ color: MC.text, letterSpacing: 1.5, fontWeight: 600 }}>COSTWAVE / workflows</span>
      </div>
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${MC.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 9px', border: `1px solid ${MC.border}`, background: MC.bg, borderRadius: 2,
        }}>
          <MCI d={ICON.search} size={11} c={MC.textMute}/>
          <input placeholder="search..." style={{
            flex: 1, background: 'transparent', border: 0, outline: 0,
            color: MC.text, fontFamily: MC_FONT_MONO, fontSize: 11,
          }}/>
        </div>
        <button style={{
          padding: '5px 10px', background: MC.text, color: MC.bg, border: 0,
          fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1, fontWeight: 600,
          cursor: 'pointer', borderRadius: 2,
        }}>NEW</button>
      </div>
      <div style={{ padding: '8px 14px', display: 'flex', gap: 6, overflowX: 'auto', borderBottom: `1px solid ${MC.borderSoft}` }}>
        <MCChip active>ALL <span style={{ color: MC.textMute }}>14</span></MCChip>
        <MCChip color={MC.phosphor}>● RUNNING <span style={{ color: MC.textMute }}>5</span></MCChip>
        <MCChip>IDLE <span style={{ color: MC.textMute }}>7</span></MCChip>
        <MCChip color={MC.red}>● FAILING <span style={{ color: MC.textMute }}>2</span></MCChip>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {WORKFLOWS.slice(0, 8).map((r) => {
          const errColor = r.err === 0 ? MC.textDim : r.err < 5 ? MC.amber : MC.red;
          const sparkColor = r.status === 'RUNNING' ? MC.phosphor : r.status === 'FAILING' ? MC.red : MC.textDim;
          return (
            <div key={r.id} style={{
              background: MC.panel,
              border: `1px solid ${MC.border}`,
              borderLeft: r.status === 'RUNNING' ? `2px solid ${MC.phosphor}`
                        : r.status === 'FAILING' ? `2px solid ${MC.red}`
                        : `1px solid ${MC.border}`,
              padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <SourceBadge src={r.src}/>
                <StatusPill status={r.status}/>
              </div>
              <div style={{ fontFamily: MC_FONT_MONO, fontSize: 11, color: MC.text }}>{r.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: MC_FONT_MONO, fontSize: 9.5, ...MC_TABULAR }}>
                <span style={{ color: MC.textDim }}>{r.last} · {r.runs} runs · <span style={{ color: errColor }}>{r.err.toFixed(1)}%</span></span>
                <span style={{ color: MC.text, fontWeight: 500 }}>${r.cost.toFixed(2)}</span>
              </div>
              <MCSpark data={r.spark} color={sparkColor} w={358} h={20}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.ScreenWorkflowsList = ScreenWorkflowsList;
window.ScreenWorkflowsListMobile = ScreenWorkflowsListMobile;
window.WORKFLOWS = WORKFLOWS;
window.SOURCES = SOURCES;
window.SourceBadge = SourceBadge;
window.StatusPill = StatusPill;
window.MCSpark = MCSpark;
