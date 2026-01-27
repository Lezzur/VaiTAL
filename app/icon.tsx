import { ImageResponse } from 'next/og'

// Route segment config
// Route segment config
// export const runtime = 'edge'

// Image metadata
export function generateImageMetadata() {
    return [
        {
            contentType: 'image/png',
            size: { width: 32, height: 32 },
            id: 'favicon',
        },
        {
            contentType: 'image/png',
            size: { width: 192, height: 192 },
            id: 'icon-192',
        },
        {
            contentType: 'image/png',
            size: { width: 512, height: 512 },
            id: 'icon-512',
        },
    ]
}

// Image generation
export default function Icon({ id }: { id: string }) {
    // Percentage-based sizing ensures the cross looks good at any resolution
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    background: 'black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '20%',
                }}
            >
                {/* Vertical bar */}
                <div
                    style={{
                        position: 'absolute',
                        width: '16%',
                        height: '60%',
                        background: 'white',
                    }}
                />
                {/* Horizontal bar */}
                <div
                    style={{
                        position: 'absolute',
                        width: '60%',
                        height: '16%',
                        background: 'white',
                    }}
                />
            </div>
        )
    )
}
