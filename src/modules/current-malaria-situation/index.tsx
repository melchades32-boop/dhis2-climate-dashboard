import { createFileRoute } from '@tanstack/react-router'
import {
    ANC_POSITIVITY_ID,
    CLINICAL_DIAGNOSIS_ID,
    CONFIRMED_COMMUNITY_ID,
    CONFIRMED_FACILITY_ID,
    CONFIRMED_FEMALE_ID,
    CONFIRMED_MALE_ID,
    DEATHS_ID,
    MAP_ID,
    MONTHLY_TREND_ID,
    OUTCOMES_ID,
    SEVERE_CASES_ID,
    SEVERE_TREATED_ID,
    TOTAL_FEVER_ID,
} from './constants'
import { MapItem } from '@/shared/components/visualizations/MapItem'
import { VisualizationItem } from '@/shared/components/visualizations/VisualizationItem'

export const Route = createFileRoute('/current-malaria-situation/')({
    component: CurrentMalariaSituation,
})

function CurrentMalariaSituation() {
    return (
        <div className="flex gap-4">
            {/* Left column — 70% */}
            <div className="flex flex-col gap-4 flex-7 min-w-0">
                <div className="grid grid-cols-4 gap-2">
                    <VisualizationItem id={TOTAL_FEVER_ID} className="h-36" />
                    <VisualizationItem id={CONFIRMED_FACILITY_ID} className="h-36" />
                    <VisualizationItem id={CLINICAL_DIAGNOSIS_ID} className="h-36" />
                    <VisualizationItem id={CONFIRMED_COMMUNITY_ID} className="h-36" />
                </div>
                <div className="flex gap-2 h-105">
                    <VisualizationItem id={MONTHLY_TREND_ID} className="flex-3 h-full" />
                    <div className="flex flex-col gap-2 flex-1">
                        <VisualizationItem id={SEVERE_CASES_ID} className="flex-1" />
                        <VisualizationItem id={SEVERE_TREATED_ID} className="flex-1" />
                        <VisualizationItem id={DEATHS_ID} className="flex-1" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <VisualizationItem id={ANC_POSITIVITY_ID} className="h-80" />
                    <VisualizationItem id={CONFIRMED_MALE_ID} className="h-80" />
                    <VisualizationItem id={CONFIRMED_FEMALE_ID} className="h-80" />
                </div>
            </div>

            {/* Right column — 30% */}
            <div className="flex flex-col gap-2 flex-3 min-w-0">
                <VisualizationItem id={OUTCOMES_ID} className="h-96" />
                <MapItem id={MAP_ID} className="flex-1 min-h-120" />
            </div>
        </div>
    )
}
