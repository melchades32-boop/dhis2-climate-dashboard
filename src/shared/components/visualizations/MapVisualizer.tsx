import {
    DHIS2Map,
    EarthEngineLayerConfig,
    getColorScale,
    MapProps,
    ThematicLayerConfig,
} from '@hisptz/dhis2-analytics'
import { OrgUnitSelection } from '@hisptz/dhis2-utils'
import { Map as LeafletMap } from 'leaflet'
import { forEach, head, isEmpty, set } from 'lodash'
import { memo, useMemo } from 'react'
import { MapConfig, MapLayerType } from '@/shared/schemas'

export interface MapViewProps {
    setRef: (map: LeafletMap) => void
    mapConfig: MapConfig
    periodSelection?: MapProps['periodSelection']
    orgUnitSelection?: MapProps['orgUnitSelection']
}

export function getOrgUnitSelectionFromIds(ous: string[]) {
    const orgUnitSelection: OrgUnitSelection = {
        userOrgUnit: false,
        userSubUnit: false,
        userSubX2Unit: false,
        orgUnits: [],
        levels: [],
        groups: [],
    }
    forEach(ous, (ou) => {
        if (ou === 'USER_ORGUNIT') {
            set(orgUnitSelection, ['userOrgUnit'], true)
        } else if (ou === 'USER_ORGUNIT_CHILDREN') {
            set(orgUnitSelection, ['userSubUnit'], true)
        } else if (ou === 'USER_ORGUNIT_GRANDCHILDREN') {
            set(orgUnitSelection, ['userSubX2Unit'], true)
        } else {
            if (ou.includes('LEVEL-')) {
                orgUnitSelection.levels!.push(ou.replace('LEVEL-', ''))
                return
            }
            if (ou.includes('GROUP-')) {
                orgUnitSelection.groups!.push(ou.replace('GROUP-', ''))
                return
            }
            orgUnitSelection.orgUnits!.push({
                id: ou,
                children: [],
                path: '',
            })
        }
    })
    return orgUnitSelection
}

function extractPeriodIds(
    view: MapConfig['mapViews'][number]
): string[] {
    const allDimensions = [
        ...(view.columns ?? []),
        ...(view.rows ?? []),
        ...(view.filters ?? []),
    ]
    const fromDimensions = allDimensions
        .filter(({ dimension }) => dimension === 'pe')
        .flatMap(({ items }) => items.map(({ id }) => id))

    if (!isEmpty(fromDimensions)) {
        return fromDimensions
    }

    const relative = view.relativePeriods ?? {}
    return Object.entries(relative)
        .filter(([, enabled]) => enabled)
        .map(([key]) =>
            key.replace(/([A-Z])/g, '_$1').toUpperCase()
        )
}

function extractOrgUnitIds(view: MapConfig['mapViews'][number]): string[] {
    const allDimensions = [
        ...(view.columns ?? []),
        ...(view.rows ?? []),
        ...(view.filters ?? []),
    ]
    return allDimensions
        .filter(({ dimension }) => dimension === 'ou')
        .flatMap(({ items }) => items.map(({ id }) => id))
}

export const MapVisualizer = memo(function MapVisualizer({
    mapConfig,
    setRef,
    periodSelection,
    orgUnitSelection,
}: MapViewProps) {
    const thematicLayers = useMemo(() => {
        return mapConfig.mapViews
            ?.filter((view) => view.layer === MapLayerType.THEMATIC)
            ?.map((view) => {
                const dataItem = head(head(view.columns)?.items)
                if (!dataItem) { return null }

                const normalizedColorScale = view.colorScale?.toLowerCase()
                const colorClass = normalizedColorScale
                    ? getColorScale(normalizedColorScale)
                    : undefined

                return {
                    id: view.id,
                    enabled: true,
                    type: view.thematicMapType?.toLowerCase() ?? 'choropleth',
                    dataItem: {
                        id: dataItem.id,
                        type: dataItem.dimensionItemType ?? 'INDICATOR',
                        legendSet: view.legendSet?.id,
                        displayName: view.displayName ?? dataItem.name,
                        legendConfig: {
                            scale: view.classes,
                            colorClass,
                        },
                    },
                    name: view.displayName ?? dataItem.name,
                    control: {
                        enabled: true,
                        position: 'topright',
                    },
                    radius: view.radiusHigh,
                } as ThematicLayerConfig
            })
            .filter((l): l is ThematicLayerConfig => l !== null)
    }, [mapConfig.mapViews])

    const boundaryLayer = useMemo(() => {
        return head(
            mapConfig.mapViews
                ?.filter((view) => view.layer === MapLayerType.ORG_UNIT)
                .map((view) => ({
                    id: view.id,
                    enabled: true,
                }) as MapProps['boundaryLayer'])
        )
    }, [mapConfig.mapViews])

    const earthEngineLayers: EarthEngineLayerConfig[] = useMemo(() => {
        return mapConfig.mapViews
            .filter((view) => view.layer === MapLayerType.EARTH_ENGINE)
            .map((view) => {
                const config = JSON.parse(view.config!)
                return {
                    id: config.band,
                    enabled: true,
                    type: config.band,
                    aggregations: config.aggregationType,
                    name: view.displayName,
                    params: {
                        ...config.style,
                        palette: config.style.palette.join(','),
                    },
                    filters: {
                        period: config.period.id,
                    },
                } as EarthEngineLayerConfig
            })
    }, [mapConfig.mapViews])

    const activePeriodSelection = useMemo(() => {
        if (periodSelection) { return periodSelection }

        const thematicView = mapConfig.mapViews.find(
            (view) => view.layer === MapLayerType.THEMATIC
        )
        if (!thematicView) { return { periods: ['THIS_YEAR'] } }

        const periods = extractPeriodIds(thematicView)
        return { periods: !isEmpty(periods) ? periods : ['THIS_YEAR'] }
    }, [mapConfig.mapViews, periodSelection])

    const activeOrgUnitSelection = useMemo(() => {
        if (orgUnitSelection) { return orgUnitSelection }

        const thematicView = mapConfig.mapViews.find(
            (view) => view.layer === MapLayerType.THEMATIC
        )
        if (!thematicView) { return getOrgUnitSelectionFromIds([]) }

        const ids = extractOrgUnitIds(thematicView)
        return getOrgUnitSelectionFromIds(ids)
    }, [mapConfig.mapViews, orgUnitSelection])

    return (
        <DHIS2Map
            mapOptions={{
                trackResize: true,
                zoomControl: true,
                scrollWheelZoom: false,
                bounceAtZoomLimits: true,
                boxZoom: true,
                zoom: mapConfig.zoom ?? 1,
                style: {
                    height: '100%',
                    width: '100%',
                    background: '#FFFFFF',
                },
            }}
            earthEngineLayers={earthEngineLayers}
            base={{ enabled: false, url: '', attribution: '' }}
            controls={[
                {
                    type: 'scale',
                    position: 'bottomleft',
                    options: { imperial: false, metric: true },
                },
                { type: 'compass', position: 'bottomleft' },
            ]}
            legends={{ collapsible: true, enabled: true, position: 'topright' }}
            setRef={setRef}
            showPeriodTitle
            periodSelection={activePeriodSelection}
            boundaryLayer={boundaryLayer}
            orgUnitSelection={activeOrgUnitSelection}
            thematicLayers={thematicLayers}
            analyticsOptions={{ displayProperty: 'SHORTNAME' }}
        />
    )
})
