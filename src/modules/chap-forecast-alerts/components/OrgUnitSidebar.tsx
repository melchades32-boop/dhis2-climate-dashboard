import i18n from '@dhis2/d2-i18n'
import { CircularLoader } from '@dhis2/ui'
import type { OrgUnit } from '../hooks/useOrgUnitLevel'

interface OrgUnitSidebarProps {
    states: OrgUnit[]
    statesLoading: boolean
    counties: OrgUnit[]
    countiesLoading: boolean
    selectedStateId: string | null
    onStateSelect: (ou: OrgUnit) => void
    selectedCountyId: string | null
    onCountySelect: (ou: OrgUnit) => void
}

function SectionHeader({ label }: { label: string }) {
    return (
        <div className="bg-[#1a5276] px-3 py-2">
            <span className="text-sm font-semibold text-white">{label}</span>
        </div>
    )
}

function OrgUnitList({
    items,
    loading,
    selectedId,
    onSelect,
}: {
    items: OrgUnit[]
    loading: boolean
    selectedId: string | null
    onSelect: (ou: OrgUnit) => void
}) {
    if (loading) {
        return (
            <div className="flex justify-center p-4">
                <CircularLoader small />
            </div>
        )
    }

    return (
        <ul className="overflow-y-auto">
            {items.map((ou) => (
                <li key={ou.id}>
                    <button
                        onClick={() => onSelect(ou)}
                        className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-blue-50 ${
                            selectedId === ou.id
                                ? 'bg-blue-100 font-medium text-blue-900'
                                : 'text-gray-700'
                        }`}
                    >
                        {ou.displayName}
                    </button>
                </li>
            ))}
        </ul>
    )
}

export function OrgUnitSidebar({
    states,
    statesLoading,
    counties,
    countiesLoading,
    selectedStateId,
    onStateSelect,
    selectedCountyId,
    onCountySelect,
}: OrgUnitSidebarProps) {
    return (
        <div className="flex w-52 shrink-0 flex-col overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
            <SectionHeader label={i18n.t('States')} />
            <div className="max-h-64 overflow-y-auto border-b border-gray-200">
                <OrgUnitList
                    items={states}
                    loading={statesLoading}
                    selectedId={selectedStateId}
                    onSelect={onStateSelect}
                />
            </div>

            <SectionHeader label={i18n.t('Counties')} />
            <div className="flex-1 overflow-y-auto">
                {!selectedStateId ? (
                    <p className="px-3 py-3 text-xs text-gray-400 italic">
                        {i18n.t('Select a state to see counties')}
                    </p>
                ) : (
                    <OrgUnitList
                        items={counties}
                        loading={countiesLoading}
                        selectedId={selectedCountyId}
                        onSelect={onCountySelect}
                    />
                )}
            </div>
        </div>
    )
}
