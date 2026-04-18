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
    VisualizationChartType,
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
    if (!config.series || config.series.length === 0) {
        return undefined
    }

    const allDimensions = [...config.columns, ...config.rows, ...config.filters]
    const dxItems = allDimensions.find((d) => d.dimension === 'dx')?.items ?? []

    const overrideById = new Map(config.series.map((s) => [s.dimensionItem, s]))

    const baseAs: 'column' | 'line' =
        config.type === VisualizationChartType.COLUMN ||
        config.type === VisualizationChartType.BAR
            ? 'column'
            : 'line'

    const seriesItems = dxItems.map((item) => {
        const override = overrideById.get(item.id)
        const as: 'column' | 'line' = override?.type
            ? override.type.toLowerCase() === 'column'
                ? 'column'
                : 'line'
            : baseAs
        const yAxis = override?.axis ?? 0
        return { id: item.id, as, yAxis }
    })

    // Only activate multi-series if there is a genuine mix of types or axes
    const uniqueTypes = new Set(seriesItems.map((s) => s.as))
    const uniqueAxes = new Set(seriesItems.map((s) => s.yAxis))
    if (uniqueTypes.size <= 1 && uniqueAxes.size <= 1) {
        return undefined
    }

    const hasSecondAxis = uniqueAxes.has(1)
    const axisConfigs = config.axes ?? []
    const axisBase = (index: number) => {
        const axisConfig = axisConfigs.find((a) => a.index === index)
        const titleText = axisConfig?.title?.text ?? ''
        const titleColor = axisConfig?.title?.fontStyle?.textColor ?? '#000000'
        const bold = axisConfig?.title?.fontStyle?.bold ?? false
        return {
            title: {
                text: titleText,
                style: {
                    color: titleColor,
                    fontWeight: bold ? 'bold' : 'normal',
                    fontSize: '14px',
                },
            },
            labels: {
                enabled: true,
                style: {
                    color: '#000000',
                    fontWeight: 'normal',
                    fontSize: '14px',
                },
            },
            plotLines: [
                {
                    color: '#000000',
                    dashStyle: 'Solid',
                    width: 2,
                    zIndex: 1000,
                    label: { text: '' },
                },
                {
                    color: '#bbbbbb',
                    dashStyle: 'Solid',
                    zIndex: 1000,
                    width: 2,
                    label: { text: '' },
                },
            ],
        }
    }

    const yAxes = hasSecondAxis
        ? [axisBase(0), { ...axisBase(1), opposite: true }]
        : undefined

    return { series: seriesItems, yAxes }
}

export function getSeriesColors(
    config: VisualizationConfig
): MultiSeriesColors {
    if (!config.series || config.series.length === 0) {
        return { seriesColors: [], hasCustomColors: false }
    }

    const colorById = new Map(
        config.series
            .filter((s) => s.color)
            .map((s) => [s.dimensionItem, s.color!])
    )
    if (colorById.size === 0) {
        return { seriesColors: [], hasCustomColors: false }
    }

    const allDimensions = [...config.columns, ...config.rows, ...config.filters]
    const dxItems = allDimensions.find((d) => d.dimension === 'dx')?.items ?? []

    const seriesColors = dxItems.map((item) => colorById.get(item.id) ?? '')
    return { seriesColors, hasCustomColors: true }
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
