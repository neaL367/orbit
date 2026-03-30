"use client"

import { useState, useEffect, useRef } from "react"

export function useImageLoaded() {
    const [loaded, setLoaded] = useState(false)
    const [error, setError] = useState(false)
    const ref = useRef<HTMLImageElement>(null)

    useEffect(() => {
        const img = ref.current
        if (!img) return

        const handleLoad = () => {
            setLoaded(true)
            setError(false)
        }

        const handleError = () => {
            setError(true)
            setLoaded(false)
        }

        // Reset if we have a new image
        setLoaded(false)
        setError(false)

        if (img.complete) {
            handleLoad()
        } else {
            img.addEventListener('load', handleLoad)
            img.addEventListener('error', handleError)
        }

        return () => {
            img.removeEventListener('load', handleLoad)
            img.removeEventListener('error', handleError)
        }
    }, [ref.current?.src])

    const onLoad = () => setLoaded(true)

    return { loaded, error, onLoad, ref }
}
