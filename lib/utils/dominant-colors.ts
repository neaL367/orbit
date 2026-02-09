/**
 * Extract dominant colors from an image URL using canvas
 * Uses advanced color extraction with saturation boost and perceptual brightness
 */
export async function extractDominantColors(imageUrl: string): Promise<{
    leftTop: string
    rightTop: string
    leftBottom: string
    rightBottom: string
}> {
    // Use proxy for external images to bypass CORS
    const finalUrl = imageUrl.startsWith('http')
        ? `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
        : imageUrl

    return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'

        img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d', { willReadFrequently: true })

            if (!ctx) {
                resolve(getDefaultColors())
                return
            }

            // Use a small canvas for performance
            canvas.width = 60
            canvas.height = 60
            ctx.drawImage(img, 0, 0, 60, 60)

            try {
                // Sample colors from 4 quadrants with overlap for smoother gradients
                const leftTop = getQuadrantColor(ctx, 0, 0, 35, 35)
                const rightTop = getQuadrantColor(ctx, 25, 0, 35, 35)
                const leftBottom = getQuadrantColor(ctx, 0, 25, 35, 35)
                const rightBottom = getQuadrantColor(ctx, 25, 25, 35, 35)

                resolve({ leftTop, rightTop, leftBottom, rightBottom })
            } catch {
                resolve(getDefaultColors())
            }
        }

        img.onerror = () => {
            resolve(getDefaultColors())
        }

        img.src = finalUrl
    })
}

/**
 * Extract dominant color from a quadrant using median cut algorithm
 */
function getQuadrantColor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
): string {
    const imageData = ctx.getImageData(x, y, width, height)
    const data = imageData.data

    // Collect color samples (skip very dark and very bright pixels)
    const colors: Array<[number, number, number]> = []

    for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const a = data[i + 3]

        // Skip transparent pixels
        if (a < 128) continue

        // Skip near-black and near-white pixels (they don't contribute to ambient feel)
        const brightness = (r + g + b) / 3
        if (brightness < 15 || brightness > 240) continue

        colors.push([r, g, b])
    }

    if (colors.length === 0) {
        return getDefaultColor()
    }

    // Get dominant color using median cut
    const dominantColor = medianCut(colors, 1)[0]

    // Convert to ambient color with enhancements
    return toAmbientColor(dominantColor)
}

/**
 * Simplified median cut algorithm to find dominant colors
 */
function medianCut(
    colors: Array<[number, number, number]>,
    depth: number
): Array<[number, number, number]> {
    if (depth === 0 || colors.length === 0) {
        // Return average color
        const r = colors.reduce((sum, c) => sum + c[0], 0) / colors.length
        const g = colors.reduce((sum, c) => sum + c[1], 0) / colors.length
        const b = colors.reduce((sum, c) => sum + c[2], 0) / colors.length
        return [[Math.round(r), Math.round(g), Math.round(b)]]
    }

    // Find channel with greatest range
    const rRange = Math.max(...colors.map(c => c[0])) - Math.min(...colors.map(c => c[0]))
    const gRange = Math.max(...colors.map(c => c[1])) - Math.min(...colors.map(c => c[1]))
    const bRange = Math.max(...colors.map(c => c[2])) - Math.min(...colors.map(c => c[2]))

    const maxRange = Math.max(rRange, gRange, bRange)
    const channelIndex = maxRange === rRange ? 0 : maxRange === gRange ? 1 : 2

    // Sort by the channel with greatest range
    colors.sort((a, b) => a[channelIndex] - b[channelIndex])

    // Split at median
    const mid = Math.floor(colors.length / 2)

    return [
        ...medianCut(colors.slice(0, mid), depth - 1),
        ...medianCut(colors.slice(mid), depth - 1)
    ]
}

/**
 * Convert RGB color to ambient-optimized hex color
 * Applies saturation boost, darkness, and ensures visual appeal
 */
function toAmbientColor([r, g, b]: [number, number, number]): string {
    // Convert to HSL for better color manipulation
    const hsl = rgbToHsl(r, g, b)

    // Boost saturation for more vibrant ambient colors (but not too much)
    hsl.s = Math.min(1, hsl.s * 1.4)

    // Darken for ambient effect while maintaining color character
    // Use a curve that preserves more saturation in darker tones
    hsl.l = hsl.l * 0.35

    // Ensure minimum brightness to avoid pure black
    hsl.l = Math.max(0.12, hsl.l)

    // Convert back to RGB
    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l)

    return rgbToHex(rgb.r, rgb.g, rgb.b)
}

/**
 * Convert RGB to HSL color space
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min

    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (diff !== 0) {
        s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min)

        switch (max) {
            case r:
                h = ((g - b) / diff + (g < b ? 6 : 0)) / 6
                break
            case g:
                h = ((b - r) / diff + 2) / 6
                break
            case b:
                h = ((r - g) / diff + 4) / 6
                break
        }
    }

    return { h, s, l }
}

/**
 * Convert HSL to RGB color space
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
    }

    let r: number, g: number, b: number

    if (s === 0) {
        r = g = b = l
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    }
}

/**
 * Convert RGB to hex color string
 */
function rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/**
 * Get default fallback colors with subtle variation
 */
function getDefaultColors() {
    return {
        leftTop: '#2a2a35',
        rightTop: '#252530',
        leftBottom: '#20202a',
        rightBottom: '#1a1a25'
    }
}

/**
 * Get single default color
 */
function getDefaultColor(): string {
    return '#2a2a35'
}
