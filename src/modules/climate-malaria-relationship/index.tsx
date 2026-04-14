import { createFileRoute } from '@tanstack/react-router'
import { LINE_CHART_IDS } from './constants'
import { VisualizationItem } from '@/shared/components/visualizations/VisualizationItem'

export const Route = createFileRoute('/climate-malaria-relationship/')({
    component: ClimateMalariaRelationship,
})

function ClimateMalariaRelationship() {
    return (
        <div className="grid grid-cols-1 gap-4">
            {LINE_CHART_IDS.map((id) => (
                <VisualizationItem key={id} id={id} className="h-160" />
            ))}
        </div>
    )
}
