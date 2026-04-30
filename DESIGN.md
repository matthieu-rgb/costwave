# Costwave Mission Control — Design System (handoff)

> Version : Direction B "Mission Control" · livraison v1.
> Cible build : **Tailwind CSS v4** (`@theme` + `@layer`) + **shadcn/ui** + **Lucide** (stroke 1.5).
> Source de verite tokens : `mc-tokens.jsx`. Aucun token ne doit etre invente hors de ce document.
> Regle d'or : **80% IBM Plex Mono / 20% Inter**, **0px radius sur cards**, **phosphor reserve au LIVE**.

---

## 1. Palette (HSL exacts + hex + role)

Toutes les valeurs sont fournies en HSL (Tailwind v4 / shadcn natif) et hex (debug rapide).
**Aucun gradient hero. Aucun melange phosphor/red dans la meme zone.**

| Token | HSL | Hex | Role | Ne PAS utiliser pour |
|---|---|---|---|---|
| `--mc-bg`          | `hsl(210 14% 4%)`  | `#07090B` | Fond page, app shell | Cards, surfaces elevees |
| `--mc-bg-grid`     | `hsl(210 14% 7%)`  | `#0D1115` | Fond grid radial (dot 1px @ 20px) | — |
| `--mc-panel`       | `hsl(210 14% 7%)`  | `#0D1115` | Surface card lvl 1 | Boutons, badges |
| `--mc-panel-2`     | `hsl(210 14% 9%)`  | `#11161B` | Surface elevee dans panel (input bg, sub-card) | Surface principale |
| `--mc-border`      | `hsl(210 17% 13%)` | `#1A2128` | Divider lvl 1, contour cards/inputs | Texte |
| `--mc-border-soft` | `hsl(210 17% 9%)`  | `#11161B` | Divider lvl 0 (dans listes) | Contour interactif |
| `--mc-text`        | `hsl(210 17% 88%)` | `#D8E1E8` | Texte primaire, valeurs KPI | Labels uppercase |
| `--mc-text-dim`    | `hsl(210 11% 56%)` | `#7B8893` | Texte secondaire, body | Headlines |
| `--mc-text-mute`   | `hsl(210 9% 38%)`  | `#4C5963` | Labels uppercase, ID, tertiaire | Texte de lecture |
| `--mc-phosphor`    | `hsl(170 73% 64%)` | `#5EE6D0` | **LIVE uniquement** : ● TRACKING, sweep radar, delta UP positif, cursor live | Boutons primaires, gradient hero, logo glow par defaut |
| `--mc-amber`       | `hsl(34 73% 67%)`  | `#E8B86B` | WARN (75%), badge `WRITE`, latence elevee | OK, succes |
| `--mc-red`         | `hsl(0 84% 68%)`   | `#F26B6B` | CRIT (90%), BREACH (100%), FAILED, delta cost UP | Decoration, accents |
| `--mc-red-dim`     | `hsl(0 60% 28%)`   | `#722929` | Fond banniere breach, border severite | Texte |
| `--mc-green`       | `hsl(150 71% 64%)` | `#5EE6A0` | OK statique, SUCCESS, ● connected | Movement (utiliser phosphor) |
| `--mc-violet`      | `hsl(258 88% 76%)` | `#A78BFA` | **GROQ uniquement** + badge GREP sub-agent | Tout autre provider |
| `--mc-blue`        | `hsl(213 67% 70%)` | `#7BA8E8` | Badge READ sub-agent, accent fichier read | Boutons |
| `--mc-orange`      | `hsl(20 100% 68%)` | `#FF8E5C` | Halo creature centrale Radar uniquement | Reste de l'app |

### Severity scale (4 paliers)

| Palier | Trigger | Token | Comportement visuel |
|---|---|---|---|
| **INFO**   | < 50% budget | `text-dim`  | Statique. Aucun accent. |
| **WARN**   | ≥ 75% | `amber` | Border-left 2px amber sur ligne. Badge `WARN`. |
| **CRIT**   | ≥ 90% | `red` | Border-left 2px red. Badge `CRIT`. Banniere collapsable top. |
| **BREACH** | ≥ 100% | `red` + `red-dim` bg | Banniere pleine largeur. Blink lent (2.4s). Auto-throttle CTA. |

