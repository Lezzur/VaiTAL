import { getPrescriptionDetails } from '@/app/actions/prescriptions'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, FileText, Activity } from 'lucide-react'
import PrescriptionReviewForm from '@/components/prescription-review-form' // We need to create this

export const dynamic = 'force-dynamic'

export default async function PrescriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const prescription = await getPrescriptionDetails(id)

    if (!prescription) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Prescription Not Found</h1>
                    <Link href="/prescriptions" className="text-teal-600 hover:underline mt-2 inline-block">
                        Back to Prescriptions
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 pb-20">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back Link */}
                <Link href="/prescriptions" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to List
                </Link>

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6 border-b border-gray-100 pb-6">
                        <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100/50 text-teal-800 border border-teal-200 mb-2">
                                Prescription
                            </span>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {prescription.doctor_name || "Prescription Details"}
                            </h1>
                            <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(prescription.date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        {prescription.file_url && (
                            <a
                                href={prescription.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-20 h-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 hover:opacity-80 transition-opacity flex-shrink-0"
                            >
                                <img src={prescription.file_url} alt="Original" className="w-full h-full object-cover" />
                            </a>
                        )}
                    </div>

                    <div className="prose prose-teal max-w-none">
                        <h3 className="text-gray-900 font-semibold flex items-center gap-2 text-sm uppercase tracking-wide">
                            <FileText className="w-4 h-4" /> Notes & Analysis
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-4 text-gray-700 mt-2 text-sm leading-relaxed">
                            {prescription.notes || "No additional notes extracted."}
                        </div>
                    </div>
                </div>

                {/* Medicines List / Edit Form */}
                <PrescriptionReviewForm prescription={prescription} />

            </div>
        </div>
    )
}
