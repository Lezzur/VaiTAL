'use client'

import { useState, useRef, useEffect } from 'react'
import { UploadCloud, Loader2, FileText, CheckCircle, AlertCircle, X, Pill } from 'lucide-react'
import { processPrescriptionUpload } from '@/app/actions/prescriptions'
import { clsx } from 'clsx'
import { useRouter } from 'next/navigation'

export default function PrescriptionUploadZone() {
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [textInput, setTextInput] = useState('')
    const [status, setStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    const handleFile = (selectedFile: File) => {
        setFile(selectedFile)

        if (selectedFile.type.startsWith('image/')) {
            const url = URL.createObjectURL(selectedFile)
            setPreviewUrl(url)
        } else {
            setPreviewUrl(null)
        }
    }

    const removeFile = () => {
        setFile(null)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        if (e.clipboardData.files && e.clipboardData.files.length > 0) {
            e.preventDefault()
            const pastedFile = e.clipboardData.files[0]
            handleFile(pastedFile)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (!file && !textInput.trim()) return

        setStatus('analyzing')
        setErrorMessage('')

        const formData = new FormData()
        if (file) {
            formData.append('file', file)
        } else {
            formData.append('text', textInput)
        }

        const result = await processPrescriptionUpload(formData)
        console.log("Upload Result:", result)

        if (result.success && result.prescriptionId) {
            setStatus('success')
            // Redirect to Review Page
            setTimeout(() => {
                router.push(`/prescriptions/${result.prescriptionId}`)
            }, 1000)
        } else {
            setStatus('error')
            setErrorMessage(result.error || 'Prescription analysis failed.')
        }
    }

    const isReady = file !== null || textInput.trim().length > 0

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">

            {/* Main Input Area */}
            <div
                className={clsx(
                    "relative border-2 border-dashed rounded-xl p-6 transition-all bg-white shadow-sm",
                    isDragging ? "border-teal-500 bg-teal-50 ring-4 ring-teal-100" : "border-gray-300 hover:border-gray-400",
                    status === 'analyzing' && "opacity-50 pointer-events-none"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* File Preview Card */}
                {file && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3 group relative">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-12 h-12 object-cover rounded-md" />
                        ) : (
                            <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center border">
                                <FileText className="w-6 h-6 text-teal-600" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                            onClick={removeFile}
                            className="p-1 hover:bg-gray-200 rounded-full text-gray-500 hover:text-red-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Text Area */}
                <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onPaste={handlePaste}
                    placeholder={file ? "Add optional notes... (File will be prioritized)" : "Paste prescription text here, or drag & drop a photo..."}
                    className="w-full min-h-[150px] resize-none border-none focus:ring-0 text-gray-700 placeholder:text-gray-400 text-lg bg-transparent"
                    disabled={status === 'analyzing'}
                />

                {/* Bottom Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*,application/pdf"
                            onChange={handleFileSelect}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                            title="Upload File"
                        >
                            <UploadCloud className="w-5 h-5" />
                            <span className="hidden sm:inline">Upload Photo</span>
                        </button>
                        <div className="h-6 w-px bg-gray-200 my-auto mx-2" />
                        <span className="text-xs text-gray-400 flex items-center">
                            JPG, PNG, PDF
                        </span>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={!isReady || status === 'analyzing'}
                        className={clsx(
                            "px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm",
                            isReady && status !== 'analyzing'
                                ? "bg-teal-600 text-white hover:bg-teal-700 hover:shadow-md"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        )}
                    >
                        {status === 'analyzing' ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Pill className="w-4 h-4" />
                                Analyze Prescription
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Status Messages */}
            {status === 'success' && (
                <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle className="w-5 h-5" />
                    Analysis Complete! Redirecting...
                </div>
            )}

            {status === 'error' && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <AlertCircle className="w-5 h-5" />
                    {errorMessage}
                </div>
            )}
        </div>
    )
}
