'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

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
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-12 reveal px-6">
            <div className="relative group">
                <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full scale-150 opacity-50" />
                <div className="relative p-8 border border-red-500/20 bg-background/50 backdrop-blur-sm index-cut-tr">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-6 animate-pulse" />

                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-red-500/60">Registry_Critical_Failure</span>
                            <h2 className="text-2xl md:text-3xl font-mono font-bold uppercase tracking-tighter">System_Crash</h2>
                        </div>

                        <div className="max-w-md mx-auto p-4 bg-red-500/5 border border-red-500/10">
                            <p className="font-mono text-[10px] uppercase tracking-wider text-red-400/80 leading-relaxed break-all">
                                {`ERR_SIG: ${error.message || "UNIDENTIFIED_STREAM_INTERRUPTION"}`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <p className="max-w-sm font-mono text-[11px] uppercase tracking-widest text-muted-foreground leading-relaxed">
                The indexing sequence encountered a terminal exception.
                Manual synchronization may be required to restore the data feed.
            </p>

            <div className="pt-4">
                <button
                    onClick={() => reset()}
                    className="flex items-center gap-3 border border-red-500/30 px-10 py-4 font-mono text-[10px] font-bold uppercase hover:bg-red-500 hover:text-black transition-all index-cut-tr shadow-[8px_8px_0px_0px_rgba(239,68,68,0.1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none mx-auto group"
                >
                    <RefreshCcw className="h-3 w-3 group-hover:rotate-180 transition-transform duration-500" />
                    Reinitialize_Registry
                </button>
            </div>

            {/* Tech Decorator */}
            <div className="font-mono text-[8px] uppercase tracking-[0.5em] text-muted-foreground/30 absolute bottom-12">
                Memory_Dump: {error.digest || "0x7F22A1ED"}
            </div>
        </div>
    )
}
