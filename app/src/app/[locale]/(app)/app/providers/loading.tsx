import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64 bg-[hsl(var(--mc-panel))]" />
        <Skeleton className="h-5 w-96 bg-[hsl(var(--mc-panel))]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 bg-[hsl(var(--mc-panel))]" />
        ))}
      </div>
    </div>
  )
}
