import i18n from '@dhis2/d2-i18n'
import { Tab, TabBar } from '@dhis2/ui'
import Highcharts from 'highcharts'
import 'highcharts/highcharts-more'
import HighchartsReact from 'highcharts-react-official'
import { forwardRef, useMemo, useRef, useState } from 'react'
import { useResizeObserver } from 'usehooks-ts'
import type { ForecastRow } from '@/modules/chap-forecast-alerts/schemas'
import { formatPeriod } from '@/modules/chap-forecast-alerts/utils/periods'
import type { ChartRef } from '@/shared/schemas'

function fmt(val: number | null): string {
    if (val === null) {
        return '—'
    }
    return val.toLocaleString('en-GB', { maximumFractionDigits: 0 })
}

const QUANTILE_ROWS: { label: string; get: (r: ForecastRow) => number | null }[] = [
    { label: 'Quantile 0.1 (low)',   get: (r) => r.quantileLow },
    { label: 'Quantile 0.25',        get: (r) => r.quantileMidLow },
    { label: 'Quantile 0.5 (median)',get: (r) => r.quantileMedian },
    { label: 'Quantile 0.75',        get: (r) => r.quantileMidHigh },
    { label: 'Quantile 0.9 (high)',  get: (r) => r.quantileHigh },
    { label: 'Threshold',            get: (r) => r.threshold },
]

interface PredictionChartProps {
    rows: ForecastRow[]
    orgUnitName?: string
}

function buildForecastLabel(rows: ForecastRow[]): string {
    const pred = rows.filter((r) => r.isPrediction)
    if (pred.length === 0) {
        return ''
    }
    const first = formatPeriod(pred[0].period)
    const last = formatPeriod(pred[pred.length - 1].period)
    const [firstMon, firstYear] = first.split(' ')
    const [lastMon, lastYear] = last.split(' ')
    return firstYear === lastYear
        ? `${firstMon}–${lastMon} ${firstYear}`
        : `${first}–${last}`
}


export const PredictionChart = forwardRef<
    HighchartsReact.RefObject,
    PredictionChartProps
