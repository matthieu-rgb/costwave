# PLAN.md — Costwave (SaaS PWA-first)

> **Note pour Claude Code** : ce document est auto-suffisant. Ne pose AUCUNE question dans le chat. Suis les phases dans l'ordre. Utilise les sub-agents declares en Phase 0. Entre chaque phase, signale juste "Phase N terminee, je passe a Phase N+1" et continue. Tokens economises = projet livre.

---

## 1. Objectif

Construire et lancer publiquement une **plateforme SaaS PWA** qui permet a n'importe quel utilisateur (developpeur, freelance, agence, equipe) de :

- Tracker en temps reel sa consommation et ses couts sur **tous ses providers IA** (Anthropic, OpenAI, Groq, Mistral, Google, et extensible).
- Tracker l'activite de **ses agents Claude Code** via hooks.
- Tracker l'activite de **ses workflows n8n / GitHub Actions / scripts custom** via SDK Python ou webhooks.
- Definir des **budgets** (par jour, semaine, mois) avec alertes a 50/75/90/100 %.
- Voir l'ensemble depuis n'importe quel appareil (iPhone, iPad, Mac, Windows, Android, Linux) via PWA installable.
- Choisir entre **mode SaaS** (donnees chiffrees sur le serveur Matthieu) et **mode self-hosted**.
- Disposer d'une interface en **francais, anglais et allemand**, switch instantane.
- S'authentifier via **passkey, email magic link, ou email/password + 2FA**.
- Souscrire a un **plan Pro** via Stripe pour debloquer les features avancees.

L'app sera ensuite portee plus tard en wrapper iOS natif pour l'App Store, mais ce n'est PAS l'objet de ce plan. Tout ce qu'on construit ici doit cependant etre compatible avec ce futur portage (API publique stable, design tokens transposables, App Store guidelines respectees en avance).

---

## 2. Decisions techniques majeures

| Domaine | Choix | Raison |
|---|---|---|
| **Framework** | Next.js 15 App Router | RSC + Server Actions = moins de fichiers, moins de tokens. Ecosysteme SaaS mature. PWA-friendly. SEO natif. |
| **Runtime** | Node 22 + Bun (dev) | Bun en dev pour install rapide, Node en prod pour stabilite. |
| **DB** | Postgres 16 | Partage avec Langfuse (economie ressources VPS). |
| **ORM** | Drizzle | Typesafe, leger, faible verbosite. |
| **Auth** | Better Auth | Open source, self-hostable, passkeys natifs, magic link, 2FA. |
| **Tracking LLM** | Langfuse v4 self-hoste | Decision deja validee. SDK + API REST. |
| **Paiement** | Stripe Checkout + Customer Portal | Standard, conforme PSD2/SCA, gestion abos+TVA EU automatique. |
| **i18n** | next-intl | Standard Next.js 15, JSON par locale, server-side. |
| **UI** | Tailwind v4 + shadcn/ui | Composants pret-a-l-emploi, dark mode, accessibles WCAG. |
| **Charts** | Recharts 2.15 | Standard React, declaratif. |
| **Graph viz** | react-force-graph-2d | Radar Claude Code. |
| **Animations** | Framer Motion 12 | Transitions et apparitions. |
| **State serveur** | TanStack Query v5 | Cache + revalidation automatique. |
| **Realtime** | Server-Sent Events (SSE) | Plus simple que WebSocket pour push uni-directionnel. |
| **PWA** | Serwist | Successor de next-pwa, support officiel Next 15. |
| **Push notifs** | Web Push API (VAPID) | Auto-heberge, pas de Firebase. iOS 16.4+ supporte. |
| **Background jobs** | pg-boss | Postgres-based, zero infra supplementaire. |
| **Email** | Resend + React Email | DX excellente, free tier confortable. |
| **Crypto cles API** | AES-256-GCM avec cle derivee Argon2id | Zero-knowledge cote serveur. |
| **Reverse proxy** | Caddy 2.8 | TLS automatique en interne. |
| **Tunnel** | Cloudflare Tunnel | Reutilise infra Matthieu. |
| **Conteneurisation** | Docker Compose v2.30 | Tout-en-un sur le VPS. |
| **Tests** | Vitest + Playwright | Unitaires + E2E. |

---

## 3. Strategie economie de tokens (CRITIQUE)

Regles applicables PENDANT le developpement par Claude Code. Lecture obligatoire avant chaque phase.

