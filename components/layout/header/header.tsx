"use client"

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useSyncExternalStore, useState } from 'react'
import { Menu, X, Terminal, Globe, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SystemClock } from './system-clock'
import type { Route } from 'next'

const menuItems = [
  { label: 'Trending', href: '/anime?sort=trending', sort: 'trending', code: 'TRX' },
  { label: 'Popular', href: '/anime?sort=popular', sort: 'popular', code: 'POP' },
  { label: 'Seasonal', href: '/anime?sort=seasonal', sort: 'seasonal', code: 'SEA' },
  { label: 'Top Rated', href: '/anime?sort=top-rated', sort: 'top-rated', code: 'RTD' },
  { label: 'Schedule', href: '/schedule', code: 'SCH' },
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
      if (sort) return pathname === '/anime' && (currentSort === sort || (!currentSort && sort === 'trending'))
      return pathname === '/anime'
    }
    return pathname === href
  }

  if (!mounted) return <header className="h-20 border-b border-white/5" />

  return (
    <>
      <header className="sticky top-0 inset-x-0 z-[110] h-20 bg-background/60 backdrop-blur-2xl border-b border-white/5 flex items-center">
        {/* Top Scanning Line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/10" />

        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 flex justify-between items-center">

          {/* Logo Section */}
          <div className="flex items-center gap-12 xl:gap-20">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="flex flex-col group z-[110] relative flex-shrink-0"
            >
              {/* Logo Corner Decors */}
              <div className="absolute -top-1.5 -left-3 w-2 h-2 border-t border-l border-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -bottom-1.5 -right-3 w-2 h-2 border-b border-r border-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />

              <span className="font-mono text-lg sm:text-2xl font-bold tracking-tighter uppercase leading-none">
                Anime<span className="text-primary italic">X</span>
              </span>
              <span className="font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.5em] text-muted-foreground font-bold leading-none mt-1.5 sm:mt-2.5">
                Index_Registry
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href as Route}
                  className={cn(
                    "relative group/nav px-5 py-3 transition-all duration-300",
                    isActive(item.href, item.sort) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex flex-col items-center">
                    <span className={cn(
                      "font-mono text-[9px] font-black tracking-widest opacity-0 -translate-y-1 transition-all group-hover/nav:opacity-100 group-hover/nav:translate-y-0",
                      isActive(item.href, item.sort) && "opacity-100 translate-y-0 text-primary/40"
                    )}>
                      {item.code}
                    </span>
                    <span className="font-mono text-[13px] font-black uppercase tracking-widest mt-0.5">
                      {item.label}
                    </span>
                  </div>

                  {/* Indicator Line */}
                  {isActive(item.href, item.sort) && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary shadow-[0_0_10px_var(--primary)]" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* System Telemetry Section */}
          <div className="flex items-center gap-8">
            <div className="hidden xl:flex items-center gap-10">
              <div className="flex flex-col items-end gap-1.5 border-r border-white/10 pr-10">
                <div className="flex items-center gap-2 font-mono text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
                  <Terminal className="w-2.5 h-2.5" />
                  Kernel_Clock
                </div>
                <div className="font-mono text-[13px] font-black text-foreground/80 tracking-widest">
                  <SystemClock />
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-2 font-mono text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
                  <Globe className="w-2.5 h-2.5" />
                  Network_Link
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                    <span className="font-mono text-[11px] font-black text-foreground uppercase tracking-widest">Active</span>
                  </div>
                  <div className="px-2 py-0.5 border border-white/5 bg-white/[0.03] rounded-sm font-mono text-[9px] font-black text-muted-foreground/40">
                    AX-NODE_01
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              className="lg:hidden p-3 text-foreground transition-all border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] rounded-md active:scale-95"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[105] bg-background/95 backdrop-blur-3xl transition-all duration-700 ease-[cubic-bezier(0.2,0,0,1)]",
          isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        )}
      >
        {/* Background Grid for Mobile Menu */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="flex flex-col h-full pt-32 px-8 gap-12 max-w-lg mx-auto relative z-10">
          <div className="space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-primary/40 font-black">Main_Navigation</span>
            <nav className="flex flex-col gap-2">
              {menuItems.map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href as Route}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "group relative flex items-center justify-between p-6 border border-white/5 transition-all duration-300",
                    isActive(item.href, item.sort) ? "bg-primary border-primary" : "bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                  )}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col">
                    <span className={cn("font-mono text-[10px] font-black opacity-40 mb-1", isActive(item.href, item.sort) && "text-primary-foreground")}>{item.code}</span>
                    <span className={cn("font-mono text-2xl font-black uppercase tracking-tighter", isActive(item.href, item.sort) ? "text-primary-foreground" : "text-foreground")}>
                      {item.label}
                    </span>
                  </div>
                  <Terminal className={cn("w-6 h-6 transition-all", isActive(item.href, item.sort) ? "text-primary-foreground" : "text-muted-foreground/20 group-hover:text-primary/40 group-hover:translate-x-2")} />
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto pb-12 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-white/5 bg-white/[0.01]">
                <span className="block font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30 mb-2">Uptime</span>
                <span className="font-mono text-xs font-black text-emerald-500">99.98%</span>
              </div>
              <div className="p-4 border border-white/5 bg-white/[0.01]">
                <span className="block font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30 mb-2">Protocol</span>
                <span className="font-mono text-xs font-black text-blue-500">HTTPS_V3</span>
              </div>
            </div>
            <div className="flex items-center gap-4 py-6 border-t border-white/10">
              <Cpu className="w-5 h-5 text-primary/40" />
              <span className="font-mono text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground">RegistryCore_v1.2.0</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function Header() {
  return (
    <Suspense fallback={<header className="h-20 border-b border-white/5" />}>
      <HeaderContent />
    </Suspense>
  )
}
