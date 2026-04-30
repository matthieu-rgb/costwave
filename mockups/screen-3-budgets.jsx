// Screen 3 — Budgets · Mission Control
// PALETTE/TYPO/RAYONS : voir mc-tokens.jsx — aucune divergence.
// Re-used : MC, MC_FONT_MONO, MC_FONT_SANS, MC_TABULAR, MCI, ICON, MCBadge,
//           MCPanelHead, MCAnims, MC_GRID_BG, MC_GRID_SIZE.
// Specifics : gauge SVG circulaire avec arc colore par seuil (phosphor < 50,
//             amber 50-75, red > 90). Tabular-nums sur tous les montants.
//             Modal "+ NEW.BUDGET" overlay avec form labels uppercase.

const BUDGETS = [
  { name: 'GLOBAL.MONTHLY',     scope: 'ALL.PROVIDERS',      period: 'APRIL 2026',    used: 412.18, max: 800,  unit: 'USD' },
  { name: 'ANTHROPIC.SONNET',   scope: 'anthropic / sonnet', period: 'APRIL 2026',    used: 184.20, max: 200,  unit: 'USD' },
  { name: 'CC.RADAR.SESSIONS',  scope: 'claude-code',        period: 'WEEKLY',        used: 38.42,  max: 50,   unit: 'USD' },
  { name: 'OPENAI.GPT5',        scope: 'openai / gpt-5',     period: 'APRIL 2026',    used: 142.80, max: 300,  unit: 'USD' },
  { name: 'GROQ.LLAMA',         scope: 'groq / llama-4',     period: 'APRIL 2026',    used: 4.10,   max: 100,  unit: 'USD' },
  { name: 'MISTRAL.LARGE',      scope: 'mistral / large-3',  period: 'APRIL 2026',    used: 89.40,  max: 100,  unit: 'USD' },
  { name: 'TEAM.EXPERIMENTS',   scope: 'tag:experiment',     period: 'APRIL 2026',    used: 22.18,  max: 100,  unit: 'USD' },
  { name: 'PROD.CHECKOUT',      scope: 'tag:prod / checkout',period: 'APRIL 2026',    used: 612.40, max: 600,  unit: 'USD' },
];

