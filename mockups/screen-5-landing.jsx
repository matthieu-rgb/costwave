// Screen 5 — Landing publique · Mission Control
// PALETTE/TYPO/RAYONS : voir mc-tokens.jsx — aucune divergence.
// Re-used : MC, MC_FONT_MONO, MC_FONT_SANS, MC_TABULAR, MCI, ICON, MCBadge,
//           MCWordmark, MCAnims, MC_GRID_BG, MC_GRID_SIZE.
// Specifics : c'est l'antichambre du cockpit, pas une landing SaaS classique.
//             - Hero : tagline FR Inter (seule entorse a la dominance mono),
//               sous-titre + telemetry strip mono.
//             - Section Features = 4 grandes cards type panel cockpit.
//             - Pricing : 2 cards, FREE et PRO, structure terminal.
//             - Footer : legal + lang switcher FR/EN/DE + GitHub.

const FAQ = [
  { q: 'POURQUOI PAS UN DASHBOARD GENERIQUE DE PLUS ?',
    a: "Costwave n'agrege pas que la facture. On suit chaque appel : provider, modele, latence, sub-agents Claude Code, fichiers touches. Vous voyez ou part chaque dollar, pas juste le total mensuel." },
  { q: 'COMMENT FONCTIONNE LE RADAR CLAUDE CODE ?',
    a: "Vous installez le CLI, il intercepte les sessions Claude Code en temps reel. Le radar visualise l'agent principal, ses sub-agents, les fichiers vus, les tools appeles, le context window. Tout est garde localement par defaut." },
  { q: 'MES CLES API SONT-ELLES EN SECURITE ?',
    a: "Chiffrement AES-256 au repos, jamais loguees, jamais exposees au front-end. Vous pouvez auto-heberger l'agent de collecte si vous voulez garder vos cles entierement chez vous." },
  { q: 'QUELS PROVIDERS SONT SUPPORTES ?',
    a: "Anthropic, OpenAI, Groq, Mistral, xAI nativement. Tout endpoint OpenAI-compatible via configuration custom. Roadmap : Cohere, Google Vertex, AWS Bedrock." },
  { q: 'PUIS-JE EXPORTER MES DONNEES ?',
    a: "Oui. CSV, JSON, Parquet. Webhook temps reel. Et l'API publique Costwave pour brancher vos propres dashboards BI." },
  { q: 'EST-CE QUE LE PLAN GRATUIT EST VRAIMENT GRATUIT ?',
    a: "Oui, sans carte bancaire. Limite a 1 workspace, 3 providers, 30 jours d'historique. Tout le reste fonctionne pareil que le PRO." },
];

function LandingHeader() {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      height: 56, padding: '0 32px',
      borderBottom: `1px solid ${MC.border}`,
      background: 'rgba(7,9,11,0.86)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', gap: 28,
    }}>
      <MCWordmark size={20}/>
      <nav style={{ display: 'flex', gap: 22, fontFamily: MC_FONT_MONO, fontSize: 10.5, letterSpacing: 1.5, marginLeft: 18 }}>
        {['FEATURES', 'PRICING', 'DOCS', 'CHANGELOG'].map((x, i) => (
          <a key={i} href="#" style={{ color: MC.textDim, textDecoration: 'none' }}>{x}</a>
        ))}
      </nav>
      <div style={{ flex: 1 }}/>
      <span style={{ fontFamily: MC_FONT_MONO, fontSize: 9.5, color: MC.textMute, letterSpacing: 1.5 }}>
        <span style={{ color: MC.phosphor }}>●</span> 184 WORKSPACES · $1.4M TRACKED · 30D
      </span>
      <a href="#" style={{ fontFamily: MC_FONT_MONO, fontSize: 10.5, color: MC.textDim, letterSpacing: 1.5, textDecoration: 'none' }}>SIGN.IN</a>
      <a href="#" style={{
        padding: '8px 14px', background: MC.text, color: MC.bg,
        fontFamily: MC_FONT_MONO, fontSize: 10.5, letterSpacing: 1.5, fontWeight: 600,
        textDecoration: 'none',
      }}>SIGN.UP →</a>
    </header>
  );
}

