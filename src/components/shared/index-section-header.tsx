import { cn } from "@/lib/utils"

interface IndexSectionHeaderProps {
    title: string
    subtitle?: string
    className?: string
}

export function IndexSectionHeader({ title, subtitle, className }: IndexSectionHeaderProps) {
    return (
        <div className={cn("relative flex items-end gap-4 mb-12 group", className)}>
            <div className="flex flex-col">
                <div className="bg-foreground text-background px-4 py-1.5 font-mono text-[12px] font-bold uppercase tracking-tighter index-cut-tr w-fit">
                    {title}
                </div>
                {subtitle && (
                    <span className="font-mono text-[10px] font-medium uppercase text-muted-foreground mt-2 tracking-[0.2em] px-1 opacity-70">
                        {subtitle}
                    </span>
                )}
            </div>
            <div className="flex-1 h-[1px] bg-border group-hover:bg-muted-foreground/50 transition-colors duration-500 mb-5" />
        </div>
    )
}
