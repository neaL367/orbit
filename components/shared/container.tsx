import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface ContainerProps {
    children: ReactNode
    className?: string
}

export function Container({ children, className }: ContainerProps) {
    return (
        <div className={cn("max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24", className)}>
            {children}
        </div>
    )
}
