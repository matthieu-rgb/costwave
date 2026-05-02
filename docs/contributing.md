# Contributing to Costwave

Thank you for your interest in contributing to Costwave. This guide will help you get started.

## Code of Conduct

Be respectful, constructive, and professional. We welcome contributions from developers of all skill levels.

## Ways to Contribute

- **Bug reports** - File issues with reproduction steps
- **Feature requests** - Propose new features or improvements
- **Code contributions** - Fix bugs, add features, improve performance
- **Documentation** - Fix typos, add examples, improve clarity
- **Testing** - Add unit tests, e2e tests, or test coverage
- **Design** - Improve UI/UX, accessibility, or design system

## Getting Started

### Prerequisites

- **Node.js** 22+ (LTS recommended)
- **Bun** (package manager, optional - can use npm)
- **Docker** (for local Postgres + Langfuse stack)
- **Git**

### Local Development Setup

1. **Fork and clone**:
   ```bash
   git clone https://github.com/[your-username]/costwave.git
   cd costwave
   ```

2. **Install dependencies**:
   ```bash
   cd app
   npm install  # or bun install
   ```

3. **Start infrastructure**:
   ```bash
   docker compose up -d postgres clickhouse redis minio langfuse-web langfuse-worker
   ```

4. **Configure environment**:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with local values:
   ```bash
   DATABASE_URL=postgres://app:password@localhost:5432/costwave
   BETTER_AUTH_SECRET=$(openssl rand -hex 32)
   BETTER_AUTH_URL=http://localhost:3001
   ENCRYPTION_PEPPER=$(openssl rand -hex 32)
   ```

5. **Run database migration**:
   ```bash
   npx drizzle-kit push
   ```

6. **Start dev server**:
   ```bash
   npm run dev
   ```

   App available at http://localhost:3001

### Repo Structure

```
costwave/
├── app/                    # Next.js application
│   ├── src/
│   │   ├── app/           # Routes (App Router)
│   │   ├── components/    # React components
│   │   ├── lib/           # Business logic, utilities
│   │   ├── hooks/         # Custom React hooks
│   │   └── messages/      # i18n translations (en/fr/de)
│   ├── public/            # Static assets
│   ├── tests/             # E2E tests (Playwright)
│   └── package.json
├── sdk/
│   ├── agent_observability/   # Python SDK
│   └── n8n-nodes-costwave/    # n8n custom node
├── hooks/                 # Shell wrappers (Claude Code)
├── docs/                  # User documentation
├── docker-compose.yml     # Local dev stack
└── CLAUDE.md              # Claude Code development rules
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/add-cohere-provider
```

**Branch naming**:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `chore/` - Maintenance, refactoring
- `test/` - Test additions/improvements

### 2. Make Changes

Follow the code style and conventions in [CLAUDE.md](../CLAUDE.md):

- **TypeScript strict mode** - No `any`, explicit types
- **Server Actions for mutations** - Avoid custom API routes (except webhooks, SSE)
- **RSC by default** - Use "use client" minimally
- **Tailwind for styles** - No CSS modules
- **Zod for validation** - All user inputs
- **Tests alongside code** - `MyComponent.tsx` -> `MyComponent.test.tsx`

### 3. Test Locally

**Unit tests**:
```bash
npm run test
```

**E2E tests** (requires dev server running):
```bash
npx playwright test
```

**Type check**:
```bash
npm run type-check
```

**Lint**:
```bash
npm run lint
```

### 4. Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add Cohere provider support"
git commit -m "fix: correct token count for cached responses"
git commit -m "docs: add self-hosting troubleshooting section"
```

**Format**: `<type>: <description>`

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`

### 5. Push and Open PR

```bash
git push origin feature/add-cohere-provider
```

Open a pull request on GitHub with:

- **Clear title** (same as commit message for single-commit PRs)
- **Description** explaining what and why
- **Screenshots** (for UI changes)
- **Checklist**:
  - [ ] Tests added/updated
  - [ ] Documentation updated
  - [ ] No breaking changes (or documented in PR)
  - [ ] Follows code style in CLAUDE.md

## Code Style

### TypeScript

```typescript
// GOOD: Explicit types, no any
interface Provider {
  id: string;
  name: string;
  validateKey(apiKey: string): Promise<boolean>;
}

// BAD: any, implicit types
function addProvider(data: any) {
  // ...
}
```

### Server Actions

```typescript
'use server';

import { z } from 'zod';
import { auth } from '@/lib/auth';

const AddProviderSchema = z.object({
  providerType: z.enum(['anthropic', 'openai', 'groq', 'mistral', 'google']),
  apiKey: z.string().min(1),
  label: z.string().min(1).max(100),
});

export async function addProvider(input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  const parsed = AddProviderSchema.parse(input);

  // ... business logic

  return { success: true, credentialId: '...' };
}
```

### React Components

```typescript
// Server Component (default)
export default async function ProvidersPage() {
  const providers = await getProviders();

  return (
    <div>
      {providers.map(p => <ProviderCard key={p.id} provider={p} />)}
    </div>
  );
}

// Client Component (only when needed)
'use client';

import { useState } from 'react';

export function AddProviderDialog() {
  const [open, setOpen] = useState(false);
  // ...
}
```

