import { Tab, TabBar } from '@dhis2/ui'
import { useNavigate, useRouterState } from '@tanstack/react-router'

const TABS = [
    { to: '/current-malaria-situation', label: '1. Current Malaria Situation' },
    {
        to: '/climate-malaria-relationship',
        label: '2. Climate & Malaria Relationship',
    },
    { to: '/chap-evaluation', label: '3. CHAP Evaluation' },
    { to: '/chap-forecast-alerts', label: '4. CHAP Forecast & Alerts' },
] as const

export function AppTabs() {
    const navigate = useNavigate()
    const pathname = useRouterState({ select: (s) => s.location.pathname })

    return (
        <TabBar>
            {TABS.map(({ to, label }) => (
                <Tab
                    key={to}
                    selected={pathname.startsWith(to)}
                    onClick={() => navigate({ to })}
                >
                    {label}
                </Tab>
            ))}
        </TabBar>
    )
}
