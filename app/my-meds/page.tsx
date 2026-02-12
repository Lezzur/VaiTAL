import { getPrescriptions } from '@/app/actions/prescriptions'
import { getMedications, getTodayLogs } from '@/app/actions/scheduler'
import PrescriptionUploadZone from '@/components/prescription-upload-zone'
import AddMedicationButton from '@/components/add-medication-button'
import MedicationList from '@/components/medication-list'
import TodaySchedule from '@/components/today-schedule'
import AlarmManager from '@/components/alarm-manager'
import Link from 'next/link'
import { Plus, Calendar, FileText, ChevronRight, Pill } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MyMedsPage() {
    const prescriptions = await getPrescriptions()
    const meds = await getMedications()
    const logs = await getTodayLogs()

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-8">
            {/* Global Alarm Manager */}
            <AlarmManager schedules={meds.flatMap((m: any) => m.schedules)} />

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Meds</h1>
                        <p className="text-gray-500 mt-1">Manage your schedule, medications, and prescriptions</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN - DAILY SCHEDULE (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                <h2 className="text-lg font-semibold">Today's Timeline</h2>
                            </div>
                            <TodaySchedule meds={meds} logs={logs} />
                        </div>
                    </div>

                    {/* RIGHT COLUMN - MANAGEMENT (7 cols) */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* Active Medications */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Pill className="w-5 h-5 text-indigo-500" />
                                    <h2 className="text-lg font-semibold">Active Medications</h2>
                                </div>
                                <AddMedicationButton />
                            </div>
                            <MedicationList meds={meds} />
                        </div>

                        {/* Recent Prescriptions */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-teal-600" />
                                    Recent Prescriptions
                                </h2>
                            </div>

                            {/* Upload Area */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Prescription</h3>
                                <PrescriptionUploadZone />
                            </div>

                            {/* List */}
                            {prescriptions.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No prescriptions uploaded yet.</p>
                            ) : (
                                <div className="grid gap-3">
                                    {prescriptions.map((prescription: any) => (
                                        <Link
                                            key={prescription.id}
                                            href={`/prescriptions/${prescription.id}`}
                                            className="block group"
                                        >
                                            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all group-hover:border-teal-200">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 group-hover:text-teal-700 transition-colors">
                                                            {prescription.doctor_name || "Unknown Doctor"}
                                                        </h3>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(prescription.date).toLocaleDateString()} • {prescription.medicines?.length || 0} items
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
