import Link from 'next/link'
import { FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'

interface CheckupListProps {
    checkups: {
        id: string
        date: string
        summary: string | null
        status: 'verified' | 'needs_review'
        results: any[]
    }[]
}

export default function CheckupList({ checkups }: CheckupListProps) {
    if (checkups.length === 0) return null

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Updates</h3>
            <div className="space-y-3">
                {checkups.map((checkup) => (
                    <Link key={checkup.id} href={`/checkup/${checkup.id}`} className="block group">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-start gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0 group-hover:bg-blue-100 transition-colors">
                                <FileText className="w-6 h-6" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-semibold text-gray-900 truncate">
                                        {new Date(checkup.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                    <span className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>

                                <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                                    {checkup.summary}
                                </p>

                                <div className="flex items-center gap-2">
                                    {checkup.status === 'verified' ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                            <CheckCircle2 className="w-3 h-3" /> Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                                            <AlertTriangle className="w-3 h-3" /> Needs Review
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-400">• {checkup.results.length} results</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
