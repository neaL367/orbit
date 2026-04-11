import { useEffect, useRef } from 'react'

/**
 * Reusable intersection observer hook for infinite scrolling or lazy loading.
 */
export function useIntersectionObserver(callback: () => void, options: IntersectionObserverInit = { root: null, rootMargin: '1200px', threshold: 0 }) {
    const targetRef = useRef<HTMLDivElement>(null)
    const savedCallback = useRef(callback)

    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                savedCallback.current()
            }
        }, options)

        const currentTarget = targetRef.current
        if (currentTarget) observer.observe(currentTarget)

        return () => {
            if (currentTarget) observer.unobserve(currentTarget)
            observer.disconnect()
        }
    }, [options])

    return { targetRef }
}
