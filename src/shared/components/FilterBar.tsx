import { Button } from '@dhis2/ui'
import { IconFilter16 } from '@dhis2/ui-icons'
import { GlobalOrgUnitFilter } from './GlobalOrgUnitFilter'
import { GlobalPeriodFilter } from './GlobalPeriodFilter'
import { useFilters } from '@/shared/hooks/useFilters'

export function FilterBar() {
    const { orgUnitIds, periodIds, setOrgUnitIds, setPeriodIds } = useFilters()
    const hasActiveFilters = orgUnitIds.length > 0 || periodIds.length > 0

    function clearAll() {
        setOrgUnitIds([])
        setPeriodIds([])
    }

    return (
        <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-6 py-2.5">
            <div className="flex items-center gap-1.5 text-gray-400">
                <IconFilter16 />
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Filters
                </span>
            </div>

            <div className="h-4 w-px bg-gray-300" />

            <div className="flex flex-1 items-center gap-2">
                <GlobalOrgUnitFilter />
                <GlobalPeriodFilter />
            </div>

            {hasActiveFilters && (
                <Button small secondary onClick={clearAll}>
                    Clear all
                </Button>
            )}
        </div>
    )
}