1. **Sonnet par defaut.** `/model sonnet` au demarrage. Opus uniquement quand sub-agent `architect` ou `security-auditor` est appele.
2. **Plan Mode systematique.** `Shift+Tab` x2 avant chaque phase d'implementation.
3. **`/clear` entre chaque phase.** Pas de contexte residuel. Toujours commiter avant.
4. **Sub-agents pour exploration et tache isolee.** Le contexte d'exploration ne pollue jamais le main.
5. **Ignore patterns CLAUDE.md respectes.** node_modules, .next, dist, build, coverage, *.lock, *.pyc, .turbo, .swc.
6. **Lecture partielle.** Tout fichier > 500 lignes : offset/limit obligatoire.
7. **Pas de re-lecture.** Fichier deja en contexte = ne pas relire.
8. **Pas de paraphrase.** Pas de "Je vais faire X, Y, Z" avant de coder. Plan Mode suffit.
9. **Pas de resume post-phase.** Juste "Phase N terminee" et continue.
10. **Commits atomiques par feature.** Permet `/clear` sans perte.
11. **WebFetch obligatoire pour docs evolutives** : Better Auth, Langfuse v4, Stripe API, Serwist, hooks Claude Code. Pas de generation depuis la memoire seule.
12. **Generation par template quand possible.** `shadcn add`, `drizzle-kit generate`, `better-auth CLI` : ces commandes generent du code en mass sans tokens. Les utiliser systematiquement.

---

## 4. Structure du repo

```
costwave/
├── CLAUDE.md
├── PLAN.md
├── DESIGN.md
├── README.md
├── .env.example
├── .gitignore
├── docker-compose.yml
├── .claude/
│   ├── settings.json
│   └── agents/
│       ├── architect.md
│       ├── fullstack-dev.md
│       ├── security-auditor.md
│       ├── i18n-translator.md
│       └── devops.md
├── docs/
│   ├── 01-getting-started/
│   ├── 02-architecture/
│   ├── 03-providers/
│   ├── 04-self-hosting/
│   ├── 05-api/
│   ├── 06-security/
│   ├── 07-billing/
│   └── 08-faq/
├── app/                                # Next.js 15
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── drizzle.config.ts
│   ├── Dockerfile
│   ├── public/
│   │   ├── manifest.webmanifest
│   │   ├── icons/
│   │   ├── locales/                    # Genere
│   │   └── docs/                       # Genere
│   ├── scripts/
│   │   ├── copy-docs.mjs
│   │   └── generate-icons.mjs
│   └── src/
│       ├── app/
│       │   ├── [locale]/
│       │   │   ├── (marketing)/
│       │   │   │   ├── page.tsx
│       │   │   │   ├── pricing/page.tsx
│       │   │   │   ├── docs/[[...slug]]/page.tsx
│       │   │   │   └── legal/{privacy,terms}/page.tsx
│       │   │   ├── (auth)/
│       │   │   │   ├── login/page.tsx
│       │   │   │   ├── signup/page.tsx
│       │   │   │   └── magic-link/page.tsx
│       │   │   ├── (app)/
│       │   │   │   ├── layout.tsx
│       │   │   │   ├── page.tsx
│       │   │   │   ├── providers/page.tsx
│       │   │   │   ├── providers/[id]/page.tsx
│       │   │   │   ├── workflows/[id]/page.tsx
│       │   │   │   ├── radar/page.tsx
│       │   │   │   ├── budgets/page.tsx
│       │   │   │   ├── settings/page.tsx
│       │   │   │   └── billing/page.tsx
│       │   │   └── layout.tsx
│       │   ├── api/
│       │   │   ├── auth/[...all]/route.ts
│       │   │   ├── ingest/{claude-code,n8n,generic}/route.ts
│       │   │   ├── stripe/{checkout,portal,webhook}/route.ts
│       │   │   ├── push/{subscribe,vapid-key}/route.ts
│       │   │   ├── stream/[userId]/route.ts
│       │   │   └── health/route.ts
│       │   ├── globals.css
│       │   ├── manifest.ts
│       │   └── sw.ts                    # Serwist
│       ├── components/
│       │   ├── ui/
│       │   ├── marketing/
│       │   ├── app/
│       │   ├── auth/
│       │   ├── billing/
│       │   ├── docs/
│       │   ├── layout/
│       │   └── shared/
│       ├── lib/
│       │   ├── auth.ts
│       │   ├── auth-client.ts
│       │   ├── db/{index,schema,migrations}/
│       │   ├── crypto/{derive-key,encrypt}.ts
│       │   ├── providers/{types,anthropic,openai,groq,mistral,google,registry}.ts
│       │   ├── langfuse.ts
│       │   ├── stripe.ts
│       │   ├── email/{resend,templates}/
│       │   ├── push/{vapid,send}.ts
│       │   ├── jobs/{boss,poll-usage,check-budgets}.ts
│       │   ├── i18n/{config,request}.ts
│       │   └── utils.ts
│       ├── messages/{fr,en,de}.json
│       ├── hooks/{useStream,usePushSubscription,useInstallPrompt}.ts
│       ├── middleware.ts
│       └── instrumentation.ts
├── sdk/
│   └── agent_observability/
│       ├── pyproject.toml
│       ├── README.md
│       └── client.py
├── infra/
│   ├── caddy/Caddyfile
│   ├── cloudflared/config.yml
│   └── scripts/
│       ├── claude_code_hook.py
│       └── deploy.sh
└── tests/
    ├── unit/
    └── e2e/
```

