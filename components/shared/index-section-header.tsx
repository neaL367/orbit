import { cn } from "@/lib/utils"

interface IndexSectionHeaderProps {
    title: string
    subtitle?: string
    className?: string
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function IndexSectionHeader({ title, subtitle, className, as: Tag = 'h2' }: IndexSectionHeaderProps) {
    return (
        <div className={cn("relative flex items-center gap-3 sm:gap-6 mb-12 sm:mb-16 px-2 sm:px-4 group", className)}>
            {/* Coordinate Label */}
            <div className="hidden lg:block absolute -left-16 top-1/2 -translate-y-1/2 whitespace-nowrap">
                <span className="font-mono text-[7px] text-muted-foreground/30 rotate-180 [writing-mode:vertical-lr] tracking-[0.5em] uppercase">
                    REG_POS: {title.substring(0, 3).toUpperCase()}_0xAA
                </span>
            </div>

            <div className="flex flex-col relative shrink-0">
                {/* Technical Bracket Decor */}
                <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-3 h-3 sm:w-4 sm:h-4 border-t border-l border-primary/20" />

                <Tag className="bg-foreground text-background px-4 py-1.5 sm:px-6 sm:py-2 font-mono text-[9px] sm:text-[11px] font-black uppercase tracking-widest index-cut-tr w-fit relative z-10">
                    {title}
                </Tag>
                {subtitle && (
                    <span className="font-mono text-[8px] sm:text-[10px] uppercase text-primary/60 mt-2 sm:mt-3 tracking-[0.2em] sm:tracking-[0.3em] font-medium animate-in fade-in slide-in-from-left-4 duration-500">
                        /{subtitle.replace(/ /g, "_")}
                    </span>
                )}
            </div>

            <div className="flex-1 flex flex-col gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-700">
                <div className="h-[1px] w-full bg-gradient-to-r from-primary/40 via-primary/10 to-transparent" />
                <div className="h-[1px] w-[60%] bg-gradient-to-r from-primary/20 via-primary/5 to-transparent" />
            </div>

            <div className="hidden md:flex flex-col items-end font-mono text-[7px] text-muted-foreground/40 uppercase tracking-widest gap-1">
                <span>INDEX_PTR_REF: 0x{title.length}FF</span>
                <span className="text-primary/20 italic">ST_READY</span>
            </div>
        </div>
    )
}