> Phosphor jamais sur du negatif. Amber jamais sur du critique. Red jamais sur du nominal. **Une zone = une intention.**

### Tailwind v4 — `@theme` block

```css
@import "tailwindcss";

@theme {
  --color-bg:          hsl(210 14% 4%);
  --color-bg-grid:     hsl(210 14% 7%);
  --color-panel:       hsl(210 14% 7%);
  --color-panel-2:     hsl(210 14% 9%);
  --color-border:      hsl(210 17% 13%);
  --color-border-soft: hsl(210 17% 9%);
  --color-text:        hsl(210 17% 88%);
  --color-text-dim:    hsl(210 11% 56%);
  --color-text-mute:   hsl(210 9% 38%);
  --color-phosphor:    hsl(170 73% 64%);
  --color-amber:       hsl(34 73% 67%);
  --color-red:         hsl(0 84% 68%);
  --color-red-dim:     hsl(0 60% 28%);
  --color-green:       hsl(150 71% 64%);
  --color-violet:      hsl(258 88% 76%);
  --color-blue:        hsl(213 67% 70%);
  --color-orange:      hsl(20 100% 68%);

  --font-mono: 'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace;
  --font-sans: 'Inter', -apple-system, system-ui, sans-serif;

  --radius-card:  0px;
  --radius-input: 2px;
  --radius-badge: 2px;
  --radius-pill:  3px;

  --tracking-mono-up: 0.1em;   /* 1.4-1.6px @ 11-13px */
  --tracking-mono-tight: 0.02em;
}
```

### shadcn/ui — `components.json` mapping

shadcn s'attend a ces noms ; on remappe sur nos tokens :

```css
@theme {
  --color-background:  var(--color-bg);
  --color-foreground:  var(--color-text);
  --color-card:        var(--color-panel);
  --color-card-foreground: var(--color-text);
  --color-popover:     var(--color-panel-2);
  --color-popover-foreground: var(--color-text);
  --color-primary:     var(--color-text);          /* boutons primaires = text inverse, PAS phosphor */
  --color-primary-foreground: var(--color-bg);
  --color-secondary:   var(--color-panel-2);
  --color-secondary-foreground: var(--color-text);
  --color-muted:       var(--color-panel-2);
  --color-muted-foreground: var(--color-text-dim);
  --color-accent:      var(--color-panel-2);
  --color-accent-foreground: var(--color-text);
  --color-destructive: var(--color-red);
  --color-destructive-foreground: var(--color-text);
  --color-border:      var(--color-border);
  --color-input:       var(--color-border);
  --color-ring:        var(--color-phosphor);     /* focus ring uniquement */

  --radius: 0px;  /* base radius shadcn */
}
```

---

## 2. Typographie — 80/20

### Roles

| Famille | Poids | Usage | % surface |
|---|---|---|---|
| **IBM Plex Mono** | 400 / 500 / 600 | Labels, valeurs, IDs, tables, badges, KPIs, terminaux, navigation, breadcrumbs, headers de panel | **80%** |
| **Inter** | 400 / 500 / 600 | Titres editorialises (h1/h2 landing), hero copy, paragraphes longs marketing | **20%** — reserve |

> Inter ne doit jamais entrer dans un cockpit (Provider, Radar, Budgets, Settings). Il est strictement reserve a la landing publique.

### Echelle (px @ 1280 desktop, slide 16:9)

| Token | Size | Line-height | Tracking | Usage |
|---|---|---|---|---|
| `text-mono-9`   | 9px  | 1.2 | 1.5px (uppercase) | Tags edge radar, micro-IDs |
| `text-mono-10`  | 10px | 1.2 | 1.5px (uppercase) | Labels colonne, badges |
| `text-mono-11`  | 11px | 1.4 | 1.4px (uppercase) | Headers panel, nav |
| `text-mono-12`  | 12px | 1.4 | 0.3px | Body table, lignes log |
| `text-mono-14`  | 14px | 1.5 | 0px | Champs input, boutons |
| `text-mono-18`  | 18px | 1.3 | 0.5px | Sous-titres cockpit |
| `text-mono-28`  | 28px | 1.1 | 0px | KPI value compact |
| `text-mono-44`  | 44px | 1.0 | -0.5px | KPI hero (cost wave) |
| `text-sans-32`  | 32px | 1.2 | -0.5px | h2 landing |
| `text-sans-56`  | 56px | 1.05 | -1.5px | h1 landing hero |

