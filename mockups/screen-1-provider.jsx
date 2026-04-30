// Screen 1 — Provider detail · Mission Control
// PALETTE/TYPO/RAYONS : voir mc-tokens.jsx — aucune divergence.
// Re-used : MC, MC_FONT_MONO, MC_FONT_SANS, MC_TABULAR, MCI, ICON, MCBadge,
//           MCDot, MCPanelHead, MCAnims, MC_GRID_BG, MC_GRID_SIZE.
// Specifics : monospace dominant, tabular-nums sur toutes les colonnes
//             cost / tokens / latency / %, rayons 0px, phosphor reserve aux
//             signaux LIVE et UP positifs (downward-cost = phosphor; up-cost = red).

function ProviderCostChart() {
  const days = 30;
  const data = React.useMemo(() => {
    let v = 12;
    return Array.from({ length: days }, (_, i) => {
      v += Math.sin(i * 0.5) * 1.5 + (Math.random() - 0.45) * 2.0 + (i > 18 ? 0.4 : 0);
      v = Math.max(4, Math.min(28, v));
      return v;
    });
  }, []);
  const W = 760, H = 200, pad = { l: 38, r: 14, t: 14, b: 26 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  const max = 30;
  const x = (i) => pad.l + (i / (days - 1)) * innerW;
  const y = (v) => pad.t + innerH - (v / max) * innerH;
  const line = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(days - 1)} ${pad.t + innerH} L${pad.l} ${pad.t + innerH} Z`;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="prov-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={MC.phosphor} stopOpacity="0.22" />
          <stop offset="100%" stopColor={MC.phosphor} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 10, 20, 30].map((g) => (
        <g key={g}>
          <line x1={pad.l} x2={W - pad.r} y1={y(g)} y2={y(g)} stroke={MC.border} strokeDasharray="2 4" opacity="0.6" />
          <text x={pad.l - 6} y={y(g) + 3} textAnchor="end" fontSize="9" fontFamily={MC_FONT_MONO} fill={MC.textMute}>${g}</text>
        </g>
      ))}
      {[0, 7, 14, 21, 29].map((i) => (
        <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="9" fontFamily={MC_FONT_MONO} fill={MC.textMute}>
          {i === 29 ? 'NOW' : `D-${29 - i}`}
        </text>
      ))}
      <path d={area} fill="url(#prov-area)" />
      <path d={line} stroke={MC.phosphor} strokeWidth="1.2" fill="none" />
      <line x1={x(29)} x2={x(29)} y1={pad.t} y2={pad.t + innerH}
            stroke={MC.phosphor} strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
      <circle cx={x(29)} cy={y(data[29])} r="3" fill={MC.bg} stroke={MC.phosphor} strokeWidth="1.5" />
    </svg>
  );
}

function ProviderModelBars() {
  const models = [
    { n: 'claude-sonnet-4-5', cost: 184.20, share: 44.7, tok: '18.4M' },
    { n: 'claude-opus-4',     cost: 142.80, share: 34.7, tok: '8.2M' },
    { n: 'claude-haiku-4',    cost: 64.18,  share: 15.6, tok: '12.1M' },
    { n: 'claude-sonnet-3-7', cost: 21.00,  share: 5.0,  tok: '3.8M' },
  ];
  return (
    <div>
      {models.map((m, i) => (
        <div key={i} style={{ padding: '10px 0', borderBottom: i < 3 ? `1px solid ${MC.borderSoft}` : 'none' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginBottom: 5,
            fontFamily: MC_FONT_MONO, fontSize: 11, ...MC_TABULAR,
          }}>
            <span style={{ color: MC.text }}>{m.n}</span>
            <span style={{ color: MC.text }}>${m.cost.toFixed(2)} <span style={{ color: MC.textMute }}>{m.share.toFixed(1)}%</span></span>
          </div>
          <div style={{ height: 3, background: MC.borderSoft, marginBottom: 3 }}>
            <div style={{ width: `${m.share * 2}%`, height: '100%', background: MC.phosphor, opacity: 0.5 + (4 - i) * 0.12 }} />
          </div>
          <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, ...MC_TABULAR }}>{m.tok} tokens</div>
        </div>
      ))}
    </div>
  );
}

const SNAPS = [
  { ts: '2026-04-30 09:14:22', model: 'sonnet-4-5', tin: '24.1k', tout: '8.2k', lat: '1.42', cost: '0.184' },
  { ts: '2026-04-30 09:13:48', model: 'opus-4',     tin: '11.4k', tout: '14.8k', lat: '3.12', cost: '0.412' },
  { ts: '2026-04-30 09:12:01', model: 'haiku-4',    tin: '8.0k',  tout: '2.1k',  lat: '0.41', cost: '0.011' },
  { ts: '2026-04-30 09:10:59', model: 'sonnet-4-5', tin: '42.0k', tout: '12.4k', lat: '1.84', cost: '0.298' },
  { ts: '2026-04-30 09:08:14', model: 'sonnet-4-5', tin: '18.2k', tout: '6.4k',  lat: '1.21', cost: '0.142' },
  { ts: '2026-04-30 09:04:32', model: 'opus-4',     tin: '32.1k', tout: '24.8k', lat: '4.20', cost: '0.682' },
  { ts: '2026-04-30 08:58:01', model: 'haiku-4',    tin: '14.0k', tout: '4.2k',  lat: '0.38', cost: '0.018' },
  { ts: '2026-04-30 08:52:18', model: 'sonnet-3-7', tin: '8.8k',  tout: '2.0k',  lat: '1.04', cost: '0.041' },
];

function ScreenProvider({ mobile }) {
  if (mobile) return <ScreenProviderMobile />;
  return (
    <div style={{
      width: 1280, height: 820, background: MC.bg, color: MC.text,
      fontFamily: MC_FONT_SANS, display: 'flex', flexDirection: 'column',
      backgroundImage: MC_GRID_BG, backgroundSize: MC_GRID_SIZE, overflow: 'hidden', borderRadius: 6,
    }}>
      <MCAnims />
      {/* Top bar */}
      <header style={{
        height: 38, padding: '0 14px',
        borderBottom: `1px solid ${MC.border}`,
        display: 'flex', alignItems: 'center', gap: 12,
        fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textDim,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: MC.textDim, cursor: 'pointer' }}>
          <MCI d={ICON.arrLeft} size={11} /> OVERVIEW
        </span>
        <span style={{ color: MC.textMute }}>/</span>
        <span style={{ color: MC.textDim }}>PROVIDERS</span>
        <span style={{ color: MC.textMute }}>/</span>
        <span style={{ color: MC.text }}>ANTHROPIC</span>
        <div style={{ flex: 1 }} />
        <span style={{ color: MC.phosphor, ...MC_TABULAR }}>● SYNCED 12s</span>
        <span style={{ color: MC.textMute }}>UTC 09:14:22</span>
      </header>

      {/* Provider header */}
      <div style={{
        padding: '18px 22px', borderBottom: `1px solid ${MC.border}`,
        display: 'flex', alignItems: 'center', gap: 18, background: MC.panel,
      }}>
        <div style={{
          width: 48, height: 48, border: `1.5px solid ${MC.phosphor}`,
          display: 'grid', placeItems: 'center',
          fontFamily: MC_FONT_MONO, fontSize: 18, fontWeight: 600, color: MC.phosphor,
        }}>A</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: MC_FONT_MONO, fontSize: 18, fontWeight: 600, letterSpacing: 1 }}>ANTHROPIC</span>
            <MCBadge tone="info" dot blink>LIVE · POLLING 30s</MCBadge>
            <MCBadge tone="ok">CONNECTED</MCBadge>
          </div>
          <div style={{
            fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textMute, letterSpacing: 1, marginTop: 6,
            display: 'flex', gap: 14, ...MC_TABULAR,
          }}>
            <span>API.KEY <span style={{ color: MC.textDim }}>sk-ant-…7c2a</span></span>
            <span>REGION <span style={{ color: MC.textDim }}>EU-WEST</span></span>
            <span>ADDED <span style={{ color: MC.textDim }}>2026-01-12</span></span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={mcBtnSecondary}><MCI d={ICON.refresh} size={11}/> SYNC</button>
          <button style={mcBtnSecondary}><MCI d={ICON.edit} size={11}/> EDIT</button>
          <button style={mcBtnSecondary}><MCI d={ICON.more} size={11}/></button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, borderBottom: `1px solid ${MC.border}` }}>
        <KpiP label="MTD COST"     value="412.18" unit="USD"    delta="+38.4%" up />
        <KpiP label="REQUESTS"     value="14,824" unit="184/min" delta="+12.0%" up />
        <KpiP label="TOKENS · IN"  value="42.5M"                 delta="+18.4%" up />
        <KpiP label="TOKENS · OUT" value="11.8M"                 delta="-2.1%" />
      </div>

      {/* Main grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', gap: 8, padding: 12, overflow: 'hidden' }}>
        {/* Chart + table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
          <div style={{ background: MC.panel, border: `1px solid ${MC.border}`, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: MC.textMute }}>SPEND.30D · ANTHROPIC</span>
              <div style={{ display: 'flex', gap: 14, fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, ...MC_TABULAR }}>
                <span>AVG <span style={{ color: MC.text }}>$13.74/d</span></span>
                <span>PEAK <span style={{ color: MC.text }}>$28.40 · D-2</span></span>
                <span style={{ color: MC.phosphor }}>● LIVE</span>
              </div>
            </div>
            <ProviderCostChart />
          </div>

          <div style={{ background: MC.panel, border: `1px solid ${MC.border}`, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <MCPanelHead title="SNAPSHOTS · LAST 8 CALLS" right="14,824 TOTAL · 30D" />
            <div style={{ overflow: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: MC_FONT_MONO, fontSize: 10.5, ...MC_TABULAR }}>
                <thead>
                  <tr style={{ background: MC.bg }}>
                    {['TIMESTAMP', 'MODEL', 'TOK.IN', 'TOK.OUT', 'LAT(s)', 'COST'].map((h, i) => (
                      <th key={h} style={{
                        textAlign: i >= 2 ? 'right' : 'left', padding: '8px 14px',
                        fontSize: 9, letterSpacing: 1.5, color: MC.textMute, fontWeight: 500,
                        borderBottom: `1px solid ${MC.border}`, textTransform: 'uppercase',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SNAPS.map((s, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${MC.borderSoft}` }}>
                      <td style={{ padding: '8px 14px', color: MC.textDim }}>{s.ts}</td>
                      <td style={{ padding: '8px 14px', color: MC.text }}>{s.model}</td>
                      <td style={{ padding: '8px 14px', color: MC.textDim, textAlign: 'right' }}>{s.tin}</td>
                      <td style={{ padding: '8px 14px', color: MC.textDim, textAlign: 'right' }}>{s.tout}</td>
                      <td style={{ padding: '8px 14px', color: parseFloat(s.lat) > 3 ? MC.amber : MC.textDim, textAlign: 'right' }}>{s.lat}</td>
                      <td style={{ padding: '8px 14px', color: MC.text, textAlign: 'right' }}>${s.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
          <div style={{ background: MC.panel, border: `1px solid ${MC.border}` }}>
            <MCPanelHead title="MODELS · BREAKDOWN" right="4 ACTIVE" />
            <div style={{ padding: '4px 14px 12px' }}>
              <ProviderModelBars />
            </div>
          </div>

          <div style={{ background: MC.panel, border: `1px solid ${MC.border}`, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <MCPanelHead title="RATE LIMITS" right="ANTHROPIC" />
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              {[
                { n: 'TOKENS / MIN', use: 184000, max: 400000, c: MC.phosphor },
                { n: 'REQUESTS / MIN', use: 312, max: 1000, c: MC.phosphor },
                { n: 'INPUT TOK / DAY', use: 38400000, max: 50000000, c: MC.amber },
              ].map((r, i) => {
                const pct = (r.use / r.max) * 100;
                const tone = pct > 90 ? MC.red : pct > 75 ? MC.amber : MC.phosphor;
                return (
                  <div key={i}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textMute, marginBottom: 4, ...MC_TABULAR,
                    }}>
                      <span style={{ letterSpacing: 1 }}>{r.n}</span>
                      <span style={{ color: tone }}>{pct.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 4, background: MC.borderSoft, position: 'relative' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: tone }} />
                      {[50, 75, 90].map((p) => (
                        <div key={p} style={{ position: 'absolute', left: `${p}%`, top: -1, bottom: -1, width: 1, background: MC.bg }} />
                      ))}
                    </div>
                    <div style={{
                      fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, marginTop: 4, ...MC_TABULAR,
                    }}>
                      {r.use.toLocaleString()} / {r.max.toLocaleString()}
                    </div>
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

function KpiP({ label, value, unit, delta, up }) {
  return (
    <div style={{ background: MC.panel, border: `1px solid ${MC.border}`, padding: '12px 14px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, ${MC.phosphor} 0%, transparent 60%)`, opacity: 0.4 }} />
      <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: MC.textMute, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
        <span style={{ fontFamily: MC_FONT_MONO, fontSize: 22, color: MC.text, letterSpacing: -0.5, ...MC_TABULAR }}>{value}</span>
        {unit && <span style={{ fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textMute, ...MC_TABULAR }}>{unit}</span>}
      </div>
      {delta && (
        <div style={{
          fontFamily: MC_FONT_MONO, fontSize: 10, marginTop: 4, ...MC_TABULAR,
          color: up ? MC.red : MC.phosphor,
        }}>{up ? '↑' : '↓'} {delta.replace(/[+-]/, '')}</div>
      )}
    </div>
  );
}

const mcBtnSecondary = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '5px 11px', background: 'transparent',
  border: `1px solid ${MC.border}`, color: MC.textDim,
  fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1,
  cursor: 'pointer', textTransform: 'uppercase',
};

function ScreenProviderMobile() {
  return (
    <div style={{
      width: 390, height: 844, background: MC.bg, color: MC.text,
      fontFamily: MC_FONT_SANS, display: 'flex', flexDirection: 'column',
      borderRadius: 6, overflow: 'hidden',
      backgroundImage: MC_GRID_BG, backgroundSize: MC_GRID_SIZE,
    }}>
      <MCAnims />
      <div style={{ height: 38, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: MC_FONT_MONO, fontSize: 11 }}>
        <span>9:41</span>
        <span style={{ color: MC.phosphor, fontSize: 9, animation: 'mc-blink 2s infinite' }}>● LIVE 09:14:22</span>
      </div>
      <div style={{ padding: '8px 16px', borderBottom: `1px solid ${MC.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <MCI d={ICON.arrLeft} size={16} c={MC.textDim} />
        <span style={{ fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textMute, letterSpacing: 1.5 }}>PROVIDERS / ANTHROPIC</span>
      </div>
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${MC.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, border: `1.5px solid ${MC.phosphor}`, display: 'grid', placeItems: 'center', fontFamily: MC_FONT_MONO, fontSize: 14, color: MC.phosphor, fontWeight: 600 }}>A</div>
          <div>
            <div style={{ fontFamily: MC_FONT_MONO, fontSize: 14, fontWeight: 600, letterSpacing: 1 }}>ANTHROPIC</div>
            <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1, marginTop: 2 }}>sk-ant-…7c2a · EU-WEST</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <MCBadge tone="info" dot blink>LIVE</MCBadge>
          <MCBadge tone="ok">CONNECTED</MCBadge>
        </div>
      </div>
      <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, borderBottom: `1px solid ${MC.border}` }}>
        <KpiP label="MTD COST" value="412.18" unit="USD" delta="+38.4%" up />
        <KpiP label="REQ" value="14,824" delta="+12.0%" up />
        <KpiP label="TOK IN" value="42.5M" delta="+18.4%" up />
        <KpiP label="TOK OUT" value="11.8M" delta="-2.1%" />
      </div>
      <div style={{ padding: '12px 12px 0' }}>
        <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1.5, marginBottom: 6 }}>// SPEND.30D</div>
        <div style={{ background: MC.panel, border: `1px solid ${MC.border}`, padding: 8 }}>
          <ProviderCostChart />
        </div>
      </div>
      <div style={{ padding: '12px 12px 0', flex: 1, overflow: 'hidden' }}>
        <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1.5, marginBottom: 6 }}>// MODELS</div>
        <div style={{ background: MC.panel, border: `1px solid ${MC.border}`, padding: '4px 12px' }}>
          <ProviderModelBars />
        </div>
      </div>
    </div>
  );
}

window.ScreenProvider = ScreenProvider;
window.ScreenProviderMobile = ScreenProviderMobile;
