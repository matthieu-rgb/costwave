// Screen 2 — Claude Code Radar · Mission Control
// PALETTE/TYPO/RAYONS : voir mc-tokens.jsx — aucune divergence.
// Re-used : MC, MC_FONT_MONO, MC_FONT_SANS, MC_TABULAR, MCI, ICON, MCBadge,
//           MCDot, MCPanelHead, MCAnims, MC_GRID_BG, MC_GRID_SIZE.
// Specifics : phosphor reserve au mouvement temps reel (sweep, edges actives,
//             event log new). Sub-agents en couleurs assignees mais desaturees.
//             Files = rectangles compact 0px radius. Tabular-nums sur tokens/cost.

const SUB_AGENTS = [
  { id: 'A1', name: 'EXPLORER',  color: MC.phosphor, status: 'run',  task: 'scan src/components',     ang: 35,  r: 130 },
  { id: 'A2', name: 'TEST.RUN',  color: MC.amber,    status: 'run',  task: 'jest --watch payments',   ang: 105, r: 145 },
  { id: 'A3', name: 'GREP',      color: MC.green,    status: 'ok',   task: 'find auth() refs',        ang: 175, r: 125 },
  { id: 'A4', name: 'TYPECHECK', color: MC.violet,   status: 'run',  task: 'tsc --noEmit',            ang: 245, r: 150 },
  { id: 'A5', name: 'LINTER',    color: '#7BA8E8',   status: 'warn', task: '14 issues found',         ang: 305, r: 130 },
];

const FILES = [
  { ext: 'TSX', name: 'PaymentForm',     ang: 20,  r: 250, active: true,  agent: 'A1' },
  { ext: 'TS',  name: 'authMiddleware',  ang: 55,  r: 240, active: true,  agent: 'A1' },
  { ext: 'TS',  name: 'stripe.client',   ang: 90,  r: 260, active: false, agent: 'A2' },
  { ext: 'TS',  name: 'payments.test',   ang: 120, r: 245, active: true,  agent: 'A2' },
  { ext: 'TSX', name: 'CheckoutPage',    ang: 160, r: 255, active: false, agent: 'A3' },
  { ext: 'TS',  name: 'useAuth.hook',    ang: 200, r: 250, active: false, agent: 'A3' },
  { ext: 'TS',  name: 'types/User',      ang: 235, r: 245, active: true,  agent: 'A4' },
  { ext: 'TS',  name: 'api/orders',      ang: 270, r: 260, active: false, agent: 'A4' },
  { ext: 'CSS', name: 'tokens.global',   ang: 295, r: 240, active: false, agent: 'A5' },
  { ext: 'TSX', name: 'Button.primary',  ang: 325, r: 250, active: true,  agent: 'A5' },
];

const EVENTS = [
  { t: '+00:14.2', tag: 'TOOL',  agent: 'A2', msg: 'jest payments.test → 14/14 passed', tone: 'ok' },
  { t: '+00:13.8', tag: 'READ',  agent: 'A1', msg: 'src/components/PaymentForm.tsx (842 lines)', tone: 'info' },
  { t: '+00:12.1', tag: 'EDIT',  agent: 'A4', msg: 'types/User.ts +12 -4', tone: 'info' },
  { t: '+00:10.4', tag: 'TOOL',  agent: 'A5', msg: 'eslint --fix → 14 warnings', tone: 'warn' },
  { t: '+00:09.0', tag: 'GREP',  agent: 'A3', msg: '"useAuth\\(\\)" → 23 matches in 14 files', tone: 'info' },
  { t: '+00:07.6', tag: 'READ',  agent: 'A1', msg: 'src/middleware/authMiddleware.ts', tone: 'info' },
  { t: '+00:05.2', tag: 'WRITE', agent: 'A4', msg: 'tsc → no errors (4.2s)', tone: 'ok' },
  { t: '+00:03.8', tag: 'TOOL',  agent: 'A2', msg: 'jest --watch payments started', tone: 'info' },
  { t: '+00:01.2', tag: 'PLAN',  agent: '——', msg: 'spawned 5 sub-agents · refactor payments flow', tone: 'info' },
];

