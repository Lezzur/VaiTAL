'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils' // Assuming you have a utils file, otherwise I'll mock it or remove usage if not found.

// Simple cn utility if not present, but usually standard in these setups. 
// If this fails I'll check utils location. 
// Based on package.json, 'clsx' and 'tailwind-merge' are installed, so this is safe pattern.

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    description?: string
    children?: React.ReactNode
    footer?: React.ReactNode
    variant?: 'default' | 'destructive'
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    variant = 'default'
}: ModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!mounted) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-all"
                    />

                    {/* Modal Content */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md pointer-events-auto border border-gray-100 overflow-hidden"
                            role="dialog"
                            aria-modal="true"
                        >
                            {/* Header */}
                            <div className={cn(
                                "flex items-start justify-between p-6 pb-2",
                                variant === 'destructive' ? "text-red-600" : "text-gray-900"
                            )}>
                                <div className="flex items-center gap-3">
                                    {variant === 'destructive' && (
                                        <div className="bg-red-50 p-2 rounded-full">
                                            <AlertTriangle className="w-5 h-5 text-red-600" />
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <h2 className="text-lg font-semibold leading-none tracking-tight">
                                            {title}
                                        </h2>
                                        {description && (
                                            <p className="text-sm text-gray-500 font-normal">
                                                {description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg -mr-2 -mt-2"
                                >
                                    <X className="w-5 h-5" />
                                    <span className="sr-only">Close</span>
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 pt-2">
                                {children}
                            </div>

                            {/* Footer */}
                            {footer && (
                                <div className="p-6 pt-0 flex justify-end gap-3">
                                    {footer}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}

// Minimal Confirmation Modal Wrapper for convenience
interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
    isLoading?: boolean
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = 'default',
    isLoading = false
}: ConfirmModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
            variant={variant}
            footer={
                <>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn(
                            "px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors shadow-lg shadow-current/20",
                            variant === 'destructive'
                                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                        )}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </button>
                </>
            }
        />
    )
}
