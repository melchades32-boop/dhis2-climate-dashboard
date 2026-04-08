import { CircularLoader, NoticeBox, Card } from '@dhis2/ui'
import React, { Suspense, memo } from 'react'
import type { DisplayItemProps } from '@/shared/interfaces/visualization'


const CardLoading = () => (
    <div className="flex items-center justify-center h-64">
        <CircularLoader />
    </div>
)

interface CardErrorProps {
    error?: Error | null
    title?: string
}

const CardError = ({ error, title }: CardErrorProps) => (
    <div className="p-4">
        <NoticeBox error title={title || 'Visualization Error'}>
            {error?.message ||
                'An error occurred while loading the visualization'}
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
            return (
                <CardError error={this.state.error} title={this.props.title} />
            )
        }

        return this.props.children
    }
}

export const DisplayItemContainer = memo<DisplayItemProps>(
    ({ children, title, loading = false, error = null }) => {
        return (
            <Card className="h-full w-full">
                {title && (
                    <div className="px-4 py-3 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                    </div>
                )}

                <div className="flex-1 p-4">
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
            </Card>
        )
    }
)

DisplayItemContainer.displayName = 'DisplayItemContainer'
