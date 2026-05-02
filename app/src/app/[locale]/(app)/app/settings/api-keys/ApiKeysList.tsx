'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createApiKey, revokeApiKey, listApiKeys } from './actions';
import { Copy, Trash2, Plus } from 'lucide-react';

export function ApiKeysList({ initialKeys }: { initialKeys: any[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    const result = await createApiKey({ name: newKeyName });
    setLoading(false);

    if (result.success && result.apiKey) {
      setGeneratedKey(result.apiKey);
      setNewKeyName('');
      // Refresh list
      const refreshed = await listApiKeys();
      if (refreshed.success) setKeys(refreshed.keys);
    } else {
      toast.error(result.error || 'Failed to create API key');
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;

    const result = await revokeApiKey(keyId);
    if (result.success) {
      toast.success('API key revoked');
      setKeys(keys.filter((k) => k.id !== keyId));
    } else {
      toast.error(result.error || 'Failed to revoke API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <p className="text-mono-11 uppercase tracking-wide text-text-mute">
          {keys.length} active {keys.length === 1 ? 'key' : 'keys'}
        </p>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New API Key
        </Button>
      </div>

      <div className="space-y-3">
        {keys.map((key) => (
          <Card key={key.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-mono-14 font-medium text-text">{key.name}</p>
                <p className="text-mono-12 text-text-dim mt-1 font-mono">
                  {key.keyPrefix}••••••••••••••••••••
                </p>
                <p className="text-mono-10 text-text-mute mt-2">
                  Created {new Date(key.createdAt).toLocaleDateString()}
                  {key.lastUsed && ` · Last used ${new Date(key.lastUsed).toLocaleDateString()}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRevoke(key.id)}
              >
                <Trash2 className="w-4 h-4 text-red" />
              </Button>
            </div>
          </Card>
        ))}

        {keys.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-mono-12 text-text-dim">No API keys yet</p>
            <p className="text-mono-11 text-text-mute mt-1">
              Create one to integrate Claude Code, n8n, or Python SDK
            </p>
          </Card>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>

          {!generatedKey ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Production API, Dev Testing..."
                  disabled={loading}
                />
              </div>
              <Button onClick={handleCreate} disabled={loading} className="w-full">
                Create Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-panel-2 border border-amber rounded p-4">
                <p className="text-mono-11 uppercase tracking-wide text-amber mb-2">
                  Save this key now
                </p>
                <p className="text-mono-11 text-text-dim mb-3">
                  You won&apos;t be able to see it again
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-mono-12 bg-bg p-2 rounded border border-border text-text break-all">
                    {generatedKey}
                  </code>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => copyToClipboard(generatedKey)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => {
                  setGeneratedKey(null);
                  setShowCreateDialog(false);
                }}
                className="w-full"
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
