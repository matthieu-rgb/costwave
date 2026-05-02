'use client'

import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut } from 'lucide-react'
import { handleLogout } from '@/app/[locale]/(app)/actions'

interface TopBarProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

const breadcrumbMap: Record<string, string> = {
  '/app': 'DASHBOARD',
  '/app/providers': 'PROVIDERS',
  '/app/budgets': 'BUDGETS',
  '/app/radar': 'RADAR',
  '/app/billing': 'BILLING',
  '/app/settings/api-keys': 'SETTINGS / API KEYS',
  '/app/settings/profile': 'SETTINGS / PROFILE',
}

export function TopBar({ user }: TopBarProps) {
  const pathname = usePathname()

  // Extract locale and get path without locale
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '')
  const breadcrumb = breadcrumbMap[pathWithoutLocale] || 'APP'

  return (
    <header className="h-14 border-b border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-bg))] flex items-center justify-between px-6">
      <div className="flex items-center gap-2 font-mono text-[10px] text-[hsl(var(--mc-text-dim))] tracking-wide">
        <span>MISSION CONTROL</span>
        <span>/</span>
        <span className="text-[hsl(var(--mc-text))]">{breadcrumb}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 font-mono text-[11px] px-3 py-2 text-[hsl(var(--mc-text-dim))] hover:text-[hsl(var(--mc-text))]">
          <User className="h-4 w-4" strokeWidth={1.5} />
          {user.name || user.email || 'User'}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-[hsl(var(--mc-panel))] border-[hsl(var(--mc-border))]">
          <DropdownMenuItem className="font-mono text-[11px] text-[hsl(var(--mc-text-dim))] focus:bg-[hsl(var(--mc-panel-2))] focus:text-[hsl(var(--mc-text))]">
            <User className="mr-2 h-4 w-4" strokeWidth={1.5} />
            {user.email}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[hsl(var(--mc-border))]" />
          <DropdownMenuItem
            onClick={() => handleLogout()}
            className="font-mono text-[11px] text-[hsl(var(--mc-red))] focus:bg-[hsl(var(--mc-panel-2))] focus:text-[hsl(var(--mc-red))]"
          >
            <LogOut className="mr-2 h-4 w-4" strokeWidth={1.5} />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