### Tabular nums — **OBLIGATOIRE**

```css
.mc-num {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
}
```

Applique a TOUS les nombres : cost ($), tokens (k/M), latency (ms/s), %, deltas, timestamps, IDs hex.
Aucun nombre ne doit etre rendu sans `tabular-nums` — meme dans un texte courant.

### Tracking uppercase

Tous les labels uppercase mono (`PROVIDERS`, `EVENT STREAM`, `BUDGETS`) → `letter-spacing: 1.4-1.6px`.
Cela donne le rythme "telemetry HUD". Sans tracking, ca lit "developpeur".

---

## 3. Espacement, rayons, bordures

| Token | Valeur | Regle |
|---|---|---|
| `--radius-card`  | **0px** | Toutes les cards, panels, surfaces principales. **Pas une seule rounded card.** |
| `--radius-input` | 2px | Inputs, selects, buttons compacts |
| `--radius-badge` | 2px | Badges severite, tags |
| `--radius-pill`  | 3px | Filtres pill (max). Au-dela : interdit. |
| Border width     | **1px** strict | Sauf border-left 2px reservee aux statuts severite + ligne LIVE |
| Card padding     | 12-14px | Cockpit (Provider, Radar, Budgets, Settings) |
| Card padding     | 18-22px | Landing hero uniquement |
| Gap inter-cards  | 8-10px  | Cockpit (densite max) |
| Gap inter-cards  | 14-16px | Landing |
| Section padding  | 24px    | Page-level |

> Si une rounded card apparait dans un PR, c'est un bug. Refuser.

### Grid de fond (signature MC)

