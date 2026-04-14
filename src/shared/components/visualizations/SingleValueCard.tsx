import { CircularLoader } from '@dhis2/ui'
import { flatten, get, head } from 'lodash'
import { useMemo } from 'react'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import { VisualizationMenu } from './VisualizationMenu'
import type { AnalyticsData, VisualizationConfig } from '@/shared/schemas'
import { numberFormatter } from '@/shared/utils'

interface SingleValueCardProps {
    visualization: VisualizationConfig
    analytics?: AnalyticsData
    colors?: string[]
    loading?: boolean
    selectedOrgUnits?: string[]
    selectedPeriods?: string[]
    onOrgUnitChange?: (ids: string[]) => void
    onPeriodChange?: (ids: string[]) => void
}

export function SingleValueCard({
    visualization,
    analytics,
    colors = ['#147cd7'],
    loading = false,
    selectedOrgUnits,
    selectedPeriods,
    onOrgUnitChange,
    onPeriodChange,
}: SingleValueCardProps) {
    const { rows = [], headers = [], metaData } = analytics ?? {}
    const handle = useFullScreenHandle()

    const valueHeaderIndex = headers.findIndex(({ name }) => name === 'value')
    const dataHeaderIndex = headers.findIndex(({ name }) => name === 'dx')
    const value = parseFloat(get(head(rows), [valueHeaderIndex]) ?? '')
    const dataItemId = get(head(rows), [dataHeaderIndex])
    const dataItem = dataItemId ? metaData?.items[dataItemId] : null
    const isPercentage = dataItem?.indicatorType?.factor === 100

    const periodLabel = useMemo(() => {
        if (visualization.subtitle) { return visualization.subtitle }
        if (!metaData) { return '' }
        const labels = visualization.filters.flatMap((filter) => {
            const dimensions = metaData.dimensions[filter.dimension] ?? []
            return flatten(
                dimensions.map((dim) => metaData.items[dim]?.name).filter(Boolean)
            )
        })
        return labels.join(' & ')
    }, [visualization, metaData])

    const displayValue = isNaN(value)
        ? '—'
        : isPercentage
          ? `${numberFormatter(value)}%`
          : numberFormatter(value)

    const valueColor = colors[0] ?? '#147cd7'

    return (
        <FullScreen handle={handle} className="h-full">
            <div className="flex h-full flex-col justify-between rounded border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-col gap-1">
                        <span className="text-sm font-bold leading-tight text-gray-900">
                            {visualization.displayName}
                        </span>
                        {periodLabel && (
                            <span
                                className="line-clamp-1 text-xs text-gray-500"
                                title={periodLabel}
                            >
                                {periodLabel}
                            </span>
                        )}
                    </div>
                    <VisualizationMenu
                        onFullscreen={() => handle.enter()}
                        selectedOrgUnits={selectedOrgUnits}
                        selectedPeriods={selectedPeriods}
                        onOrgUnitChange={onOrgUnitChange}
                        onPeriodChange={onPeriodChange}
                    />
                </div>

                <div className="flex flex-1 items-center justify-center">
                    {loading ? (
                        <CircularLoader />
                    ) : (
                        <span className="text-5xl font-bold" style={{ color: valueColor }}>
                            {displayValue}
                        </span>
                    )}
                </div>
            </div>
        </FullScreen>
    )
}
