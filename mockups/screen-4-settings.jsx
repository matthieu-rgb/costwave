// Screen 4 — Settings · Mission Control
// PALETTE/TYPO/RAYONS : voir mc-tokens.jsx — aucune divergence.
// Re-used : MC, MC_FONT_MONO, MC_FONT_SANS, MC_TABULAR, MCI, ICON, MCBadge,
//           MCDot, MCPanelHead, MCAnims, MC_GRID_BG, MC_GRID_SIZE.
// Specifics : sections en cards (PROFILE / PROVIDERS / API.TOKENS / PREFERENCES /
//             BILLING). Token reveal en monospace style "secret revealed" avec
//             border phosphor + bg desature. Toggle = pill 0px radius.

const PROVIDERS_LIST = [
  { id: 'A', name: 'ANTHROPIC',  key: 'sk-ant-…7c2a',  status: 'run',  added: '2026-01-12', spend: '$412.18' },
  { id: 'O', name: 'OPENAI',     key: 'sk-…a91f',      status: 'run',  added: '2026-01-12', spend: '$142.80' },
  { id: 'G', name: 'GROQ',       key: 'gsk_…b428',     status: 'ok',   added: '2026-02-04', spend: '$4.10' },
  { id: 'M', name: 'MISTRAL',    key: 'mst_…c103',     status: 'warn', added: '2026-03-18', spend: '$89.40' },
  { id: 'X', name: 'XAI',        key: 'xai-…d710',     status: 'ok',   added: '—',          spend: '$0.00' },
];

const TOKENS_LIST = [
  { name: 'CLI · MAIN',          last: '4 min ago',   created: '2026-03-12', scope: 'read' },
  { name: 'GITHUB.ACTIONS',      last: '2 hours ago', created: '2026-02-28', scope: 'read · write' },
  { name: 'PWA · MOBILE',        last: '12 min ago',  created: '2026-04-12', scope: 'read' },
];

