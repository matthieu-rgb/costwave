import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48 bg-[hsl(var(--mc-panel))]" />
      <Skeleton className="h-64 w-full bg-[hsl(var(--mc-panel))]" />
    </div>
  )
}
