export const numberFormatter = (value: number) =>
    Intl.NumberFormat('en-GB', {
        notation: 'standard',
        maximumFractionDigits: 2,
    }).format(value)

export const formatLargeNumber = (value: number): string => {
    if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`
    }
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`
    }

    return value.toLocaleString()
}

export const formatDecimal = (value: number, precision: number = 1): string => {
    return value.toFixed(precision)
}

export const formatPercentage = (
    value: number,
    precision: number = 1
): string => {
    return `${value.toFixed(precision)}%`
}

export const formatTemperature = (
    value: number,
    unit: 'C' | 'F' = 'C'
): string => {
    const temp = unit === 'F' ? (value * 9) / 5 + 32 : value
    return `${temp.toFixed(1)}°${unit}`
}

export const formatPrecipitation = (value: number): string => {
    return `${value.toFixed(1)} mm`
}

export const formatHumidity = (value: number): string => {
    return `${value.toFixed(0)}%`
}
