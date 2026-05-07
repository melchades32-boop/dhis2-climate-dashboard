import {
    DataTable,
    DataTableCell,
    DataTableColumnHeader,
    DataTableRow,
    TableBody,
    TableHead,
} from '@dhis2/ui'
import { LegendSet } from '@hisptz/dhis2-utils'
import { compact, isArray } from 'lodash'
import { CSSProperties, RefObject, useMemo } from 'react'
import {
    AnalyticsData,
    DimensionConfig,
    LegendStrategy,
    VisualizationConfig,
} from '@/shared/schemas'
import { getVisualizationLegendSet } from '@/shared/utils'
import { getForeground } from '@/shared/utils/colors'

export interface TableVisualizerProps {
    analytics: AnalyticsData
    visualization: VisualizationConfig
    setRef: RefObject<HTMLTableElement | null>
    fullScreen: boolean
}

function getDimensionLabel(dim: DimensionConfig): string | undefined {
    if (dim.dimension !== 'ou') {
        return undefined
    }
    return 'Organisation Units'
}

function buildLegendMap(
    visualization: VisualizationConfig
): Map<string, LegendSet> | undefined {
    const { legend } = visualization
    if (!legend?.strategy) {
        return undefined
    }

    const allDxIds = compact([
        ...visualization.columns,
        ...visualization.rows,
        ...(visualization.filters ?? []),
    ])
        .find((d) => d.dimension === 'dx')
        ?.items.map((i) => i.id) ?? []

    if (legend.strategy === LegendStrategy.FIXED && legend.set) {
        return new Map(allDxIds.map((id) => [id, legend.set as LegendSet]))
    }

    if (legend.strategy === LegendStrategy.BY_DATA_ITEM) {
        const legendSets = getVisualizationLegendSet(visualization)
        if (isArray(legendSets) && legendSets.length > 0) {
            return new Map(
                legendSets.map(({ dataItem, legendSet }) => [
                    dataItem,
                    legendSet,
                ])
            )
        }
        if (legend.set) {
            const sharedSet = legend.set as LegendSet
            return new Map(allDxIds.map((id) => [id, sharedSet]))
        }
    }

    return undefined
}

interface CellStyleParams {
    legendMap: Map<string, LegendSet> | undefined
    legendStyle: string | undefined
    dxId: string
    value: number | undefined
}

function getCellStyle({
    legendMap,
    legendStyle,
    dxId,
    value,
}: CellStyleParams): CSSProperties {
    if (!legendMap || value === undefined) {
        return {}
    }
    const set = legendMap.get(dxId)
    if (!set?.legends) {
        return {}
    }
    const match = set.legends.find(
        (l) =>
            l.startValue !== undefined &&
            l.endValue !== undefined &&
            value >= l.startValue &&
            value <= l.endValue
    )
    if (!match?.color) {
        return {}
    }
    if (legendStyle === 'FILL') {
        return {
            background: match.color,
            color: getForeground(match.color),
        }
    }
    if (legendStyle === 'TEXT') {
        return { color: match.color }
    }
    return {}
}

function formatValue(value: number | undefined): string {
    if (value === undefined) {
        return ''
    }
    return Number.isInteger(value)
        ? value.toString()
        : parseFloat(value.toFixed(2)).toString()
}

