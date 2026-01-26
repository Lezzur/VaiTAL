'use client'

import { useState } from 'react'
import { updateCheckup, updateResult, verifyCheckup, deleteCheckup } from '@/app/actions/checkup'
import { CheckCircle2, AlertTriangle, Save, ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ... existing code ...



interface Props {
    checkup: any
    results: any[]
}

export default function CheckupReviewForm({ checkup, results: initialResults }: Props) {
    const router = useRouter()
    const [date, setDate] = useState(checkup.date)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this checkup? This cannot be undone.")) return

        setIsDeleting(true)
        await deleteCheckup(checkup.id)
        router.push('/')
    }

    // We can manage local state for results or just rely on server actions + standard inputs
    // For simplicity MVP, we'll use individual form action handlers or simple onBlur updates.
    // Review Mode: Highlight warnings.

    const flags = checkup.flags || []
    const isFlagged = flags.length > 0 || checkup.status === 'needs_review'

    const handleVerify = async () => {
        setIsSaving(true)
        // Save date first
        await updateCheckup(checkup.id, { date })
        // Verify
        await verifyCheckup(checkup.id)
        setIsSaving(false)
        router.push('/')
    }

    return (
        <div className="space-y-6">
            {/* Banner */}
            {isFlagged && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-yellow-800">Review Required</h3>
                        <p className="text-sm text-yellow-700">
                            {flags.length > 0
                                ? `Issues detected: ${flags.join(', ')}`
                                : "Please verify the extracted data before saving."}
                        </p>
                    </div>
                </div>
            )}

            {/* Header / Date Edit */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">Checkup Details</h2>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={`border p-2 rounded-lg font-mono ${flags.includes('Future Date Detected') || flags.includes('Suspiciously Old Date') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    />
                </div>
            </div>

            {/* Results Editor */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 uppercase">
                        <tr>
                            <th className="px-6 py-3">Marker</th>
                            <th className="px-6 py-3">Value</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {initialResults.map(result => {
                            const resultFlags = result.flags || []
                            const hasIssue = resultFlags.length > 0

                            return (
                                <tr key={result.id} className={hasIssue ? "bg-yellow-50/50" : ""}>
                                    <td className="px-6 py-4 font-medium">
                                        <input
                                            defaultValue={result.marker_name}
                                            onBlur={(e) => updateResult(result.id, { marker_name: e.target.value, checkup_id: checkup.id })}
                                            className="bg-transparent border-b border-transparent focus:border-blue-300 focus:outline-none w-full"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <input
                                                defaultValue={result.text_value || result.value}
                                                className="bg-gray-50 border border-gray-200 rounded px-2 py-1 w-24 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                                onChange={(e) => {
                                                    // Smart update: detect if number or string
                                                    const val = e.target.value
                                                    const num = parseFloat(val)
                                                    if (!isNaN(num) && val.trim() !== '') {
                                                        updateResult(result.id, { value: num, text_value: null, checkup_id: checkup.id })
                                                    } else {
                                                        updateResult(result.id, { text_value: val, value: null, checkup_id: checkup.id })
                                                    }
                                                }}
                                            />
                                            <span className="text-gray-400 text-xs">{result.unit}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {hasIssue && (
                                            <div className="flex items-center gap-1 text-yellow-600 text-xs font-medium">
                                                <AlertTriangle className="w-3 h-3" />
                                                {resultFlags.join(', ')}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Actions */}
            {/* Actions */}
            <div className="flex items-center justify-between p-4">
                <button
                    onClick={handleDelete}
                    disabled={isDeleting || isSaving}
                    className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <Trash2 className="w-4 h-4" /> Delete Results
                </button>

                <div className="flex items-center gap-4">
                    <Link href="/" className="text-gray-500 hover:text-gray-900">Cancel</Link>
                    <button
                        onClick={handleVerify}
                        disabled={isSaving || isDeleting}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-green-600/20 transition-all disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : (
                            <>
                                <CheckCircle2 className="w-4 h-4" /> Verify & Save
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
