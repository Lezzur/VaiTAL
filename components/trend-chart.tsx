'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea } from 'recharts'

interface TrendChartProps {
    data: {
        date: string
        value: number
        unit: string
        min?: number
        max?: number
    }[]
    markerName: string
}

export default function TrendChart({ data, markerName }: TrendChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100 text-gray-400">
                No data for this marker yet.
            </div>
        )
    }

    // Calculate generic min/max for reference area if available across most points
    // For simplicity, we define the reference band based on the *latest* record's range, or average.
    // Visualizing a changing reference range is complex, so let's stick to simple line for now, 
    // maybe just show the latest range in the tooltip or subtitle.

    const latest = data[data.length - 1]
    const hasRange = latest.min !== undefined && latest.max !== undefined

    return (
        <div className="w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{markerName} Trends</h3>
                <span className="text-sm text-gray-500">
                    Last: {latest.value} {latest.unit}
                    {hasRange && (
                        <span className={latest.value >= latest.min! && latest.value <= latest.max! ? "text-green-600 ml-2" : "text-amber-600 ml-2"}>
                            (Ref: {latest.min} - {latest.max})
                        </span>
                    )}
                </span>
            </div>

            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="date"
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickMargin={10}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            fontSize={12}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#2563EB"
                            strokeWidth={3}
                            activeDot={{ r: 6 }}
                            dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