export function TableVisualizer({
    analytics,
    visualization,
    fullScreen,
}: TableVisualizerProps) {
    const legendMap = useMemo(
        () => buildLegendMap(visualization),
        [visualization]
    )
    const legendStyle = visualization.legend?.style

    const getMetaItems = (dimId: string) =>
        (analytics.metaData?.dimensions?.[dimId] ?? []).map((id) => ({
            id,
            name:
                (
                    analytics.metaData?.items?.[id] as
                    | { name?: string }
                    | undefined
                )?.name ?? id,
        }))

    // Column dimensions (e.g. [dx, pe]) — outer first, inner second
    const colDims = visualization.columns.map((d) => d.dimension)
    const outerColItems = getMetaItems(colDims[0] ?? 'dx')
    const innerColItems = colDims[1] ? getMetaItems(colDims[1]) : []
    const hasInnerCol = innerColItems.length > 0

    const rowDims = visualization.rows.map((d) => d.dimension)
    const outerRowItems = getMetaItems(rowDims[0] ?? 'ou')
    const dxDimId = colDims.find((d) => d === 'dx') ?? colDims[0] ?? 'dx'

    const headers = analytics.headers ?? []
    const valueIdx = headers.findIndex((h) => h.name === 'value')
    const valueMap = useMemo(() => {
        const map = new Map<string, number>()
        for (const row of analytics.rows ?? []) {
            const key = headers
                .filter((_, i) => i !== valueIdx)
                .map((h) => {
                    const actualIdx = headers.indexOf(h)
                    return `${h.name}:${row[actualIdx]}`
                })
                .sort()
                .join('|')
            const val = parseFloat(row[valueIdx] ?? '')
            if (!isNaN(val)) {
                map.set(key, val)
            }
        }
        return map
    }, [analytics])

    function getValue(dims: Record<string, string>): number | undefined {
        const key = Object.entries(dims)
            .map(([k, v]) => `${k}:${v}`)
            .sort()
            .join('|')
        return valueMap.get(key)
    }

    const rawRowLabel =
        getDimensionLabel(visualization.rows[0]!) ?? visualization.rows[0]?.dimension ?? ''
    const HIDDEN_DIMENSION_KEYS = new Set(['pe', 'ou', 'dx', 'co'])
    const rowLabel = HIDDEN_DIMENSION_KEYS.has(rawRowLabel) ? '' : rawRowLabel

    const scrollHeight = fullScreen
        ? 'calc(100dvh - 96px)'
        : 'calc(100% - 48px)'

    return (
        <div
            style={{ overflowY: 'auto', maxHeight: scrollHeight }}
            className="w-full"
        >
            <DataTable>
                <TableHead>
                    {/* Outer column header row */}
                    <DataTableRow>
                        <DataTableColumnHeader
                            fixed
                            top="0"
                            rowSpan={hasInnerCol ? '2' : '1'}
                        >
                            {rowLabel}
                        </DataTableColumnHeader>
                        {outerColItems.map((outer) => (
                            <DataTableColumnHeader
                                key={outer.id}
                                align="center"
                                colSpan={
                                    hasInnerCol
                                        ? innerColItems.length.toString()
                                        : '1'
                                }
                                fixed
                                top="0"
                            >
                                {outer.name}
                            </DataTableColumnHeader>
                        ))}
                    </DataTableRow>
                    {/* Inner column header row (periods) */}
                    {hasInnerCol && (
                        <DataTableRow>
                            {outerColItems.flatMap((outer) =>
                                innerColItems.map((inner) => (
                                    <DataTableColumnHeader
                                        key={`${outer.id}-${inner.id}`}
                                        align="center"
                                        fixed
                                        top="0"
                                    >
                                        {inner.name}
                                    </DataTableColumnHeader>
                                ))
                            )}
                        </DataTableRow>
                    )}
                </TableHead>
                <TableBody>
                    {outerRowItems.map((rowItem) => (
                        <DataTableRow key={rowItem.id}>
                            <DataTableCell
                                tag="th"
                                fixed
                                bordered
                                className="font-medium whitespace-nowrap"
                            >
                                {rowItem.name}
                            </DataTableCell>
                            {outerColItems.flatMap((outer) => {
                                const colCells = hasInnerCol
                                    ? innerColItems.map((inner) => {
                                        const dims: Record<string, string> =
                                        {
                                            [rowDims[0]!]: rowItem.id,
                                            [colDims[0]!]: outer.id,
                                            [colDims[1]!]: inner.id,
                                        }
                                        const value = getValue(dims)
                                        const dxId =
                                            dxDimId === colDims[0]
                                                ? outer.id
                                                : inner.id
                                        const style = getCellStyle({
                                            legendMap,
                                            legendStyle,
                                            dxId,
                                            value,
                                        })
                                        return (
                                            <DataTableCell
                                                key={`${outer.id}-${inner.id}`}
                                                align="center"
                                                bordered
                                                style={style}
                                            >
                                                {formatValue(value)}
                                            </DataTableCell>
                                        )
                                    })
                                    : [
                                        (() => {
                                            const dims: Record<
                                                string,
                                                string
                                            > = {
                                                [rowDims[0]!]: rowItem.id,
                                                [colDims[0]!]: outer.id,
                                            }
                                            const value = getValue(dims)
                                            const style = getCellStyle({
                                                legendMap,
                                                legendStyle,
                                                dxId: outer.id,
                                                value,
                                            })
                                            return (
                                                <DataTableCell
                                                    key={outer.id}
                                                    align="center"
                                                    bordered
                                                    style={style}
                                                >
                                                    {formatValue(value)}
                                                </DataTableCell>
                                            )
                                        })(),
                                    ]
                                return colCells
                            })}
                        </DataTableRow>
                    ))}
                </TableBody>
            </DataTable>
        </div>
    )
}