---

## 5. CLAUDE.md (a poser a la racine)

```markdown
# Regles Claude Code pour costwave

## Ignore patterns
- node_modules/, .next/, dist/, build/, coverage/, .turbo/, .swc/
- *.lock, *.log, .env*, .venv/
- app/public/docs/, app/public/locales/ (generes au build)

## Lecture
- Fichier > 500 lignes : offset/limit
- Deja lu : ne pas relire
- Exploration dossier : sub-agent via Task

## Modele
- Sonnet par defaut
- Opus uniquement quand sub-agent architect ou security-auditor appele
- Pas de switch Opus de soi-meme

## Stack imposee (NE PAS DEVIER)
- Next.js 15 App Router (pas Pages Router)
- React 19 + TypeScript 5.6+ strict
- Tailwind v4 (CSS-first)
- shadcn/ui + Radix
- Drizzle ORM (pas Prisma, pas TypeORM)
- Better Auth (pas NextAuth, pas Clerk)
- Stripe (pas Lemon Squeezy)
- next-intl (pas react-i18next)
- Serwist (pas next-pwa)
- Resend (pas Mailgun, pas SendGrid)
- pg-boss (pas BullMQ, pas Inngest)
- Postgres (pas SQLite en prod)
- Langfuse v4 self-hoste pour le tracking LLM

## Conventions code
- TypeScript strict, pas de any
- Server Actions pour mutations, pas de routes API custom sauf webhook/SSE/auth
- async/await, pas de .then().catch()
- Composants RSC par defaut, "use client" minimal
- Tailwind classes inline, pas de CSS modules
- Pas de useEffect+fetch (TanStack Query ou Server Components)
- Tests Vitest a cote du code teste
- E2E Playwright dans tests/e2e/

## Securite (CRITIQUE)
- Aucune cle API user en clair, jamais
- Aucun secret en logs
- HTTPS partout
- Validation Zod sur toutes les entrees user
- Rate limiting sur signup, login, ingest
- CSRF protection via Better Auth

## Commits
- Conventional commits : feat, fix, chore, docs, refactor, test
- Un commit par feature finie
- Toujours commiter avant /clear

## Interdictions
- Pas de localStorage pour donnees sensibles
- Pas de any en TypeScript
- Pas de console.log oublies
- Pas de hardcode de strings UI (toujours via i18n)
- Pas de couleur hex en dur (toujours via design tokens)
```

---

## 6. Sub-agents (`.claude/agents/`)

### 6.1 architect.md

```markdown
---
name: architect
description: Architecte technique. Valide schemas DB, contrats d'API, decisions structurelles. A appeler quand une decision impacte plusieurs couches ou quand un fichier est ambigu dans PLAN.md.
tools: Read, Grep, Glob, WebFetch
model: opus
---

Architecte technique. Connait Next.js 15 App Router, Drizzle, Better Auth, Stripe, Langfuse v4, Serwist. Patterns SaaS multi-tenant.

Quand on t'appelle :
1. Lis PLAN.md, DESIGN.md, CLAUDE.md
2. Lis les fichiers concernes
3. Reponds par : decision, alternatives ecartees, impact, fichiers a modifier
4. Tu ne codes pas. Tu decides.
```

### 6.2 fullstack-dev.md

```markdown
---
name: fullstack-dev
description: Developpeur fullstack Next.js 15. Code pages, Server Components, Server Actions, composants client, schemas Drizzle, libs, hooks. Pour toute tache cote app/.
tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

Developpeur fullstack senior. Stack : Next.js 15 App Router, React 19, TypeScript strict, Drizzle, Better Auth, Tailwind v4, shadcn/ui, TanStack Query, next-intl.

Regles :
- RSC par defaut, "use client" minimal
- Server Actions pour mutations
- Validation Zod systematique
- Tests Vitest a cote
- shadcn/ui prioritaire (npx shadcn add)
- Mobile-first, responsive obligatoire
- i18n via next-intl, jamais de string en dur
- Type safety stricte

Avant de coder : verifie shadcn/ui pour le composant, verifie deps existantes.
```

### 6.3 security-auditor.md

```markdown
---
name: security-auditor
description: Auditeur securite. Verifie crypto, auth, gestion secrets, validation, rate limiting. A appeler avant tout merge sur lib/auth/*, lib/crypto/*, app/api/*.
tools: Read, Grep, Glob, WebFetch
model: opus
---

Auditeur securite senior, niveau OSCP/CPTS. Connait OWASP Top 10, OAuth, JWT, AES-GCM, Argon2, CSRF, XSS.

Quand on t'appelle :
1. Lis fichiers cibles
2. Cherche : secrets en logs, validation manquante, derivation faible, IV reutilises, comparaisons non constant-time, race conditions sur quotas, IDOR, SSRF, prompt injection sur ingest.
3. Rapport structure : findings (severity), reproducer, fix recommande.
4. Tu ne corriges pas, tu signales.
```

