'use client'

import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { LayoutDashboard, Server, Shield, Activity, CreditCard, Settings, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navItems = [
  { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/providers', label: 'Providers', icon: Server },
  { href: '/app/budgets', label: 'Budgets', icon: Shield },
  { href: '/app/radar', label: 'Radar', icon: Activity },
  { href: '/app/billing', label: 'Billing', icon: CreditCard },
  { href: '/app/settings/api-keys', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-[hsl(var(--mc-border))]">
        <Link href="/app" className="font-mono text-sm font-semibold tracking-[0.15em] text-[hsl(var(--mc-text))]">
          COSTWAVE
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          // Remove locale prefix from pathname for comparison
          const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '')
          const isActive = pathWithoutLocale === item.href || pathWithoutLocale.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 font-mono text-[11px] tracking-wide transition-colors",
                isActive
                  ? "bg-[hsl(var(--mc-panel))] text-[hsl(var(--mc-text))] border-l-2 border-[hsl(var(--mc-phosphor))]"
                  : "text-[hsl(var(--mc-text-dim))] hover:text-[hsl(var(--mc-text))] hover:bg-[hsl(var(--mc-panel))]/50"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )

  return (
    <>
      {/* Mobile burger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-[hsl(var(--mc-panel))] border border-[hsl(var(--mc-border))] text-[hsl(var(--mc-text))]"
        aria-label="Toggle navigation menu"
      >
        {mobileOpen ? (
          <X className="h-5 w-5" strokeWidth={1.5} />
        ) : (
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        )}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-[hsl(var(--mc-bg))] border-r border-[hsl(var(--mc-border))]">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-[hsl(var(--mc-bg))] border-r border-[hsl(var(--mc-border))] z-40 flex flex-col md:hidden">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}
