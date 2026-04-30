// ─────────────────────────────────────────────────────────────
// MC TOKENS — single source of truth for Mission Control direction.
// Every screen MUST import these. No new colors, no new fonts.
// ─────────────────────────────────────────────────────────────
//
// PALETTE (HSL — Tailwind v4 / shadcn ready)
//   bg          hsl(210 14% 4%)   #07090B   page background
//   bg-grid     hsl(210 14% 7%)   #0D1115   dot-grid + panel
//   panel       hsl(210 14% 7%)   #0D1115   card surface
//   panel-2     hsl(210 14% 9%)   #11161B   raised inside panel
//   border      hsl(210 17% 13%)  #1A2128   divider lvl 1
//   border-soft hsl(210 17% 9%)   #11161B   divider lvl 0
//   text        hsl(210 17% 88%)  #D8E1E8   primary
//   text-dim    hsl(210 11% 56%)  #7B8893   secondary
//   text-mute   hsl(210 9% 38%)   #4C5963   tertiary / labels
//   phosphor    hsl(170 73% 64%)  #5EE6D0   LIVE + UP positifs uniquement
//   amber       hsl(34 73% 67%)   #E8B86B   WARN / 75% / latence
//   red         hsl(0 84% 68%)    #F26B6B   CRIT / BREACH / FAILED
//   green       hsl(150 71% 64%)  #5EE6A0   OK / SUCCESS (statique)
//   violet      hsl(258 88% 76%)  #A78BFA   GROQ uniquement
//
// TYPO
//   IBM Plex Mono 400/500/600 — DOMINANT (80%) : labels, valeurs, IDs, tables.
//                                                Tracking 1-1.5px sur uppercase.
//   Inter 400/500/600          — RESERVE       : titres editorialises uniquement
//                                                (h1/h2 landing, hero copy).
//   Numerals : font-variant-numeric: tabular-nums + 'tnum' 1 PARTOUT.
//
// SPACING / RADII
//   Padding card    : 12-14px (compact panels), 18-22px (landing hero only)
//   Gap entre cards : 8-10px (cockpit), 14-16px (landing)
//   Radius          : 0px sur tous les panels et cards (anti-rounded)
//                     2-3px max sur badges/inputs/bars
//                     RIEN au-dessus de 4px. Aucune card pillule.
//   Border-width    : 1px stricte. Border-left 2px reserve aux statuts severite.
//
// DISCIPLINE PHOSPHOR
//   Phosphor cyan = LIVE / UP positif / cursor temps reel UNIQUEMENT.
//   Aucun bouton primaire en phosphor. Aucun gradient hero en phosphor.
//   Aucun logo glow phosphor sauf "● LIVE" indicators.
//
// ICONS
//   Lucide stroke 1.5 partout. Pas d'emoji. Pas de gradients.
//
// ─────────────────────────────────────────────────────────────

const MC = {
  bg:         '#07090B',
  bgGrid:     '#0D1115',
  panel:      '#0D1115',
  panel2:     '#11161B',
  border:     '#1A2128',
  borderSoft: '#11161B',
  text:       '#D8E1E8',
  textDim:    '#7B8893',
  textMute:   '#4C5963',
  phosphor:   '#5EE6D0',
  amber:      '#E8B86B',
  red:        '#F26B6B',
  redDim:     'hsl(0 60% 28%)',
  green:      '#5EE6A0',
  violet:     '#A78BFA',
};

