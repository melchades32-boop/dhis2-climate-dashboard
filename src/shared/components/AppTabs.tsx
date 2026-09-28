import i18n from '@dhis2/d2-i18n'
import { Tab, TabBar } from '@dhis2/ui'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { FLLOW_M_ADMIN_USER_GROUP_ID } from '@/shared/constants/accessControl'
import { useHasUserGroup } from '@/shared/hooks/useCurrentUserGroups'

const RESTRICTED_TABS = new Set([
    '/chap-evaluation',
    '/chap-compare',
    '/chap-threshold',
])

const TABS = [
    { to: '/current-malaria-situation', label:i18n.t ('Current Malaria Situation') },
    {
        to: '/climate-malaria-relationship',
        label:i18n.t  ('Climate & Malaria Relationship'),
    },
    { to: '/chap-evaluation', label:i18n.t  ('CHAP Evaluation') },
    { to: '/chap-compare', label:i18n.t  ('Compare Evaluations') },
    { to: '/chap-forecast-alerts', label:i18n.t  ('CHAP Forecast & Alerts') },
    { to: '/chap-threshold', label:i18n.t  ('Threshold Analysis') },
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
