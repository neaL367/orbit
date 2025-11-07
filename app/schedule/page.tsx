'use client'

import { Suspense } from 'react'
import { Content } from '@/features/schedule'

export default function SchedulePage() {
  return (
    <Suspense>
      <Content />
    </Suspense>
  )
}

