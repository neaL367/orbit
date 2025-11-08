'use client'

import React, { Suspense, useState, useEffect, useRef, startTransition } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from '@/components/ui/drawer'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'
import type { Route } from 'next'

function HeaderContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const prevPathnameRef = useRef(pathname)
  const navRef = useRef<HTMLElement>(null)

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Trending', href: '/anime?sort=trending' },
    { label: 'Popular', href: '/anime?sort=popular' },
    { label: 'Top 100', href: '/anime?sort=top-rated' },
    { label: 'Seasonal', href: '/anime?sort=seasonal' },
    { label: 'Schedule', href: '/schedule' },
  ]

  // Close drawer when route changes
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname
      // Close drawer on route change using startTransition to defer state update
      startTransition(() => {
        setOpen(false)
      })
    }
  }, [pathname])

  // Ensure nav is never hidden from assistive technology
  useEffect(() => {
    const navElement = navRef.current
    if (!navElement) return

    // Remove aria-hidden if it gets set (e.g., by drawer library)
    const observer = new MutationObserver(() => {
      if (navElement.getAttribute('aria-hidden') === 'true') {
        navElement.removeAttribute('aria-hidden')
      }
      if (navElement.getAttribute('data-aria-hidden') === 'true') {
        navElement.removeAttribute('data-aria-hidden')
      }
    })

    observer.observe(navElement, {
      attributes: true,
      attributeFilter: ['aria-hidden', 'data-aria-hidden'],
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    if (href.startsWith('/anime')) {
      const urlParams = new URLSearchParams(href.split('?')[1])
      const currentSort = searchParams.get('sort')
      const hrefSort = urlParams.get('sort')
      return pathname === '/anime' && currentSort === hrefSort
    }
    return pathname === href
  }

  // Generate breadcrumbs based on pathname, using navItems for consistency
  const getBreadcrumbs = () => {
    const crumbs: Array<{ label: string; href?: Route }> = []

    if (pathname === '/') {
      return crumbs // No breadcrumb on home page
    }

    // Home is always first (from navItems)
    const homeItem = navItems.find((item) => item.href === '/')
    if (homeItem) {
      crumbs.push({ label: homeItem.label, href: homeItem.href as Route })
    }

    // Parse pathname and match with navItems
    if (pathname.startsWith('/anime/')) {
      // Anime detail page
      const animeId = pathname.split('/')[2]
      if (animeId && /^\d+$/.test(animeId)) {
        crumbs.push({ label: 'Anime' })
        crumbs.push({ label: 'Detail' })
      }
    } else if (pathname === '/anime') {
      // Anime list page - find matching navItem based on sort parameter
      const currentSort = searchParams.get('sort')
      const matchingNavItem = navItems.find((item) => {
        if (!item.href.startsWith('/anime')) return false
        const urlParams = new URLSearchParams(item.href.split('?')[1])
        const itemSort = urlParams.get('sort')
        return itemSort === currentSort
      })
      
      if (matchingNavItem) {
        crumbs.push({ label: matchingNavItem.label })
      } else {
        // Default fallback - use first anime nav item
        const firstAnimeNavItem = navItems.find((item) => item.href.startsWith('/anime'))
        if (firstAnimeNavItem) {
          crumbs.push({ label: firstAnimeNavItem.label })
        } else {
          crumbs.push({ label: 'Anime' })
        }
      }
    } else {
      // Try to find matching navItem for other routes (e.g., /schedule)
      const matchingNavItem = navItems.find((item) => {
        if (item.href === '/') return false
        if (item.href.startsWith('/anime')) return false // Already handled above
        return pathname === item.href
      })
      
      if (matchingNavItem) {
        crumbs.push({ label: matchingNavItem.label })
      }
    }

    return crumbs
  }

  const breadcrumbs = getBreadcrumbs()

  // Filter out "Home" from navigation items (but keep it in navItems for breadcrumb logic)
  const navigationItems = navItems.filter((item) => item.href !== '/')

  return (
    <nav 
      ref={navRef}
      className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg"
      aria-hidden={false}
    >
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand and Breadcrumb */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-white hover:text-zinc-300 transition-colors shrink-0"
            >
              AnimeX
            </Link>
            {breadcrumbs.length > 0 && (
              <>
                <span className="hidden sm:block text-zinc-400 text-lg leading-none pointer-events-none select-none">
                  |
                </span>
                <Breadcrumb className="hidden sm:flex">
                  <BreadcrumbList className="text-zinc-400 flex items-center gap-1.5">
                    {breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <BreadcrumbSeparator className="text-zinc-600" />}
                        <BreadcrumbItem>
                          {crumb.href ? (
                            <BreadcrumbLink asChild>
                              <Link
                                href={crumb.href}
                                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                              >
                                {crumb.label}
                              </Link>
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage className="text-sm font-medium text-white">
                              {crumb.label}
                            </BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 space-x-8">
            {navigationItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href as Route}
                  className={cn(
                    'relative text-sm font-medium rounded-lg transition-all duration-200',
                    active
                      ? 'text-white bg-zinc-800/50'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Mobile Drawer */}
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-zinc-800/50"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </DrawerTrigger>
            <DrawerContent 
              className="bg-zinc-950 border-zinc-800"
              aria-describedby={undefined}
            >
              <DrawerHeader>
                <DrawerTitle className="text-white text-xl font-bold">Navigation</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-4 space-y-1">
                {navigationItems.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <DrawerClose key={item.label} asChild>
                      <Link
                        href={item.href as Route}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                          active
                            ? 'text-white bg-zinc-800/50'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                        )}
                      >
                        {item.label}
                      </Link>
                    </DrawerClose>
                  )
                })}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </nav>
  )
}

export function Header() {
  return (
    <Suspense>
      <HeaderContent />
    </Suspense>
  )
}