const MC_FONT_MONO = `'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace`;
const MC_FONT_SANS = `'Inter', -apple-system, system-ui, sans-serif`;
const MC_TABULAR   = { fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum" 1' };

const MC_GRID_BG = `radial-gradient(${MC.bgGrid} 1px, transparent 1px)`;
const MC_GRID_SIZE = '20px 20px';

// Lucide-ish icons (stroke 1.5)
const MCI = ({ d, size = 14, c = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style}>{d}</svg>
);

const ICON = {
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
  arrLeft: <><path d="M19 12H5M12 19l-7-7 7-7"/></>,
  bell:    <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
  plus:    <><path d="M12 5v14M5 12h14"/></>,
  x:       <><path d="M18 6L6 18M6 6l12 12"/></>,
  chev:    <><path d="M9 18l6-6-6-6"/></>,
  chevDn:  <><path d="M6 9l6 6 6-6"/></>,
  more:    <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
  user:    <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  key:     <><path d="M21 2l-9.6 9.6a5.5 5.5 0 1 0 1 1L14 11h2v-2h2v-2h2zM7.5 19.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></>,
  card:    <><rect x="2" y="6" width="20" height="12" rx="1"/><line x1="2" y1="10" x2="22" y2="10"/></>,
  shield:  <><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z"/></>,
  copy:    <><rect x="9" y="9" width="13" height="13" rx="1"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
  refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></>,
  edit:    <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></>,
  trash:   <><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>,
  file:    <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></>,
  github:  <><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></>,
  globe:   <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/></>,
  check:   <><path d="M20 6L9 17l-5-5"/></>,
  rocket:  <><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></>,
  zap:     <><path d="M13 2L3 14h8l-1 8 10-12h-8z"/></>,
  device:  <><rect x="2" y="3" width="20" height="14" rx="1"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
  smart:   <><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></>,
  lock:    <><rect x="3" y="11" width="18" height="11" rx="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
};

// Wordmark Costwave (Mission Control variant) — square emblem + uppercase mono
function MCWordmark({ size = 22 }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 11,
      fontFamily: MC_FONT_MONO,
    }}>
      <div style={{
        width: size + 4, height: size + 4,
        border: `1.5px solid ${MC.phosphor}`,
        display: 'grid', placeItems: 'center',
        position: 'relative',
      }}>
        <div style={{ width: size - 12, height: size - 12, background: MC.phosphor }} />
        {/* Crosshair tics */}
        {[
          { t: -3, l: -3, w: 5, h: 1 }, { t: -3, l: -3, w: 1, h: 5 },
          { b: -3, r: -3, w: 5, h: 1 }, { b: -3, r: -3, w: 1, h: 5 },
        ].map((p, i) => (
          <div key={i} style={{
            position: 'absolute', background: MC.phosphor,
            top: p.t, left: p.l, bottom: p.b, right: p.r,
            width: p.w, height: p.h,
          }}/>
        ))}
      </div>
      <span style={{
        fontSize: size * 0.78, color: MC.text,
        fontWeight: 600, letterSpacing: 3,
      }}>COSTWAVE</span>
    </div>
  );
}

// Generic panel header
function MCPanelHead({ title, right, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', borderBottom: `1px solid ${MC.border}`,
      fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5,
      color: MC.textMute, textTransform: 'uppercase',
    }}>
      <span>{title}</span>
      <span style={{ color: MC.textDim, fontSize: 9 }}>{right || children}</span>
    </div>
  );
}

// Generic badge
function MCBadge({ tone = 'info', children, dot, blink }) {
  const palette = {
    info:  { c: MC.phosphor, bd: 'hsl(170 73% 30%)', bg: 'hsl(170 73% 8%)' },
    warn:  { c: MC.amber,    bd: 'hsl(34 73% 30%)',  bg: 'hsl(34 73% 8%)' },
    crit:  { c: MC.red,      bd: 'hsl(0 60% 32%)',   bg: 'hsl(0 60% 10%)' },
    ok:    { c: MC.green,    bd: 'hsl(150 71% 28%)', bg: 'hsl(150 71% 7%)' },
    mute:  { c: MC.textDim,  bd: MC.border,          bg: MC.bgGrid },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px',
      border: `1px solid ${palette.bd}`, background: palette.bg, color: palette.c,
      fontFamily: MC_FONT_MONO, fontSize: 9.5, letterSpacing: 1,
      textTransform: 'uppercase',
    }}>
      {dot && <span style={{
        width: 5, height: 5, borderRadius: 99, background: palette.c,
        animation: blink ? 'mc-blink 1.2s infinite' : 'none',
      }}/>}
      {children}
    </span>
  );
}

// Status dot (run / ok / warn / crit)
function MCDot({ status, size = 6 }) {
  const c = status === 'run' ? MC.phosphor
          : status === 'ok'  ? MC.green
          : status === 'warn'? MC.amber
          : status === 'crit'? MC.red
          : MC.textMute;
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: size + 2, height: size + 2, verticalAlign: 'middle' }}>
      <span style={{
        position: 'absolute', top: 1, left: 1, width: size, height: size,
        borderRadius: 99, background: c,
        animation: status === 'crit' ? 'mc-blink 1.2s infinite' : 'none',
      }}/>
      {status === 'run' && (
        <span style={{
          position: 'absolute', inset: 0, borderRadius: 99, background: c,
          opacity: 0.4, animation: 'mc-pulse 1.6s infinite',
        }}/>
      )}
    </span>
  );
}

// Common keyframes injection (any screen can drop this once)
function MCAnims() {
  return (
    <style>{`
      @keyframes mc-pulse { 0% { transform: scale(1); opacity: 0.5 } 100% { transform: scale(2.5); opacity: 0 } }
      @keyframes mc-blink { 50% { opacity: 0.35 } }
      @keyframes mc-scan  { 0% { transform: rotate(0) } 100% { transform: rotate(360deg) } }
      @keyframes mc-tick  { 0% { opacity: 1 } 100% { opacity: 0 } }
    `}</style>
  );
}

Object.assign(window, {
  MC, MC_FONT_MONO, MC_FONT_SANS, MC_TABULAR,
  MC_GRID_BG, MC_GRID_SIZE,
  MCI, ICON, MCWordmark, MCPanelHead, MCBadge, MCDot, MCAnims,
});
