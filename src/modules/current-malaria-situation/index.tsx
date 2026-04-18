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
        <div className="flex flex-col gap-4 xl:flex-row">
            {/* Left column */}
            <div className="flex flex-col gap-4 min-w-0 xl:flex-7">
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    <VisualizationItem id={TOTAL_FEVER_ID} className="h-40" />
                    <VisualizationItem
                        id={CONFIRMED_FACILITY_ID}
                        className="h-40"
                    />
                    <VisualizationItem
                        id={CLINICAL_DIAGNOSIS_ID}
                        className="h-40"
                    />
                    <VisualizationItem
                        id={CONFIRMED_COMMUNITY_ID}
                        className="h-40"
                    />
                </div>
                <div className="flex flex-col gap-2 md:flex-row md:h-128">
                    <VisualizationItem
                        id={MONTHLY_TREND_ID}
                        className="h-96 md:h-full md:flex-3"
                    />
                    <div className="grid grid-cols-3 gap-2 md:flex md:flex-col md:flex-1">
                        <VisualizationItem
                            id={SEVERE_CASES_ID}
                            className="h-36 md:flex-1"
                        />
                        <VisualizationItem
                            id={SEVERE_TREATED_ID}
                            className="h-36 md:flex-1"
                        />
                        <VisualizationItem
                            id={DEATHS_ID}
                            className="h-36 md:flex-1"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <VisualizationItem
                        id={ANC_POSITIVITY_ID}
                        className="h-80"
                    />
                    <VisualizationItem
                        id={CONFIRMED_MALE_ID}
                        className="h-80"
                    />
                    <VisualizationItem
                        id={CONFIRMED_FEMALE_ID}
                        className="h-80"
                    />
                </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-2 min-w-0 xl:flex-3">
                <VisualizationItem
                    id={OUTCOMES_ID}
                    colors={['#125687', '#43a047', '#e53935']}
                    className="h-96"
                />
                <MapItem id={MAP_ID} className="h-120 xl:flex-1 xl:min-h-120" />
            </div>
        </div>
    )
}
