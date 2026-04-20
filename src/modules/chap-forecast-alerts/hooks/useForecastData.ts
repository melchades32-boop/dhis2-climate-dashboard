import { useDataQuery } from '@dhis2/app-runtime'
import { useEffect, useMemo } from 'react'
import {
    ACTUAL_CASES_INDICATOR_ID,
    HISTORICAL_MONTHS,
    PREDICTION_MONTHS,
    QUANTILE_HIGH_ID,
    QUANTILE_LOW_ID,
    QUANTILE_MEDIAN_ID,
    QUANTILE_MID_HIGH_ID,
    QUANTILE_MID_LOW_ID,
} from '../constants'
import type { ForecastRow } from '../schemas'
import {
    formatPeriod,
    getHistoricalPeriods,
    getPredictionPeriods,
    parseAnalyticsRows,
} from '../utils/periods'

type AnalyticsQueryData = {
    result: {
        headers: { name: string }[]
        rows: string[][]
    }
}

const actualCasesQuery = {
    result: {
        resource: 'analytics',
        params: (vars: Record<string, unknown>) => ({
            dimension: [
                `dx:${ACTUAL_CASES_INDICATOR_ID}`,
                `pe:${(vars.periods as string[]).join(';')}`,
            ],
            filter: `ou:${vars.orgUnitId}`,
            skipMeta: true,
        }),
    },
}

const predictionsQuery = {
    result: {
        resource: 'analytics',
        params: (vars: Record<string, unknown>) => ({
            dimension: [
                `dx:${[QUANTILE_LOW_ID, QUANTILE_MID_LOW_ID, QUANTILE_MEDIAN_ID, QUANTILE_MID_HIGH_ID, QUANTILE_HIGH_ID].join(';')}`,
                `pe:${(vars.periods as string[]).join(';')}`,
            ],
            filter: `ou:${vars.orgUnitId}`,
            skipMeta: true,
        }),
    },
}

export function useForecastData(orgUnitId: string | null) {
    const historicalPeriods = useMemo(
        () => getHistoricalPeriods(HISTORICAL_MONTHS),
        []
    )
    const predictionPeriods = useMemo(
        () => getPredictionPeriods(PREDICTION_MONTHS),
        []
    )
    const allPeriods = useMemo(
        () => [...historicalPeriods, ...predictionPeriods],
        [historicalPeriods, predictionPeriods]
    )

    const {
        data: actualData,
        loading: actualLoading,
        refetch: refetchActual,
    } = useDataQuery<AnalyticsQueryData>(actualCasesQuery, { lazy: true })

    const {
        data: predData,
        loading: predLoading,
        refetch: refetchPred,
    } = useDataQuery<AnalyticsQueryData>(predictionsQuery, { lazy: true })

    useEffect(() => {
        if (!orgUnitId) {
            return
        }
        refetchActual({ orgUnitId, periods: historicalPeriods })
        refetchPred({ orgUnitId, periods: predictionPeriods })
    }, [
        orgUnitId,
        historicalPeriods,
        predictionPeriods,
        refetchActual,
        refetchPred,
    ])

    const rows = useMemo<ForecastRow[]>(() => {
        const actualMap = actualData?.result
            ? parseAnalyticsRows(
                  actualData.result.headers,
                  actualData.result.rows
              )
            : new Map<string, Map<string, number>>()

        const predMap = predData?.result
            ? parseAnalyticsRows(predData.result.headers, predData.result.rows)
            : new Map<string, Map<string, number>>()

        const historicalSet = new Set(historicalPeriods)

        return allPeriods.map((period): ForecastRow => {
            const actualByDx = actualMap.get(period)
            const predByDx = predMap.get(period)
            const isPrediction = !historicalSet.has(period)

            return {
                period,
                label: formatPeriod(period),
                actual: actualByDx?.get(ACTUAL_CASES_INDICATOR_ID) ?? null,
                quantileLow: predByDx?.get(QUANTILE_LOW_ID) ?? null,
                quantileMidLow: predByDx?.get(QUANTILE_MID_LOW_ID) ?? null,
                quantileMedian: predByDx?.get(QUANTILE_MEDIAN_ID) ?? null,
                quantileMidHigh: predByDx?.get(QUANTILE_MID_HIGH_ID) ?? null,
                quantileHigh: predByDx?.get(QUANTILE_HIGH_ID) ?? null,
                isPrediction,
            }
        })
    }, [actualData, predData, allPeriods, historicalPeriods])

    return {
        rows,
        loading: actualLoading || predLoading,
        historicalPeriods,
        predictionPeriods,
        allPeriods,
    }
}
