"use client"

import { useState, useEffect, useRef } from "react"

export function useImageLoaded() {
    const [loaded, setLoaded] = useState(false)
    const ref = useRef<HTMLImageElement>(null)

    useEffect(() => {
        if (ref.current?.complete) {
            requestAnimationFrame(() => setLoaded(true))
        }
    }, [])

    const onLoad = () => setLoaded(true)

    return { loaded, onLoad, ref }
}
