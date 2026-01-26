import { getMatrixData } from '@/app/actions/matrix'
import { Activity, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { clsx } from 'clsx'

export const dynamic = 'force-dynamic'

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
                                        <th key={date} className="px-6 py-4 text-left whitespace-nowrap min-w-[120px]">
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
                                    rows.map((row) => (
                                        <tr key={row.marker} className="hover:bg-blue-50/30 transition-colors">
                                            <th className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">
                                                {row.marker}
                                                <span className="block text-xs text-gray-400 font-normal">{row.unit}</span>
                                            </th>
                                            {dates.map((date, idx) => {
                                                const value = row.values[date]
                                                const prevDate = dates[idx + 1]
                                                const prevValue = prevDate ? row.values[prevDate] : undefined

                                                // Delta calculation (only if both are numbers)
                                                let delta = null
                                                if (typeof value === 'number' && typeof prevValue === 'number') {
                                                    const diff = value - prevValue
                                                    const diffFormatted = Math.abs(diff) < 0.1 ? 0 : diff.toFixed(1)
                                                    if (diff > 0) delta = <span className="text-xs text-gray-400 font-mono ml-1">↑{diffFormatted}</span>
                                                    if (diff < 0) delta = <span className="text-xs text-gray-400 font-mono ml-1">↓{Math.abs(diff).toFixed(1)}</span>
                                                }

                                                return (
                                                    <td key={date} className="px-6 py-4 whitespace-nowrap">
                                                        {value !== undefined ? (
                                                            <div className="flex items-center gap-1">
                                                                <span className={clsx(
                                                                    "font-semibold",
                                                                    typeof value === 'string' ? "text-gray-600 text-xs uppercase tracking-wider" : "text-gray-700"
                                                                )}>
                                                                    {value}
                                                                </span>
                                                                {delta}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-300">-</span>
                                                        )}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
