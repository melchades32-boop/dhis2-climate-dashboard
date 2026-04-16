import { CircularLoader } from '@dhis2/ui'
import { ChartSelector } from './ChartSelector'
import { DisplayItemContainer } from './DisplayItemContainer'
import { SingleValueCard } from './SingleValueCard'
import { useAnalytics, useYearOverYearAnalytics } from '@/shared/hooks/useAnalytics'
import { useFilters } from '@/shared/hooks/useFilters'
import { useVisualization } from '@/shared/hooks/useVisualization'
import { useVisualizationRefs } from '@/shared/hooks/useVisualizationRefs'
import { VisualizationChartType, YearOverYearVisualizationConfig } from '@/shared/schemas'


const DEFAULT_COLORS = ['#125687', '#e53935', '#43a047', '#8e24aa', '#f9a825']

const YOY_TYPES = new Set([
    VisualizationChartType.YEAR_OVER_YEAR_LINE,
    VisualizationChartType.YEAR_OVER_YEAR_COLUMN,
])

interface VisualizationItemProps {
    id: string
    colors?: string[]
    className?: string
}

export function VisualizationItem({
    id,
    colors = DEFAULT_COLORS,
    className,
}: VisualizationItemProps) {
    const { visualization, loading: vizLoading, error } = useVisualization({ visualizationId: id })
    const { paramsMap } = useFilters()
    const { chartRef, tableRef } = useVisualizationRefs()

    const isYoY = visualization?.type !== undefined && YOY_TYPES.has(visualization.type)

    const {
        analytics,
        loading: analyticsLoading,
        setSelectedOrgUnits,
        setSelectedPeriods,
        selectedOrgUnits,
        selectedPeriods,
    } = useAnalytics({
        visualizationConfig: isYoY ? null : (visualization ?? null),
        params: paramsMap,
    })

    const {
        analytics: yoyAnalytics,
        loading: yoyLoading,
        setSelectedOrgUnits: yoySetOrgUnits,
        setSelectedPeriods: yoySetPeriods,
        selectedOrgUnits: yoyOrgUnits,
        selectedPeriods: yoyPeriods,
    } = useYearOverYearAnalytics({
        visualizationConfig: isYoY ? (visualization as YearOverYearVisualizationConfig) : null,
        params: paramsMap,
    })

    const activeSetOrgUnits = isYoY ? yoySetOrgUnits : setSelectedOrgUnits
    const activeSetPeriods = isYoY ? yoySetPeriods : setSelectedPeriods
    const activeOrgUnits = isYoY ? yoyOrgUnits : selectedOrgUnits
    const activePeriods = isYoY ? yoyPeriods : selectedPeriods

    const loading = vizLoading || (isYoY ? yoyLoading : analyticsLoading)
    const isSingleValue = visualization?.type === VisualizationChartType.SINGLE_VALUE

    if (isSingleValue && visualization) {
        return (
            <div className={className}>
                <SingleValueCard
                    visualization={visualization}
                    analytics={analytics}
                    loading={loading}
                    colors={colors}
                    selectedOrgUnits={activeOrgUnits}
                    selectedPeriods={activePeriods}
                    onOrgUnitChange={activeSetOrgUnits}
                    onPeriodChange={activeSetPeriods}
                />
            </div>
        )
    }

    if (isSingleValue && vizLoading) {
        return (
            <div className={`${className ?? ''} flex items-center justify-center rounded border border-gray-200 bg-white`}>
                <CircularLoader />
            </div>
        )
    }

    const hasData = isYoY ? !!yoyAnalytics : !!analytics

    return (
        <div className={className}>
            <DisplayItemContainer
                title={visualization?.displayName}
                loading={loading}
                error={error}
                chartRef={chartRef}
                selectedOrgUnits={activeOrgUnits}
                selectedPeriods={activePeriods}
                onOrgUnitChange={activeSetOrgUnits}
                onPeriodChange={activeSetPeriods}
            >
                {visualization && hasData && (
                    <ChartSelector
                        analytics={analytics}
                        yoyAnalytics={yoyAnalytics}
                        visualization={visualization}
                        setRef={chartRef}
                        tableRef={tableRef}
                        fullScreen={false}
                        colors={colors}
                    />
                )}
            </DisplayItemContainer>
        </div>
    )
}
