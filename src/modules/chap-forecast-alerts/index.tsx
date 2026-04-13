import { createFileRoute } from '@tanstack/react-router'
import { PredictionChart } from '@/shared/components/visualizations/PredictionChart'

export const Route = createFileRoute('/chap-forecast-alerts/')({
    component: ChapForecastAlerts,
})

function ChapForecastAlerts() {
    return (
        <div className="mx-auto max-w-4xl">
            <PredictionChart />
        </div>

    )
}
