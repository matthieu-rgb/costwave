'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addProvider } from '@/app/[locale]/(app)/app/actions/providers';
import type { ProviderType } from '@/lib/providers/types';
import { toast } from 'sonner';

const providers: { value: ProviderType; label: string }[] = [
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'groq', label: 'Groq' },
  { value: 'mistral', label: 'Mistral AI' },
  { value: 'google', label: 'Google AI (Gemini)' },
];

export function AddProviderDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    providerType: ProviderType | '';
    label: string;
    apiKey: string;
    scope: string;
  }>({
    providerType: '',
    label: '',
    apiKey: '',
    scope: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.providerType) {
        toast.error('Please select a provider');
        setLoading(false);
        return;
      }

      const result = await addProvider({
        providerType: formData.providerType,
        label: formData.label,
        apiKey: formData.apiKey,
        scope: formData.scope || undefined,
      });

      if (result.success) {
        toast.success('Provider added successfully');
        setOpen(false);
        setFormData({ providerType: '', label: '', apiKey: '', scope: '' });
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to add provider');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="rounded-sm border-[hsl(var(--mc-phosphor))] bg-[hsl(var(--mc-phosphor))] px-4 py-2 font-mono text-xs text-white hover:bg-[hsl(var(--mc-phosphor))]/90"
      >
        + ADD PROVIDER
      </DialogTrigger>
      <DialogContent className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] font-mono sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg font-semibold">
            ADD PROVIDER
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
            Add a new LLM provider API credential. Your API key will be
            encrypted before storage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="providerType" className="font-mono text-xs">
              Provider
            </Label>
            <Select
              value={formData.providerType}
              onValueChange={(value) =>
                setFormData({ ...formData, providerType: value || '' })
              }
            >
              <SelectTrigger
                id="providerType"
                className="rounded-sm border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-bg))] font-mono text-xs"
              >
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent className="rounded-sm border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] font-mono">
                {providers.map((p) => (
                  <SelectItem
                    key={p.value}
                    value={p.value}
                    className="font-mono text-xs"
                  >
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label" className="font-mono text-xs">
              Label
            </Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              placeholder="e.g., Production, Development"
              className="rounded-sm border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-bg))] font-mono text-xs"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey" className="font-mono text-xs">
              API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              value={formData.apiKey}
              onChange={(e) =>
                setFormData({ ...formData, apiKey: e.target.value })
              }
              placeholder="sk-..."
              className="rounded-sm border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-bg))] font-mono text-xs"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scope" className="font-mono text-xs">
              Scope (optional)
            </Label>
            <Input
              id="scope"
              value={formData.scope}
              onChange={(e) =>
                setFormData({ ...formData, scope: e.target.value })
              }
              placeholder="e.g., read, write"
              className="rounded-sm border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-bg))] font-mono text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-sm border-[hsl(var(--mc-border))] font-mono text-xs"
              disabled={loading}
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              className="rounded-sm border-[hsl(var(--mc-phosphor))] bg-[hsl(var(--mc-phosphor))] font-mono text-xs hover:bg-[hsl(var(--mc-phosphor))]/90"
              disabled={loading}
            >
              {loading ? 'VALIDATING...' : 'ADD PROVIDER'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
