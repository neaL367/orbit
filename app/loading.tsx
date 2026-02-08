export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-6">
                {/* Loader Core */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 border border-primary/20 rotate-45 animate-pulse" />
                    <div className="absolute inset-0 border border-primary/20 -rotate-45 animate-pulse delay-75" />
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>

                {/* Technical Text */}
                <div className="flex flex-col items-center gap-1 font-mono">
                    <span className="text-xs uppercase tracking-[0.5em] text-primary font-bold animate-pulse">
                        System_Loading
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-primary/40">
                        Initializing_Route_Data...
                    </span>
                </div>
            </div>
        </div>
    )
}
