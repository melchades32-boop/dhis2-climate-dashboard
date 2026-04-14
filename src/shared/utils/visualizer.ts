import { ChartType } from '@hisptz/dhis2-analytics'
import { LegendSet } from '@hisptz/dhis2-utils'
import type { YAxisOptions } from 'highcharts'
import {
    camelCase,
    compact,
    flattenDeep,
    fromPairs,
    get,
    isEmpty,
} from 'lodash'
import {
    AnalyticsDimensionSchema,
    DataDimensionItem,
    DimensionConfig,
    LegendSetConfig,
    VisualizationConfig,
} from '@/shared/schemas'


interface MultiSeriesConfig {
    series?: Array<{ id: string; as: 'column' | 'line'; yAxis?: number }>
    yAxes?: Array<Partial<YAxisOptions>>
}

export interface MultiSeriesColors {
    seriesColors: string[]
    hasCustomColors: boolean
}

export function getChartLayout(visualization: VisualizationConfig): {
    category: AnalyticsDimensionSchema[]
    series: AnalyticsDimensionSchema[]
    filter: AnalyticsDimensionSchema[]
} {
    return {
        category: visualization.rows.map((row) => row.dimension),
        series: visualization.columns.map((col) => col.dimension),
        filter: visualization.filters.map((filter) => filter.dimension) ?? [],
    }
}

export function getDataItems(visualization: VisualizationConfig): string[] {
    return compact(
        visualization.dataDimensionItems.map((item) => {
            const dataItem = item[
                camelCase(item.dataDimensionItemType) as keyof typeof item
            ] as DataDimensionItem
            return dataItem?.id
        })
    )
}

export function getPeriods(visualization: VisualizationConfig) {
    const allDimensions = [
        ...visualization.rows,
        ...visualization.columns,
        ...visualization.filters,
    ]
    return flattenDeep(
        allDimensions
            .filter(({ dimension }) => dimension === 'pe')
            .map((item) => item.items.map((item) => item.id))
    )
}

export function getOrgUnits(visualization: VisualizationConfig): Array<string> {
    const allDimensions = [
        ...visualization.rows,
        ...visualization.columns,
        ...visualization.filters,
    ]
    return flattenDeep(
        allDimensions
            .filter(({ dimension }) => dimension === 'ou')
            .map((item) => item.items.map((item) => item.id))
    )
}

export type { MultiSeriesConfig }

export function getMultiSeriesConfig(
    config: VisualizationConfig
): MultiSeriesConfig | undefined {
    if (!config.series || config.series.length === 0) { return undefined }

    const allDimensions = [
        ...config.columns,
        ...config.rows,
        ...config.filters,
    ]
    const dxItems =
        allDimensions.find((d) => d.dimension === 'dx')?.items ?? []

    const seriesItems = config.series.map((s, i) => ({
        id: dxItems[i]?.id ?? s.dimensionItem,
        as: (s.type?.toLowerCase() === 'column' ? 'column' : 'line') as
            | 'column'
            | 'line',
        // DHIS2 axis 1 → left (yAxis 0), axis 2+ → right (yAxis 1)
        yAxis: (s.axis ?? 1) > 1 ? 1 : 0,
    }))

    const hasSecondAxis = config.series.some((s) => (s.axis ?? 1) > 1)
    const yAxes = hasSecondAxis
        ? [{ opposite: false }, { opposite: true }]
        : undefined

    return { series: seriesItems, yAxes }
}

export function getSeriesColors(config: VisualizationConfig): MultiSeriesColors {
    const seriesColors = (config.series ?? []).map((s) => s.color ?? '')
    const hasCustomColors = seriesColors.some((c) => c !== '')
    return {
        seriesColors: hasCustomColors ? seriesColors : [],
        hasCustomColors,
    }
}

export function getChartType(config: VisualizationConfig): ChartType {
    if (config.type.match(/YEAR_OVER_YEAR_/)) {
        return config.type
            .replace('YEAR_OVER_YEAR_', '')
            .toLowerCase()
            .replace('_', '-') as ChartType
    }
    return config.type.toLowerCase().replace('_', '-') as ChartType
}

export function getVisualizationLegendSet(
    config: VisualizationConfig
): LegendSetConfig | undefined {
    if (!config.legend) {
        return
    }
    const legendConfig = config.legend
    switch (legendConfig.strategy) {
        case 'FIXED':
            if (!legendConfig.set?.id) {
                return
            }
            return legendConfig.set as LegendSet
        case 'BY_DATA_ITEM':
            return compact(
                config.dataDimensionItems.map((item) => {
                    const dataItem = get(
                        item,
                        camelCase(item.dataDimensionItemType.toLowerCase())
                    )

                    if (dataItem.legendSet) {
                        return {
                            dataItem: dataItem.id,
                            legendSet: dataItem.legendSet as LegendSet,
                        }
                    }
                    return undefined
                })
            )
    }
}

interface SelectedValues {
    searchParams?: Map<string, string>
    selectedOrgUnits?: string[]
    selectedPeriods?: string[]
}

function getDimensionItems(
    dimension: DimensionConfig[],
    { searchParams, selectedPeriods, selectedOrgUnits }: SelectedValues
) {
    const orgUnitParams = !isEmpty(selectedOrgUnits)
        ? selectedOrgUnits
        : searchParams?.get('ou')?.split(',')
    const periodParams = !isEmpty(selectedPeriods)
        ? selectedPeriods
        : searchParams?.get('pe')?.split(',')
    return fromPairs(
        dimension.map((column) => {
            if (column.dimension === 'ou') {
                if (isEmpty(orgUnitParams)) {
                    return [
                        column.dimension,
                        column.items.map((item) => item.id),
                    ]
                }
                return [column.dimension, orgUnitParams!]
            }
            if (column.dimension === 'pe') {
                if (isEmpty(periodParams)) {
                    return [
                        column.dimension,
                        column.items.map((item) => item.id),
                    ]
                }
                return [column.dimension, periodParams!]
            }
            return [
                column.dimension,
                compact(column.items).map((item) => item.id),
            ]
        })
    )
}

function getColumnItems(
    config: VisualizationConfig,
    selectedValues: SelectedValues
) {
    return getDimensionItems(config.columns, selectedValues)
}

function getRowItems(
    config: VisualizationConfig,
    selectedValues: SelectedValues
) {
    return getDimensionItems(config.rows, selectedValues)
}

function getFilterItems(
    config: VisualizationConfig,
    selectedValues: SelectedValues
) {
    return getDimensionItems(config.filters, selectedValues)
}

export function getVisualizationDimensions(
    config: VisualizationConfig,
    selectedValues: SelectedValues
): {
    [key: string]: Array<string>
} {
    const rows = getRowItems(config, selectedValues)
    const columns = getColumnItems(config, selectedValues)

    return {
        ...rows,
        ...columns,
    }
}

export function getVisualizationFilters(
    config: VisualizationConfig,
    selectedValues: SelectedValues
): {
    [key: string]: Array<string>
} {
    return getFilterItems(config, selectedValues)
}
