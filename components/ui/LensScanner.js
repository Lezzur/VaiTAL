'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Camera, X, Loader2 } from 'lucide-react'

export default function LensScanner({ onScan }) {
    const [dragActive, setDragActive] = useState(false)
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const inputRef = useRef(null)

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handleChange = (e) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    const handleFile = (file) => {
        setFile(file)
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result)
        }
        reader.readAsDataURL(file)
    }

    const clearFile = () => {
        setFile(null)
        setPreview(null)
        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }

    const handleScan = async () => {
        if (!file || !preview) return
        setIsProcessing(true)

        try {
            // Remove data:image/xxx;base64, prefix
            const base64Data = preview.split(',')[1]
            await onScan(base64Data, file.type)
        } catch (error) {
            console.error("Scan failed", error)
            alert("Failed to analyze image. Please try again.")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="w-full max-w-xl mx-auto p-4">
            <AnimatePresence mode="wait">
                {!preview ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`
              relative border-2 border-dashed rounded-2xl p-8 
              flex flex-col items-center justify-center text-center 
              transition-colors duration-200 cursor-pointer
              min-h-[300px]
              ${dragActive ? 'border-blue-500 bg-blue-50/10' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'}
            `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            onChange={handleChange}
                            accept="image/*,.pdf"
                        />

                        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <Camera className="w-8 h-8 text-gray-400" />
                        </div>

                        <h3 className="text-lg font-semibold mb-2">
                            Snap or Upload
                        </h3>
                        <p className="text-sm text-gray-500 max-w-xs">
                            Drag & drop your lab results here, take a photo, or select a file.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative rounded-2xl overflow-hidden shadow-lg bg-black/5 dark:bg-white/5 backdrop-blur-sm"
                    >
                        <button
                            onClick={clearFile}
                            disabled={isProcessing}
                            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="relative aspect-[3/4] md:aspect-video w-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-contain bg-gray-900"
                            />
                        </div>

                        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={handleScan}
                                disabled={isProcessing}
                                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Analyzing with Lens...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        Process Results
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