### 6.4 i18n-translator.md

```markdown
---
name: i18n-translator
description: Traducteur FR/EN/DE. A appeler quand nouvelles strings UI sont ajoutees pour traduire dans les 3 langues. Trilingue natif.
tools: Read, Edit
model: sonnet
---

Trilingue natif francais/anglais/allemand, specialise localisation SaaS.

Quand on t'appelle :
1. Lis messages/fr.json, en.json, de.json
2. Identifie cles manquantes
3. Traduis professionnel coherent, concis, adapte aux conventions
4. Edit les 3 fichiers en parallele

Conventions :
- FR : "tu" pour app personnelle, "vous" pour landing/marketing/billing
- DE : "Du" pour app, "Sie" pour landing/marketing/billing
- EN : direct, second person
```

### 6.5 devops.md

```markdown
---
name: devops
description: DevOps. Docker Compose, Caddy, Cloudflare Tunnel, deploy. Pour infra/, docker-compose.yml, Dockerfile.
tools: Read, Write, Edit, Bash
model: sonnet
---

DevOps senior. Stack : Docker Compose v2.30, Caddy 2.8, Cloudflare Tunnel, Postgres 16, Langfuse v4 stack.

Regles :
- Healthchecks sur tous services
- depends_on avec service_healthy
- Volumes nommes
- Secrets en .env
- Reseaux Docker isoles
- Restart unless-stopped
- Multi-stage Dockerfiles
- HEALTHCHECK Docker pour Next.js
```

---

## 7. DESIGN.md (deja livre)

Le fichier `DESIGN.md` est deja a la racine du repo, livre par une session Claude Design dediee. C'est la source de verite design absolue. Claude Code doit le lire integralement en Phase 0 et le respecter strictement dans toutes les phases suivantes. Claude Code ne doit JAMAIS modifier ni recreer DESIGN.md.

Le dossier `mockups/` a la racine contient 8 ecrans references en composants JSX :
- `dashboard-b-mission.jsx` (dashboard principal)
- `screen-1-provider.jsx` (vue detail provider)
- `screen-2-radar.jsx` (radar Claude Code)
- `screen-3-budgets.jsx` (page budgets)
- `screen-4-settings.jsx` (settings)
- `screen-5-landing.jsx` (landing publique)
- `screen-6-workflows-list.jsx` (liste workflows automatisations)
- `screen-7-workflow-detail.jsx` (detail workflow + runs history)
- `mc-tokens.jsx` (composant tokens design system)

En cas de doute sur un detail visuel non couvert par DESIGN.md, Claude Code peut consulter le mockup correspondant comme reference d'intention. Les mockups ne sont PAS du code de production — ils ne seront pas integres tels quels dans l'app — mais ils servent de guide visuel pour reproduire fidelement l'intention.

---

## 8. Phases d'execution

> Chaque phase : `/clear` au demarrage, `/model sonnet`, Plan Mode, execution, commit, /clear.

### Phase 0 — Init repo + DESIGN.md + sub-agents (15 min)

**Sub-agent** : aucun
**Modele** : sonnet

1. `mkdir costwave && cd costwave && git init`
2. Creer CLAUDE.md (section 5 de PLAN.md)
3. Creer .claude/agents/ avec les 5 fichiers (section 6)
4. DESIGN.md est deja a la racine, livre par session Claude Design. Lire integralement avant tout autre fichier. Source de verite design absolue. Ne PAS le modifier ni le recreer.
5. Creer .gitignore (Node + .env + .next + coverage + .turbo + .swc + Python + .venv)
6. Creer .env.example avec toutes les vars (section 11)
7. Creer README.md minimaliste pointant PLAN.md et DESIGN.md
8. Commit : `chore: init monorepo with claude code config`

### Phase 1 — Stack Langfuse v4 self-hostee (30 min)

**Sub-agent** : devops
**Modele** : sonnet

1. WebFetch `https://langfuse.com/self-hosting/docker-compose`
2. Creer docker-compose.yml avec services : langfuse-web, langfuse-worker, postgres (partage), clickhouse, redis, minio
3. Volumes nommes, healthchecks, depends_on
4. `docker compose up -d`, verifier Langfuse :3000
5. Compte admin via UI, projet "costwave", recuperer cles, .env
6. Commit : `feat(infra): langfuse v4 self-hosted`

### Phase 2 — Setup Next.js + DB schema + Better Auth + i18n (60 min)

**Sub-agent** : architect (validation schema), fullstack-dev (code)
**Modele** : sonnet, opus pour architect

