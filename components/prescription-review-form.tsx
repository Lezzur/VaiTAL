'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePrescription, deletePrescription } from '@/app/actions/prescriptions'
import MedicineCard from '@/components/medicine-card'
import { Save, Plus, Trash2, Loader2, ArrowLeft } from 'lucide-react'
import { clsx } from 'clsx'

interface Props {
    prescription: any
}

export default function PrescriptionReviewForm({ prescription }: Props) {
    const router = useRouter()
    const [medicines, setMedicines] = useState(prescription.medicines || [])
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Not implementing full editing of medicines inline for this iteration to keep it simple,
    // but the structure supports it. We can validly just display them for now,
    // or add simple delete functionality.

    const handleSave = async () => {
        setIsSaving(true)
        // For now we just save generic prescription data if we had fields for it, 
        // effectively this confirms the review.
        try {
            await updatePrescription(prescription.id, {
                date: prescription.date,
                doctor_name: prescription.doctor_name,
                notes: prescription.notes
            }, medicines)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Failed to save changes")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this prescription?")) return
        setIsDeleting(true)
        try {
            await deletePrescription(prescription.id)
            router.push('/prescriptions')
        } catch (error) {
            alert("Failed to delete")
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Medicines Prescribed</h2>
                {/* 
                <button className="text-sm text-teal-600 font-medium hover:underline flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add Medicine
                </button>
                */}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {medicines.map((med: any, i: number) => (
                    <MedicineCard key={i} medicine={med} />
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-500 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 font-medium"
                >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete Prescription
                </button>

                {/* 
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
                */}
            </div>
        </div>
    )
}
