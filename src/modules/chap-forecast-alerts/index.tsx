import { createFileRoute } from '@tanstack/react-router'
import type HighchartsReact from 'highcharts-react-official'
import { useRef } from 'react'
import { DisplayItemContainer } from '@/shared/components/visualizations/DisplayItemContainer'
import { PredictionChart } from '@/shared/components/visualizations/PredictionChart'

export const Route = createFileRoute('/chap-forecast-alerts/')({
    component: ChapForecastAlerts,
})

function ChapForecastAlerts() {
    const chartRef = useRef<HighchartsReact.RefObject>(null)

    return (
        <div className="mx-auto max-w-4xl">
            <DisplayItemContainer
                title="CHAP Forecast & Alerts"
                chartRef={chartRef}
            >
                <PredictionChart ref={chartRef} />
            </DisplayItemContainer>
        </div>
    )
}
