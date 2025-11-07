'use client'

import { Suspense } from 'react'
import { Content } from '@/features/schedule'

export default function SchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16" style={{ maxWidth: '1680px' }}>
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-zinc-800 rounded w-64" />
              <div className="grid grid-cols-7 gap-4">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-6 bg-zinc-800 rounded" />
                    <div className="space-y-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="h-24 bg-zinc-800 rounded" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    >
      <Content />
    </Suspense>
  )
}

