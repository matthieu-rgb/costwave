'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
import { syncProvider, removeProvider } from '@/app/[locale]/(app)/app/actions/providers';
import { toast } from 'sonner';

interface ProviderActionsProps {
  credentialId: string;
}

export function ProviderActions({ credentialId }: ProviderActionsProps) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncProvider(credentialId);
      if (result.success) {
        toast.success('Provider synced successfully');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to sync provider');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await removeProvider(credentialId);
      if (result.success) {
        toast.success('Provider removed successfully');
        router.push('/providers');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to remove provider');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-sm border-[hsl(var(--mc-phosphor))] bg-[hsl(var(--mc-phosphor))] font-mono text-xs hover:bg-[hsl(var(--mc-phosphor))]/90"
        >
          {syncing ? 'SYNCING...' : 'SYNC'}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="rounded-sm border border-[hsl(var(--mc-border))] bg-transparent px-4 py-2 font-mono text-xs hover:bg-[hsl(var(--mc-bg))]"
          >
            MORE
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-sm border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] font-mono"
          >
            <DropdownMenuItem
              onClick={() => setDeleteDialogOpen(true)}
              className="font-mono text-xs text-[hsl(var(--mc-red))]"
            >
              Remove Provider
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] font-mono">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-lg">
              Remove Provider
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
              This will permanently delete this provider credential and all
              associated usage data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-sm border-[hsl(var(--mc-border))] font-mono text-xs">
              CANCEL
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-sm border-[hsl(var(--mc-red))] bg-[hsl(var(--mc-red))] font-mono text-xs hover:bg-[hsl(var(--mc-red))]/90"
            >
              {deleting ? 'REMOVING...' : 'REMOVE'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
