'use client'

import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
                    <span className="text-4xl font-bold text-blue-600">404</span>
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
                    <p className="text-gray-500">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                    <button
                        onClick={() => history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </div>
        </main>
    )
}
