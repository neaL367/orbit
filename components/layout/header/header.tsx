'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useSyncExternalStore, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Route } from 'next'

const menuItems = [
  { label: 'Trending', href: '/anime?sort=trending', sort: 'trending' },
  { label: 'Popular', href: '/anime?sort=popular', sort: 'popular' },
  { label: 'Seasonal', href: '/anime?sort=seasonal', sort: 'seasonal' },
  { label: 'Top Rated', href: '/anime?sort=top-rated', sort: 'top-rated' },
  { label: 'Schedule', href: '/schedule' },
]

const emptySubscriber = () => () => { }

function HeaderContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const mounted = useSyncExternalStore(
    emptySubscriber,
    () => true,
    () => false
  )



  const isActive = (href: string, sort?: string) => {
    if (href === '/') return pathname === '/'
    if (href.startsWith('/anime')) {
      const currentSort = searchParams.get('sort')
      if (sort) return pathname === '/anime' && currentSort === sort
      return pathname === '/anime' && !currentSort
    }
    return pathname === href
  }

  if (!mounted) return <header className="h-16 border-b border-border" />

  return (
    <>
      <header className="sticky top-0 inset-x-0 z-[110] h-14 sm:h-16 bg-background/80 backdrop-blur-xl border-b border-white/5 flex items-center shadow-[0_1px_0_0_rgba(255,255,255,0.03)]">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24 flex justify-between items-center">
          <div className="flex items-center gap-16">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="flex flex-col group z-[110] relative"
            >
              {/* Logo Corner Decors */}
              <div className="absolute -top-2 -left-3 w-2 h-2 border-t border-l border-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -bottom-2 -right-3 w-2 h-2 border-b border-r border-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />

              <span className="font-mono text-lg sm:text-xl font-bold tracking-tighter uppercase leading-none">
                Anime<span className="text-primary italic">X</span>
              </span>
              <span className="font-mono text-[6px] sm:text-[7px] uppercase tracking-[0.4em] sm:tracking-[0.5em] text-muted-foreground leading-none mt-1 sm:mt-1.5 opacity-60">
                Index_Registry
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <span className="font-mono text-[7px] text-muted-foreground/30 uppercase tracking-widest mr-4">[ NAV_PTR ]</span>
              <nav className="flex gap-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href as Route}
                    className={cn(
                      "font-mono text-[9px] uppercase tracking-widest transition-all duration-300 px-4 py-1.5 hover:bg-white/5",
                      isActive(item.href, item.sort)
                        ? "text-primary font-bold bg-white/5"
                        : "text-muted-foreground/60 hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-8 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60 border-l border-white/10 pl-8">
              <div className="flex flex-col gap-0.5">
                <span className="text-[7px] opacity-40">System_Clock</span>
                <span className="text-foreground tabular-nums">13:21:18:04</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[7px] opacity-40">Access_Node</span>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                  </span>
                  <span className="text-foreground font-bold">ST_ONLINE</span>
                </div>
              </div>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 z-[110] text-foreground transition-colors border border-white/10 hover:bg-white/5"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[105] bg-background/98 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)]",
          isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <div className="flex flex-col h-full pt-28 px-8 gap-8">
          <div className="flex flex-col gap-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground border-l border-border pl-4">
              System_Navigation
            </span>
            <nav className="flex flex-col gap-4">
              {menuItems.map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href as Route}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "font-mono text-2xl font-bold uppercase tracking-tighter transition-all duration-300 flex items-center justify-between group",
                    isActive(item.href, item.sort) ? "text-primary" : "text-foreground/60"
                  )}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <span>{item.label.replace(' ', '_')}</span>
                  <div className={cn(
                    "w-2 h-2 border-t border-r border-primary opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0",
                    isActive(item.href, item.sort) && "opacity-100 translate-x-0"
                  )} />
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto pb-12 space-y-8">
            <div className="h-[1px] bg-border/50" />
            <div className="flex flex-col gap-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Core_Status</span>
                <div className="flex items-center gap-2 text-foreground">
                  <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
                  <span>Synchronized</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Access_Token</span>
                <span className="text-foreground">AX-5521-X</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function Header() {
  return (
    <Suspense fallback={<header className="h-16 border-b border-border" />}>
      <HeaderContent />
    </Suspense>
  )
}
