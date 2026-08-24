import {
    DataTable,
    DataTableCell,
    DataTableColumnHeader,
    DataTableRow,
    TableBody,
    TableHead,
} from '@dhis2/ui'
import { LegendSet } from '@hisptz/dhis2-utils'
import { CSSProperties, RefObject, useMemo } from 'react'
import { AnalyticsData, VisualizationConfig } from '@/shared/schemas'
import { buildLegendMap, buildPivotModel, formatValue } from '@/shared/utils'
import { getForeground } from '@/shared/utils/colors'

export interface TableVisualizerProps {
    analytics: AnalyticsData
    visualization: VisualizationConfig
    setRef: RefObject<HTMLTableElement | null>
    fullScreen: boolean
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

    const {
        rowLabel,
        outerColItems,
        innerColItems,
        hasInnerCol,
        outerRowItems,
        rowDims,
        colDims,
        dxDimId,
        getValue,
    } = useMemo(
        () => buildPivotModel({ analytics, visualization }),
        [analytics, visualization]
    )

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
                                if (!hasInnerCol) {
                                    const value = getValue({
                                        [rowDims[0]!]: rowItem.id,
                                        [colDims[0]!]: outer.id,
                                    })
                                    return [
                                        <DataTableCell
                                            key={outer.id}
                                            align="center"
                                            bordered
                                            style={getCellStyle({
                                                legendMap,
                                                legendStyle,
                                                dxId: outer.id,
                                                value,
                                            })}
                                        >
                                            {formatValue(value)}
                                        </DataTableCell>,
                                    ]
                                }
                                return innerColItems.map((inner) => {
                                    const value = getValue({
                                        [rowDims[0]!]: rowItem.id,
                                        [colDims[0]!]: outer.id,
                                        [colDims[1]!]: inner.id,
                                    })
                                    const dxId =
                                        dxDimId === colDims[0]
                                            ? outer.id
                                            : inner.id
                                    return (
                                        <DataTableCell
                                            key={`${outer.id}-${inner.id}`}
                                            align="center"
                                            bordered
                                            style={getCellStyle({
                                                legendMap,
                                                legendStyle,
                                                dxId,
                                                value,
                                            })}
                                        >
                                            {formatValue(value)}
                                        </DataTableCell>
                                    )
                                })
                            })}
                        </DataTableRow>
                    ))}
                </TableBody>
            </DataTable>
        </div>
    )
}
