import { useEffect, useRef } from "react"

/**
 * High-performance mouse trajectory hook using requestAnimationFrame and direct DOM manipulation.
 * This avoids React re-renders for mouse movements, providing buttery smooth movement.
 */
export function useMouseTrajectory<T extends HTMLElement>(options: { size: number } = { size: 300 }) {
    const ref = useRef<T>(null)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const handleMouseMove = (e: MouseEvent) => {
            requestAnimationFrame(() => {
                const x = e.clientX - options.size
                const y = e.clientY - options.size
                element.style.transform = `translate(${x}px, ${y}px)`
            })
        }

        window.addEventListener('mousemove', handleMouseMove, { passive: true })
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [options.size])

    return ref
}
