'use client'

import { Pill, Clock, CalendarDays, MoreHorizontal, Trash2 } from 'lucide-react'

export default function MedicationList({ meds }: { meds: any[] }) {
    if (meds.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>No medications added yet.</p>
                <p className="text-sm mt-1">Click "Add Medication" to get started.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {meds.map((med) => (
                <div
                    key={med.id}
                    className="p-4 border border-gray-100 rounded-xl hover:border-blue-100 hover:bg-blue-50/30 transition-all group"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                                <Pill className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{med.name}</h3>
                                {med.dosage && (
                                    <p className="text-sm text-gray-500">{med.dosage}</p>
                                )}
                            </div>
                        </div>
                        <button className="text-gray-300 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {med.schedules.map((schedule: any) => (
                            <span
                                key={schedule.id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md"
                            >
                                <Clock className="w-3 h-3" />
                                {schedule.time.substring(0, 5)}
                                {schedule.days ? (
                                    <span className="text-gray-400 border-l border-gray-200 pl-1.5 ml-1">
                                        {schedule.days.join(', ')}
                                    </span>
                                ) : (
                                    <span className="text-gray-400 border-l border-gray-200 pl-1.5 ml-1">
                                        Daily
                                    </span>
                                )}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
