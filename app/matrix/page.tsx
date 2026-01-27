import { getMatrixData, MatrixValue } from '@/app/actions/matrix'
import { Activity, ArrowLeft, TrendingUp, TrendingDown, Info } from 'lucide-react'
import Link from 'next/link'
import { clsx } from 'clsx'
import { Tooltip } from '@/components/ui/tooltip'
import { getDefinition } from '@/lib/glossary'

export const dynamic = 'force-dynamic'

function getStatus(val: MatrixValue) {
    if (typeof val.value !== 'number') return 'unknown'
    if (val.min != null && val.value < val.min) return 'low'
    if (val.max != null && val.value > val.max) return 'high'
    if (val.min != null || val.max != null) return 'normal'
    return 'unknown'
}

function StatusIndicator({ status }: { status: 'low' | 'high' | 'normal' | 'unknown' }) {
    if (status === 'high') {
        return (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">
                High
            </span>
        )
    }
    if (status === 'low') {
        return (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
                Low
            </span>
        )
    }
    return null
}

export default async function MatrixPage() {
    const { rows, dates } = await getMatrixData()

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Link href="/" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            <ArrowLeft className="w-3 h-3" /> Back to Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="w-6 h-6 text-blue-600" />
                            Health Matrix
                        </h1>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left font-bold text-gray-900 sticky left-0 bg-gray-50 min-w-[200px] border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10">
                                        Biomarker
                                    </th>
                                    {dates.map(date => (
                                        <th key={date} className="px-6 py-4 text-left whitespace-nowrap min-w-[140px]">
                                            {new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={dates.length + 1} className="px-6 py-8 text-center text-gray-500">
                                            No data found. Upload a report first.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row) => {
                                        const definition = getDefinition(row.marker)
                                        return (
                                            <tr key={row.marker} className="hover:bg-blue-50/30 transition-colors">
                                                <th className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">
                                                    {definition ? (
                                                        <Tooltip content={definition}>
                                                            <span className="cursor-help border-b border-dotted border-gray-400">
                                                                {row.marker}
                                                            </span>
                                                        </Tooltip>
                                                    ) : (
                                                        row.marker
                                                    )}
                                                    <span className="block text-xs text-gray-400 font-normal">{row.unit}</span>
                                                </th>
                                                {dates.map((date, idx) => {
                                                    const cell = row.values[date]
                                                    const prevDate = dates[idx + 1]
                                                    const prevCell = prevDate ? row.values[prevDate] : undefined

                                                    if (!cell) {
                                                        return (
                                                            <td key={date} className="px-6 py-4 whitespace-nowrap">
                                                                <span className="text-gray-300">-</span>
                                                            </td>
                                                        )
                                                    }

                                                    // Delta calculation (only if both are numbers)
                                                    let delta = null
                                                    if (typeof cell.value === 'number' && typeof prevCell?.value === 'number') {
                                                        const diff = cell.value - prevCell.value
                                                        const diffFormatted = Math.abs(diff) < 0.1 ? 0 : diff.toFixed(1)
                                                        if (diff > 0) delta = <TrendingUp className="w-3 h-3 text-gray-400" />
                                                        if (diff < 0) delta = <TrendingDown className="w-3 h-3 text-gray-400" />
                                                    }

                                                    const status = getStatus(cell)
                                                    const isNumeric = typeof cell.value === 'number'
                                                    const displayValue = cell.textValue || cell.value

                                                    return (
                                                        <td key={date} className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={clsx(
                                                                        "font-semibold",
                                                                        status === 'high' ? "text-amber-700" :
                                                                            status === 'low' ? "text-blue-700" :
                                                                                !isNumeric ? "text-gray-600 text-xs uppercase tracking-wider" : "text-gray-900"
                                                                    )}>
                                                                        {displayValue}
                                                                    </span>
                                                                    {delta}
                                                                    <StatusIndicator status={status} />
                                                                </div>

                                                                {/* Range Tooltip / Context */}
                                                                {(cell.min != null || cell.max != null) && (
                                                                    <div className="text-[10px] text-gray-400 font-mono">
                                                                        Expected: {cell.min ?? '?'} - {cell.max ?? '?'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
