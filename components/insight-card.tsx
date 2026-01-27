import { Lightbulb, CheckCircle2, Sparkles } from 'lucide-react'

interface InsightCardProps {
    analysis?: string
    recommendations: string[]
}

export default function InsightCard({ analysis, recommendations }: InsightCardProps) {
    if ((!recommendations || recommendations.length === 0) && !analysis) return null

    return (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">


            <div className="relative z-10 space-y-6">
                {/* Narrative Analysis */}
                {analysis ? (
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-indigo-50">
                            <Sparkles className="w-5 h-5" />
                            AI Health Insight
                        </h3>
                        <p className="text-white/90 leading-relaxed font-medium">
                            "{analysis}"
                        </p>
                    </div>
                ) : (
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-indigo-50">
                        <Lightbulb className="w-5 h-5" />
                        AI Recommendations
                    </h3>
                )}

                {/* Action Items */}
                {recommendations.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-white/10">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200">Action Items</h4>
                        <ul className="space-y-2">
                            {recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-md">
                                    <CheckCircle2 className="w-5 h-5 text-green-300 shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium leading-relaxed shadow-sm">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}
