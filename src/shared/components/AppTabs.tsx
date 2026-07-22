import { Tab, TabBar } from '@dhis2/ui'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { FLLOW_M_ADMIN_USER_GROUP_ID } from '@/shared/constants/accessControl'
import { useHasUserGroup } from '@/shared/hooks/useCurrentUserGroups'

const RESTRICTED_TABS = new Set(['/chap-evaluation', '/chap-threshold'])

const TABS = [
    { to: '/current-malaria-situation', label: '1. Current Malaria Situation' },
    {
        to: '/climate-malaria-relationship',
        label: '2. Climate & Malaria Relationship',
    },
    { to: '/chap-evaluation', label: '3. CHAP Evaluation' },
    { to: '/chap-forecast-alerts', label: '4. CHAP Forecast & Alerts' },
    { to: '/chap-threshold', label: '5. Threshold Analysis' },
] as const

export function AppTabs() {
    const navigate = useNavigate()
    const pathname = useRouterState({ select: (s) => s.location.pathname })
    const { hasAccess } = useHasUserGroup(FLLOW_M_ADMIN_USER_GROUP_ID)

    const visibleTabs = TABS.filter(
        ({ to }) => hasAccess || !RESTRICTED_TABS.has(to)
    )

    return (
        <TabBar>
            {visibleTabs.map(({ to, label }) => (
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
