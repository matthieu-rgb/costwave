import { listApiKeys } from './actions';
import { ApiKeysList } from './ApiKeysList';

export default async function ApiKeysPage() {
  const { keys } = await listApiKeys();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-mono-18 font-medium text-text">API Keys</h1>
        <p className="text-mono-12 text-text-dim mt-1">
          Manage API keys for external integrations (Claude Code, n8n, Python SDK)
        </p>
      </div>

      <ApiKeysList initialKeys={keys} />
    </div>
  );
}
