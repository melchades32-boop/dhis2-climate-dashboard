import Highcharts from 'highcharts'
import 'highcharts/highcharts-more'
import HighchartsReact from 'highcharts-react-official'
import { forwardRef, useMemo } from 'react'
import type { ChartRef } from '@/shared/schemas'

//TODO Dummy data matching the chart's period range (202310 → 202512)
const PERIODS = [
    '202310', '202311', '202312',
    '202401', '202402', '202403', '202404', '202405', '202406',
    '202407', '202408', '202409', '202410', '202411', '202412',
    '202501', '202502', '202503', '202504', '202505', '202506',
    '202507', '202508', '202509', '202510', '202511', '202512',
]

const ACTUAL_CASES: (number | null)[] = [
    1600, 1450, 1500,
    1550, 1480, 1520, 1600, 2200, 5700, 4800, 3600, 2700,
    2600, 2600, 2550,
    2600, 200, 500, 1200, 1800, 1900,
    2000, 1900, 1850, 3400, null, null,
]

// Prediction starts at index 24 (202510)
const PREDICTION_START = 24

const MEDIAN_PREDICTION: (number | null)[] = PERIODS.map((_, i) =>
    i >= PREDICTION_START ? [2900, 2400, 1600][i - PREDICTION_START] : null,
)

const BAND_80: ([number, number] | null)[] = PERIODS.map((_, i) =>
    i >= PREDICTION_START
        ? ([
              [900, 4100],
              [700, 3800],
              [400, 4200],
          ][i - PREDICTION_START] as [number, number])
        : null,
)

const BAND_50: ([number, number] | null)[] = PERIODS.map((_, i) =>
    i >= PREDICTION_START
        ? ([
              [2300, 3500],
              [1800, 3100],
              [1000, 2500],
          ][i - PREDICTION_START] as [number, number])
        : null,
)

export const PredictionChart = forwardRef<HighchartsReact.RefObject>(
function PredictionChart(_props, ref) {
    const options = useMemo<Highcharts.Options>(
        () => ({
            chart: {
                type: 'line',
                style: { fontFamily: 'inherit' },
            },
            title: {
                text: 'Prediction for OPD - IPD-Comm - Malaria (OPD) for Abiemnhom County',
                style: { fontSize: '14px', fontWeight: '600' },
            },
            xAxis: {
                categories: PERIODS,
                tickInterval: 2,
                labels: { style: { fontSize: '11px' } },
            },
            yAxis: {
                title: { text: undefined },
                min: 0,
                tickAmount: 5,
                labels: {
                    formatter() {
                        const v = this.value as number
                        return v >= 1000 ? `${v / 1000}k` : `${v}`
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
            },
            plotOptions: {
                arearange: {
                    lineWidth: 0,
                    marker: { enabled: false },
                    states: { hover: { lineWidthPlus: 0 } },
                },
                line: {
                    marker: { enabled: false },
                },
            },
            series: [
                {
                    type: 'line',
                    name: 'Actual Cases',
                    data: ACTUAL_CASES,
                    color: '#f97316',
                    lineWidth: 2,
                    zIndex: 4,
                },
                {
                    type: 'line',
                    name: 'Median prediction',
                    data: MEDIAN_PREDICTION,
                    color: '#1e3a8a',
                    lineWidth: 3,
                    zIndex: 5,
                    dashStyle: 'Solid',
                },
                {
                    type: 'arearange',
                    name: '80% prediction interval',
                    data: BAND_80,
                    color: '#93c5fd',
                    fillOpacity: 0.35,
                    zIndex: 2,
                    linkedTo: ':previous',
                },
                {
                    type: 'arearange',
                    name: '50% prediction interval',
                    data: BAND_50,
                    color: '#3b82f6',
                    fillOpacity: 0.45,
                    zIndex: 3,
                },
            ],
            credits: { enabled: false },
        }),
        [],
    )

    return (
        <HighchartsReact
            highcharts={Highcharts}
            options={options}
            ref={ref as ChartRef}
        />
    )
})