function SettingsSection({ id, title, sub, children }) {
  return (
    <div id={id} style={{
      background: MC.panel, border: `1px solid ${MC.border}`,
    }}>
      <div style={{
        padding: '12px 16px', borderBottom: `1px solid ${MC.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: MC_FONT_MONO,
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 1.5, color: MC.text, fontWeight: 600 }}>{title}</div>
          {sub && <div style={{ fontSize: 9, color: MC.textMute, letterSpacing: 1, marginTop: 3 }}>{sub}</div>}
        </div>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

function Toggle({ on }) {
  return (
    <div style={{
      width: 34, height: 16, border: `1px solid ${on ? MC.phosphor : MC.border}`,
      background: on ? 'hsl(170 73% 8%)' : MC.bg,
      position: 'relative', cursor: 'pointer',
    }}>
      <div style={{
        position: 'absolute', top: 1, left: on ? 18 : 1,
        width: 13, height: 12, background: on ? MC.phosphor : MC.textMute,
        transition: 'left 0.15s',
      }}/>
    </div>
  );
}

function SettingRow({ label, hint, control }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0', borderBottom: `1px solid ${MC.borderSoft}`,
    }}>
      <div>
        <div style={{ fontFamily: MC_FONT_MONO, fontSize: 11, color: MC.text, letterSpacing: 0.5 }}>{label}</div>
        {hint && <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9.5, color: MC.textMute, marginTop: 2 }}>{hint}</div>}
      </div>
      {control}
    </div>
  );
}

function ScreenSettings({ mobile }) {
  if (mobile) return <ScreenSettingsMobile/>;
  const [revealed, setRevealed] = React.useState(true);
  return (
    <div style={{
      width: 1280, height: 820, background: MC.bg, color: MC.text,
      fontFamily: MC_FONT_SANS, display: 'flex', flexDirection: 'column',
      backgroundImage: MC_GRID_BG, backgroundSize: MC_GRID_SIZE,
      borderRadius: 6, overflow: 'hidden',
    }}>
      <MCAnims/>
      <header style={{
        height: 38, padding: '0 14px', borderBottom: `1px solid ${MC.border}`,
        display: 'flex', alignItems: 'center', gap: 14, fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textDim,
      }}>
        <span style={{ color: MC.text, letterSpacing: 1.5 }}>SETTINGS</span>
        <span style={{ color: MC.textMute }}>·</span>
        <span>WORKSPACE / costwave-eu / amelie@costwave.io</span>
        <div style={{ flex: 1 }}/>
        <span style={{ color: MC.textMute, ...MC_TABULAR }}>SAVED 2s AGO</span>
      </header>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 0 }}>
        {/* Sidebar */}
        <nav style={{ borderRight: `1px solid ${MC.border}`, padding: '14px 0', background: MC.panel }}>
          {[
            { id: 'profile',     label: 'PROFILE',     icon: ICON.user,  active: true },
            { id: 'providers',   label: 'PROVIDERS',   icon: ICON.bolt },
            { id: 'tokens',      label: 'API.TOKENS',  icon: ICON.key },
            { id: 'preferences', label: 'PREFERENCES', icon: ICON.layers },
            { id: 'billing',     label: 'BILLING',     icon: ICON.card },
            { id: 'security',    label: 'SECURITY',    icon: ICON.shield },
          ].map((it, i) => (
            <a key={i} href={`#${it.id}`} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 18px',
              fontFamily: MC_FONT_MONO, fontSize: 10.5, letterSpacing: 1.5,
              color: it.active ? MC.text : MC.textDim,
              borderLeft: it.active ? `2px solid ${MC.phosphor}` : '2px solid transparent',
              background: it.active ? MC.panel2 : 'transparent',
              textDecoration: 'none',
            }}>
              <MCI d={it.icon} size={12}/>
              {it.label}
            </a>
          ))}
        </nav>

        {/* Main scroll */}
        <div style={{ overflow: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* PROFILE */}
          <SettingsSection id="profile" title="PROFILE" sub="// IDENTITY · WORKSPACE">
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14 }}>
              <div style={{
                width: 56, height: 56, border: `1.5px solid ${MC.phosphor}`,
                display: 'grid', placeItems: 'center',
                fontFamily: MC_FONT_MONO, fontSize: 22, color: MC.phosphor, fontWeight: 600,
              }}>AM</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: MC_FONT_MONO, fontSize: 13, color: MC.text, letterSpacing: 0.5 }}>Amelie Marchand</div>
                <div style={{ fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textMute }}>amelie@costwave.io · OWNER</div>
              </div>
              <button style={mcBtnSec}>UPLOAD PHOTO</button>
            </div>
            <SettingRow label="DISPLAY.NAME" hint="Visible across the workspace" control={<input defaultValue="Amelie Marchand" style={inputCSS}/>}/>
            <SettingRow label="EMAIL" hint="Used for alerts and login" control={<input defaultValue="amelie@costwave.io" style={inputCSS}/>}/>
            <SettingRow label="WORKSPACE.SLUG" hint="costwave.io/w/<slug>" control={<input defaultValue="costwave-eu" style={inputCSS}/>}/>
            <SettingRow label="TIMEZONE" hint="Used for daily reports" control={<div style={selectCSS}>EUROPE/PARIS · UTC+02 <MCI d={ICON.chevDn} size={11} c={MC.textMute}/></div>}/>
          </SettingsSection>

          {/* PROVIDERS */}
          <SettingsSection id="providers" title="PROVIDERS" sub={`// ${PROVIDERS_LIST.length} CONNECTED · 1 WARN`}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: MC_FONT_MONO, fontSize: 10.5, ...MC_TABULAR }}>
              <thead>
                <tr>
                  {['', 'PROVIDER', 'API.KEY', 'ADDED', 'SPEND.MTD', ''].map((h, i) => (
                    <th key={i} style={{
                      textAlign: i === 4 ? 'right' : 'left', padding: '6px 0',
                      fontSize: 9, letterSpacing: 1.5, color: MC.textMute, fontWeight: 500,
                      borderBottom: `1px solid ${MC.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROVIDERS_LIST.map((p, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${MC.borderSoft}` }}>
                    <td style={{ padding: '10px 0', width: 26 }}><MCDot status={p.status}/></td>
                    <td style={{ padding: '10px 0', color: MC.text, letterSpacing: 1 }}>{p.name}</td>
                    <td style={{ padding: '10px 0', color: MC.textDim }}>{p.key}</td>
                    <td style={{ padding: '10px 0', color: MC.textDim }}>{p.added}</td>
                    <td style={{ padding: '10px 0', color: MC.text, textAlign: 'right' }}>{p.spend}</td>
                    <td style={{ padding: '10px 0', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button style={iconBtn} title="SYNC"><MCI d={ICON.refresh} size={11}/></button>
                        <button style={iconBtn} title="EDIT"><MCI d={ICON.edit} size={11}/></button>
                        <button style={iconBtn} title="REMOVE"><MCI d={ICON.trash} size={11}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 14 }}>
              <button style={mcBtnSec}><MCI d={ICON.plus} size={11}/> CONNECT.PROVIDER</button>
            </div>
          </SettingsSection>

          {/* API.TOKENS */}
          <SettingsSection id="tokens" title="API.TOKENS" sub="// USED BY CLI / PWA / EXTERNAL CALLS">
            {/* Reveal block */}
            <div style={{
              border: `1px solid ${MC.phosphor}`,
              background: 'hsl(170 73% 6%)', padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: MC.phosphor, opacity: 0.5 }}/>
              <MCI d={ICON.key} size={14} c={MC.phosphor}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: MC.phosphor }}>SECRET.REVEALED · COPY NOW · WILL NOT DISPLAY AGAIN</div>
                <div style={{ fontFamily: MC_FONT_MONO, fontSize: 12, color: MC.text, marginTop: 4, ...MC_TABULAR, letterSpacing: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  cw_pat_94ba_ZmF4ND8h2KqLxR7mP_aGc8VrTd2NjB9wQ4Y6Hf
                </div>
              </div>
              <button style={mcBtnSec}><MCI d={ICON.copy} size={11}/> COPY</button>
              <button style={iconBtn} title="DISMISS"><MCI d={ICON.x} size={11}/></button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: MC_FONT_MONO, fontSize: 10.5, ...MC_TABULAR }}>
              <thead>
                <tr>
                  {['NAME', 'SCOPE', 'CREATED', 'LAST.USED', ''].map((h, i) => (
                    <th key={i} style={{
                      textAlign: 'left', padding: '6px 0',
                      fontSize: 9, letterSpacing: 1.5, color: MC.textMute, fontWeight: 500,
                      borderBottom: `1px solid ${MC.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOKENS_LIST.map((t, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${MC.borderSoft}` }}>
                    <td style={{ padding: '10px 0', color: MC.text, letterSpacing: 1 }}>{t.name}</td>
                    <td style={{ padding: '10px 0', color: MC.textDim }}>{t.scope}</td>
                    <td style={{ padding: '10px 0', color: MC.textDim }}>{t.created}</td>
                    <td style={{ padding: '10px 0', color: MC.text }}>{t.last}</td>
                    <td style={{ padding: '10px 0', textAlign: 'right' }}><button style={iconBtn} title="REVOKE"><MCI d={ICON.trash} size={11}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              <button style={mcBtnPrimary}><MCI d={ICON.plus} size={11}/> GENERATE.TOKEN</button>
              <button style={mcBtnSec}>DOCUMENTATION</button>
            </div>
          </SettingsSection>

          {/* PREFERENCES */}
          <SettingsSection id="preferences" title="PREFERENCES" sub="// UI · NOTIFICATIONS · LOCALE">
            <SettingRow label="THEME" hint="Mission Control is dark by design" control={<MCBadge tone="info">DARK · LOCKED</MCBadge>}/>
            <SettingRow label="DENSITY" hint="Compact recommended on cockpit" control={<div style={selectCSS}>COMPACT <MCI d={ICON.chevDn} size={11} c={MC.textMute}/></div>}/>
            <SettingRow label="LANGUAGE" control={<div style={selectCSS}>FR · FRANÇAIS <MCI d={ICON.chevDn} size={11} c={MC.textMute}/></div>}/>
            <SettingRow label="EMAIL.ALERTS" hint="Daily digest + breach alerts" control={<Toggle on/>}/>
            <SettingRow label="SLACK.WEBHOOK" hint="Post breach events to #ai-budget" control={<Toggle on/>}/>
            <SettingRow label="DESKTOP.NOTIFICATIONS" hint="Browser push on critical events" control={<Toggle/>}/>
            <SettingRow label="TELEMETRY" hint="Help improve Costwave (anonymized)" control={<Toggle on/>}/>
          </SettingsSection>

          {/* BILLING */}
          <SettingsSection id="billing" title="BILLING" sub="// PLAN · PAYMENT · INVOICES">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div style={{ background: MC.panel2, border: `1px solid ${MC.border}`, padding: 14 }}>
                <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: MC.textMute }}>CURRENT.PLAN</div>
                <div style={{ fontFamily: MC_FONT_MONO, fontSize: 18, color: MC.text, marginTop: 6, letterSpacing: 1 }}>PRO · ANNUAL</div>
                <div style={{ fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textMute, marginTop: 4, ...MC_TABULAR }}>$24/mo · billed annually · renews 2027-01-12</div>
                <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
                  <button style={mcBtnSec}>CHANGE.PLAN</button>
                  <button style={iconBtn}><MCI d={ICON.x} size={10}/></button>
                </div>
              </div>
              <div style={{ background: MC.panel2, border: `1px solid ${MC.border}`, padding: 14 }}>
                <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: MC.textMute }}>PAYMENT.METHOD</div>
                <div style={{ fontFamily: MC_FONT_MONO, fontSize: 13, color: MC.text, marginTop: 6, ...MC_TABULAR }}>VISA •••• 4218</div>
                <div style={{ fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textMute, marginTop: 4 }}>EXP 09/27 · A. MARCHAND</div>
                <div style={{ marginTop: 12 }}><button style={mcBtnSec}>UPDATE.CARD</button></div>
              </div>
            </div>
            <SettingRow label="BILLING.EMAIL" hint="Receipts + tax docs" control={<input defaultValue="finance@costwave.io" style={inputCSS}/>}/>
            <SettingRow label="VAT.NUMBER" hint="EU customers · auto-validated" control={<input defaultValue="FR 14 392 814 102" style={inputCSS}/>}/>
            <SettingRow label="INVOICES" hint="14 issued · all paid" control={<button style={mcBtnSec}>DOWNLOAD.HISTORY</button>}/>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}

