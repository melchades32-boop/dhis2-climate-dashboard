import HighchartsReact from 'highcharts-react-official'
import { useRef, useState } from 'react'

export function useVisualizationRefs() {
    const chartRef = useRef<HighchartsReact.RefObject>(null)
    const tableRef = useRef<HTMLTableElement>(null)
    const [, setSingleValueRef] = useState<HTMLDivElement | null>(null)

    return {
        chartRef,
        tableRef,
        setSingleValueRef,
    }
}
