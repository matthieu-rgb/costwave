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

## Git commit conventions

NEVER add the following to commit messages:
- "Co-Authored-By: Claude" or any AI co-author tag
- "Generated with Claude Code" or any generation marker
- Any reference to AI/Claude/Anthropic

Commits should look human-authored. Use Conventional Commits format only.
