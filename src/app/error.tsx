'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 space-y-6 text-center">
            <div className="p-4 rounded-full bg-red-500/10 text-red-500">
                <AlertTriangle className="h-8 w-8" />
            </div>

            <div className="space-y-2 max-w-md">
                <h2 className="text-xl font-bold text-white">Something went wrong!</h2>
                <p className="text-zinc-400 text-sm">
                    {error.message || "We encountered an unexpected error while loading this section."}
                </p>
            </div>

            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="outline" className="border-red-500/30 hover:bg-red-500/10 text-red-500 hover:text-red-400">
                    Try again
                </Button>
            </div>
        </div>
    )
}
