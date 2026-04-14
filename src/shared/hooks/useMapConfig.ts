import { useDataQuery } from '@dhis2/app-runtime'
import { MapConfig } from '@/shared/schemas'

const MAP_FIELDS =
    'id,name,basemap,zoom,' +
    'mapViews[' +
        'id,name,displayName,type,layer,thematicMapType,' +
        'colorScale,classes,config,' +
        'radiusHigh,radiusLow,' +
        'legendSet[id],' +
        'relativePeriods,' +
        'userOrganisationUnit,userOrganisationUnitChildren,userOrganisationUnitGrandChildren,' +
        'organisationUnitLevels,itemOrganisationUnitGroups,' +
        'organisationUnits[id,path],' +
        'dataDimensionItems[dataDimensionItemType,indicator[id],dataElement[id],programIndicator[id]],' +
        'columns[id,dimension,items[id,name,dimensionItemType]],' +
        'rows[id,dimension,items[id]],' +
        'filters[id,dimension,items[id]],' +
        'categoryDimensions[category[id],categoryOptions[id]],' +
        'organisationUnitGroupSetDimensions[id]' +
    ']'

const MAP_QUERY = {
    map: {
        resource: 'maps',
        id: ({ id }: Record<string, unknown>) => id as string,
        params: { fields: MAP_FIELDS },
    },
}

export function useMapConfig(mapId: string) {
    const { loading, error, data } = useDataQuery<{ map: MapConfig }>(
        MAP_QUERY,
        { variables: { id: mapId } }
    )

    return { loading, error, mapConfig: data?.map }
}