function RadarGraph() {
  const W = 620, H = 540, cx = W / 2, cy = H / 2;
  const [sweep, setSweep] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setSweep((s) => (s + 1.4) % 360), 33);
    return () => clearInterval(id);
  }, []);
  const polar = (ang, r) => [cx + Math.cos((ang - 90) * Math.PI / 180) * r, cy + Math.sin((ang - 90) * Math.PI / 180) * r];
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="rad-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={MC.phosphor} stopOpacity="0.06"/>
          <stop offset="100%" stopColor={MC.phosphor} stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="rad-sweep" x1="0" x2="1">
          <stop offset="0%" stopColor={MC.phosphor} stopOpacity="0"/>
          <stop offset="100%" stopColor={MC.phosphor} stopOpacity="0.45"/>
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={280} fill="url(#rad-glow)"/>
      {[80, 130, 190, 250, 290].map((r) => (
        <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke={MC.border} strokeDasharray={r === 290 ? '0' : '2 4'} opacity={r === 290 ? 0.9 : 0.5}/>
      ))}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const [x2, y2] = polar(a, 290);
        return <line key={a} x1={cx} y1={cy} x2={x2} y2={y2} stroke={MC.border} strokeDasharray="1 6" opacity="0.4"/>;
      })}
      {/* Sweep arm */}
      <g transform={`rotate(${sweep} ${cx} ${cy})`}>
        <path d={`M ${cx} ${cy} L ${cx + 290} ${cy} A 290 290 0 0 0 ${cx + 290 * Math.cos(-Math.PI / 4)} ${cy + 290 * Math.sin(-Math.PI / 4)} Z`} fill="url(#rad-sweep)"/>
        <line x1={cx} y1={cy} x2={cx + 290} y2={cy} stroke={MC.phosphor} strokeWidth="1"/>
      </g>
      {/* Connections agent → file */}
      {FILES.map((f, i) => {
        const ag = SUB_AGENTS.find((a) => a.id === f.agent);
        if (!ag) return null;
        const [ax, ay] = polar(ag.ang, ag.r);
        const [fx, fy] = polar(f.ang, f.r);
        return (
          <line key={i} x1={ax} y1={ay} x2={fx} y2={fy}
            stroke={f.active ? ag.color : MC.border}
            strokeWidth={f.active ? 1 : 0.5}
            opacity={f.active ? 0.6 : 0.4}
            strokeDasharray={f.active ? '0' : '2 3'}/>
        );
      })}
      {/* Center → agent */}
      {SUB_AGENTS.map((a) => {
        const [x, y] = polar(a.ang, a.r);
        return <line key={a.id} x1={cx} y1={cy} x2={x} y2={y} stroke={a.color} strokeWidth={a.status === 'run' ? 1 : 0.6} opacity={a.status === 'run' ? 0.7 : 0.35}/>;
      })}
      {/* Center main agent */}
      <circle cx={cx} cy={cy} r="34" fill={MC.bgGrid} stroke={MC.phosphor} strokeWidth="1.5"/>
      <circle cx={cx} cy={cy} r="44" fill="none" stroke={MC.phosphor} strokeWidth="1" opacity="0.4">
        <animate attributeName="r" values="34;52;34" dur="2.4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite"/>
      </circle>
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fontFamily={MC_FONT_MONO} fill={MC.phosphor} letterSpacing="2" fontWeight="600">CLAUDE</text>
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize="9" fontFamily={MC_FONT_MONO} fill={MC.textMute} letterSpacing="1.5">SONNET-4-5</text>
      {/* Sub-agents */}
      {SUB_AGENTS.map((a) => {
        const [x, y] = polar(a.ang, a.r);
        return (
          <g key={a.id}>
            <circle cx={x} cy={y} r="14" fill={MC.bgGrid} stroke={a.color} strokeWidth="1.2"/>
            {a.status === 'run' && (
              <circle cx={x} cy={y} r="14" fill="none" stroke={a.color} strokeWidth="1" opacity="0.4">
                <animate attributeName="r" values="14;24;14" dur="1.8s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.5;0;0.5" dur="1.8s" repeatCount="indefinite"/>
              </circle>
            )}
            <text x={x} y={y + 3} textAnchor="middle" fontSize="9" fontFamily={MC_FONT_MONO} fill={a.color} fontWeight="600">{a.id}</text>
            <text x={x} y={y + 28} textAnchor="middle" fontSize="8.5" fontFamily={MC_FONT_MONO} fill={MC.textDim} letterSpacing="1">{a.name}</text>
          </g>
        );
      })}
      {/* Files */}
      {FILES.map((f, i) => {
        const [x, y] = polar(f.ang, f.r);
        const w = 86, h = 22;
        const ag = SUB_AGENTS.find((a) => a.id === f.agent);
        const c = f.active ? ag.color : MC.textMute;
        return (
          <g key={i}>
            <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={MC.bgGrid} stroke={f.active ? c : MC.border} strokeWidth={f.active ? 1 : 0.6}/>
            <rect x={x - w / 2} y={y - h / 2} width={26} height={h} fill={f.active ? c : MC.border} opacity={f.active ? 0.18 : 0.5}/>
            <text x={x - w / 2 + 13} y={y + 3.5} textAnchor="middle" fontSize="8" fontFamily={MC_FONT_MONO} fill={f.active ? c : MC.textDim} fontWeight="600">{f.ext}</text>
            <text x={x - w / 2 + 32} y={y + 3.5} fontSize="8.5" fontFamily={MC_FONT_MONO} fill={f.active ? MC.text : MC.textDim}>{f.name}</text>
          </g>
        );
      })}
      {/* Cardinal labels */}
      {[
        { l: '000°', a: 0 }, { l: '090°', a: 90 }, { l: '180°', a: 180 }, { l: '270°', a: 270 },
      ].map((p) => {
        const [x, y] = polar(p.a, 302);
        return <text key={p.l} x={x} y={y + 3} textAnchor="middle" fontSize="8" fontFamily={MC_FONT_MONO} fill={MC.textMute} letterSpacing="1">{p.l}</text>;
      })}
    </svg>
  );
}

