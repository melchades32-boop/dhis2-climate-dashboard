import { DHIS2PivotTable } from '@hisptz/dhis2-analytics'
import { LegendSet } from '@hisptz/dhis2-utils'
import { isArray, isEmpty } from 'lodash'
import { RefObject, useMemo } from 'react'
import { AnalyticsData, DimensionConfig, VisualizationConfig } from '@/shared/schemas'
import { getVisualizationLegendSet } from '@/shared/utils'

function getDimensionLabel(dim: DimensionConfig): string | undefined {
    if (dim.dimension !== 'ou') { return undefined }
    const levelItem = dim.items.find((item) => item.id.startsWith('LEVEL-'))
    if (!levelItem) { return undefined }
    const name = levelItem.displayName || levelItem.name
    return name ? `${name} levels` : undefined
}

function toLayoutDimensions(dims: DimensionConfig[]) {
    return dims.map((dim) => ({
        dimension: dim.dimension,
        label: getDimensionLabel(dim),
    }))
}

export interface TableVisualizerProps {
    analytics: AnalyticsData
    visualization: VisualizationConfig
    setRef: RefObject<HTMLTableElement | null>
    fullScreen: boolean
}

export function TableVisualizer({
    analytics,
    visualization,
    setRef,
    fullScreen,
}: TableVisualizerProps) {
    const legend = useMemo(() => {
        if (!visualization.legend) {
            return
        }
        if (visualization.legend.strategy === 'FIXED') {
            if (!visualization.legend.set) {
                return
            }
            return {
                ...visualization.legend,
            }
        }

        if (visualization.legend.strategy === 'BY_DATA_ITEM') {
            const legendSets = getVisualizationLegendSet(visualization)
            if (isArray(legendSets)) {
                const legendMap = new Map<string, LegendSet>(
                    legendSets.map(({ dataItem, legendSet }) => [
                        dataItem,
                        legendSet,
                    ])
                )
                return {
                    ...visualization.legend,
                    legendMap,
                }
            }
        }
    }, [visualization.legend])

    return (
        <DHIS2PivotTable
            /*
	 // @ts-expect-error library fix */
            setRef={setRef}
            tableProps={{
                scrollHeight: fullScreen
                    ? `calc(100dvh - 96px)`
                    : `calc(100% - 48px)`,
            }}
            analytics={analytics}
            config={{
                options: {
                    fixColumnHeaders: true,
                    fixRowHeaders: true,
                    showFilterAsTitle:
                        !isEmpty(visualization.filters) &&
                        visualization.filters.every(
                            (f) => f.dimension !== 'ou'
                        ),
                    // @ts-expect-error legend prop not in type definitions but supported at runtime
                    legend: legend,
                },
                layout: {
                    columns: toLayoutDimensions(visualization.columns),
                    filter: toLayoutDimensions(visualization.filters ?? []),
                    rows: toLayoutDimensions(visualization.rows),
                },
            }}
        />
    )
}