function BudgetGauge({ pct, size = 140 }) {
  const r = size / 2 - 10;
  const c = size / 2;
  const tone = pct >= 100 ? MC.red : pct >= 90 ? MC.red : pct >= 75 ? MC.amber : MC.phosphor;
  const circumference = 2 * Math.PI * r;
  const start = -135; // degrees
  const sweep = 270;  // total arc
  const usedSweep = (Math.min(pct, 100) / 100) * sweep;
  const polar = (deg, rad) => {
    const a = (deg - 90) * Math.PI / 180;
    return [c + Math.cos(a) * rad, c + Math.sin(a) * rad];
  };
  const arcPath = (from, to, rad) => {
    const [x1, y1] = polar(from, rad);
    const [x2, y2] = polar(to, rad);
    const large = Math.abs(to - from) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${rad} ${rad} 0 ${large} 1 ${x2} ${y2}`;
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path d={arcPath(start, start + sweep, r)} stroke={MC.borderSoft} strokeWidth="3" fill="none"/>
      {/* Threshold ticks at 50/75/90 */}
      {[50, 75, 90].map((p) => {
        const ang = start + (p / 100) * sweep;
        const [x1, y1] = polar(ang, r - 6);
        const [x2, y2] = polar(ang, r + 6);
        const tc = p === 90 ? MC.red : p === 75 ? MC.amber : MC.textMute;
        return <line key={p} x1={x1} y1={y1} x2={x2} y2={y2} stroke={tc} strokeWidth="1" opacity="0.7"/>;
      })}
      {pct > 0 && (
        <path d={arcPath(start, start + usedSweep, r)} stroke={tone} strokeWidth="3" fill="none" strokeLinecap="butt"/>
      )}
      {/* Cursor */}
      {(() => {
        const [px, py] = polar(start + usedSweep, r);
        return <circle cx={px} cy={py} r="3.5" fill={MC.bg} stroke={tone} strokeWidth="1.5"/>;
      })()}
      <text x={c} y={c - 2} textAnchor="middle" fontSize="22" fontFamily={MC_FONT_MONO} fill={MC.text} fontWeight="600" style={MC_TABULAR}>
        {pct.toFixed(0)}<tspan fontSize="11" fill={MC.textMute}>%</tspan>
      </text>
      <text x={c} y={c + 14} textAnchor="middle" fontSize="8" fontFamily={MC_FONT_MONO} fill={MC.textMute} letterSpacing="1.5">CONSUMED</text>
    </svg>
  );
}

function BudgetCard({ b }) {
  const pct = (b.used / b.max) * 100;
  const breach = pct >= 100;
  const crit   = pct >= 90 && !breach;
  const warn   = pct >= 75 && !crit && !breach;
  const tone = breach ? 'crit' : crit ? 'crit' : warn ? 'warn' : 'info';
  return (
    <div style={{
      background: MC.panel, border: `1px solid ${breach ? 'hsl(0 60% 30%)' : MC.border}`,
      borderLeft: breach ? `2px solid ${MC.red}` : `1px solid ${MC.border}`,
      padding: '14px 14px 12px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 230,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: MC_FONT_MONO, fontSize: 11.5, color: MC.text, letterSpacing: 1, fontWeight: 600 }}>{b.name}</div>
          <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1, marginTop: 4 }}>// {b.scope}</div>
        </div>
        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: MC.textMute }}>
          <MCI d={ICON.more} size={14}/>
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <BudgetGauge pct={pct}/>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 8, borderTop: `1px solid ${MC.borderSoft}`,
        fontFamily: MC_FONT_MONO, ...MC_TABULAR,
      }}>
        <span style={{ fontSize: 11, color: MC.text }}>
          ${b.used.toFixed(2)} <span style={{ color: MC.textMute }}>/ ${b.max.toFixed(0)}</span>
        </span>
        <span style={{ fontSize: 9, color: MC.textMute, letterSpacing: 1 }}>{b.period}</span>
      </div>
      <div style={{ display: 'flex' }}>
        <MCBadge tone={tone} dot={breach || crit} blink={breach}>
          {breach ? 'BREACH · OVER' : crit ? 'CRIT · 90%' : warn ? 'WARN · 75%' : 'NOMINAL'}
        </MCBadge>
      </div>
    </div>
  );
}

function NewBudgetModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(7,9,11,0.78)',
      display: 'grid', placeItems: 'center', zIndex: 50, backdropFilter: 'blur(2px)',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 520, background: MC.panel, border: `1px solid ${MC.border}`,
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: 0, top: 0, height: 1, background: `linear-gradient(90deg, ${MC.phosphor}, transparent 60%)`, opacity: 0.5 }}/>
        <div style={{
          padding: '12px 16px', borderBottom: `1px solid ${MC.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: MC.textMute,
        }}>
          <span>NEW.BUDGET / CONFIGURE</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: MC.textMute, cursor: 'pointer' }}>
            <MCI d={ICON.x} size={12}/>
          </button>
        </div>
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="NAME" value="GLOBAL.MONTHLY" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="SCOPE" value="all.providers" select />
            <Field label="PERIOD" value="MONTHLY" select />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="LIMIT (USD)" value="800.00" mono />
            <Field label="ALERT.AT (%)" value="75 / 90" mono />
          </div>
          <div>
            <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: MC.textMute, marginBottom: 6 }}>NOTIFICATIONS</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <MCBadge tone="info" dot>EMAIL</MCBadge>
              <MCBadge tone="mute">SLACK</MCBadge>
              <MCBadge tone="mute">WEBHOOK</MCBadge>
            </div>
          </div>
        </div>
        <div style={{
          padding: '12px 16px', borderTop: `1px solid ${MC.border}`,
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button onClick={onClose} style={{
            padding: '7px 14px', background: 'transparent', border: `1px solid ${MC.border}`,
            color: MC.textDim, fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5, cursor: 'pointer',
          }}>CANCEL</button>
          <button style={{
            padding: '7px 14px', background: MC.text, border: `1px solid ${MC.text}`,
            color: MC.bg, fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5, cursor: 'pointer', fontWeight: 600,
          }}>CREATE.BUDGET →</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, select, mono }) {
  return (
    <div>
      <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: MC.textMute, marginBottom: 5 }}>{label}</div>
      <div style={{
        height: 32, padding: '0 10px',
        background: MC.bg, border: `1px solid ${MC.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: MC_FONT_MONO, fontSize: 11, color: MC.text, ...MC_TABULAR,
      }}>
        <span>{value}</span>
        {select && <MCI d={ICON.chevDn} size={11} c={MC.textMute}/>}
      </div>
    </div>
  );
}

function ScreenBudgets({ mobile }) {
  const [open, setOpen] = React.useState(false);
  if (mobile) return <ScreenBudgetsMobile/>;
  return (
    <div style={{
      width: 1280, height: 820, background: MC.bg, color: MC.text,
      fontFamily: MC_FONT_SANS, display: 'flex', flexDirection: 'column',
      backgroundImage: MC_GRID_BG, backgroundSize: MC_GRID_SIZE,
      borderRadius: 6, overflow: 'hidden', position: 'relative',
    }}>
      <MCAnims/>
      <header style={{
        height: 38, padding: '0 14px', borderBottom: `1px solid ${MC.border}`,
        display: 'flex', alignItems: 'center', gap: 14, fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textDim,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: MC.text, letterSpacing: 1.5 }}>
          <MCI d={ICON.shield} size={12}/> BUDGETS
        </span>
        <span style={{ color: MC.textMute }}>·</span>
        <span>{BUDGETS.length} CONFIGURED · 1 BREACH · 1 WARN</span>
        <div style={{ flex: 1 }}/>
        <span style={{ color: MC.textMute, ...MC_TABULAR }}>UPDATED 12s</span>
      </header>

      {/* Top summary strip */}
      <div style={{
        padding: '14px 18px', borderBottom: `1px solid ${MC.border}`,
        display: 'flex', alignItems: 'center', gap: 24, background: MC.panel,
      }}>
        <div>
          <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: MC.textMute }}>BUDGETS.HEALTH</div>
          <div style={{ fontFamily: MC_FONT_MONO, fontSize: 22, color: MC.text, marginTop: 4, ...MC_TABULAR }}>6 <span style={{ color: MC.textMute, fontSize: 13 }}>/ {BUDGETS.length}</span> <span style={{ color: MC.phosphor, fontSize: 11 }}>NOMINAL</span></div>
        </div>
        <div style={{ width: 1, height: 36, background: MC.border }}/>
        <div>
          <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: MC.textMute }}>SPEND / TOTAL</div>
          <div style={{ fontFamily: MC_FONT_MONO, fontSize: 22, color: MC.text, marginTop: 4, ...MC_TABULAR }}>$1,505 <span style={{ color: MC.textMute, fontSize: 13 }}>/ $2,250</span></div>
        </div>
        <div style={{ width: 1, height: 36, background: MC.border }}/>
        <div>
          <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: MC.textMute }}>BREACH / CRIT / WARN</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <MCBadge tone="crit" dot blink>1 BREACH</MCBadge>
            <MCBadge tone="warn">1 WARN</MCBadge>
            <MCBadge tone="info">6 OK</MCBadge>
          </div>
        </div>
        <div style={{ flex: 1 }}/>
        <button onClick={() => setOpen(true)} style={{
          padding: '8px 14px', background: MC.text, color: MC.bg,
          border: `1px solid ${MC.text}`, fontFamily: MC_FONT_MONO, fontSize: 10.5, letterSpacing: 1.5,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600,
        }}>
          <MCI d={ICON.plus} size={11}/> NEW.BUDGET
        </button>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, padding: 12, overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {BUDGETS.map((b, i) => <BudgetCard key={i} b={b}/>)}
        </div>
      </div>

      <NewBudgetModal open={open} onClose={() => setOpen(false)}/>
    </div>
  );
}

function ScreenBudgetsMobile() {
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
        <span style={{ color: MC.phosphor, fontSize: 9 }}>● 09:14:22</span>
      </div>
      <div style={{ padding: '8px 16px', borderBottom: `1px solid ${MC.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <MCI d={ICON.shield} size={13}/>
        <span style={{ fontFamily: MC_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: MC.text }}>BUDGETS</span>
        <span style={{ flex: 1 }}/>
        <button style={{ background: MC.text, color: MC.bg, padding: '5px 10px', border: 'none', fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1.5, fontWeight: 600 }}>+ NEW</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {BUDGETS.slice(0, 6).map((b, i) => <BudgetCard key={i} b={b}/>)}
      </div>
    </div>
  );
}

window.ScreenBudgets = ScreenBudgets;
window.ScreenBudgetsMobile = ScreenBudgetsMobile;
