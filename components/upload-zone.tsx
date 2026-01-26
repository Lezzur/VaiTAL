'use client'

import { useState, useRef } from 'react'
import { UploadCloud, Loader2, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { processDocument } from '@/app/actions/analyze'
import { clsx } from 'clsx'
import { useRouter } from 'next/navigation'

export default function UploadZone() {
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [status, setStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0])
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setStatus('analyzing')
        setErrorMessage('')

        const formData = new FormData()
        formData.append('file', file)

        const result = await processDocument(formData)
        console.log("Upload Result:", result)

        if (result.success && result.checkupId) {
            setStatus('success')
            // Redirect to Review Page
            setTimeout(() => {
                router.push(`/checkup/${result.checkupId}`)
            }, 1000)
        } else {
            setStatus('error')
            setErrorMessage(result.error || 'Checkup analysis failed.')
        }
    }

    return (
        <div className="w-full max-w-xl mx-auto space-y-6">
            <div
                className={clsx(
                    "relative border-2 border-dashed rounded-xl p-12 transition-all text-center",
                    isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-gray-50",
                    status === 'analyzing' && "opacity-50 pointer-events-none"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleFileSelect}
                />

                {!file ? (
                    <div className="space-y-4" onClick={() => fileInputRef.current?.click()}>
                        <div className="mx-auto w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center">
                            <UploadCloud className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-lg font-medium text-gray-900">
                                Click or drag & drop to upload
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Supports Images (JPG, PNG) and PDF
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                            className="text-sm text-red-500 hover:underline"
                        >
                            Remove
                        </button>
                    </div>
                )}
            </div>

            {/* Buttons & Status */}
            {file && status !== 'success' && (
                <button
                    onClick={handleUpload}
                    disabled={status === 'analyzing'}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {status === 'analyzing' ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Analyzing with Personal Lens...
                        </>
                    ) : (
                        'Process Document'
                    )}
                </button>
            )}

            {status === 'success' && (
                <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Analysis Complete! Checkup saved to database.
                </div>
            )}

            {status === 'error' && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {errorMessage}
                </div>
            )}
        </div>
    )
}