### i18n

All UI strings must be translatable:

```typescript
// messages/en.json
{
  "providers": {
    "title": "Providers",
    "add": "Add Provider",
    "none": "No providers yet"
  }
}

// Component
import { useTranslations } from 'next-intl';

export function ProvidersPage() {
  const t = useTranslations('providers');

  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{t('add')}</button>
    </div>
  );
}
```

**Never hardcode strings**:
```typescript
// BAD
<button>Add Provider</button>

// GOOD
<button>{t('providers.add')}</button>
```

## Testing

### Unit Tests (Vitest)

Test critical business logic:

```typescript
// lib/pricing/calculate.test.ts
import { describe, it, expect } from 'vitest';
import { calculateCost } from './calculate';

describe('calculateCost', () => {
  it('calculates Anthropic Claude Sonnet cost correctly', () => {
    const cost = calculateCost({
      provider: 'anthropic',
      model: 'claude-sonnet-4-5-20250929',
      inputTokens: 1000,
      outputTokens: 500,
    });

    expect(cost).toBe('0.01050000');  // (1k/1M * 3) + (500/1M * 15)
  });
});
```

### E2E Tests (Playwright)

Test complete user flows:

```typescript
// tests/e2e/providers.spec.ts
import { test, expect } from '@playwright/test';

test('add Anthropic provider', async ({ page }) => {
  await page.goto('http://localhost:3001/en/login');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'Password123!');
  await page.click('button[type=submit]');

  await page.goto('http://localhost:3001/en/app/providers');
  await page.click('text=Add Provider');
  await page.selectOption('[name=providerType]', 'anthropic');
  await page.fill('[name=apiKey]', 'sk-ant-test-key');
  await page.fill('[name=label]', 'Test Anthropic');
  await page.click('button:has-text("Save")');

  await expect(page.locator('text=Test Anthropic')).toBeVisible();
});
```

## Adding a New Provider

Follow this checklist:

1. **Add pricing** in `lib/pricing/constants.ts`:
   ```typescript
   cohere: {
     'command-r-plus': { input: 3.0, output: 15.0, cached: 0.3 },
   }
   ```

2. **Implement provider** in `lib/providers/cohere.ts`:
   ```typescript
   import type { LLMProvider } from './types';

   export const cohereProvider: LLMProvider = {
     id: 'cohere',
     name: 'Cohere',
     authMethod: 'api_key',

     async validateKey(apiKey: string) {
       const response = await fetch('https://api.cohere.ai/v1/check-api-key', {
         headers: { Authorization: `Bearer ${apiKey}` },
       });
       return { valid: response.ok };
     },

     async fetchUsage(apiKey, from, to) {
       // TODO: Implement if Cohere exposes billing API
       return [];
     },
   };
   ```

3. **Register provider** in `lib/providers/registry.ts`:
   ```typescript
   import { cohereProvider } from './cohere';

   export const providerRegistry = {
     // ... existing
     cohere: cohereProvider,
   };
   ```

4. **Update schema** in `lib/db/schema/providers.ts`:
   ```typescript
   export const providerCredential = pgTable('provider_credential', {
     // ...
     providerType: text('provider_type').notNull().$type<'anthropic' | 'openai' | 'groq' | 'mistral' | 'google' | 'cohere'>(),
   });
   ```

5. **Add tests** in `lib/providers/cohere.test.ts`

6. **Update docs** in `docs/getting-started.md` (supported providers list)

7. **Update i18n** in `messages/en.json`, `fr.json`, `de.json`:
   ```json
   {
     "providers": {
       "cohere": "Cohere"
     }
   }
   ```

## Adding a New Language

1. **Add locale** to `lib/i18n/config.ts`:
   ```typescript
   export const locales = ['en', 'fr', 'de', 'es'] as const;
   ```

2. **Create message file** `messages/es.json`:
   ```json
   {
     "common": {
       "save": "Guardar",
       "cancel": "Cancelar"
     }
   }
   ```

3. **Translate all keys** from `en.json` (use DeepL, human translator preferred)

4. **Update language switcher** (add flag icon, label)

5. **Test** all pages in new locale

## Security

**DO NOT**:
- Commit secrets (API keys, passwords) to Git
- Log sensitive data (API keys, email addresses)
- Use `eval()` or `dangerouslySetInnerHTML`
- Trust user input without validation

**DO**:
- Validate all inputs with Zod
- Use parameterized queries (Drizzle handles this)
- Sanitize user-generated content
- Rate limit expensive operations
- Follow OWASP Top 10 guidelines

If you discover a security vulnerability, email security@[domain] instead of filing a public issue.

## Documentation

Update docs when adding features:

- **User docs** (`docs/*.md`) - For end users
- **Code comments** - JSDoc for public functions
- **README** - For contributors
- **CHANGELOG.md** - On every release

## Release Process

Maintainers only:

1. Update `CHANGELOG.md` with version and changes
2. Tag release: `git tag v1.1.0 && git push origin v1.1.0`
3. GitHub Actions builds and publishes Docker image
4. Update deployment

## Getting Help

- **GitHub Issues** - For bugs and feature requests
- **Discussions** - For questions and ideas
- **Discord** - For real-time chat (link in README)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