```css
.mc-grid-bg {
  background-image: radial-gradient(hsl(210 14% 7%) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

Applique sur app shell. Pas dans les cards (deja sombres).

---

## 4. Composants

### MCBadge — severite

```tsx
<span class="mc-badge mc-badge--crit">CRIT</span>
```

| Variante | bg | border | text |
|---|---|---|---|
| `info`   | transparent | `border` | `text-dim` |
| `warn`   | `hsl(34 73% 10%)` | `hsl(34 50% 28%)` | `amber` |
| `crit`   | `hsl(0 60% 10%)`  | `hsl(0 60% 28%)`  | `red` |
| `breach` | `hsl(0 60% 14%)`  | `red` | `red` |
| `ok`     | `hsl(150 71% 8%)` | `hsl(150 71% 24%)`| `green` |
| `live`   | `hsl(170 73% 8%)` | `hsl(170 73% 24%)`| `phosphor` |

Style : 9-10px mono uppercase, tracking 1px, padding 3-8px, radius 2px.

### MCDot — status pulse

7-8px circle, `box-shadow: 0 0 6px <color>`, animation `mc-blink 1.4s` reservee aux statuts LIVE. Statuts statiques (OK, IDLE) : pas d'animation, pas de glow.

### MCPanelHead

Header de chaque panel : 28px hauteur, label uppercase mono 10-11px tracking 1.5, valeur secondaire a droite (count, status).

### MCButton

| Variante | bg | text | border | usage |
|---|---|---|---|---|
| `primary`   | `text` (#D8E1E8) | `bg` (#07090B) | none | Action principale (RUN, DEPLOY) |
| `secondary` | transparent | `text` | `border` | Secondaire |
| `ghost`     | transparent | `text-dim` | none | Tertiaire |
| `danger`    | `red-dim` | `red` | `red` | Destructive |

**Aucun bouton primaire en phosphor.** Phosphor est reserve aux indicateurs.

### Tables

- Header row : panel-2 bg, mono 10px uppercase tracking 1.5, text-mute.
- Cell : mono 12px text, tabular-nums sur tous les nombres.
- Border : `border-soft` entre lignes, `border` autour de la table.
- Row hover : panel-2 bg.
- Pas de zebra stripes.

### Sparklines / Bars

Trace 1px stroke. Color = phosphor pour positif, red pour negatif. Background bar a 4-6% opacity, fill a 100%.

---

## 5. Iconographie

- **Lucide** uniquement.
- `stroke-width: 1.5` partout. **Pas 2.**
- Tailles : 12 / 14 / 16 / 20 px. Aucun icone > 20px en cockpit.
- Couleur = `currentColor` herite du contexte. Jamais de gradient sur icone.
- **Pas d'emoji.** Jamais. Y compris dans messages d'etat.

Set canonique : `radar bolt layers flow alert terminal power search arrow-up arrow-down bell plus x chevron-right chevron-down more-horizontal user key credit-card shield copy refresh-cw edit-2 trash-2 file github globe check rocket zap monitor smartphone lock`.

---

## 6. Animation — discipline

| Pattern | Duree | Easing | Usage |
|---|---|---|---|
| `mc-blink` | 1.4s | step | Indicateur LIVE uniquement |
| `mc-pulse-ring` | 1.6s | ease-in-out | Ring autour agent en LIVE work |
| `radar-sweep` | 24s | linear | Bras de balayage radar |
| `sprite-bob` | 2.4s | ease-in-out | Sprite pixel art (translation 1.4px) |
| `mc-cursor` | 1.0s | step | Cursor terminal `▊` |

> Aucune animation > 200ms sur transitions UI. Aucun parallax. Aucun "shimmer".

---

## 7. Le Radar — specifications precises

**Cible** : visualisation temps reel des sessions Claude Code, ADN cinema sobre.

### Anatomie (1280×820 desktop, 390×844 mobile)

```
┌─ Top bar 40h ────────────────────────────────────────────┐
│ CC.RADAR · CONTEXT 45.0k/1M · 4.5% · model · ●connected  │
├──────────────────────────────────────────────┬───────────┤
│  [radar canvas 880×600]                       │ SUB-AGENT │
│   ┌ Concentric rings (4)                      │ FILES SEEN│
│   ├ Cardinal spokes (12)                      │ EVENT STR.│
│   ├ Sweep arm (linear gradient phosphor)      │           │
│   ├ MAIN sprite center (orange #FF8E5C glow)  │           │
│   ├ 5 sub-agent sprites en orbite r=175-200   │           │
│   ├ 12 file rectangles peripherie r=285-295   │           │
│   ├ Edges agent→file (live = solid, idle=dot) │           │
│   └ Tags "Task 1.2s" sur edges actives        │           │
│  Legend (Write/Read/Grep/Sub-agent/Web)       │           │
│  Terminal log strip (path + $ command)        │           │
└──────────────────────────────────────────────┴───────────┘
```

### Sprites pixel art — 16×16 grid

5 sprites uniques (MAIN, AUTH, PRODUCTS, SHARED, CHECKOUT) rendus en `<rect>` SVG `shape-rendering: crispEdges`.
Ne pas reutiliser le sprite Space Invader original — chaque sub-agent a son emblematique pour identification rapide.

Glow par sprite : `drop-shadow(0 0 Xpx <color>) drop-shadow(0 0 2Xpx <color>)`. X = 2px idle / 4px live.

### Code couleur sub-agent

| Sub-agent | Couleur | Usage halo | Glow live |
|---|---|---|---|
| Refactor auth      | `amber`    | radial 36px | 4px ring pulse 1.6s |
| Refactor products  | `violet`   | radial 36px | 4px ring pulse 1.6s |
| Refactor shared    | `phosphor` | radial 36px | **Le seul phosphor** car en LIVE work |
| Refactor checkout  | `red`      | radial 36px | 4px ring pulse 1.6s |
| Refactor shared 2  | `blue`     | radial 36px | idle (pas de ring) |

> Phosphor reserve a l'agent en LIVE work. Si plusieurs agents sont LIVE simultanement, n'attribuer phosphor qu'a celui qui ecrit (kind=write). Les autres gardent leur couleur d'identite.

### Color codes par kind d'action

| Kind | Token | Badge event stream |
|---|---|---|
| `write`     | `amber`    | `WRITE` |
| `read`      | `blue`     | `READ` |
| `grep`      | `violet`   | `GREP` |
| `sub-agent` | `red`      | `SPAWN` |
| `web`       | `phosphor` | `WEB` |
| `plan`      | `text-dim` | `PLAN` |

### Files rectangles

124×22 px, fond `panel`, border 1px `border` (idle) ou kind-color (live). Bande gauche 3px = kind-color. Badge ext (`TS`/`MD`/`JSON`) en outline 22-30px. Filename mono 9px.

---

## 7b. Pattern — List view filtree (workflows-list)

**Cible** : page index sur N items heterogenes (sources multiples), avec filtrage agressif et lecture en table dense.

### Anatomie

```
┌─ Top bar 40h (app shell)
├─ Filter bar 3 rows
│   Row 1 : titre · count · search /-shortcut · view toggle · NEW.WORKFLOW
│   Row 2 : SOURCE chips (ALL + 5 sources avec count)  · GROUP.BY select
│   Row 3 : STATUS chips (ALL · ● RUNNING · IDLE · ● FAILING) · SHOWING N/N
├─ Main : <table dense> ou <cards 3-col>
│   - Group header (collapsable) : icone src · LABEL · count · subtotal cost
│   - Row : name · src-badge · status-pill · last · runs · err% · cost · spark · actions
│   - Row click → expand inline (workflow.id, avg.duration, cost.per.run + lien detail)
```

### Regles

- **Search avec shortcut `/`** affiche obligatoirement le `<kbd>/</kbd>` a droite du champ.
- **Filter chips** :
  - Active = `border-color` = couleur identite (source) ou status, `bg = panel-2`.
  - Inactive = `border = border`, `text = text-dim`.
  - Count secondaire en `text-mute`.
  - Toujours un chip `ALL` en premier.
- **Group header** : `bg = panel-2`, chevron `chev`/`chevDn` avec `transform`, `cursor: pointer` sur toute la ligne.
- **Border-left 2px** sur la row : phosphor si RUNNING, red si FAILING, transparent sinon. **Jamais** d'autre couleur.
- **Sparkline** : phosphor si RUNNING, red si FAILING, `text-dim` si IDLE. Cercle plein 1.6px sur le dernier point.
- **Error rate color ramp** : 0% → `text-dim`, < 5% → `amber`, >= 5% → `red`.
- **Actions par ligne** : icones uniquement (12-14px), border transparent par defaut, revele au hover (`border` + `text`).
- **View toggle table/cards** : segmented control mono uppercase 9.5px, pas de toggle visuel anime.
- **NEW.[X]** primary button : `bg = text`, `text = bg`, mono uppercase 10px, jamais en phosphor.

### Mobile

Filter chips en `overflowX: auto` (scroll horizontal). Row → card pleine largeur avec sparkline en bas full-width. Pas de groupe ni de view toggle en mobile.

---

## 7c. Pattern — Detail view avec runs history

**Cible** : page detail sur une entite executable (workflow, job, pipeline) qui produit des runs repetes.

### Anatomie

```
┌─ Top bar 40h · breadcrumb workflows / <name> · WORKFLOW.ID a droite
├─ Detail header
│   - Titre 18px · src-badge · status-pill
│   - Description 10px text-dim
│   - Meta line : SCHEDULE · OWNER · CREATED  (mono 9px)
│   - Actions a droite : PAUSE · RUN.NOW · EDIT · DELETE (border, danger=red)
├─ KPI row (5 cards) : RUNS.WEEK · SUCCESS.RATE · AVG.DURATION · COST.MTD · COST.PER.RUN
├─ Cost × Duration chart (full width)
│   - Bars text/85% pour cost.per.run, amber 85% pour anomalies (>$0.30)
│   - Line 1.2px phosphor pour duration (axe droite)
│   - Grid 0.6px borderSoft, 5 niveaux
│   - Legend en haut droite du panel
├─ Grid 1fr 1fr :
│   - RECENT.RUNS table (12 visible / 50)
│     · Click row → expand inline avec INPUT.PREVIEW + OUTPUT.PREVIEW (2 col)
│   - RECENT.ERRORS panel
│     · Border-left 2px red sur chaque erreur
│     · Code badge (TIMEOUT, RATE_LIMIT, etc.) en outline red
│     · Stack trace en mono 9.5px text-dim, prefixee par numero de ligne text-mute
```

### Regles

- **KPI cards** : padding 12-14, value en mono 22px (pas plus en cockpit), unit a 11px text-dim. Sub line en mono 9px text-dim. Color accent reservee a SUCCESS.RATE (green) et eventuels delta.
- **Chart axes** : double axe (cost gauche $, duration droite s). Aucun gradient sur les bars, juste opacity 0.55 (normal) / 0.85 (anomaly amber).
- **Run table** : meme regle border-left que la list view (phosphor RUNNING, red FAILED, transparent OK).
- **Expand inline** : 2 panels cote a cote (INPUT / OUTPUT preview), max-height 110px, `whiteSpace: pre-wrap`, finir par `...` pour signaler la troncature. Pas de syntax highlighting.
- **Error code badge** : variante `crit` du MCBadge, label = code en SCREAMING_SNAKE.
- **Stack trace** : 9.5px mono, `lineHeight: 1.7`, prefix `01 02 03` en text-mute, contenu en text-dim. Pas plus de 3-4 lignes par erreur (truncated).
- **Recent errors** : maximum 5 visibles, bouton "VIEW.ALL" optionnel en footer.

### Mobile

KPIs en grid 2×2, chart conservee mais reduite, runs en liste card (5 max). Errors deplaces a un onglet ou ecran separe.

---

## 8. Coherence checklist (PR review)

- [ ] Aucune nouvelle couleur hors palette.
- [ ] Aucun rounded > 4px sur surface principale.
- [ ] Aucun bouton primaire en phosphor.
- [ ] Aucun gradient hero (uniquement radial halo discret center radar).
- [ ] Aucun emoji.
- [ ] Tous les nombres en `tabular-nums`.
- [ ] Tous les labels uppercase ont `letter-spacing >= 1.4px`.
- [ ] Inter present uniquement sur landing.
- [ ] Lucide stroke 1.5 partout.
- [ ] Severity scale a 4 paliers respectee.
- [ ] Border-left 2px reservee aux severites + LIVE row.

---

## 9. Fichiers livres

| Fichier | Role |
|---|---|
| `mc-tokens.jsx` | Source de verite : palette, fonts, icons, primitives (MCBadge, MCDot, MCPanelHead) |
| `screen-1-provider.jsx` | Provider detail (Anthropic) |
| `screen-2-radar.jsx` | Claude Code Radar (cinema) |
| `screen-3-budgets.jsx` | Budgets & severity walkthrough |
| `screen-4-settings.jsx` | Settings / API keys / orgs |
| `screen-5-landing.jsx` | Landing publique (Inter autorise ici) |
| `screen-6-workflows-list.jsx` | Workflows list filtree (toutes sources) |
| `screen-7-workflow-detail.jsx` | Workflow detail (KPIs + chart + runs + errors) |
| `Costwave Mission Control Screens.html` | Canvas host (5 artboards desktop + 5 mobile) |
| `DESIGN.md` | Ce document |

---

## 10. Prochaines etapes (suggerees)

1. Generer le `tailwind.config.css` v4 reel a partir des tokens ci-dessus.
2. Builder les primitives shadcn (`Button`, `Badge`, `Card`, `Input`, `Table`) avec radius=0 et fonts mono.
3. Ajouter un mode "DEMO" (toutes severites visibles) vs "LIVE" (vraies donnees).
4. Specifier le comportement **BREACH** : auto-throttle UX (modal + actions explicites).
5. Specifier les empty states (provider sans donnees, radar idle, budget non configure).
