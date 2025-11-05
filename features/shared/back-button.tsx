'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Route } from 'next'

type BackButtonProps = {
  className?: string
  label?: string
  href?: Route
}

export function BackButton({ className, label = 'Back', href }: BackButtonProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else if (pathname?.match(/^\/anime\/\d+$/)) {
      // If on anime detail page, use browser back
      router.back()
    } else {
      // Navigate to home page to clear all sort/filter URL parameters
      router.push('/' as Route)
    }
  }

  return (
    <Button
      onClick={handleClick}
      className={`${className}`}
      aria-label="Go back"
      variant="outline"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>{label}</span>
    </Button>
  )
}