function HeroSparkline() {
  const W = 320, H = 56;
  const pts = [10, 12, 9, 14, 11, 18, 15, 22, 19, 26, 24, 30, 28, 36, 33, 42];
  const max = 50, min = 0;
  const x = (i) => (i / (pts.length - 1)) * W;
  const y = (v) => H - ((v - min) / (max - min)) * H;
  const line = pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  return (
    <svg width={W} height={H}>
      <path d={`${line} L ${W} ${H} L 0 ${H} Z`} fill={MC.phosphor} opacity="0.1"/>
      <path d={line} stroke={MC.phosphor} strokeWidth="1.2" fill="none"/>
    </svg>
  );
}

function FeatureCard({ no, label, title, body, glyph }) {
  return (
    <div style={{
      background: MC.panel, border: `1px solid ${MC.border}`,
      padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14,
      position: 'relative', minHeight: 280,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, height: 1, width: 60, background: MC.phosphor, opacity: 0.5 }}/>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: MC.textMute }}>{no} · {label}</span>
        <div style={{
          width: 36, height: 36, border: `1px solid ${MC.border}`,
          display: 'grid', placeItems: 'center', color: MC.phosphor,
        }}>{glyph}</div>
      </div>
      <div style={{ fontFamily: MC_FONT_MONO, fontSize: 18, color: MC.text, letterSpacing: 1, fontWeight: 600 }}>{title}</div>
      <div style={{ fontFamily: MC_FONT_SANS, fontSize: 13, color: MC.textDim, lineHeight: 1.55 }}>{body}</div>
      <div style={{ flex: 1 }}/>
      <a href="#" style={{ fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.text, letterSpacing: 1.5, display: 'inline-flex', gap: 6, alignItems: 'center', textDecoration: 'none' }}>
        EXPLORE → 
      </a>
    </div>
  );
}

function StepCard({ n, title, body, code }) {
  return (
    <div style={{
      background: MC.panel, border: `1px solid ${MC.border}`,
      padding: '22px 22px 0', display: 'flex', flexDirection: 'column', gap: 14, height: 320,
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: MC.textMute,
      }}>
        <span style={{
          display: 'inline-grid', placeItems: 'center', width: 24, height: 24,
          border: `1px solid ${MC.phosphor}`, color: MC.phosphor, fontWeight: 600,
        }}>0{n}</span>
        STEP {n}
      </div>
      <div style={{ fontFamily: MC_FONT_MONO, fontSize: 17, color: MC.text, letterSpacing: 0.5, fontWeight: 600 }}>{title}</div>
      <div style={{ fontFamily: MC_FONT_SANS, fontSize: 13, color: MC.textDim, lineHeight: 1.55 }}>{body}</div>
      <div style={{
        marginTop: 'auto', marginLeft: -22, marginRight: -22, padding: '12px 22px',
        background: MC.bg, borderTop: `1px solid ${MC.border}`,
        fontFamily: MC_FONT_MONO, fontSize: 10.5, color: MC.phosphor, letterSpacing: 0.5, ...MC_TABULAR,
      }}>
        <span style={{ color: MC.textMute }}>$</span> {code}
      </div>
    </div>
  );
}

function PricingCard({ plan, price, period, sub, features, cta, primary, badge }) {
  return (
    <div style={{
      background: MC.panel,
      border: `1px solid ${primary ? 'hsl(170 73% 32%)' : MC.border}`,
      padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 16,
      position: 'relative', minHeight: 460,
    }}>
      {primary && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: MC.phosphor }}/>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: MC_FONT_MONO, fontSize: 12, letterSpacing: 2, color: MC.text, fontWeight: 600 }}>{plan}</span>
        {badge}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontFamily: MC_FONT_MONO, fontSize: 44, color: MC.text, ...MC_TABULAR, letterSpacing: -1 }}>{price}</span>
          {period && <span style={{ fontFamily: MC_FONT_MONO, fontSize: 12, color: MC.textMute, ...MC_TABULAR }}>{period}</span>}
        </div>
        <div style={{ fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textMute, letterSpacing: 1, marginTop: 4 }}>{sub}</div>
      </div>
      <div style={{ height: 1, background: MC.border }}/>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontFamily: MC_FONT_MONO, fontSize: 11, color: MC.textDim, ...MC_TABULAR, letterSpacing: 0.3 }}>
            <span style={{ color: f.muted ? MC.textMute : MC.phosphor, marginTop: 2 }}>
              <MCI d={f.muted ? ICON.x : ICON.check} size={11}/>
            </span>
            <span style={{ color: f.muted ? MC.textMute : MC.text, textDecoration: f.muted ? 'line-through' : 'none' }}>{f.t}</span>
          </li>
        ))}
      </ul>
      <a href="#" style={{
        textAlign: 'center', padding: '11px 0',
        background: primary ? MC.text : 'transparent', color: primary ? MC.bg : MC.text,
        border: `1px solid ${primary ? MC.text : MC.border}`,
        fontFamily: MC_FONT_MONO, fontSize: 11, letterSpacing: 1.5, textDecoration: 'none',
        fontWeight: 600,
      }}>{cta}</a>
    </div>
  );
}

