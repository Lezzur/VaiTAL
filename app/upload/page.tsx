import UploadZone from '@/components/upload-zone'

export default function UploadPage() {
    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Add New Results</h1>
                    <p className="text-gray-500 text-lg">
                        Upload a photo of your lab report. The AI Lens will extract the data.
                    </p>
                </div>

                <UploadZone />
            </div>
        </div>
    )
}