const inputCSS = {
  background: MC.bg, border: `1px solid ${MC.border}`,
  padding: '6px 10px', fontFamily: MC_FONT_MONO, fontSize: 10.5, color: MC.text,
  width: 240, outline: 'none', letterSpacing: 0.5,
};
const selectCSS = {
  background: MC.bg, border: `1px solid ${MC.border}`,
  padding: '6px 10px', fontFamily: MC_FONT_MONO, fontSize: 10.5, color: MC.text,
  width: 240, display: 'flex', alignItems: 'center', justifyContent: 'space-between', letterSpacing: 1,
};
const mcBtnSec = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 12px', background: 'transparent',
  border: `1px solid ${MC.border}`, color: MC.textDim,
  fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5, cursor: 'pointer',
};
const mcBtnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 12px', background: MC.text, color: MC.bg,
  border: `1px solid ${MC.text}`, fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5,
  cursor: 'pointer', fontWeight: 600,
};
const iconBtn = {
  display: 'inline-grid', placeItems: 'center', width: 24, height: 24,
  background: 'transparent', border: `1px solid ${MC.border}`,
  color: MC.textDim, cursor: 'pointer',
};

function ScreenSettingsMobile() {
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
        <span style={{ color: MC.phosphor, fontSize: 9 }}>● SAVED</span>
      </div>
      <div style={{ padding: '8px 16px', borderBottom: `1px solid ${MC.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: MC_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: MC.text }}>SETTINGS</span>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { id: 'profile', icon: ICON.user, label: 'PROFILE', sub: 'amelie@costwave.io' },
          { id: 'providers', icon: ICON.bolt, label: 'PROVIDERS', sub: '5 CONNECTED · 1 WARN' },
          { id: 'tokens', icon: ICON.key, label: 'API.TOKENS', sub: '3 ACTIVE' },
          { id: 'preferences', icon: ICON.layers, label: 'PREFERENCES', sub: 'FR · DARK · COMPACT' },
          { id: 'billing', icon: ICON.card, label: 'BILLING', sub: 'PRO · VISA •••• 4218' },
          { id: 'security', icon: ICON.shield, label: 'SECURITY', sub: '2FA · ACTIVE' },
        ].map((it, i) => (
          <div key={i} style={{
            background: MC.panel, border: `1px solid ${MC.border}`,
            padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 28, height: 28, border: `1px solid ${MC.border}`, display: 'grid', placeItems: 'center' }}>
              <MCI d={it.icon} size={13} c={MC.text}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: MC_FONT_MONO, fontSize: 11, letterSpacing: 1.2, color: MC.text }}>{it.label}</div>
              <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, marginTop: 2 }}>{it.sub}</div>
            </div>
            <MCI d={ICON.chev} size={12} c={MC.textMute}/>
          </div>
        ))}
      </div>
    </div>
  );
}

window.ScreenSettings = ScreenSettings;
window.ScreenSettingsMobile = ScreenSettingsMobile;
