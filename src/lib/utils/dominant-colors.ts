/**
 * Extract dominant colors from an image URL using canvas
 */
export async function extractDominantColors(imageUrl: string): Promise<{
    leftTop: string
    rightTop: string
    leftBottom: string
    rightBottom: string
}> {
    return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'

        img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            if (!ctx) {
                resolve(getDefaultColors())
                return
            }

            // Use a very small canvas for maximum performance
            canvas.width = 50
            canvas.height = 50
            ctx.drawImage(img, 0, 0, 50, 50)

            try {
                // Sample colors from 4 quadrants
                const leftTop = getQuadrantColor(ctx, 0, 0, 25, 25)
                const rightTop = getQuadrantColor(ctx, 25, 0, 25, 25)
                const leftBottom = getQuadrantColor(ctx, 0, 25, 25, 25)
                const rightBottom = getQuadrantColor(ctx, 25, 25, 25, 25)

                resolve({ leftTop, rightTop, leftBottom, rightBottom })
            } catch (e) {
                resolve(getDefaultColors())
            }
        }

        img.onerror = () => {
            resolve(getDefaultColors())
        }

        img.src = imageUrl
    })
}

function getQuadrantColor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
): string {
    const imageData = ctx.getImageData(x, y, width, height)
    const data = imageData.data

    let r = 0, g = 0, b = 0, count = 0

    // Sample every 8th pixel for better performance  
    for (let i = 0; i < data.length; i += 32) {
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
        count++
    }

    if (count === 0) return '#2a2a35'

    r = Math.round(r / count)
    g = Math.round(g / count)
    b = Math.round(b / count)

    // Darken the color for ambient effect, but ensure minimum brightness
    r = Math.round(r * 0.5)
    g = Math.round(g * 0.5)
    b = Math.round(b * 0.5)

    // Ensure minimum brightness to avoid pure black
    const minBrightness = 30
    if (r < minBrightness && g < minBrightness && b < minBrightness) {
        // If all channels are too dark, boost them proportionally
        const boost = minBrightness / Math.max(r, g, b, 1)
        r = Math.min(255, Math.round(r * boost))
        g = Math.min(255, Math.round(g * boost))
        b = Math.min(255, Math.round(b * boost))
    }

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

function getDefaultColors() {
    return {
        leftTop: '#2a2a35',
        rightTop: '#252530',
        leftBottom: '#20202a',
        rightBottom: '#1a1a25'
    }
}
