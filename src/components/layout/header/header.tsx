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
      <header className="sticky top-0 inset-x-0 z-[110] h-16 bg-background/90 backdrop-blur-sm border-b border-border flex items-center">
        <div className="container mx-auto px-6 md:px-12 lg:px-24 flex justify-between items-center">
          <div className="flex items-center gap-12">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="flex flex-col group z-[110]"
            >
              <span className="font-mono text-xl font-bold tracking-tighter uppercase leading-none">
                Anime<span className="text-muted-foreground">X</span>
              </span>
              <span className="font-mono text-[8px] uppercase tracking-[0.4em] text-muted-foreground leading-none mt-1">
                Index_Archive
              </span>
            </Link>

            <nav className="hidden md:flex gap-8">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href as Route}
                  className={cn(
                    "font-mono text-[9px] uppercase tracking-widest transition-all duration-300 py-1 border-b",
                    isActive(item.href, item.sort)
                      ? "text-foreground border-foreground"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:border-muted"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-6 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              <div className="hidden sm:block">
                REF_ID: <span className="text-foreground">AX-1903-22</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-foreground animate-pulse" />
                <span className="text-foreground">ONLINE</span>
              </div>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 -mr-2 z-[110] text-foreground transition-colors"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
