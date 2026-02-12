import Link from 'next/link'
import { Activity, Pill } from 'lucide-react'
import UserMenu from '@/components/user-menu'

export default function SiteHeader() {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Activity className="w-6 h-6 text-blue-600" />
                        <span className="font-bold text-gray-900 text-lg tracking-tight">VaiTAL</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/"
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/my-meds"
                            className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors flex items-center gap-1.5"
                        >
                            <Pill className="w-4 h-4" />
                            My Meds
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {/* Mobile Nav could go here */}
                    <UserMenu />
                </div>
            </div>
        </header>
    )
}
