'use client'

import { useState } from 'react'
import { Check, X, Clock, AlertCircle } from 'lucide-react'
import { logMedicationTaken } from '@/app/actions/scheduler'
import { useRouter } from 'next/navigation'

export default function TodaySchedule({ meds, logs }: { meds: any[], logs: any[] }) {
    const router = useRouter()

    // Flatten schedules for today
    const todaySchedules = meds.flatMap(med =>
        med.schedules
            .filter((s: any) => s.active) // Only active
            // Filter by day (if specific days set)
            .filter((s: any) => {
                if (!s.days || s.days.length === 0) return true
                const today = new Date().toLocaleDateString('en-US', { weekday: 'short' })
                return s.days.includes(today)
            })
            .map((s: any) => ({
                ...s,
                medName: med.name,
                medDosage: med.dosage,
                log: logs.find((l: any) => l.schedule_id === s.id)
            }))
    ).sort((a, b) => a.time.localeCompare(b.time))

    const handleAction = async (scheduleId: string, status: 'taken' | 'skipped') => {
        try {
            await logMedicationTaken(scheduleId, status)
            router.refresh()
        } catch (err) {
            console.error(err)
            alert('Failed to update status')
        }
    }

    if (todaySchedules.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>No medications scheduled for today!</p>
            </div>
        )
    }

    return (
        <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 py-2">
            {todaySchedules.map((item) => {
                const status = item.log?.status
                const isTaken = status === 'taken'
                const isSkipped = status === 'skipped'

                return (
                    <div key={item.id} className="relative pl-8">
                        {/* Timeline Dot */}
                        <div className={`
                            absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 
                            ${isTaken ? 'bg-green-500 border-green-500' :
                                isSkipped ? 'bg-red-500 border-red-500' :
                                    'bg-white border-gray-300'}
                        `}>
                            {isTaken && <Check className="w-3 h-3 text-white absolute top-0 left-0" />}
                        </div>

                        <div className={`p-4 rounded-lg border transition-all ${isTaken ? 'bg-green-50 border-green-200 opacity-70' :
                                isSkipped ? 'bg-red-50 border-red-200 opacity-70' :
                                    'bg-white border-gray-200 shadow-sm hover:shadow-md'
                            }`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="font-mono text-sm font-semibold text-gray-600">
                                            {item.time.substring(0, 5)}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900">{item.medName}</h3>
                                    <p className="text-sm text-gray-500">{item.medDosage}</p>
                                </div>

                                {!status && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAction(item.id, 'taken')}
                                            className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                                            title="Mark as Taken"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleAction(item.id, 'skipped')}
                                            className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                                            title="Skip"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}

                                {status && (
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${isTaken ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {status}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
