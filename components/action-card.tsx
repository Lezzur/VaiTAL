import { Lightbulb, CheckCircle2 } from 'lucide-react'

interface ActionCardProps {
    recommendations: string[]
}

export default function ActionCard({ recommendations }: ActionCardProps) {
    if (!recommendations || recommendations.length === 0) return null

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Lightbulb className="w-32 h-32" />
            </div>

            <div className="relative z-10 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    AI Recommendations
                </h3>

                <ul className="space-y-2">
                    {recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                            <CheckCircle2 className="w-5 h-5 text-indigo-200 shrink-0 mt-0.5" />
                            <span className="text-sm font-medium leading-relaxed">{rec}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