>(function PredictionChart({ rows, orgUnitName }, ref) {
    const [view, setView] = useState<'chart' | 'table'>('chart')
    const containerRef = useRef<HTMLDivElement>(null)
    const { height = 0 } = useResizeObserver<HTMLDivElement>({
        // @ts-expect-error ref will always have a nullable value
        ref: containerRef!,
        box: 'border-box',
    })

    const options = useMemo<Highcharts.Options>(() => {
        const categories = rows.map((r) => r.label)
        const forecastLabel = buildForecastLabel(rows)
        const subtitleParts = [
            orgUnitName,
            forecastLabel ? `CHAP Forecast: ${forecastLabel}` : '',
        ].filter(Boolean)

        const actualData: (number | null)[] = rows.map((r) =>
            !r.isPrediction ? r.actual : null
        )

        const lastHistoricalIdx = rows.reduce(
            (last, r, i) => (!r.isPrediction ? i : last),
            -1
        )
        const medianData: (number | null)[] = rows.map((r, i) => {
            if (r.isPrediction) {
                return r.quantileMedian
            }
            if (i === lastHistoricalIdx) {
                return r.actual
            }
            return null
        })

        const band80: ([number, number] | null)[] = rows.map((r) =>
            r.isPrediction && r.quantileLow !== null && r.quantileHigh !== null
                ? [r.quantileLow, r.quantileHigh]
                : null
        )

        const band50: ([number, number] | null)[] = rows.map((r) =>
            r.isPrediction &&
            r.quantileMidLow !== null &&
            r.quantileMidHigh !== null
                ? [r.quantileMidLow, r.quantileMidHigh]
                : null
        )

        return {
            chart: {
                type: 'line',
                height: height || undefined,
                style: { fontFamily: 'inherit' },
                animation: false,
            },
            title: { text: undefined },
            subtitle:
                subtitleParts.length > 0
                    ? {
                          text: subtitleParts.join(' | '),
                          style: { fontSize: '12px', color: '#6b7280' },
                          align: 'left',
                      }
                    : undefined,
            xAxis: {
                categories,
                labels: {
                    useHTML: true,
                    formatter() {
                        const isPred = rows[this.pos]?.isPrediction
                        return `<span style="font-size:11px;color:${isPred ? '#1e3a8a' : '#666666'};font-weight:${isPred ? '600' : 'normal'}">${this.value}</span>`
                    },
                },
            },
            yAxis: {
                title: { text: 'Confirmed Cases' },
                min: 0,
                tickAmount: 5,
                labels: {
                    formatter() {
                        const v = this.value as number
                        return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`
                    },
                },
            },
            legend: {
                enabled: true,
                align: 'center',
                verticalAlign: 'bottom',
                symbolWidth: 30,
            },
            tooltip: {
                shared: true,
                crosshairs: true,
                formatter() {
                    const pts = this.points ?? []
                    let s = `<b>${this.x}</b><br/>`
                    for (const pt of pts) {
                        const row = rows[pt.index ?? -1]
                        if (pt.series.name === 'Median Forecast' && !row?.isPrediction) {
                            continue
                        }
                        const ptRange = pt as Highcharts.Point & { low?: number; high?: number }
                        s += `<span style="color:${pt.color}">\u25CF</span> ${pt.series.name}: `
                        if (
                            ptRange.low !== undefined &&
                            ptRange.high !== undefined
                        ) {
                            s += `${Math.round(ptRange.low).toLocaleString()} – ${Math.round(ptRange.high).toLocaleString()}`
                        } else {
                            s +=
                                pt.y !== null && pt.y !== undefined
                                    ? Math.round(pt.y).toLocaleString()
                                    : '—'
                        }
                        s += '<br/>'
                    }
                    return s
                },
                useHTML: true,
            },
            plotOptions: {
                arearange: {
                    lineWidth: 0,
                    marker: { enabled: false },
                    states: { hover: { lineWidthPlus: 0 } },
                    connectNulls: false,
                },
                line: {
                    marker: { enabled: false },
                    connectNulls: false,
                },
            },
            series: [
                {
                    type: 'line',
                    name: 'Actual Cases',
                    data: actualData,
                    color: '#16a34a',
                    lineWidth: 2,
                    zIndex: 4,
                    dataLabels: {
                        enabled: true,
                        formatter() {
                            if (this.y === null || this.y === undefined) {
                                return null
                            }
                            return this.y >= 1000
                                ? `${(this.y / 1000).toFixed(1)}k`
                                : `${Math.round(this.y)}`
                        },
                        style: {
                            fontSize: '10px',
                            fontWeight: '600',
                            color: '#16a34a',
                            textOutline: 'none',
                        },
                    },
                },
                {
                    type: 'line',
                    name: 'Median Forecast',
                    data: medianData,
                    color: '#1e3a8a',
                    lineWidth: 2,
                    dashStyle: 'ShortDash',
                    zIndex: 5,
                    dataLabels: {
                        enabled: true,
                        formatter() {
                            if (this.y === null || this.y === undefined) {
                                return null
                            }
                            return this.y >= 1000
                                ? `${(this.y / 1000).toFixed(1)}k`
                                : `${Math.round(this.y)}`
                        },
                        style: {
                            fontSize: '10px',
                            fontWeight: '600',
                            color: '#1e3a8a',
                            textOutline: 'none',
                        },
                    },
                },
                {
                    type: 'arearange',
                    name: '80% interval (Q10–Q90)',
                    data: band80,
                    color: '#93c5fd',
                    fillOpacity: 0.3,
                    zIndex: 2,
                },
                {
                    type: 'arearange',
                    name: '50% interval (Q25–Q75)',
                    data: band50,
                    color: '#3b82f6',
                    fillOpacity: 0.45,
                    zIndex: 3,
                },
                {
                    type: 'line',
                    name: 'Threshold',
                    data: rows.map((r) => r.threshold),
                    color: '#dc2626',
                    lineWidth: 2,
                    dashStyle: 'line',
                    zIndex: 6,
                    marker: { enabled: false },
                    dataLabels: { enabled: false },
                },
            ],
            exporting: { enabled: false },
            credits: { enabled: false },
        }
    }, [rows, orgUnitName, height])

    const predictionRows = rows.filter((r) => r.isPrediction)

    return (
        <div className="flex h-full flex-col">
            <div className="shrink-0 border-b border-gray-200">
                <TabBar>
                    <Tab selected={view === 'chart'} onClick={() => setView('chart')}>
                        {i18n.t('Chart')}
                    </Tab>
                    <Tab selected={view === 'table'} onClick={() => setView('table')}>
                        {i18n.t('Table')}
                    </Tab>
                </TabBar>
            </div>

            {view === 'chart' ? (
                <div ref={containerRef} className="min-h-0 flex-1">
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={options}
                        ref={ref as ChartRef}
                        containerProps={{ style: { height: '100%' } }}
                    />
                </div>
            ) : (
                <div className="overflow-auto pt-3">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-4 py-3 text-left font-medium text-gray-600">
                                    {i18n.t('Quantiles')}
                                </th>
                                {predictionRows.map((r) => (
                                    <th key={r.period} className="px-4 py-3 text-center font-semibold text-blue-900">
                                        {r.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {QUANTILE_ROWS.map(({ label, get }) => (
                                <tr key={label} className={`border-b border-gray-100 ${label === 'Threshold' ? 'bg-red-50 hover:bg-red-100' : label === 'Quantile 0.5 (median)' ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}>
                                    <td className={`px-4 py-3 ${label === 'Threshold' ? 'font-medium text-red-700' : label === 'Quantile 0.5 (median)' ? 'font-medium text-blue-700' : 'text-gray-700'}`}>{label}</td>
                                    {predictionRows.map((r) => (
                                        <td key={r.period} className="px-4 py-3 text-center tabular-nums text-gray-800">
                                            {fmt(get(r))}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
})
