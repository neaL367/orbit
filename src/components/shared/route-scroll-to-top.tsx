"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

export function RouteScrollToTop() {
    const pathname = usePathname()

    useEffect(() => {
        // Force scroll to top with no animation to be instant
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        })
    }, [pathname])

    return null
}
