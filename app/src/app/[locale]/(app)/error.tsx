'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-6">
        <AlertTriangle className="h-12 w-12 text-[hsl(var(--mc-red))] mx-auto" strokeWidth={1.5} />
        <h2 className="text-xl font-semibold text-[hsl(var(--mc-text))]">
          Something went wrong
        </h2>
        <p className="text-sm text-[hsl(var(--mc-text-dim))]">
          {error.message || 'An unexpected error occurred'}
        </p>
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
      </div>
    </div>
  )
}
