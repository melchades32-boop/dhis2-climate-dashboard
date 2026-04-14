import { createRootRoute, Outlet } from '@tanstack/react-router'
import { z } from 'zod'
import { AppTabs } from '@/shared/components/AppTabs'
import { FilterBar } from '@/shared/components/FilterBar'

export const Route = createRootRoute({
    validateSearch: z.object({
        ou: z.string().optional(),
        pe: z.string().optional(),
    }),
    component: RootComponent,
})

function RootComponent() {
    return (
        <div className="flex h-full w-full flex-col">
            <AppTabs />
            <FilterBar />
            <main className="flex-1 overflow-y-auto p-6">
                <Outlet />
            </main>
        </div>
    )
}
