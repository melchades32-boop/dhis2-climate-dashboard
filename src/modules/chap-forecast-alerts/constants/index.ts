// Org-unit hierarchy levels for South Sudan
export const STATE_OU_LEVEL = 2
export const COUNTY_OU_LEVEL = 3

// Actual malaria cases indicator
export const ACTUAL_CASES_INDICATOR_ID = 'VqICaehXI2W'

// CHAP prediction dataset (ESysCAEIUDy) quantile data elements
export const QUANTILE_LOW_ID = 'S0Zc8XguF16' // Q10 (0.1)
export const QUANTILE_MID_LOW_ID = 'bxSGt9LiuFc' // Q25 (0.25)
export const QUANTILE_MEDIAN_ID = 'ZqR5unVGVvH' // Q50 (0.5)
export const QUANTILE_MID_HIGH_ID = 'uE6IXF5FfyS' // Q75 (0.75)
export const QUANTILE_HIGH_ID = 'ZcYu1l21FhH' // Q90 (0.9)

// Table / chart window
export const HISTORICAL_MONTHS = 12
export const PREDICTION_MONTHS = 3

// KPI data element IDs
export const TOTAL_FEVER_ID = 'T9AMXThzdNK'
export const CONFIRMED_FACILITY_ID = 'M7WaIRTcTGD'
export const CLINICAL_DIAGNOSIS_ID = 'i22SNIx7ti9'
export const CONFIRMED_COMMUNITY_ID = 'M7WaIRTcTGD'

export const KPI_IDS = [
    TOTAL_FEVER_ID,
    CONFIRMED_FACILITY_ID,
    CLINICAL_DIAGNOSIS_ID,
    CONFIRMED_COMMUNITY_ID,
] as const

export const MAP_IDS = ['cMaYBmfzxqQ', 'LCjVaqtisxZ', 'JlH5zn6F4ft'] as const
