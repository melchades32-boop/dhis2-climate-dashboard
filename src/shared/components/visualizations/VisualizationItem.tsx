import { CircularLoader } from '@dhis2/ui'
import { ChartSelector } from './ChartSelector'
import { DisplayItemContainer } from './DisplayItemContainer'
import { SingleValueCard } from './SingleValueCard'
import { useAnalytics } from '@/shared/hooks/useAnalytics'
import { useFilters } from '@/shared/hooks/useFilters'
import { useVisualization } from '@/shared/hooks/useVisualization'
import { useVisualizationRefs } from '@/shared/hooks/useVisualizationRefs'
import { VisualizationChartType } from '@/shared/schemas'

//TODO
const DEFAULT_COLORS = ['#147cd7', '#0d47a1', '#a0c8f0', '#6abef5']

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

    const {
        analytics,
        loading: analyticsLoading,
        setSelectedOrgUnits,
        setSelectedPeriods,
        selectedOrgUnits,
        selectedPeriods,
    } = useAnalytics({ visualizationConfig: visualization ?? null, params: paramsMap })

    const loading = vizLoading || analyticsLoading
    const isSingleValue = visualization?.type === VisualizationChartType.SINGLE_VALUE

    if (isSingleValue && visualization) {
        return (
            <div className={className}>
                <SingleValueCard
                    visualization={visualization}
                    analytics={analytics}
                    loading={loading}
                    colors={colors}
                    selectedOrgUnits={selectedOrgUnits}
                    selectedPeriods={selectedPeriods}
                    onOrgUnitChange={setSelectedOrgUnits}
                    onPeriodChange={setSelectedPeriods}
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

    return (
        <div className={className}>
            <DisplayItemContainer
                title={visualization?.displayName}
                loading={loading}
                error={error}
                chartRef={chartRef}
                selectedOrgUnits={selectedOrgUnits}
                selectedPeriods={selectedPeriods}
                onOrgUnitChange={setSelectedOrgUnits}
                onPeriodChange={setSelectedPeriods}
            >
                {visualization && analytics && (
                    <ChartSelector
                        analytics={analytics}
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