1. `cd app && bunx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"`
2. Installer deps prod : `drizzle-orm postgres better-auth zod next-intl @tanstack/react-query stripe @stripe/stripe-js framer-motion recharts react-force-graph-2d lucide-react resend react-email pg-boss web-push @serwist/next sonner argon2`
3. Installer dev deps : `drizzle-kit @better-auth/cli @types/web-push vitest @playwright/test @testing-library/react @vitejs/plugin-react`
4. Init shadcn : `bunx shadcn@latest init`, ajouter : `card button input label dialog sheet tabs select badge skeleton tooltip toast switch separator dropdown-menu form alert avatar progress`
5. Configurer Tailwind v4 avec design tokens HSL du DESIGN.md (vars dans globals.css)
6. Configurer next-intl : routing `/[locale]/*`, locales `fr|en|de`, defaut `en`. Middleware i18n.
7. Creer `messages/{fr,en,de}.json` avec cles de base : `common.*`, `auth.*`, `nav.*`, `landing.*`
8. **APPELER architect** pour valider schema Drizzle :
   - `users` (id, email unique, name, locale, theme, createdAt)
   - `accounts`, `sessions`, `verifications`, `passkeys` (Better Auth)
   - `subscriptions` (userId, stripeCustomerId, stripeSubId, plan, status, currentPeriodEnd)
   - `providers_credentials` (id, userId, providerType, label, encryptedKey, encryptedKeyIv, scope, lastSync, createdAt)
   - `provider_usage_snapshots` (id, credentialId, periodStart, periodEnd, model, requests, inputTokens, outputTokens, cachedTokens, costUsd, raw jsonb)
   - `workflows` (id, userId, source, name, createdAt)
   - `events` (id, userId, workflowId, runId, parentRunId, type, status, startedAt, durationMs, tokensIn, tokensOut, costUsd, langfuseTraceId, metadata jsonb)
   - `budgets` (id, userId, scope, targetId, period, amountUsd, alertThresholds int[], createdAt)
   - `budget_alerts_sent` (id, budgetId, threshold, periodStart, sentAt)
   - `push_subscriptions` (id, userId, endpoint, p256dh, auth, deviceLabel, createdAt)
   - `audit_log` (id, userId, action, ip, userAgent, metadata jsonb, createdAt)
