import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-12 reveal">
            <div className="relative">
                <h1 className="text-[12rem] md:text-[18rem] font-mono font-bold leading-none tracking-tighter text-white/5 select-none">
                    404
                </h1>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="space-y-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary">System_Error</span>
                        <h2 className="text-2xl md:text-4xl font-mono font-bold uppercase tracking-tight">Entry_Not_Found</h2>
                    </div>
                </div>
            </div>

            <p className="max-w-md font-mono text-[11px] uppercase tracking-widest text-muted-foreground leading-relaxed px-6">
                The requested coordinate does not exist within the centralized archive.
                The entry may have been purged or relocated to a different sector.
            </p>

            <div className="pt-8">
                <Link
                    href="/"
                    className="inline-block border border-border px-8 py-3 font-mono text-[10px] font-bold uppercase hover:bg-white hover:text-black transition-all index-cut-tr shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                    Return_To_Base
                </Link>
            </div>

            {/* Decorator */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-20">
                <div className="h-[1px] w-12 bg-border" />
                <span className="font-mono text-[8px] uppercase tracking-[0.3em]">SEC_ID: NULL_PTR</span>
                <div className="h-[1px] w-12 bg-border" />
            </div>
        </div>
    )
}
