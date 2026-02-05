'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function Home() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalCheckups: 0,
        totalMarkers: 0,
        latestDate: 'N/A'
    })
    const [user, setUser] = useState<any>(null)

    // Note: authError was defined but not used in the UI in the original JS. Keeping it for completeness but suppressing usage warning if needed.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [authError, setAuthError] = useState<string | null>(null)

    useEffect(() => {
        async function loadData() {
            try {
                const { data: { user } } = await createClient().auth.getUser()
                setUser(user)

                if (!user) {
                    setLoading(false)
                    return
                }

                // Fetch Checkups Count
                const { count: checkupCount, error: checkupError } = await createClient()
                    .from('checkups')
                    .select('*', { count: 'exact', head: true })
                if (checkupError) throw checkupError

                // Fetch Total Markers Count
                const { count: markerCount, error: markerError } = await createClient()
                    .from('results')
                    .select('*', { count: 'exact', head: true })
                if (markerError) throw markerError

                // Fetch Latest Date
                const { data: latestCheckup, error: latestError } = await createClient() // eslint-disable-line @typescript-eslint/no-unused-vars
                    .from('checkups')
                    .select('date')
                    .order('date', { ascending: false })
                    .limit(1)
                    .single()

                // Handle no data case gracefully
                const dateStr = latestCheckup ? latestCheckup.date : 'N/A'

                setStats({
                    totalCheckups: checkupCount || 0,
                    totalMarkers: markerCount || 0,
                    latestDate: dateStr
                })

            } catch (e: any) {
                console.error("Dashboard load failed", e)
                setAuthError(e.message)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const handleDevLogin = async () => {
        // A helper for the developer to quickly sign in or sign up
        const email = prompt("Enter email for dev login/signup:")
        const password = prompt("Enter password:")
        if (!email || !password) return

        // Try sign in
        let { error } = await createClient().auth.signInWithPassword({ email, password })
        if (error) {
            // Try sign up if login fails
            const { error: signUpError } = await createClient().auth.signUp({ email, password })
            if (signUpError) {
                alert("Error: " + signUpError.message)
                return
            }
            alert("Account created! Check email if confirmation is on, or try logging in again if disabled.")
        } else {
            window.location.reload()
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-gray-950">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            <main className="max-w-5xl mx-auto px-4 py-8">

                {/* Header */}
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold">Personal Health Lens</h1>
                        <p className="text-gray-500 dark:text-gray-400">Your metabolic archive.</p>
                    </div>
                    {user ? (
                        <Link
                            href="/upload"
                            className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg hover:shadow-blue-500/20"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            New Checkup
                        </Link>
                    ) : (
                        <button
                            onClick={handleDevLogin}
                            className="text-sm text-blue-600 underline"
                        >
                            Log In (Dev)
                        </button>
                    )}
                </header>

                {!user ? (
                    <div className="text-center p-12 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300">
                        <p className="text-lg text-gray-500">Please log in to view your health data.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Stat Card 1 */}
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-semibold text-gray-500 mb-2">LATEST CHECKUP</h3>
                            <div className="text-2xl font-bold">{stats.latestDate}</div>
                            <div className="mt-2 text-sm text-green-600 font-medium">
                                {stats.totalCheckups} Record{stats.totalCheckups !== 1 && 's'} Found
                            </div>
                        </div>

                        {/* Stat Card 2 */}
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-semibold text-gray-500 mb-2">TOTAL MARKERS</h3>
                            <div className="text-2xl font-bold">{stats.totalMarkers}</div>
                            <div className="mt-2 text-sm text-gray-400">
                                Extracted data points
                            </div>
                        </div>

                        {/* Stat Card 3 */}
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-semibold text-gray-500 mb-2">HEALTH SCORE</h3>
                            <div className="text-2xl font-bold">--</div>
                            <div className="mt-2 text-sm text-gray-400">
                                Coming soon
                            </div>
                        </div>

                        {/* Chart Placeholder */}
                        <div className="md:col-span-2 lg:col-span-3 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 min-h-[300px] flex items-center justify-center">
                            {stats.totalCheckups === 0 ? (
                                <div className="text-center text-gray-400">
                                    <p>No data yet. Upload your first checkup!</p>
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 w-full">
                                    {/* We will add real charts in the next phase */}
                                    <p>Charts will populate here.</p>
                                    <div className="mt-4 text-xs text-left overflow-auto max-h-40 bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono">
                                        Debug Info: {JSON.stringify(stats, null, 2)}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </main>
        </div>
    )
}
