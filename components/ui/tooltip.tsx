'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface TooltipProps {
    content: string
    alignment?: 'start' | 'center'
    children: React.ReactNode
}

export function Tooltip({ content, alignment = 'center', children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [position, setPosition] = useState<{ top: number; left: number; placement: 'top' | 'bottom'; transformX: string }>({
        top: 0,
        left: 0,
        placement: 'top',
        transformX: '-50%'
    })
    const triggerRef = useRef<HTMLDivElement>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleMouseEnter = () => {
        if (triggerRef.current) {
            updatePosition()
            setIsVisible(true)
        }
    }

    const updatePosition = () => {
        if (!triggerRef.current) return

        const rect = triggerRef.current.getBoundingClientRect()

        // Fixed positioning is relative to viewport, so we DO NOT add scroll offsets
        let top = rect.top - 5 // Default: 5px above target
        let left = 0
        let placement: 'top' | 'bottom' = 'top'
        let transformX = '-50%'

        // Vertical Placement Logic
        if (rect.top < 60) { // If closer than 60px to top edge (header + spacing)
            placement = 'bottom'
            top = rect.bottom + 5
        }

        // Horizontal Alignment Logic
        if (alignment === 'start') {
            left = rect.left // Align left edge with target left edge
            transformX = '0%' // No centering shift
        } else {
            left = rect.left + (rect.width / 2) // Center relative to target
            transformX = '-50%' // Shift back by 50% of tooltip width
        }

        setPosition({ top, left, placement, transformX })
    }

    return (
        <div
            ref={triggerRef}
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}

            {mounted && createPortal(
                <AnimatePresence>
                    {isVisible && (
                        <motion.div
                            initial={{ opacity: 0, y: position.placement === 'top' ? 5 : -5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: position.placement === 'top' ? 5 : -5, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="fixed z-[9999] bg-slate-900 text-white text-xs rounded-lg shadow-xl px-3 py-2 max-w-xs leading-relaxed pointer-events-none"
                            style={{
                                top: position.top,
                                left: position.left,
                                transform: `translate(${position.transformX}, ${position.placement === 'top' ? '-100%' : '0'})`,
                            }}
                        >
                            {content}
                            {/* Arrow */}
                            <div
                                className={`absolute w-0 h-0 border-4 border-transparent ${position.placement === 'top'
                                    ? 'border-t-slate-900 top-full'
                                    : 'border-b-slate-900 bottom-full'
                                    }`}
                                style={{
                                    left: alignment === 'start' ? '10px' : '50%', // 10px offset for start alignment
                                    transform: alignment === 'start' ? 'none' : 'translateX(-50%)'
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    )
}
