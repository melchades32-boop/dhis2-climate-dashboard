import { z } from 'zod'

// Organization unit schema
export const OrgUnitSchema = z.object({
    id: z.string(),
    displayName: z.string(),
    level: z.number().optional(),
    path: z.string().optional(),
})

// Period schema
export const PeriodSchema = z.object({
    id: z.string(),
    displayName: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
})

// Chart options schema
export const ChartOptionsSchema = z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    showLegend: z.boolean().optional(),
    showDataLabels: z.boolean().optional(),
    colorScheme: z.array(z.string()).optional(),
    responsive: z.boolean().optional(),
})

// Export options schema
export const ExportOptionsSchema = z.object({
    format: z.enum(['png', 'jpeg', 'pdf', 'svg']),
    filename: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
})

// Infer TypeScript types from schemas
export type OrgUnit = z.infer<typeof OrgUnitSchema>
export type Period = z.infer<typeof PeriodSchema>
export type ChartOptions = z.infer<typeof ChartOptionsSchema>
export type ExportOptions = z.infer<typeof ExportOptionsSchema>
