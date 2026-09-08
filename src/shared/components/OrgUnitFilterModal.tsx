import { OrgUnitSelectorModal } from '@hisptz/dhis2-ui'
import { useOrgUnitsByIds } from '@/shared/hooks/useOrgUnitsByIds'

interface OrgUnitFilterModalProps {
    selectedIds: string[]
    onUpdate: (ids: string[]) => void
    onClose: () => void
}

export function OrgUnitFilterModal({
    selectedIds,
    onUpdate,
    onClose,
}: OrgUnitFilterModalProps) {
    const { orgUnits, loading } = useOrgUnitsByIds(selectedIds)
    if (loading) {
        return null
    }
    return (
        <OrgUnitSelectorModal
            value={{
                orgUnits: orgUnits.map((ou) => ({ ...ou, children: [] })),
            }}
            onUpdate={(selection: { orgUnits?: Array<{ id: string }> }) =>
                onUpdate((selection.orgUnits ?? []).map((ou) => ou.id))
            }
            onClose={onClose}
            hide={false}
        />
    )
}
