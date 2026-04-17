import { useNavigate, useSearch } from '@tanstack/react-router'

type FilterSearch = { ou?: string; pe?: string }
type NavigateFn = (opts: { search: FilterSearch }) => void

export function useFilters() {
    const search = useSearch({ from: '__root__' })
    const navigate = useNavigate() as unknown as NavigateFn

    function setOrgUnitIds(ids: string[]) {
        navigate({
            search: { ...search, ou: ids.length > 0 ? ids.join(',') : undefined },
        })
    }

    function setPeriodIds(ids: string[]) {
        navigate({
            search: { ...search, pe: ids.length > 0 ? ids.join(',') : undefined },
        })
    }

    const paramsMap = new Map<string, string>()
    if (search.ou) { paramsMap.set('ou', search.ou) }
    if (search.pe) { paramsMap.set('pe', search.pe) }

    function clearFilters() {
        navigate({ search: { ou: undefined, pe: undefined } })
    }

    return {
        orgUnitIds: search.ou ? search.ou.split(',') : [],
        periodIds: search.pe ? search.pe.split(',') : [],
        setOrgUnitIds,
        setPeriodIds,
        clearFilters,
        paramsMap,
    }
}
