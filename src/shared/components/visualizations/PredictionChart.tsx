import Highcharts from 'highcharts'
import 'highcharts/highcharts-more'
import HighchartsReact from 'highcharts-react-official'
import { forwardRef, useMemo, useRef } from 'react'
import { useResizeObserver } from 'usehooks-ts'
import type { ForecastRow } from '@/modules/chap-forecast-alerts/schemas'
import { formatPeriod } from '@/modules/chap-forecast-alerts/utils/periods'
import type { ChartRef } from '@/shared/schemas'

interface PredictionChartProps {
    rows: ForecastRow[]
    historicalCount: number
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
>(function PredictionChart({ rows, historicalCount, orgUnitName }, ref) {
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

        // Actual cases — historical only
        const actualData: (number | null)[] = rows.map((r) =>
            !r.isPrediction ? r.actual : null
        )

        // Median forecast — anchor to last historical point for visual continuity
        const lastHistoricalIdx = historicalCount - 1
        const medianData: (number | null)[] = rows.map((r, i) => {
            if (r.isPrediction) {
                return r.quantileMedian
            }
            if (i === lastHistoricalIdx) {
                return r.actual
            }
            return null
        })

        // 80% CI band Q10–Q90
        const band80: ([number, number] | null)[] = rows.map((r) =>
            r.isPrediction && r.quantileLow !== null && r.quantileHigh !== null
                ? [r.quantileLow, r.quantileHigh]
                : null
        )

        // 50% CI band Q25–Q75
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
                labels: { style: { fontSize: '11px' } },
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
                        s += `<span style="color:${pt.color}">\u25CF</span> ${pt.series.name}: `
                        if (
                            pt.point.low !== undefined &&
                            pt.point.high !== undefined
                        ) {
                            s += `${Math.round(pt.point.low).toLocaleString()} – ${Math.round(pt.point.high).toLocaleString()}`
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
                    color: '#f97316',
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
                            color: '#f97316',
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
            ],
            exporting: { enabled: false },
            credits: { enabled: false },
        }
    }, [rows, historicalCount, orgUnitName, height])

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
                ref={ref as ChartRef}
                containerProps={{ style: { height: '100%' } }}
            />
        </div>
    )
})
