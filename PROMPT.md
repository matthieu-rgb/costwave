# PROMPT.md — Lancement Claude Code

> A coller dans Claude Code apres avoir cree un dossier vide `ai-cost-tracker/` contenant uniquement `PLAN.md`.

---

## Procedure de lancement

### 1. Preparer le terminal

```bash
mkdir ai-cost-tracker
cd ai-cost-tracker
# Copier PLAN.md a la racine
claude
```

### 2. Configurer le modele

```
/model sonnet
```

Sonnet par defaut sur tout le projet. Opus seulement quand `architect` ou `security-auditor` sont appeles. Cette regle seule economise 70-80 % des tokens.

### 3. Entrer en Plan Mode

`Shift+Tab` x2.

### 4. Coller le prompt principal ci-dessous

---

## PROMPT PRINCIPAL (a coller tel quel)

```
Lis PLAN.md a la racine. Document auto-suffisant et contractuel. Tu ne devies pas.

REGLES NON NEGOCIABLES :

1. Aucune question dans le chat. Toutes les decisions sont dans PLAN.md. Ambiguite = choisir l'option la plus standard et continuer.

2. Suis les phases dans l'ordre 0 a 10. Fin de phase = "Phase N terminee, je passe a Phase N+1" et tu continues. Pas de resume, pas de feedback demande.

3. Plan Mode obligatoire avant chaque phase d'implementation. Verifier le plan, executer.

4. Apres chaque phase : commit avec message indique dans PLAN.md, puis /clear AVANT phase suivante.

5. Sub-agents declares dans .claude/agents/ pour les taches qui leur sont assignees dans PLAN.md. Delegue via Task, recupere uniquement le resume.

6. Modele :
   - Sonnet par defaut
   - Opus uniquement quand sub-agent architect ou security-auditor appele
   - Pas de switch Opus de toi-meme

7. Lecture :
   - Respecter ignore patterns CLAUDE.md (cf Phase 0)
   - Fichier > 500 lignes : offset/limit
   - Fichier deja lu : ne pas relire

8. Pas de commande destructive (rm -rf, docker volume prune, git reset --hard) sans confirmation explicite.

9. WebFetch obligatoire AVANT de coder pour ces sources qui evoluent souvent :
   - Langfuse v4 self-hosting (Phase 1) : https://langfuse.com/self-hosting/docker-compose
   - Better Auth setup (Phase 2) : https://www.better-auth.com/docs/installation
   - Drizzle ORM (Phase 2) : https://orm.drizzle.team/docs/get-started
   - Stripe Checkout (Phase 5) : https://docs.stripe.com/checkout/embedded/quickstart
   - Serwist Next.js (Phase 6) : https://serwist.pages.dev/docs/next/getting-started
   - Hooks Claude Code (Phase 7) : https://docs.claude.com/en/docs/claude-code/hooks
   - Endpoints Admin API providers : doc officielle de chaque provider

10. Generation par template a privilegier : npx shadcn add, drizzle-kit generate, better-auth CLI. Ces commandes generent du code en mass sans tokens.

DEMARRAGE :

Tu commences par Phase 0. Lis PLAN.md en entier (offset/limit si > 500 lignes), puis execute Phase 0. Pas de paraphrase, pas de "voici mon plan" : execute.

GO.
```

---

## Surveillance pendant l'execution

### Indicateurs a surveiller

- **Compteur de tokens** : si une phase consomme > 30 % du context, anomalie. Interrompre, /clear, recommencer la phase.
- **Questions cachees** : "Voulez-vous que..." → reponse : `Continue selon PLAN.md.`
- **Deviations stack** : si Claude propose un truc hors PLAN (NextAuth a la place de Better Auth, Prisma a la place de Drizzle, etc.) → reponse : `Pas dans PLAN.md. Suis PLAN.md strictement.`

### Commandes utiles

| Commande | Effet | Quand |
|---|---|---|
| `/clear` | Vide le contexte | Entre chaque phase, obligatoire |
| `/compact` | Resume + vide | Si phase deborde, alternative |
| `/model sonnet` | Switch Sonnet | Au demarrage et apres detour Opus |
| `/model opus` | Switch Opus | Avant appel architect/security-auditor |
| `/cost` | Affiche tokens session | Suivi consommation |
| `Shift+Tab Shift+Tab` | Toggle Plan Mode | Avant chaque phase |
| `Esc Esc` | Annule tour en cours | Si Claude part en vrille |
| `/agents` | Liste sub-agents | Verifier conf |

### Reponses-types courtes (economes)

- Hors-plan : `Pas dans PLAN.md. Reprends derniere etape valide.`
- Question : `Decide selon PLAN.md ou choisis l'option standard. Continue.`
- Sur-explication : `Pas de commentaire. Execute.`

---

## Estimation budget tokens (Sonnet par defaut)

| Phase | Duree | Tokens estimes |
|---|---|---|
| Phase 0 — Init + DESIGN.md + sub-agents | 15min | 12k |
| Phase 1 — Langfuse self-hosted | 30min | 25k |
| Phase 2 — Next.js + DB + Auth + i18n | 60min | 90k |
| Phase 3 — Crypto + Providers + Dashboard | 90min | 130k |
| Phase 4 — Budgets + Jobs + Push | 60min | 65k |
| Phase 5 — Stripe + Landing | 60min | 90k |
| Phase 6 — PWA | 30min | 25k |
| Phase 7 — Hooks + n8n + SDK | 45min | 55k |
| Phase 8 — Polish | 45min | 50k |
| Phase 9 — Documentation | 60min | 90k |
| Phase 10 — Deploiement | 45min | 30k |
| **Total** | **~9h dev** | **~660k tokens** |

Sur Max 5x : tient en 2 sessions de 5h. Sur Max 20x : non-sujet.

Sans discipline (full Opus, pas de /clear, pas de sub-agents) : 4-6x plus, soit 2.5-4M tokens. Tu plafonnes ton abonnement avant la Phase 5.

---

## Apres execution

1. URL publique accessible et PWA installable iOS/Android/Mac/Windows
2. Tester signup avec email reel, magic link, passkey
3. Brancher cle Anthropic perso (Admin API read-only) pour valider le tracking real
4. Hooks Claude Code actifs sur ton repo perso, voir radar live
5. SDK importe dans script TLDR digest, valider tracking real
6. Push GitHub repo public
7. Soft launch : Product Hunt, r/SideProject, r/SaaS, r/ClaudeAI, communautes IA Discord, LinkedIn

Bonne execution.