9. `bun drizzle-kit generate && bun drizzle-kit migrate`
10. Configurer Better Auth : email/password + magic link + passkey + 2FA TOTP. Session 30j. Adapter Drizzle. Trusted origins. Rate limiting.
11. `bunx @better-auth/cli generate`
12. Pages auth fonctionnelles minimales : login, signup, magic-link, forgot, verify
13. Middleware : i18n + auth (redirect /login si non auth sur (app)/*)
14. Tests Vitest : crypto helpers, validation Zod, server actions auth
15. Health endpoint `/api/health` ping DB + Langfuse
16. Commit : `feat(app): nextjs setup with auth db i18n`

### Phase 3 — Crypto + Providers + Dashboard core (90 min)

**Sub-agent** : security-auditor (avant + apres crypto), fullstack-dev (code), i18n-translator (strings)
**Modele** : sonnet, opus pour security-auditor

1. **APPELER security-auditor AVANT** pour valider approche crypto :
   - Argon2id (memoryCost 64MB, timeCost 3, parallelism 1)
   - Cle 32 bytes derivee
   - AES-256-GCM avec IV aleatoire 12 bytes par chiffrement
   - Tag d'auth verifie au dechiffrement
   - Cle vault dans session encryptee, jamais persistee en clair
   - Reset password = perte cles API (acceptable, documente)
2. Implementer `lib/crypto/derive-key.ts` (Argon2id) et `lib/crypto/encrypt.ts` (AES-256-GCM)
3. Tests Vitest exhaustifs crypto (round-trip, IV unique, tag verifie)
4. `lib/providers/types.ts` avec interface LLMProvider (id, name, authMethod, scopes, fetchUsage, validateKey)
5. `lib/providers/anthropic.ts` (Admin API : `https://api.anthropic.com/v1/organizations/usage_report/messages`)
6. `lib/providers/openai.ts` (`https://api.openai.com/v1/organization/usage/completions`)
7. `lib/providers/groq.ts`, `mistral.ts`, `google.ts` (verifier endpoints via WebFetch des docs officielles)
8. `lib/providers/registry.ts`
9. Server Actions providers : addProvider, removeProvider, syncProvider, validateProvider. Validation Zod, dechiffrement session, appel provider, stockage snapshots.
10. Page `(app)/providers/page.tsx` : liste + bouton Ajouter
11. Page `(app)/providers/[id]/page.tsx` : detail, graphes Recharts, snapshots
12. Dashboard `(app)/page.tsx` : grille KPI cards (cout total mois, evolution, top 3 providers, alertes actives), heatmap 7j, workflows recents
13. Composant `ClaudeCodeRadar.tsx` : react-force-graph-2d, listening SSE
14. Composants `CostChart.tsx`, `BudgetGauge.tsx`, `EventTimeline.tsx`, `ProviderRow.tsx`, `DashboardCards.tsx`
15. SSE endpoint `app/api/stream/[userId]/route.ts` : authentifie, push events temps reel filtres user
16. Hook `hooks/useStream.ts`
17. **APPELER security-auditor APRES** pour audit final crypto + providers + SSE auth
18. **APPELER i18n-translator** pour traduire nouvelles strings fr/en/de
19. Tests E2E Playwright : signup → ajout cle Anthropic test → sync → cout sur dashboard
20. Commit : `feat(app): providers dashboard with encrypted credentials`

### Phase 4 — Budgets + Alertes + Background Jobs + Push (60 min)

**Sub-agent** : fullstack-dev, i18n-translator
**Modele** : sonnet

1. Configurer pg-boss : init dans `lib/jobs/boss.ts`, demarrage worker dans `instrumentation.ts`
2. Job `poll-usage.ts` : toutes les 6h, sync chaque provider de chaque user actif (rate-limited, idempotent)
3. Job `check-budgets.ts` : toutes les 15min, calculer % consomme, comparer thresholds, declencher alertes (idempotent par periode)
4. Web Push : `lib/push/vapid.ts` (cles VAPID en .env), `lib/push/send.ts`
5. Endpoints `/api/push/subscribe` et `/api/push/vapid-key`
6. Hook `hooks/usePushSubscription.ts` : permission + subscribe + send to server
7. Page `(app)/budgets/page.tsx` : liste, creation (scope/period/amount/thresholds), edit, delete
8. Email d'alerte via Resend + React Email : "Budget threshold reached" en FR/EN/DE
9. Push notification d'alerte avec deep link
10. **APPELER i18n-translator** pour nouvelles strings
11. Tests Vitest sur logique detection (edge cases : budget cree au milieu de periode, multiple seuils, etc.)
12. Commit : `feat(app): budgets alerts background jobs push`

### Phase 5 — Stripe + Freemium + Landing Pages (60 min)

**Sub-agent** : fullstack-dev, i18n-translator
**Modele** : sonnet

1. Stripe dashboard : 2 produits test mode :
   - **Free** : 1 provider, 30j historique, 1 budget, 3 langues, dashboard mobile
   - **Pro** (4,99 EUR/mois ou 39,99 EUR/an) : illimite, push, exports CSV, Claude Code radar, support prioritaire
2. `lib/stripe.ts` : client + helpers (createCheckoutSession, createPortalSession, getActiveSubscription)
3. Endpoints `/api/stripe/checkout`, `/api/stripe/portal`, `/api/stripe/webhook` (validation signature, mise a jour subscriptions sur events `customer.subscription.*`, `invoice.payment_*`)
4. Server Action utilitaire `requirePro()` : throw si free
5. Composant `PaywallDialog.tsx`
6. Page `(app)/billing/page.tsx` : plan actuel, Upgrade/Manage
7. Page `(marketing)/pricing/page.tsx`
8. Page `(marketing)/page.tsx` : landing complete (Hero + Features + How it works + Pricing recap + FAQ + Footer)
9. Composant `LanguageSwitcher.tsx` (footer + settings)
10. Pages legales `(marketing)/legal/{privacy,terms}/page.tsx` (templates SaaS, mention Anthropic+OpenAI+Groq+Mistral+Google)
11. **APPELER i18n-translator** pour pages marketing fr/en/de
12. Tests E2E : signup → checkout test (carte test Stripe) → webhook → user devient Pro → action Pro accessible
13. Commit : `feat(app): stripe paywall freemium marketing landing`

### Phase 6 — PWA + Service Worker + Offline + Install (30 min)

**Sub-agent** : fullstack-dev
**Modele** : sonnet

1. Configurer Serwist : `next.config.ts` avec withSerwist, `src/app/sw.ts`
2. Strategie cache :
   - NetworkFirst : `/api/*`
   - CacheFirst : `/icons/*`, `/locales/*`, fonts
   - StaleWhileRevalidate : pages marketing et docs statiques
   - NetworkOnly : `/api/auth/*`, `/api/stripe/*`
3. Manifest dynamique `app/manifest.ts` : nom, description, theme_color (design tokens), icons (192/512/maskable), start_url, display "standalone", lang dynamique
4. Generer icones via `scripts/generate-icons.mjs` (sharp) depuis `assets/logo.svg` (placeholder)
5. Composant `InstallPrompt.tsx` : ecoute `beforeinstallprompt`, toast custom apres 30s
6. Hook `useInstallPrompt.ts`
7. Detecter mode PWA pour padding mobile (safe-area-inset-top/bottom)
8. Tests : install Chrome desktop + iOS Safari, offline, push notification recue meme app fermee
9. Commit : `feat(app): pwa offline install prompt`

### Phase 7 — Hooks Claude Code + n8n + SDK Python (45 min)

**Sub-agent** : fullstack-dev (adapters), devops (hook script), i18n-translator
**Modele** : sonnet

1. WebFetch `https://docs.claude.com/en/docs/claude-code/hooks`
2. Endpoint `/api/ingest/claude-code` : auth via API token user, validation Zod, transformation, ecriture `events`, push Langfuse, broadcast SSE
3. Endpoint `/api/ingest/n8n` : format `{ workflow, executionId, status, durationMs, payload }`
4. Endpoint `/api/ingest/generic` : format universel (cf section 9)
5. Page `(app)/settings/page.tsx` : section "API Tokens" pour generer (visible une fois, hash en DB)
6. Script `infra/scripts/claude_code_hook.py` : standalone Python, lit stdin, POST avec token user en header
7. Documentation `docs/03-providers/06-claude-code.md` : payload schema, config `.claude/settings.json`, activation projet/global
8. Sous-dossier `sdk/agent_observability/` : pyproject.toml + client.py (context manager `track`) + README
9. Page `(app)/workflows/[id]/page.tsx` : runs, events, duree, cout, erreurs
10. Page `(app)/radar/page.tsx` : radar Claude Code stream live SSE
11. **APPELER i18n-translator** pour nouvelles strings
12. Tests E2E : config hook sur test repo → lancer Claude Code dummy run → event sur dashboard
13. Commit : `feat(app): claude code n8n sdk integrations`

### Phase 8 — Polish, accessibilite, edge cases (45 min)

**Sub-agent** : fullstack-dev, security-auditor, i18n-translator
**Modele** : sonnet, opus pour security-auditor

1. Audit accessibilite : keyboard navigation, focus visible, aria-labels, role correct, skip-to-content, prefers-reduced-motion respecte
2. Edge cases providers : cle invalide → message + lien doc, expiree → re-saisie, rate limit → backoff, response shape inattendu → log et continue, network failure → retry job
3. Edge cases auth : email deja inscrit, magic link expire (15min), passkey non supporte, 2FA perdu (recovery codes)
4. Edge cases billing : webhook recu avant email confirme (queue + retry), downgrade Pro→Free (data garde 30j), echec paiement (grace period 7j)
5. Empty states sur toutes listes avec CTA
6. Loading states : Skeleton, pas de layout shift
7. Error boundary global Next.js
8. Audit perf : analyzer bundle, lazy-load Recharts et react-force-graph-2d, dynamic import du radar
9. Tests E2E : 8 happy paths + 3 edge cases critiques (cle invalide, paiement echec, alerte budget)
10. **APPELER security-auditor** pour audit final complet
11. **APPELER i18n-translator** pour revue 3 fichiers messages, fix incoherences
12. Commit : `chore: polish a11y edge cases perf`

### Phase 9 — Documentation integree (60 min)

**Sub-agent** : fullstack-dev (integration), main agent (ecriture)
**Modele** : sonnet

1. Creer dossier `docs/` avec structure :
   - `01-getting-started/{01-overview,02-quick-start,03-pwa-install}.md`
   - `02-architecture/{01-stack,02-data-flow,03-event-schema}.md`
   - `03-providers/{01-anthropic,02-openai,03-groq,04-mistral,05-google,06-claude-code,07-n8n,08-add-custom-source}.md`
   - `04-self-hosting/{01-overview,02-docker-compose,03-cloudflare-tunnel,04-update}.md`
   - `05-api/{01-authentication,02-ingest,03-rate-limits}.md`
   - `06-security/{01-encryption,02-api-key-scopes,03-data-retention}.md`
   - `07-billing/{01-plans,02-payments,03-cancel-refund}.md`
   - `08-faq/index.md` (15 questions)
2. Frontmatter YAML par fichier : `--- updated: 2026-04-30 ---`
3. Script `app/scripts/copy-docs.mjs` : copie docs/ → public/docs/, genere index.json
4. Composant `DocsLayout.tsx` : sidebar tree + content + TOC droite
5. Composant `DocsPage.tsx` : ReactMarkdown + remark-gfm + rehype-highlight + rehype-slug
6. Search Cmd+K via cmdk indexant le contenu cote client
7. Bouton "Edit on GitHub" en haut de chaque page
8. Documents critiques a soigner : `03-providers/06-claude-code.md` (payloads hooks, settings.json), `04-self-hosting/02-docker-compose.md` (guide complet), `06-security/01-encryption.md` (modele de menace, choix Argon2id+AES-GCM)
9. README.md racine : badges, captures (placeholders), quick start, lien doc, license MIT
10. Commit : `docs: full integrated documentation`

### Phase 10 — Deploiement public + soft launch (45 min)

**Sub-agent** : devops
**Modele** : sonnet

1. Completer docker-compose.yml : service `app` (Next.js multi-stage) et `caddy`
2. `infra/caddy/Caddyfile` : `app.costwave.app` → app:3000
3. `infra/cloudflared/config.yml` : tunnel vers caddy:80, hostname `app.costwave.app`
4. `.env.production.example` complete (cf section 11)
5. Script `infra/scripts/deploy.sh` : `git pull && docker compose pull && docker compose up -d --build && bun drizzle-kit migrate`
6. Configurer Stripe webhook endpoint vers prod URL
7. Generer VAPID keys prod
8. Verifier tunnel + PWA installable depuis URL publique
9. Smoke test complet : signup → ajout cle Anthropic test → sync → budget → alerte → upgrade Pro carte test → portal → cancel
10. Push GitHub (repo public, MIT license)
11. Commit final : `chore: production deployment`

---

## 9. Schema d'event universel (reference)

```json
{
  "source": "claude_code | anthropic_api | openai_api | groq_api | mistral_api | google_api | n8n | github_action | cron | custom",
  "workflow": "string",
  "run_id": "uuid",
  "parent_run_id": "uuid | null",
  "event_type": "string",
  "status": "started | success | error",
  "started_at": "iso8601",
  "duration_ms": "int | null",
  "tokens_in": "int | null",
  "tokens_out": "int | null",
  "cost_usd": "float | null",
  "input_summary": "string | null",
  "output_summary": "string | null",
  "metadata": "object"
}
```

---

## 10. App Store guidelines (preparation future app iOS native)

A respecter des V1 web pour faciliter le portage :

- Privacy policy claire et accessible
- Terms of Service accessibles
- Aucune collecte non declaree
- Mention explicite "Your API keys never leave your account, encrypted with your password"
- Pas de tracking publicitaire
- Restore Purchases mecanisme cote SaaS (utile pour wrapper iOS apres)
- Fonctionnement gratuit non bloque par paywall agressif
- Aucun lien externe vers paiement depuis future app iOS (StoreKit obligatoire)

---

## 11. Variables d'environnement (.env.example)

```env
# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.costwave.app
SELF_HOSTED=false

# Database
DATABASE_URL=postgres://app:password@postgres:5432/aicosttracker
POSTGRES_PASSWORD=changeme

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=https://app.costwave.app
BETTER_AUTH_TRUSTED_ORIGINS=https://app.costwave.app

# Langfuse self-hosted
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_HOST=http://langfuse-web:3000
LANGFUSE_SALT=
NEXTAUTH_SECRET=
CLICKHOUSE_PASSWORD=
MINIO_ROOT_PASSWORD=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_YEARLY=

# Email
RESEND_API_KEY=
EMAIL_FROM=Costwave <noreply@0xmatthieu.dev>

# Web Push
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:contact@0xmatthieu.dev

# Cloudflare Tunnel
CLOUDFLARE_TUNNEL_TOKEN=

# Internal
ENCRYPTION_PEPPER=
```

---

## 12. Critere d'acceptation V1

V1 est livree quand TOUS verts :

- Site public sur le domaine final
- Inscription email/password + magic link + passkey + 2FA TOTP fonctionnent
- 5 providers connectables : Anthropic, OpenAI, Groq, Mistral, Google
- Cles API chiffrees AES-256-GCM avec cle derivee Argon2id
- Dashboard agrege par provider et workflow
- Budgets configurables avec alertes 50/75/90/100 % par email + push
- Hooks Claude Code fonctionnels avec radar live
- Webhook n8n + SDK Python fonctionnels
- 3 langues completes : FR, EN, DE (toutes pages, emails, notifs)
- Stripe upgrade/downgrade/portal fonctionnent en test et prod
- PWA installable iOS/Android/Mac/Windows
- Push notifications recues meme app fermee
- Documentation /docs navigable avec search
- Lighthouse landing : Perf > 90, A11y > 95, Best Practices > 95, SEO > 95
- Tests E2E : 8 happy paths + 3 edge cases critiques verts
- Audit security-auditor sans finding High/Critical

---

## 13. Hors scope V1 (V2+)

- App iOS native (wrapper) avec Face ID, widgets, Live Activities, Apple Watch
- App macOS native
- Mode equipe (multi-user organization)
- Plus de providers (Cohere, Replicate, Together, Perplexity, etc.)
- Analytics avance (LTV, MRR widget pour Matthieu)
- Public API documentee (OpenAPI)
- Integration Zapier / Make
- Plan Enterprise (SSO SAML, audit log avance)
- Light mode toggle (V1 dark only, plus rapide a livrer proprement)

---

**FIN DU PLAN. Demarrer Phase 0.**
