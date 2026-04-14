import { Card, CircularLoader, NoticeBox } from '@dhis2/ui'
import React, { Suspense, memo } from 'react'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import { VisualizationMenu } from './VisualizationMenu'
import type { ChartRef, DisplayItemProps } from '@/shared/schemas'

//TODO
const CardLoading = () => (
    <div className="flex h-64 items-center justify-center">
        <CircularLoader />
    </div>
)

const CardError = ({ error, title }: { error?: Error | null; title?: string }) => (
    <div className="p-4">
        <NoticeBox error title={title || 'Visualization Error'}>
            {error?.message || 'An error occurred while loading the visualization'}
        </NoticeBox>
    </div>
)

interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
}

class VisualizationErrorBoundary extends React.Component<
    { children: React.ReactNode; title?: string },
    ErrorBoundaryState
> {
    constructor(props: { children: React.ReactNode; title?: string }) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Visualization error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return <CardError error={this.state.error} title={this.props.title} />
        }
        return this.props.children
    }
}

interface DisplayItemContainerProps extends DisplayItemProps {
    chartRef?: ChartRef
    selectedOrgUnits?: string[]
    selectedPeriods?: string[]
    onOrgUnitChange?: (ids: string[]) => void
    onPeriodChange?: (ids: string[]) => void
}

export const DisplayItemContainer = memo<DisplayItemContainerProps>(
    ({
        children,
        title,
        loading = false,
        error = null,
        chartRef,
        selectedOrgUnits,
        selectedPeriods,
        onOrgUnitChange,
        onPeriodChange,
    }) => {
        const handle = useFullScreenHandle()

        function handleFullscreen() {
            if (handle.active) {
                handle.exit()
            } else {
                handle.enter()
            }
            setTimeout(() => chartRef?.current?.chart?.reflow(), 100)
        }

        return (
            <Card className="h-full w-full">
                <div className="flex h-full flex-col">
                    <div className="flex shrink-0 items-center justify-between  px-4 py-2">
                        {title && (
                            <h3 className="text-base font-semibold text-gray-900">
                                {title}
                            </h3>
                        )}
                        <div className="ml-auto">
                            <VisualizationMenu
                            onFullscreen={handleFullscreen}
                            selectedOrgUnits={selectedOrgUnits}
                            selectedPeriods={selectedPeriods}
                            onOrgUnitChange={onOrgUnitChange}
                            onPeriodChange={onPeriodChange}
                        />
                        </div>
                    </div>
                    <FullScreen handle={handle} className="min-h-0 flex-1 bg-white">
                        <div className="h-full overflow-hidden p-4">
                            {error ? (
                                <CardError error={error} title={title} />
                            ) : loading ? (
                                <CardLoading />
                            ) : (
                                <VisualizationErrorBoundary title={title}>
                                    <Suspense fallback={<CardLoading />}>
                                        {children}
                                    </Suspense>
                                </VisualizationErrorBoundary>
                            )}
                        </div>
                    </FullScreen>
                </div>
            </Card>
        )
    }
)

DisplayItemContainer.displayName = 'DisplayItemContainer'
