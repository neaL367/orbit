import { cn } from "@/lib/utils"

export function AnimexSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("relative overflow-hidden bg-[#0A0A0F] border border-white/5", className)}>
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-pulse" />
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/10" />
        </div>
    )
}

export function SectionSkeleton() {
    return (
        <section className="mb-16">
            <div className="mb-8 space-y-1">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-zinc-800" />
                    <div className="h-9 w-48 bg-zinc-900/50 rounded animate-pulse" />
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                        <AnimexSkeleton className="aspect-[2/3] w-full" />
                        <div className="h-4 w-3/4 bg-zinc-900/50 rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-zinc-900/50 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        </section>
    )
}
