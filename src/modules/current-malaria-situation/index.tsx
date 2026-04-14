import { createFileRoute } from '@tanstack/react-router'
import {
    BAR_CHART_ID,
    MAP_ID,
    SINGLE_VALUE_IDS,
} from './constants'
import { MapItem } from '@/shared/components/visualizations/MapItem'
import { VisualizationItem } from '@/shared/components/visualizations/VisualizationItem'

export const Route = createFileRoute('/current-malaria-situation/')({
    component: CurrentMalariaSituation,
})

function CurrentMalariaSituation() {
    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-4">
                {SINGLE_VALUE_IDS.map((id) => (
                    <VisualizationItem key={id} id={id} className="h-36" />
                ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <MapItem id={MAP_ID} className="h-120" />
                <VisualizationItem id={BAR_CHART_ID} className="h-120" />
            </div>
        </div>
    )
}
