import { CircularLoader } from '@dhis2/ui'
import { useMemo } from 'react'
import { SingleValueCard } from '@/shared/components/visualizations/SingleValueCard'
import { useAnalytics } from '@/shared/hooks/useAnalytics'
import { useVisualization } from '@/shared/hooks/useVisualization'

interface KpiVisualizationItemProps {
    id: string
    orgUnitId: string | null
    className?: string
}

export function KpiVisualizationItem({
    id,
    orgUnitId,
    className,
}: KpiVisualizationItemProps) {
    const { visualization, loading: vizLoading } = useVisualization({
        visualizationId: id,
    })

    const params = useMemo(() => {
        const m = new Map<string, string>()
        if (orgUnitId) {
            m.set('ou', orgUnitId)
        }
        return m
    }, [orgUnitId])

    const { analytics, loading: analyticsLoading } = useAnalytics({
        visualizationConfig: visualization ?? null,
        params,
    })

    const loading = vizLoading || analyticsLoading

    if (vizLoading) {
        return (
            <div
                className={`flex items-center justify-center rounded border border-gray-200 bg-white shadow-sm ${className ?? ''}`}
            >
                <CircularLoader small />
            </div>
        )
    }

    if (!visualization) {
        return null
    }

    return (
        <div className={className}>
            <SingleValueCard
                visualization={visualization}
                analytics={analytics}
                loading={loading}
                showMenu={false}
            />
        </div>
    )
}
