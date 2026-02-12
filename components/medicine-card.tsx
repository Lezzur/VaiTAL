import { AlertTriangle, Clock, Calendar, FileText, Activity } from 'lucide-react'
import { clsx } from 'clsx'

interface MedicineCardProps {
    medicine: any
    isEditable?: boolean
    onUpdate?: (updatedMedicine: any) => void
    onDelete?: () => void
}

export default function MedicineCard({ medicine, isEditable = false, onUpdate, onDelete }: MedicineCardProps) {
    // Determine card color based on warnings or importance
    const hasWarnings = medicine.warnings || medicine.contraindications
    const cardBg = hasWarnings ? 'bg-orange-50 border-orange-100' : 'bg-white border-gray-100'

    return (
        <div className={clsx("rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md", cardBg)}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {medicine.name}
                        {medicine.dosage && (
                            <span className="text-sm font-medium px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                                {medicine.dosage}
                            </span>
                        )}
                    </h3>
                    {medicine.description && (
                        <p className="text-sm text-gray-500 mt-1">{medicine.description}</p>
                    )}
                </div>
                {/* Confidence Badge if low */}
                {medicine.confidence < 0.8 && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-200" title="Low AI Confidence">
                        Check Accuracy
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {(medicine.frequency || medicine.duration) && (
                    <div className="space-y-2">
                        {medicine.frequency && (
                            <div className="flex items-center gap-2 text-gray-700">
                                <Clock className="w-4 h-4 text-teal-600" />
                                <span>{medicine.frequency}</span>
                            </div>
                        )}
                        {medicine.duration && (
                            <div className="flex items-center gap-2 text-gray-700">
                                <Calendar className="w-4 h-4 text-teal-600" />
                                <span>{medicine.duration}</span>
                            </div>
                        )}
                    </div>
                )}

                {(medicine.instructions) && (
                    <div className="flex items-start gap-2 text-gray-700">
                        <FileText className="w-4 h-4 text-teal-600 mt-0.5" />
                        <span>{medicine.instructions}</span>
                    </div>
                )}
            </div>

            {/* Warnings Section */}
            {(medicine.contraindications || medicine.warnings) && (
                <div className="mt-4 pt-3 border-t border-gray-200/50 space-y-2">
                    {medicine.contraindications && (
                        <div className="flex items-start gap-2 text-red-700 bg-red-50 p-2 rounded-lg text-sm">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold block text-xs uppercase tracking-wider mb-0.5">Contraindications</span>
                                {medicine.contraindications}
                            </div>
                        </div>
                    )}
                    {medicine.warnings && (
                        <div className="flex items-start gap-2 text-orange-700 bg-orange-100/50 p-2 rounded-lg text-sm">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold block text-xs uppercase tracking-wider mb-0.5">Warnings</span>
                                {medicine.warnings}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
