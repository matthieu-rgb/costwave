'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
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
import { createBudget } from '@/app/[locale]/(app)/budgets/actions';

interface Provider {
  id: string;
  label: string;
  providerType: string;
}

interface Workflow {
  id: string;
  name: string;
}

interface CreateBudgetDialogProps {
  providers?: Provider[];
  workflows?: Workflow[];
}

export function CreateBudgetDialog({ providers = [], workflows = [] }: CreateBudgetDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [scope, setScope] = useState<'global' | 'provider' | 'workflow'>('global');
  const [targetId, setTargetId] = useState('');
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [amount, setAmount] = useState('');
  const [thresholds, setThresholds] = useState<number[]>([75, 90]);

  const toggleThreshold = (value: number) => {
    setThresholds((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value].sort((a, b) => a - b)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createBudget({
        name,
        scope,
        targetId: scope === 'global' ? undefined : targetId,
        period,
        amountUsd: parseFloat(amount),
        alertThresholds: thresholds,
      });

      if (result.success) {
        toast.success('Budget created successfully');
        setOpen(false);
        // Reset form
        setName('');
        setScope('global');
        setTargetId('');
        setPeriod('month');
        setAmount('');
        setThresholds([75, 90]);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to create budget');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-sm border-[hsl(var(--mc-text))] bg-[hsl(var(--mc-text))] px-3.5 py-2 font-mono text-[10.5px] font-semibold uppercase tracking-wide text-[hsl(var(--mc-bg))] hover:bg-[hsl(var(--mc-text))]">
          <Plus className="h-3 w-3" />
          NEW.BUDGET
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] font-mono sm:max-w-[520px]">
        {/* Top accent line */}
        <div
          className="absolute left-0 right-0 top-0 h-px opacity-50"
          style={{
            background: 'linear-gradient(90deg, hsl(var(--mc-phosphor)), transparent 60%)',
          }}
        />

        <DialogHeader>
          <DialogTitle className="font-mono text-[10px] uppercase tracking-wide text-[hsl(var(--mc-text-mute))]">
            NEW.BUDGET / CONFIGURE
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label className="font-mono text-[9px] uppercase tracking-wide text-[hsl(var(--mc-text-mute))]">
              NAME
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monthly Global"
              className="h-8 rounded-sm border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-bg))] font-mono text-[11px] text-[hsl(var(--mc-text))] placeholder:text-[hsl(var(--mc-text-mute))]"
              required
            />
          </div>

          {/* Scope and Period */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1.5">
              <Label className="font-mono text-[9px] uppercase tracking-wide text-[hsl(var(--mc-text-mute))]">
                SCOPE
              </Label>
              <Select value={scope} onValueChange={(v) => setScope(v as typeof scope)}>
                <SelectTrigger className="h-8 rounded-sm border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-bg))] font-mono text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-sm border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] font-mono">
                  <SelectItem value="global">all.providers</SelectItem>
                  <SelectItem value="provider">provider</SelectItem>
                  <SelectItem value="workflow">workflow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="font-mono text-[9px] uppercase tracking-wide text-[hsl(var(--mc-text-mute))]">
                PERIOD
              </Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
                <SelectTrigger className="h-8 rounded-sm border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-bg))] font-mono text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-sm border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] font-mono">
                  <SelectItem value="day">DAILY</SelectItem>
                  <SelectItem value="week">WEEKLY</SelectItem>
                  <SelectItem value="month">MONTHLY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target (if not global) */}
          {scope !== 'global' && (
            <div className="flex flex-col gap-1.5">
              <Label className="font-mono text-[9px] uppercase tracking-wide text-[hsl(var(--mc-text-mute))]">
                TARGET
              </Label>
              <Select value={targetId} onValueChange={setTargetId} required>
                <SelectTrigger className="h-8 rounded-sm border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-bg))] font-mono text-[11px]">
                  <SelectValue placeholder="Select target..." />
                </SelectTrigger>
                <SelectContent className="rounded-sm border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] font-mono">
                  {scope === 'provider' &&
                    providers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label} ({p.providerType})
                      </SelectItem>
                    ))}
                  {scope === 'workflow' &&
                    workflows.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <Label className="font-mono text-[9px] uppercase tracking-wide text-[hsl(var(--mc-text-mute))]">
              LIMIT (USD)
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="800.00"
              className="h-8 rounded-sm border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-bg))] font-mono text-[11px] tabular-nums text-[hsl(var(--mc-text))]"
              required
            />
          </div>

          {/* Alert Thresholds */}
          <div className="flex flex-col gap-1.5">
            <Label className="font-mono text-[9px] uppercase tracking-wide text-[hsl(var(--mc-text-mute))]">
              ALERT.AT (%)
            </Label>
            <div className="flex gap-1.5">
              {[50, 75, 90, 100].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleThreshold(value)}
                  className={`h-8 flex-1 rounded-sm border font-mono text-[10px] uppercase tracking-wide transition-colors ${
                    thresholds.includes(value)
                      ? 'border-[hsl(var(--mc-phosphor))] bg-[hsl(var(--mc-phosphor))] bg-opacity-10 text-[hsl(var(--mc-phosphor))]'
                      : 'border-[hsl(var(--mc-border))] bg-transparent text-[hsl(var(--mc-text-dim))]'
                  }`}
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 border-t border-[hsl(var(--mc-border))] pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="rounded-sm border border-[hsl(var(--mc-border))] bg-transparent font-mono text-[10px] uppercase tracking-wide text-[hsl(var(--mc-text-dim))] hover:bg-[hsl(var(--mc-panel-2))]"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-sm border border-[hsl(var(--mc-text))] bg-[hsl(var(--mc-text))] font-mono text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--mc-bg))] hover:bg-[hsl(var(--mc-text))]"
            >
              {loading ? 'CREATING...' : 'CREATE.BUDGET →'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
