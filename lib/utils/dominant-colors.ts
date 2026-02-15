const COLOR_CACHE_KEY = 'orbit_color_cache'

type ColorPalette = {
    topLeft: string
    topCenter: string
    topRight: string
    midLeft: string
    midCenter: string
    midRight: string
    bottomLeft: string
    bottomCenter: string
    bottomRight: string
}

// In-memory cache to avoid repeated JSON.parse/sessionStorage hits
let memoryCache: Record<string, ColorPalette> = {}
let isCacheLoaded = false

function getCache(): Record<string, ColorPalette> {
    if (typeof window === 'undefined') return {}
    if (isCacheLoaded) return memoryCache

    try {
        const cached = sessionStorage.getItem(COLOR_CACHE_KEY)
        memoryCache = cached ? JSON.parse(cached) : {}
        isCacheLoaded = true
        return memoryCache
    } catch {
        return {}
    }
}

function setCache(url: string, colors: ColorPalette) {
    if (typeof window === 'undefined') return
    memoryCache[url] = colors
    isCacheLoaded = true
    try {
        sessionStorage.setItem(COLOR_CACHE_KEY, JSON.stringify(memoryCache))
    } catch { }
}

function getDefaultColors(): ColorPalette {
    const defaultColor = '#000000' // Or any other default color
    return {
        topLeft: defaultColor,
        topCenter: defaultColor,
        topRight: defaultColor,
        midLeft: defaultColor,
        midCenter: defaultColor,
        midRight: defaultColor,
        bottomLeft: defaultColor,
        bottomCenter: defaultColor,
        bottomRight: defaultColor,
    }
}

export async function extractDominantColors(imageUrl: string): Promise<ColorPalette> {
    // Check cache first
    const cache = getCache()
    if (cache[imageUrl]) return cache[imageUrl]

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

            // Use a small canvas for performance - 40x40 is plenty for ambient sampling
            canvas.width = 40
            canvas.height = 40
            ctx.drawImage(img, 0, 0, 40, 40)

            try {
                // Sample colors from 9 zones (3x3 grid) for higher fidelity
                // Grid layout:
                // [0] [1] [2]  (Top)
                // [3] [4] [5]  (Middle)
                // [6] [7] [8]  (Bottom)
                const gridW = Math.floor(canvas.width / 3)
                const gridH = Math.floor(canvas.height / 3)

                // Helper to get zone color safely
                const getZone = (col: number, row: number) =>
                    getQuadrantColor(ctx, col * gridW, row * gridH, gridW, gridH)

                const colors: ColorPalette = {
                    // Top row
                    topLeft: getZone(0, 0),
                    topCenter: getZone(1, 0),
                    topRight: getZone(2, 0),

                    // Middle row
                    midLeft: getZone(0, 1),
                    midCenter: getZone(1, 1),
                    midRight: getZone(2, 1),

                    // Bottom row
                    bottomLeft: getZone(0, 2),
                    bottomCenter: getZone(1, 2),
                    bottomRight: getZone(2, 2),
                }

                setCache(imageUrl, colors)
                resolve(colors)
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

function getQuadrantColor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
): string {
    const { data } = ctx.getImageData(x, y, width, height)

    let rSum = 0, gSum = 0, bSum = 0, wSum = 0

    // Sample every 3rd pixel
    for (let i = 0; i < data.length; i += 12) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const a = data[i + 3]

        // Soft alpha weight instead of hard threshold
        const alphaWeight = a / 255
        if (alphaWeight < 0.1) continue

        // brightness 0..255
        const br = (r + g + b) / 3

        // Weight:
        // - don’t let near-black dominate
        // - keep highlights, but not overpowering
        // A smooth “bell-ish” weight is more stable than hard skipping.
        const shadowCut = smoothstep(8, 40, br)      // 0 in deep shadow → 1 by ~40
        const highlightSoft = 1 - smoothstep(235, 255, br) // 1 until ~235 → 0 by 255

        // Combine weights
        const w = alphaWeight * shadowCut * (0.55 + 0.45 * highlightSoft)

        if (w <= 0) continue

        rSum += r * w
        gSum += g * w
        bSum += b * w
        wSum += w
    }

    if (wSum <= 0) return getDefaultColor()

    const rr = Math.round(rSum / wSum)
    const gg = Math.round(gSum / wSum)
    const bb = Math.round(bSum / wSum)

    return toAmbientColor([rr, gg, bb])
}

function smoothstep(edge0: number, edge1: number, x: number) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
    return t * t * (3 - 2 * t)
}

function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v))
}

function toAmbientColor([r, g, b]: [number, number, number]): string {
    // Convert to HSL for controlled “YouTube-ish” vibes
    const hsl = rgbToHsl(r, g, b)

    // Dynamic saturation boost: boost low-sat more, high-sat less
    const satBoost = 1.15 + (1 - hsl.s) * 0.35
    hsl.s = Math.min(1, hsl.s * satBoost)

    // Don’t crush luminance.
    // Keep midtones, gently darken highlights, and ensure a nice minimum.
    // (Your old 0.35 basically forced everything into the same dark band.)
    const l = hsl.l
    // Filmic curve-ish: keep midtones more than highlights
    hsl.l = clamp(0.14 + (l * 0.60), 0.14, 0.62)

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
 * Get single default color
 */
function getDefaultColor(): string {
    return '#2a2a35'
}