function ScreenRadar({ mobile }) {
  if (mobile) return <ScreenRadarMobile />;
  const ctxUsed = 45000, ctxMax = 1000000, ctxPct = (ctxUsed / ctxMax) * 100;
  return (
    <div style={{
      width: 1280, height: 820, background: MC.bg, color: MC.text,
      fontFamily: MC_FONT_SANS, display: 'flex', flexDirection: 'column',
      backgroundImage: MC_GRID_BG, backgroundSize: MC_GRID_SIZE,
      borderRadius: 6, overflow: 'hidden',
    }}>
      <MCAnims />
      <header style={{
        height: 38, padding: '0 14px', borderBottom: `1px solid ${MC.border}`,
        display: 'flex', alignItems: 'center', gap: 14, fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textDim,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <MCI d={ICON.radar} size={12} c={MC.phosphor}/> <span style={{ color: MC.text, letterSpacing: 1.5 }}>CC.RADAR</span>
        </span>
        <span style={{ color: MC.textMute }}>·</span>
        <span style={{ color: MC.textDim, ...MC_TABULAR }}>SESSION 0xA4F2-9C81</span>
        <span style={{ color: MC.textMute }}>·</span>
        <span style={{ color: MC.text }}>refactor payments flow</span>
        <div style={{ flex: 1 }}/>
        {/* Context window meter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: MC.textMute, letterSpacing: 1.5 }}>CTX.WINDOW</span>
          <div style={{ width: 160, height: 5, background: MC.borderSoft, position: 'relative' }}>
            <div style={{ width: `${ctxPct}%`, height: '100%', background: MC.phosphor }}/>
            {[25, 50, 75].map((p) => <div key={p} style={{ position: 'absolute', left: `${p}%`, top: -1, bottom: -1, width: 1, background: MC.bg }}/>)}
          </div>
          <span style={{ color: MC.text, ...MC_TABULAR }}>45k / 1,000k</span>
          <span style={{ color: MC.phosphor, ...MC_TABULAR }}>{ctxPct.toFixed(1)}%</span>
        </div>
      </header>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 0, minHeight: 0 }}>
        {/* Radar canvas */}
        <div style={{ position: 'relative', borderRight: `1px solid ${MC.border}` }}>
          {/* corner read-outs */}
          <div style={{ position: 'absolute', top: 12, left: 14, fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1.5, lineHeight: 1.7 }}>
            <div>// SCAN.MODE  ACTIVE</div>
            <div>// AGENTS     <span style={{ color: MC.text }}>5 / 8</span></div>
            <div>// FILES      <span style={{ color: MC.text }}>10 SEEN · 5 LIVE</span></div>
            <div>// COST.TOK   <span style={{ color: MC.text, ...MC_TABULAR }}>$0.184</span></div>
          </div>
          <div style={{ position: 'absolute', top: 12, right: 14, fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1.5, textAlign: 'right', lineHeight: 1.7 }}>
            <div>RUNTIME    <span style={{ color: MC.text, ...MC_TABULAR }}>14.2s</span></div>
            <div>RPS        <span style={{ color: MC.text, ...MC_TABULAR }}>3.2</span></div>
            <div>LATENCY    <span style={{ color: MC.text, ...MC_TABULAR }}>1.42s</span></div>
            <div>STATUS     <span style={{ color: MC.phosphor }}>● TRACKING</span></div>
          </div>
          <div style={{ position: 'absolute', inset: 0 }}>
            <RadarGraph/>
          </div>
          {/* Bottom legend */}
          <div style={{
            position: 'absolute', bottom: 10, left: 14, right: 14,
            display: 'flex', justifyContent: 'space-between',
            fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1.5,
          }}>
            <span>──── CONNECTION ACTIVE   - - - IDLE</span>
            <span>RANGE 290PX · 1U = ~10ms LATENCY</span>
          </div>
        </div>

        {/* Right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Sub-agents */}
          <div style={{ borderBottom: `1px solid ${MC.border}` }}>
            <MCPanelHead title="SUB-AGENTS" right={`${SUB_AGENTS.length} ACTIVE`}/>
            <div>
              {SUB_AGENTS.map((a, i) => (
                <div key={a.id} style={{
                  padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10,
                  borderBottom: i < SUB_AGENTS.length - 1 ? `1px solid ${MC.borderSoft}` : 'none',
                  borderLeft: a.status === 'crit' ? `2px solid ${MC.red}` : a.status === 'warn' ? `2px solid ${MC.amber}` : '2px solid transparent',
                }}>
                  <MCDot status={a.status}/>
                  <span style={{ width: 26, fontFamily: MC_FONT_MONO, fontSize: 10, color: a.color, fontWeight: 600 }}>{a.id}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: MC_FONT_MONO, fontSize: 10.5, color: MC.text, letterSpacing: 1 }}>{a.name}</div>
                    <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.task}</div>
                  </div>
                  <span style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, ...MC_TABULAR }}>{(2 + i * 1.7).toFixed(1)}s</span>
                </div>
              ))}
            </div>
          </div>

          {/* Files */}
          <div style={{ borderBottom: `1px solid ${MC.border}`, flex: '0 0 auto' }}>
            <MCPanelHead title="FILES.SEEN" right={`${FILES.length} TOTAL · ${FILES.filter(f => f.active).length} LIVE`}/>
            <div style={{ maxHeight: 154, overflow: 'auto' }}>
              {FILES.map((f, i) => (
                <div key={i} style={{
                  padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: MC_FONT_MONO, fontSize: 10, ...MC_TABULAR,
                }}>
                  <span style={{ width: 28, color: f.active ? MC.phosphor : MC.textMute, fontSize: 9 }}>{f.ext}</span>
                  <span style={{ flex: 1, color: f.active ? MC.text : MC.textDim }}>{f.name}</span>
                  {f.active && <span style={{ color: MC.phosphor, fontSize: 8, animation: 'mc-blink 1.6s infinite' }}>●</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Event stream */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <MCPanelHead title="EVENT.STREAM" right="LIVE · 9 EVENTS"/>
            <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
              {EVENTS.map((e, i) => {
                const tone = e.tone === 'ok' ? MC.green : e.tone === 'warn' ? MC.amber : e.tone === 'crit' ? MC.red : MC.phosphor;
                return (
                  <div key={i} style={{
                    padding: '4px 14px',
                    fontFamily: MC_FONT_MONO, fontSize: 9.5, ...MC_TABULAR,
                    display: 'flex', gap: 8, alignItems: 'flex-start',
                    borderLeft: i === 0 ? `2px solid ${MC.phosphor}` : '2px solid transparent',
                    background: i === 0 ? 'hsl(170 73% 8%)' : 'transparent',
                  }}>
                    <span style={{ color: MC.textMute, width: 56 }}>{e.t}</span>
                    <span style={{ color: tone, width: 38 }}>{e.tag}</span>
                    <span style={{ color: MC.textDim, width: 20 }}>{e.agent}</span>
                    <span style={{ color: MC.text, flex: 1 }}>{e.msg}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenRadarMobile() {
  return (
    <div style={{
      width: 390, height: 844, background: MC.bg, color: MC.text,
      fontFamily: MC_FONT_SANS, display: 'flex', flexDirection: 'column',
      backgroundImage: MC_GRID_BG, backgroundSize: MC_GRID_SIZE,
      borderRadius: 6, overflow: 'hidden',
    }}>
      <MCAnims />
      <div style={{ height: 38, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: MC_FONT_MONO, fontSize: 11 }}>
        <span>9:41</span>
        <span style={{ color: MC.phosphor, fontSize: 9 }}>● TRACKING</span>
      </div>
      <div style={{ padding: '8px 16px', borderBottom: `1px solid ${MC.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <MCI d={ICON.radar} size={14} c={MC.phosphor}/>
        <span style={{ fontFamily: MC_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: MC.text }}>CC.RADAR</span>
        <span style={{ flex: 1 }}/>
        <span style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, ...MC_TABULAR }}>45k / 1M · 4.5%</span>
      </div>
      <div style={{ height: 320, position: 'relative', borderBottom: `1px solid ${MC.border}` }}>
        <RadarGraph/>
      </div>
      <div style={{ borderBottom: `1px solid ${MC.border}` }}>
        <MCPanelHead title="SUB-AGENTS" right="5 ACTIVE"/>
        <div style={{ maxHeight: 130, overflow: 'auto' }}>
          {SUB_AGENTS.map((a, i) => (
            <div key={a.id} style={{
              padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8,
              borderBottom: i < SUB_AGENTS.length - 1 ? `1px solid ${MC.borderSoft}` : 'none',
            }}>
              <MCDot status={a.status}/>
              <span style={{ fontFamily: MC_FONT_MONO, fontSize: 10, color: a.color, fontWeight: 600 }}>{a.id}</span>
              <span style={{ fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.text, letterSpacing: 1, flex: 1 }}>{a.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <MCPanelHead title="EVENT.STREAM" right="LIVE"/>
        <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
          {EVENTS.slice(0, 6).map((e, i) => {
            const tone = e.tone === 'ok' ? MC.green : e.tone === 'warn' ? MC.amber : MC.phosphor;
            return (
              <div key={i} style={{
                padding: '4px 14px', fontFamily: MC_FONT_MONO, fontSize: 9.5, ...MC_TABULAR,
                display: 'flex', gap: 6,
                borderLeft: i === 0 ? `2px solid ${MC.phosphor}` : '2px solid transparent',
              }}>
                <span style={{ color: MC.textMute, width: 50 }}>{e.t}</span>
                <span style={{ color: tone, width: 36 }}>{e.tag}</span>
                <span style={{ color: MC.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.msg}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.ScreenRadar = ScreenRadar;
window.ScreenRadarMobile = ScreenRadarMobile;
