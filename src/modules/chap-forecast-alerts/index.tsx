import i18n from '@dhis2/d2-i18n'
import { createFileRoute } from '@tanstack/react-router'
import HighchartsReact from 'highcharts-react-official'
import { useEffect, useRef, useState } from 'react'
import { KpiVisualizationItem } from './components/KpiVisualizationItem'
import { OrgUnitSidebar } from './components/OrgUnitSidebar'
import { KPI_IDS, MAP_IDS, STATE_OU_LEVEL } from './constants'
import { useForecastData } from './hooks/useForecastData'
import { useCounties, useStates } from './hooks/useOrgUnitLevel'
import type { OrgUnit } from './hooks/useOrgUnitLevel'
import { DisplayItemContainer } from '@/shared/components/visualizations/DisplayItemContainer'
import { MapItem } from '@/shared/components/visualizations/MapItem'
import { PredictionChart } from '@/shared/components/visualizations/PredictionChart'

export const Route = createFileRoute('/chap-forecast-alerts/')({
    component: ChapForecastAlerts,
})

function ChapForecastAlerts() {
    const chartRef = useRef<HighchartsReact.RefObject | null>(null)
    const [selectedState, setSelectedState] = useState<OrgUnit | null>(null)
    const [selectedCounty, setSelectedCounty] = useState<OrgUnit | null>(null)

    const { states, loading: statesLoading } = useStates(STATE_OU_LEVEL)
    const { counties, loading: countiesLoading } = useCounties(
        selectedState?.id ?? null
    )

    useEffect(() => {
        if (!selectedState && states.length > 0) {
            setSelectedState(states[0] ?? null)
        }
    }, [states, selectedState])

    const activeOrgUnit = selectedCounty ?? selectedState

    const { rows, loading: forecastLoading } = useForecastData(activeOrgUnit?.id ?? null)

    function handleStateSelect(ou: OrgUnit) {
        setSelectedState(ou)
        setSelectedCounty(null)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4">
                <OrgUnitSidebar
                    states={states}
                    statesLoading={statesLoading}
                    counties={counties}
                    countiesLoading={countiesLoading}
                    selectedStateId={selectedState?.id ?? null}
                    onStateSelect={handleStateSelect}
                    selectedCountyId={selectedCounty?.id ?? null}
                    onCountySelect={setSelectedCounty}
                />

                <div className="flex min-w-0 flex-1 flex-col gap-4">
                    <div className="grid grid-cols-4 gap-4">
                        {[...KPI_IDS].map((id) => (
                            <KpiVisualizationItem
                                key={id}
                                id={id}
                                orgUnitId={activeOrgUnit?.id ?? null}
                                className="h-36"
                            />
                        ))}
                    </div>

                    <div className="h-128">
                        <DisplayItemContainer
                            title={i18n.t('Malaria Forecast — {{name}}', {
                                name: activeOrgUnit?.displayName ?? '…',
                            })}
                            chartRef={chartRef}
                            loading={forecastLoading}
                        >
                            <PredictionChart
                                ref={chartRef}
                                rows={rows}
                                orgUnitName={activeOrgUnit?.displayName ?? ''}
                            />
                        </DisplayItemContainer>
                    </div>
                </div>
            </div>

            {/* Maps row - not affected by org unit sidebar */}
            <div className="grid grid-cols-3 gap-4">
                {[...MAP_IDS].map((mapId) => (
                    <MapItem key={mapId} id={mapId} className="h-144" />
                ))}
            </div>
        </div>
    )
}
