import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Route } from 'next'

type SectionHeaderProps = {
  title: string
  subtitle?: string
  viewAllHref?: Route
  viewAllLabel?: string
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = 'View All →',
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-6', className)}>
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && <p className="text-zinc-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          {viewAllLabel}
        </Link>
      )}
    </div>
  )
}

