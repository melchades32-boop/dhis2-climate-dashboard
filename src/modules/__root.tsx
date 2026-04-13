import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
    component: RootComponent,
})

const TABS = [
    { to: '/current-malaria-situation', label: 'Current Malaria Situation', num: 1 },
    { to: '/climate-malaria-relationship', label: 'Climate & Malaria Relationship', num: 2 },
    { to: '/chap-forecast-alerts', label: 'CHAP Forecast & Alerts', num: 3 },
] as const

function RootComponent() {
    return (
        <div className="flex h-full w-full flex-col">
            <nav className="border-b border-gray-200 bg-white shadow-sm">
                <div className="flex items-end gap-0 px-4">
                    {TABS.map(({ to, label, num }) => (
                        <Link
                            key={to}
                            to={to}
                            className="group relative flex items-center gap-1.5 px-5 py-3 text-sm text-gray-500 transition-colors hover:text-[#1a3a5c]"
                            activeProps={{ className: 'text-[#1a3a5c] font-semibold' }}
                        >
                            {({ isActive }) => (
                                <>
                                    <span
                                        className={
                                            isActive
                                                ? 'font-bold text-[#1a3a5c]'
                                                : 'font-normal text-gray-400'
                                        }
                                    >
                                        {num}.
                                    </span>
                                    <span>{label}</span>
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-t bg-[#1a3a5c]" />
                                    )}
                                </>
                            )}
                        </Link>
                    ))}
                </div>
            </nav>
            <main className="flex-1 overflow-y-auto p-6">
                <Outlet />
            </main>
        </div>
    )
}
