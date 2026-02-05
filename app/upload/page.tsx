'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LensScanner from '@/components/ui/LensScanner'
import { analyzeImageAction } from '@/app/actions'
import { createClient } from '@/lib/supabase'
import { Loader2, CheckCircle, AlertCircle, Save } from 'lucide-react'
import type { ExtractedCheckup } from '@/lib/gemini'

export default function UploadPage() {
    const router = useRouter()
    const [results, setResults] = useState<ExtractedCheckup | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleScan = async (base64Data: string, mimeType: string) => {
        setError(null)
        try {
            // Call Server Action
            const response = await analyzeImageAction(base64Data, mimeType)

            if (response.success && response.data) {
                setResults(response.data)
            } else {
                throw new Error(response.error || 'Unknown error')
            }

        } catch (e: any) {
            console.error(e)
            setError("Failed to analyze image. Please try again.")
        }
    }

    const handleSave = async () => {
        if (!results) return
        setIsSaving(true)
        setError(null)

        try {
            const { data: { user } } = await createClient().auth.getUser()
            if (!user) throw new Error("User not authenticated")

            // 1. Insert Checkup
            const { data: checkupData, error: checkupError } = await createClient()
                .from('checkups')
                .insert({
                    user_id: user.id,
                    date: new Date().toISOString().split('T')[0], // Today's date default
                    summary: results.summary
                })
                .select()
                .single()

            if (checkupError) throw checkupError

            // 2. Insert Results
            const resultsToInsert = results.results.map((item) => ({
                checkup_id: checkupData.id,
                user_id: user.id,
                marker_name: item.marker_name,
                value: item.value,
                unit: item.unit,
                reference_range_min: item.reference_range_min,
                reference_range_max: item.reference_range_max,
                confidence: item.confidence
            }))

            const { error: resultsError } = await createClient()
                .from('results')
                .insert(resultsToInsert)

            if (resultsError) throw resultsError

            router.push('/')

        } catch (e: any) {
            console.error(e)
            setError("Failed to save to database. " + (e.message || ""))
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 flex flex-col items-center">
            <div className="w-full max-w-2xl text-center mb-12 mt-10">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
                    Data Ingestion
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Upload your blood work, lab results, or medical reports.
                </p>
            </div>

            {!results ? (
                <>
                    <LensScanner onScan={handleScan} />
                    {error && (
                        <div className="mt-4 text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}
                </>
            ) : (
                <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            Analysis Complete
                        </h2>
                        <p className="text-gray-500 mt-1">{results.summary}</p>
                    </div>

                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Marker</th>
                                    <th className="px-6 py-3">Value</th>
                                    <th className="px-6 py-3">Unit</th>
                                    <th className="px-6 py-3">Range</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.results.map((row, idx) => (
                                    <tr key={idx} className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {row.marker_name}
                                        </td>
                                        <td className="px-6 py-4 font-bold">
                                            {row.value}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {row.unit}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {row.reference_range_min} - {row.reference_range_max}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex flex-col gap-4">
                        {error && (
                            <div className="text-sm text-red-600 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setResults(null)}
                                className="px-5 py-2.5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Confirm & Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
