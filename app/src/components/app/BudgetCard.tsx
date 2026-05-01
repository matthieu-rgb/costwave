'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { BudgetGauge } from './BudgetGauge';
import { MCBadge } from './MCBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteBudget } from '@/app/[locale]/(app)/app/budgets/actions';

interface BudgetCardProps {
  budget: {
    id: string;
    name?: string;
    scope: string;
    targetId: string | null;
    period: string;
    amountUsd: string;
    alertThresholds: number[];
  };
  usedAmount: number;
  scopeLabel?: string;
}

export function BudgetCard({ budget, usedAmount, scopeLabel }: BudgetCardProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const maxAmount = parseFloat(budget.amountUsd);
  const percentage = maxAmount > 0 ? (usedAmount / maxAmount) * 100 : 0;

  // Determine severity
  const getSeverity = () => {
    if (percentage >= 100) return 'breach';
    if (percentage >= 90) return 'crit';
    if (percentage >= 75) return 'warn';
    return 'info';
  };

  const severity = getSeverity();
  const isBreach = percentage >= 100;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteBudget(budget.id);
      if (result.success) {
        toast.success('Budget deleted successfully');
        setDeleteDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to delete budget');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div
        className="flex min-h-[240px] flex-col gap-3 border bg-[hsl(var(--mc-panel))] p-3.5"
        style={{
          borderColor: isBreach ? 'hsl(var(--mc-red))' : 'hsl(var(--mc-border))',
          borderLeftWidth: isBreach ? '2px' : '1px',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--mc-text))]">
              {budget.name || scopeLabel || budget.scope}
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-wide text-[hsl(var(--mc-text-mute))]">
              // {scopeLabel || budget.scope}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-[hsl(var(--mc-text-mute))] hover:text-[hsl(var(--mc-text))]">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-sm border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] font-mono text-xs"
            >
              <DropdownMenuItem className="gap-2 text-[hsl(var(--mc-text))]">
                <Pencil className="h-3 w-3" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 text-[hsl(var(--mc-red))]"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Gauge */}
        <div className="flex flex-1 items-center justify-center">
          <BudgetGauge value={percentage} max={100} size={120} />
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between border-t pt-2 font-mono tabular-nums"
          style={{ borderColor: 'hsl(var(--mc-border-soft))' }}
        >
          <span className="text-[11px] text-[hsl(var(--mc-text))]">
            ${usedAmount.toFixed(2)}{' '}
            <span className="text-[hsl(var(--mc-text-mute))]">/ ${maxAmount.toFixed(0)}</span>
          </span>
          <span className="text-[9px] uppercase tracking-wide text-[hsl(var(--mc-text-mute))]">
            {budget.period}
          </span>
        </div>

        {/* Status Badge */}
        <div>
          <MCBadge severity={severity}>
            {isBreach
              ? 'BREACH · OVER'
              : severity === 'crit'
                ? 'CRIT · 90%'
                : severity === 'warn'
                  ? 'WARN · 75%'
                  : 'NOMINAL'}
          </MCBadge>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] font-mono">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[hsl(var(--mc-text))]">
              Delete Budget
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[hsl(var(--mc-text-dim))]">
              This will permanently delete this budget and all associated alerts. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-sm border-[hsl(var(--mc-border))] bg-transparent text-[hsl(var(--mc-text-dim))] hover:bg-[hsl(var(--mc-panel-2))]"
              disabled={deleting}
            >
              CANCEL
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-sm border-[hsl(var(--mc-red))] bg-[hsl(var(--mc-red-dim))] text-[hsl(var(--mc-red))] hover:bg-[hsl(var(--mc-red-dim))]"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'DELETING...' : 'DELETE BUDGET'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
