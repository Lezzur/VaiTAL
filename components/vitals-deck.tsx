import { Activity, Droplets, Heart } from 'lucide-react'

interface VitalsDeckProps {
    checkups: any[]
}

// Helper to find a specific marker value from the latest checkup (this requires fetching results deeply, 
// strictly speaking we might need a dedicated query for this to be efficient, but we can infer from Matrix data or just 
// imply it. For now, let's create a placeholder structure assuming we pass specific latest vitals.)

// Actually, let's make this component simple: It takes specific values.
// We'll update DashboardView to compute these from the "Matrix" data equivalent or recent results.

export default function VitalsDeck({ latestVitals }: { latestVitals: any[] }) {
    if (!latestVitals || latestVitals.length === 0) return null

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {latestVitals.map((vital) => (
                <div key={vital.label} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                    <div className="flex items-start justify-between">
                        <span className="text-gray-500 font-medium text-sm">{vital.label}</span>
                        <Activity className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">
                            {vital.value} <span className="text-xs font-normal text-gray-400">{vital.unit}</span>
                        </div>
                        <div className="text-xs mt-1">
                            {/* Logic for status color could go here */}
                            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                Latest
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
