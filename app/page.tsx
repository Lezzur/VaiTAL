import Link from 'next/link'
import { Plus, Activity } from 'lucide-react'
import { getRecentCheckups, getAllMarkers } from '@/app/actions/data'
import DashboardView from '@/components/dashboard-view'
import UserMenu from '@/components/user-menu'

export default async function Home() {
    const checkups = await getRecentCheckups()
    const allMarkers = await getAllMarkers()

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-6 h-6 text-blue-600" />
                        <span className="font-bold text-gray-900 text-lg tracking-tight">VaiTAL</span>
                    </div>
                    <UserMenu />
                </div>
            </header>



            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                {checkups.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center space-y-6 max-w-2xl mx-auto mt-12">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-blue-50/50">
                            <Activity className="w-10 h-10 text-blue-600" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Your Health Dashboard</h2>
                            <p className="text-gray-500 text-lg max-w-md mx-auto">
                                No data yet. Upload your first lab report to unlock AI-powered insights and trend tracking.
                            </p>
                        </div>
                        <div className="pt-4">
                            <Link
                                href="/upload"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold hover:underline text-lg"
                            >
                                Start Uploading &rarr;
                            </Link>
                        </div>
                    </div>
                ) : (
                    <DashboardView checkups={checkups} allMarkers={allMarkers} />
                )}
            </main>
        </div>
    )
}
