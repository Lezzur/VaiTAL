'use client'

import { useState, useEffect } from 'react'
import TrendChart from './trend-chart'
import CheckupList from './checkup-list'
import VitalsDeck from './vitals-deck'
import InsightCard from './insight-card'
import { getMarkerHistory } from '@/app/actions/data'
import { Filter, Table, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface DashboardViewProps {
    checkups: any[]
    allMarkers: string[]
}

export default function DashboardView({ checkups, allMarkers }: DashboardViewProps) {
    // Default to first marker or "Hemoglobin" if available, else empty
    const defaultMarker = allMarkers.find(m => m.includes('Hemoglobin')) || allMarkers[0] || ''

    const [selectedMarker, setSelectedMarker] = useState(defaultMarker)
    const [historyData, setHistoryData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // Derive latest vitals and recommendations from the most recent checkup
    const latestCheckup = checkups[0] || {}
    const latestRecommendations = latestCheckup.recommendations || []
    const latestAnalysis = latestCheckup.analysis || ''

    // Mock "Top Vitals" by grabbing specific known markers if they exist in the history/cache 
    // For MVP, we don't have a "getLatestValueFor(marker)" easily available without fetching all histories.
    // STRATEGY: We'll show placeholder or "Common" ones if we can find them in the ALL markers list, but without value it's tricky.
    // BETTER MVP: Just don't show specific values in the deck yet, OR, show "Latest Updates" count.
    // ACTUALLY: Let's strip the value requirement for now and just show "Tracked Vitals" count or similar, 
    // OR, let's skip the VitalsDeck dynamic values until we have a robust "getLatestVitals" action.
    // WAIT: implementing a simple "Latest Vitals" retrieval in the component is better.
    // Let's pass "latestVitals" as a prop computed in the parent page for now? No, let's keep it simple.
    // We will omit VitalsDeck values for this step and focus on the Matrix link + Action Card.

    // Correction: I can try to pass the result_count or something. 
    // Let's implement VitalsDeck with dummy data just to show UI if we can't get real data (user asked for UI/UX). 
    // No, honest data is better. Let's show the Action Card which IS real.

    useEffect(() => {
        if (!selectedMarker) return

        async function fetchData() {
            setLoading(true)
            const data = await getMarkerHistory(selectedMarker)
            setHistoryData(data)
            setLoading(false)
        }

        fetchData()
    }, [selectedMarker])

    if (checkups.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center space-y-4">
                <p className="text-gray-500">No data found. Upload your first result to get started.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Top Row: Actions & Navigation */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <InsightCard analysis={latestAnalysis} recommendations={latestRecommendations} />
                </div>
                <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg flex flex-col justify-center items-start space-y-2 hover:bg-blue-700 transition-colors cursor-pointer group">
                    <Link href="/matrix" className="w-full h-full flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1 opacity-80">
                            <Table className="w-5 h-5" />
                            <span>Comprehensive View</span>
                        </div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            Health Matrix <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-sm opacity-70 mt-2">View all your results in a pivot table.</p>
                    </Link>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Col: Trends */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Health Trends</h2>

                        <div className="relative">
                            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <select
                                value={selectedMarker}
                                onChange={(e) => setSelectedMarker(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                {allMarkers.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {selectedMarker ? (
                        <div className={loading ? "opacity-50 animate-pulse" : ""}>
                            <TrendChart data={historyData} markerName={selectedMarker} />
                        </div>
                    ) : (
                        <div className="h-64 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400">
                            Select a marker to visualize trends
                        </div>
                    )}
                </div>

                {/* Right Col: Feed */}
                <div className="space-y-6">
                    <CheckupList checkups={checkups} />
                </div>
            </div>
        </div>
    )
}