function FaqItem({ q, a, open, onClick }) {
  return (
    <div style={{ borderBottom: `1px solid ${MC.border}` }}>
      <button onClick={onClick} style={{
        width: '100%', textAlign: 'left', background: 'transparent', border: 'none',
        padding: '18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: MC_FONT_MONO, fontSize: 12, letterSpacing: 1, color: MC.text, cursor: 'pointer',
      }}>
        <span>{q}</span>
        <MCI d={open ? ICON.x : ICON.plus} size={13} c={MC.textMute}/>
      </button>
      {open && <div style={{ padding: '0 0 18px', fontFamily: MC_FONT_SANS, fontSize: 13, color: MC.textDim, lineHeight: 1.6, maxWidth: 720 }}>{a}</div>}
    </div>
  );
}

function ScreenLanding({ mobile }) {
  const [openFaq, setOpenFaq] = React.useState(0);
  if (mobile) return <ScreenLandingMobile openFaq={openFaq} setOpenFaq={setOpenFaq}/>;
  return (
    <div style={{
      width: 1280, background: MC.bg, color: MC.text,
      fontFamily: MC_FONT_SANS, borderRadius: 6, overflow: 'hidden',
      borderLeft: `1px solid ${MC.border}`, borderRight: `1px solid ${MC.border}`,
    }}>
      <MCAnims/>
      <LandingHeader/>

      {/* HERO */}
      <section style={{
        position: 'relative', padding: '64px 64px 56px',
        backgroundImage: MC_GRID_BG, backgroundSize: MC_GRID_SIZE,
        borderBottom: `1px solid ${MC.border}`,
      }}>
        {/* Top telemetry strip */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingBottom: 28, fontFamily: MC_FONT_MONO, fontSize: 9.5, letterSpacing: 1.5, color: MC.textMute,
        }}>
          <span>// COSTWAVE.IO · OBSERVATOIRE D'INFERENCE LLM · v0.42.0</span>
          <span style={{ ...MC_TABULAR }}>UTC 09:14:22 · LATENCY 12ms · STATUS <span style={{ color: MC.phosphor }}>● NOMINAL</span></span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <MCBadge tone="info" dot blink>NOW IN BETA · PUBLIC</MCBadge>
            <h1 style={{
              fontFamily: MC_FONT_SANS, fontSize: 64, lineHeight: 1.02,
              fontWeight: 600, color: MC.text, letterSpacing: -1.5,
              margin: '24px 0 18px', maxWidth: 680,
            }}>
              L'observatoire de votre <span style={{ color: MC.phosphor }}>consommation IA.</span>
            </h1>
            <p style={{ fontFamily: MC_FONT_SANS, fontSize: 17, lineHeight: 1.55, color: MC.textDim, maxWidth: 580, margin: 0 }}>
              Suivez chaque dollar depense en inference LLM, en temps reel, a travers tous vos providers — et voyez Claude Code travailler de l'interieur.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
              <a href="#" style={{
                padding: '13px 22px', background: MC.text, color: MC.bg,
                fontFamily: MC_FONT_MONO, fontSize: 11, letterSpacing: 1.5, fontWeight: 600,
                textDecoration: 'none', display: 'inline-flex', gap: 8, alignItems: 'center',
              }}>SIGN.UP — FREE FOREVER →</a>
              <a href="#" style={{
                padding: '13px 22px', border: `1px solid ${MC.border}`, color: MC.text,
                fontFamily: MC_FONT_MONO, fontSize: 11, letterSpacing: 1.5,
                textDecoration: 'none', display: 'inline-flex', gap: 8, alignItems: 'center',
              }}><MCI d={ICON.term} size={12}/> LIVE.DEMO</a>
            </div>
            <div style={{
              marginTop: 26, fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textMute, letterSpacing: 1,
            }}>
              NO CREDIT CARD · OPEN.SOURCE.AGENT · SOC.2 IN PROGRESS
            </div>
          </div>

          {/* Hero panel — micro mission control */}
          <div style={{ background: MC.panel, border: `1px solid ${MC.border}`, padding: 0, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, ${MC.phosphor}, transparent 80%)`, opacity: 0.7 }}/>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${MC.border}`, display: 'flex', justifyContent: 'space-between', fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: MC.textMute }}>
              <span>// COSTWAVE.MTD</span>
              <span style={{ color: MC.phosphor }}>● LIVE</span>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1.5 }}>SPEND.MTD · ALL.PROVIDERS</div>
              <div style={{ fontFamily: MC_FONT_MONO, fontSize: 38, color: MC.text, marginTop: 6, ...MC_TABULAR, letterSpacing: -0.5 }}>$847.32</div>
              <div style={{ fontFamily: MC_FONT_MONO, fontSize: 10, marginTop: 2, color: MC.red, ...MC_TABULAR }}>↑ 38.4%  vs LAST.MONTH</div>
              <div style={{ marginTop: 16 }}><HeroSparkline/></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16 }}>
                {[
                  { l: 'PROVIDERS', v: '5' },
                  { l: 'REQUESTS',  v: '14.8k' },
                  { l: 'TOK.IN',    v: '42.5M' },
                ].map((x, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: MC_FONT_MONO, fontSize: 8.5, color: MC.textMute, letterSpacing: 1.5 }}>{x.l}</div>
                    <div style={{ fontFamily: MC_FONT_MONO, fontSize: 16, color: MC.text, marginTop: 3, ...MC_TABULAR }}>{x.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${MC.border}`, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10, fontFamily: MC_FONT_MONO, fontSize: 9.5, color: MC.textMute, letterSpacing: 1 }}>
              <span style={{ color: MC.amber }}>● WARN</span> ANTHROPIC.SONNET 92.1% · BUDGET WILL BREACH IN ~14h
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section style={{ padding: '24px 64px', borderBottom: `1px solid ${MC.border}`, background: MC.panel }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <span style={{ fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: MC.textMute, whiteSpace: 'nowrap' }}>
            // TRUSTED.BY
          </span>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
            {['LATTICE.AI', 'MERIDIAN', 'KAPTAIN', 'NORTHWAVE', 'OBSERVA.IO', 'SHIFTBASE', 'CRITERIO'].map((n, i) => (
              <span key={i} style={{
                fontFamily: MC_FONT_MONO, fontSize: 13, color: MC.textDim, letterSpacing: 2.5, opacity: 0.85,
              }}>{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '72px 64px', borderBottom: `1px solid ${MC.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <div style={{ fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: MC.phosphor }}>// FEATURES</div>
            <h2 style={{ fontFamily: MC_FONT_SANS, fontSize: 36, color: MC.text, fontWeight: 600, letterSpacing: -0.8, margin: '10px 0 0', maxWidth: 720 }}>
              Conçu comme un cockpit. Pas comme un dashboard.
            </h2>
          </div>
          <div style={{ fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textMute, letterSpacing: 1.5, ...MC_TABULAR }}>04 / 04 PILLARS</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <FeatureCard no="01" label="OBSERVABILITY"
            title="MULTI.PROVIDER"
            body="Anthropic, OpenAI, Groq, Mistral, xAI. Une seule vue, une seule unite (USD). Snapshots par appel : modele, tokens, latence, cout exact."
            glyph={<MCI d={ICON.layers} size={16}/>}/>
          <FeatureCard no="02" label="AGENT.TRACE"
            title="CLAUDE.CODE.RADAR"
            body="Visualisation en temps reel de l'agent principal, des sub-agents en orbite, des fichiers vus, des tools appeles. Le context window comme une jauge de carburant."
            glyph={<MCI d={ICON.radar} size={16}/>}/>
          <FeatureCard no="03" label="GOVERNANCE"
            title="BUDGETS.ALERTS"
            body="Limites par provider, par modele, par tag. Seuils 75/90/100% avec notifications email, Slack, webhook. Auto-throttle au breach."
            glyph={<MCI d={ICON.shield} size={16}/>}/>
          <FeatureCard no="04" label="ANYWHERE"
            title="MULTI.DEVICE.PWA"
            body="Desktop pour le cockpit complet, mobile pour les alertes en deplacement. PWA installable, offline-tolerant, push notifications natives."
            glyph={<MCI d={ICON.device} size={16}/>}/>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '72px 64px', borderBottom: `1px solid ${MC.border}`, background: MC.panel }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: MC.phosphor }}>// HOW.IT.WORKS</div>
          <h2 style={{ fontFamily: MC_FONT_SANS, fontSize: 36, color: MC.text, fontWeight: 600, letterSpacing: -0.8, margin: '10px 0 0' }}>
            3 minutes du sign-up au premier insight.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <StepCard n={1} title="CREEZ VOTRE WORKSPACE" body="Sign-up email-only, sans carte. Vous obtenez un workspace, un token API, un endpoint webhook." code="curl https://costwave.io/signup"/>
          <StepCard n={2} title="CONNECTEZ VOS PROVIDERS" body="Collez vos cles API. Costwave commence a tirer les usages dans la minute. Aucune cle n'est jamais visible cote front." code="costwave providers add anthropic"/>
          <StepCard n={3} title="OBSERVEZ ET REGLEZ" body="Dashboards live, radar Claude Code, budgets, alertes. Reglez vos seuils, branchez Slack, dormez tranquille." code="costwave radar --session live"/>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: '72px 64px', borderBottom: `1px solid ${MC.border}` }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: MC.phosphor }}>// PRICING</div>
          <h2 style={{ fontFamily: MC_FONT_SANS, fontSize: 36, color: MC.text, fontWeight: 600, letterSpacing: -0.8, margin: '10px 0 0' }}>
            Deux plans. Pas de palier piege.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 920 }}>
          <PricingCard
            plan="FREE" price="$0" period="/forever" sub="Pour explorer · 1 dev · 1 workspace"
            features={[
              { t: '1 workspace · 1 user' },
              { t: '3 providers connectes' },
              { t: '30 jours d\'historique' },
              { t: 'CC.Radar — sessions illimitees' },
              { t: '5 budgets · 2 alertes' },
              { t: 'API.Tokens illimites', muted: true },
              { t: 'SSO + audit log', muted: true },
              { t: 'SLA + support prioritaire', muted: true },
            ]}
            cta="START.FREE →"/>
          <PricingCard
            plan="PRO" price="$24" period="/mo · billed annually" sub="Pour les equipes · jusqu'a 25 users"
            badge={<MCBadge tone="info" dot blink>RECOMMANDE</MCBadge>}
            primary
            features={[
              { t: 'Workspaces illimites · jusqu\'a 25 users' },
              { t: 'Providers illimites' },
              { t: 'Historique illimite + export Parquet' },
              { t: 'CC.Radar — replay sessions 90 jours' },
              { t: 'Budgets + alertes illimites' },
              { t: 'API.Tokens + webhooks' },
              { t: 'SSO (Google, Okta) + audit log' },
              { t: 'SLA 99.9% + support prioritaire' },
            ]}
            cta="UPGRADE.PRO →"/>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '72px 64px', borderBottom: `1px solid ${MC.border}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 64 }}>
          <div>
            <div style={{ fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: MC.phosphor }}>// FAQ</div>
            <h2 style={{ fontFamily: MC_FONT_SANS, fontSize: 32, color: MC.text, fontWeight: 600, letterSpacing: -0.6, margin: '10px 0 18px' }}>
              Vos questions, en clair.
            </h2>
            <p style={{ fontFamily: MC_FONT_SANS, fontSize: 13, color: MC.textDim, lineHeight: 1.6 }}>
              Si quelque chose manque, ecrivez a hello@costwave.io. On repond en moins de 24h, en francais ou en anglais.
            </p>
          </div>
          <div>
            {FAQ.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} open={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? -1 : i)}/>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '48px 64px 32px', background: MC.panel }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, marginBottom: 36 }}>
          <div>
            <MCWordmark size={18}/>
            <p style={{ fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.textMute, letterSpacing: 1, marginTop: 14, maxWidth: 280, lineHeight: 1.6 }}>
              L'OBSERVATOIRE DE VOTRE CONSOMMATION IA. CONÇU EN FRANCE, OPERE EN EUROPE.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 56 }}>
            {[
              { h: 'PRODUCT',  links: ['FEATURES', 'PRICING', 'CHANGELOG', 'ROADMAP'] },
              { h: 'DEVELOPERS', links: ['DOCS', 'API', 'CLI', 'OPEN.AGENT'] },
              { h: 'COMPANY',  links: ['ABOUT', 'BLOG', 'CAREERS', 'CONTACT'] },
              { h: 'LEGAL',    links: ['TERMS', 'PRIVACY', 'DPA', 'STATUS'] },
            ].map((c, i) => (
              <div key={i}>
                <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: MC.textMute, marginBottom: 12 }}>{c.h}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {c.links.map((l, j) => (
                    <li key={j} style={{ fontFamily: MC_FONT_MONO, fontSize: 10.5, letterSpacing: 1, color: MC.textDim }}>{l}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          paddingTop: 18, borderTop: `1px solid ${MC.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: MC_FONT_MONO, fontSize: 9.5, letterSpacing: 1, color: MC.textMute,
        }}>
          <span>© 2026 COSTWAVE SAS · RCS PARIS 894 102 384 · 14 RUE DU SENTIER, 75002 PARIS</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
              <span style={{ color: MC.text, borderBottom: `1px solid ${MC.phosphor}`, paddingBottom: 2 }}>FR</span>
              <span>·</span>
              <span>EN</span>
              <span>·</span>
              <span>DE</span>
            </span>
            <span style={{ color: MC.textMute }}>|</span>
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: MC.textDim }}>
              <MCI d={ICON.github} size={11}/> GITHUB
            </span>
            <span style={{ color: MC.phosphor, ...MC_TABULAR }}>● ALL.SYSTEMS.NOMINAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ScreenLandingMobile({ openFaq, setOpenFaq }) {
  return (
    <div style={{
      width: 390, height: 844, background: MC.bg, color: MC.text,
      fontFamily: MC_FONT_SANS, display: 'flex', flexDirection: 'column',
      borderRadius: 6, overflow: 'hidden',
    }}>
      <MCAnims/>
      {/* Status bar */}
      <div style={{ height: 38, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: MC_FONT_MONO, fontSize: 11 }}>
        <span>9:41</span>
        <span style={{ fontSize: 9, color: MC.phosphor }}>● COSTWAVE.IO</span>
      </div>
      {/* Header */}
      <div style={{ height: 50, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${MC.border}`, background: MC.bg }}>
        <MCWordmark size={16}/>
        <MCI d={ICON.more} size={16} c={MC.text}/>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Hero */}
        <div style={{ padding: '28px 22px', backgroundImage: MC_GRID_BG, backgroundSize: MC_GRID_SIZE, borderBottom: `1px solid ${MC.border}` }}>
          <MCBadge tone="info" dot blink>BETA · PUBLIC</MCBadge>
          <h1 style={{ fontFamily: MC_FONT_SANS, fontSize: 32, lineHeight: 1.05, fontWeight: 600, letterSpacing: -0.8, margin: '14px 0 12px' }}>
            L'observatoire de votre <span style={{ color: MC.phosphor }}>consommation IA.</span>
          </h1>
          <p style={{ fontFamily: MC_FONT_SANS, fontSize: 13, color: MC.textDim, lineHeight: 1.55, margin: 0 }}>
            Suivez chaque dollar depense, en temps reel, a travers tous vos providers. Voyez Claude Code travailler de l'interieur.
          </p>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a href="#" style={{ padding: '12px 0', textAlign: 'center', background: MC.text, color: MC.bg, fontFamily: MC_FONT_MONO, fontSize: 11, letterSpacing: 1.5, fontWeight: 600, textDecoration: 'none' }}>SIGN.UP — FREE →</a>
            <a href="#" style={{ padding: '12px 0', textAlign: 'center', border: `1px solid ${MC.border}`, color: MC.text, fontFamily: MC_FONT_MONO, fontSize: 11, letterSpacing: 1.5, textDecoration: 'none' }}>LIVE.DEMO</a>
          </div>
        </div>
        {/* Live KPI */}
        <div style={{ padding: 14, borderBottom: `1px solid ${MC.border}` }}>
          <div style={{ background: MC.panel, border: `1px solid ${MC.border}`, padding: 14, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: MC.phosphor, opacity: 0.5 }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1.5 }}>
              <span>// SPEND.MTD</span><span style={{ color: MC.phosphor }}>● LIVE</span>
            </div>
            <div style={{ fontFamily: MC_FONT_MONO, fontSize: 28, color: MC.text, marginTop: 4, ...MC_TABULAR }}>$847.32</div>
            <div style={{ fontFamily: MC_FONT_MONO, fontSize: 10, color: MC.red, marginTop: 2, ...MC_TABULAR }}>↑ 38.4% vs LAST.MONTH</div>
            <div style={{ marginTop: 10 }}><HeroSparkline/></div>
          </div>
        </div>
        {/* Features */}
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, borderBottom: `1px solid ${MC.border}` }}>
          <div style={{ fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: MC.phosphor, marginBottom: 4 }}>// FEATURES</div>
          {[
            { n: '01', t: 'MULTI.PROVIDER', g: ICON.layers, b: 'Anthropic, OpenAI, Groq, Mistral, xAI dans une seule vue.' },
            { n: '02', t: 'CLAUDE.CODE.RADAR', g: ICON.radar, b: 'Agent + sub-agents + fichiers, en temps reel.' },
            { n: '03', t: 'BUDGETS.ALERTS', g: ICON.shield, b: 'Limites, seuils 75/90, Slack + webhook.' },
            { n: '04', t: 'MULTI.DEVICE.PWA', g: ICON.device, b: 'Desktop cockpit · Mobile alertes · PWA installable.' },
          ].map((f, i) => (
            <div key={i} style={{ background: MC.panel, border: `1px solid ${MC.border}`, padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 30, height: 30, border: `1px solid ${MC.border}`, display: 'grid', placeItems: 'center', color: MC.phosphor }}><MCI d={f.g} size={14}/></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: MC_FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: MC.textMute }}>{f.n}</div>
                <div style={{ fontFamily: MC_FONT_MONO, fontSize: 12, color: MC.text, letterSpacing: 1, fontWeight: 600, marginTop: 2 }}>{f.t}</div>
                <div style={{ fontFamily: MC_FONT_SANS, fontSize: 12, color: MC.textDim, lineHeight: 1.45, marginTop: 6 }}>{f.b}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Pricing teaser */}
        <div style={{ padding: 14, borderBottom: `1px solid ${MC.border}` }}>
          <div style={{ fontFamily: MC_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: MC.phosphor, marginBottom: 8 }}>// PRICING</div>
          <div style={{ background: MC.panel, border: `1px solid ${MC.border}`, padding: 16, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: MC.phosphor }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: MC_FONT_MONO, fontSize: 11, letterSpacing: 2, color: MC.text, fontWeight: 600 }}>PRO</span>
              <MCBadge tone="info">RECOMMANDE</MCBadge>
            </div>
            <div style={{ fontFamily: MC_FONT_MONO, fontSize: 32, color: MC.text, marginTop: 8, ...MC_TABULAR }}>$24<span style={{ fontSize: 11, color: MC.textMute }}>/mo</span></div>
            <a href="#" style={{ display: 'block', marginTop: 14, textAlign: 'center', padding: '10px 0', background: MC.text, color: MC.bg, fontFamily: MC_FONT_MONO, fontSize: 11, letterSpacing: 1.5, fontWeight: 600, textDecoration: 'none' }}>UPGRADE.PRO →</a>
          </div>
          <a href="#" style={{ display: 'block', marginTop: 8, textAlign: 'center', padding: '10px 0', border: `1px solid ${MC.border}`, color: MC.textDim, fontFamily: MC_FONT_MONO, fontSize: 10.5, letterSpacing: 1.5, textDecoration: 'none' }}>VOIR LE PLAN FREE</a>
        </div>
        {/* Footer mini */}
        <div style={{ padding: '18px 14px 24px', display: 'flex', justifyContent: 'space-between', fontFamily: MC_FONT_MONO, fontSize: 9, color: MC.textMute, letterSpacing: 1 }}>
          <span>© 2026 COSTWAVE</span>
          <span>FR · EN · DE</span>
        </div>
      </div>
    </div>
  );
}

window.ScreenLanding = ScreenLanding;
window.ScreenLandingMobile = ScreenLandingMobile;
