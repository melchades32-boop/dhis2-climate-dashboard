export function getForeground(backgroundColor: string) {
    if (backgroundColor.startsWith('#')) {
        backgroundColor = backgroundColor.slice(1)
    }

    const [r, g, b] = [0, 2, 4].map((i) =>
        parseInt(backgroundColor.substring(i, i + 2), 16)
    )

    const brightness = r! * 0.299 + g! * 0.587 + b! * 0.114
    const threshold = 128

    return brightness > threshold ? 'black' : 'white'
}

export const DEFAULT_CHART_COLORS = [
    '#1f77b4', // Blue
    '#ff7f0e', // Orange
    '#2ca02c', // Green
    '#d62728', // Red
    '#9467bd', // Purple
    '#8c564b', // Brown
    '#e377c2', // Pink
    '#7f7f7f', // Gray
    '#bcbd22', // Olive
    '#17becf', // Cyan
]

// Climate-specific color palette
export const CLIMATE_COLORS = {
    temperature: '#ff4444', // Red for temperature
    precipitation: '#4a90e2', // Blue for precipitation/water
    humidity: '#7ed321', // Green for humidity
    wind: '#f5a623', // Orange for wind
    pressure: '#9013fe', // Purple for pressure
    uv: '#ffcc02', // Yellow for UV index
}

// Lighten or darken a color by a percentage
export const adjustColorLightness = (
    color: string,
    percent: number
): string => {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = ((num >> 8) & 0x00ff) + amt
    const B = (num & 0x0000ff) + amt

    return (
        '#' +
        (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        )
            .toString(16)
            .slice(1)
    )
}
