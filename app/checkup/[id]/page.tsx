import { getCheckupDetails } from '@/app/actions/checkup'
import CheckupReviewForm from '@/components/checkup-review-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    // Validate UUID to prevent 22P02 DB errors
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    if (!isValidUUID) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-xl font-bold text-red-600">Invalid Checkup ID</h1>
                    <p className="text-gray-500">The requested checkup ID "{id}" is invalid.</p>
                    <Link href="/" className="text-blue-600 hover:underline">Return Home</Link>
                </div>
            </div>
        )
    }

    const checkup = await getCheckupDetails(id)

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                <h1 className="text-2xl font-bold text-gray-900">Review Results</h1>
                <p className="text-gray-500">Please verify the AI-extracted data below. Edit any errors before saving.</p>

                <CheckupReviewForm checkup={checkup} results={checkup.results} />
            </div>
        </div>
    )
}
