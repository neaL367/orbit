import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
        return new NextResponse('Missing url parameter', { status: 400 })
    }

    try {
        const response = await fetch(imageUrl)

        if (!response.ok) {
            return new NextResponse('Failed to fetch image', { status: response.status })
        }

        const contentType = response.headers.get('content-type')
        const buffer = await response.arrayBuffer()

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType || 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*', // Allow CORS for the proxied image
            },
        })
    } catch (error) {
        console.error('Image proxy error:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
