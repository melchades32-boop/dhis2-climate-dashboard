import { createRootRoute, Outlet } from '@tanstack/react-router'
import { AppTabs } from '@/shared/components/AppTabs'

export const Route = createRootRoute({
    component: RootComponent,
})

function RootComponent() {
    return (
        <div className="flex h-full w-full flex-col">
            <AppTabs />
            <main className="flex-1 overflow-y-auto p-6">
                <Outlet />
            </main>
        </div>
    )
}
