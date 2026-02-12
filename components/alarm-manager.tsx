'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { toast } from 'sonner' // Assuming sonner or similar, if not I'll standard alert or valid hook

// Helper to play a beep sound using Web Audio API
const playAlarmSound = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime) // A5
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5)

    gain.gain.setValueAtTime(0.5, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

    osc.start()
    osc.stop(ctx.currentTime + 0.5)
}

export default function AlarmManager({ schedules }: { schedules: any[] }) {
    const [permission, setPermission] = useState<NotificationPermission>('default')

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission)
        }
    }, [])

    const requestPermission = async () => {
        if (!('Notification' in window)) return
        const permission = await Notification.requestPermission()
        setPermission(permission)
    }

    useEffect(() => {
        const checkSchedules = () => {
            const now = new Date()
            const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) // "08:00"

            schedules.forEach(schedule => {
                // Check if active and time matches
                if (!schedule.active) return
                // Simple day check (if days array exists)
                if (schedule.days && schedule.days.length > 0) {
                    const today = now.toLocaleDateString('en-US', { weekday: 'short' }) // "Mon"
                    if (!schedule.days.includes(today)) return
                }

                // Time match (ignoring seconds)
                // Schedule time format from DB comes as "HH:mm:ss" usually
                const scheduleTime = schedule.time.substring(0, 5)

                if (currentTime === scheduleTime) {
                    // Trigger Alarm
                    playAlarmSound()

                    if (permission === 'granted') {
                        new Notification('Time to take your meds!', {
                            body: `It's ${scheduleTime}. Check your dashboard.`,
                            icon: '/icon-192x192.png'
                        })
                    } else {
                        // Fallback if no notification permission
                        alert(`ALARM: Time to take your medication! (${scheduleTime})`)
                    }
                }
            })
        }

        // Align to minute start? Or just check every minute
        const interval = setInterval(checkSchedules, 60000) // Check every minute

        // Initial check in case we load exactly on the minute?
        // Maybe better to not double trigger.

        return () => clearInterval(interval)
    }, [schedules, permission])

    if (permission === 'granted') return null

    return (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <BellOff className="w-5 h-5 text-yellow-600" />
                <div>
                    <p className="font-semibold text-yellow-800">Notifications are disabled</p>
                    <p className="text-sm text-yellow-700">Enable them to get alerts even when this tab is backgrounded.</p>
                </div>
            </div>
            <button
                onClick={requestPermission}
                className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md text-sm font-medium transition-colors"
            >
                Enable Alarms
            </button>
        </div>
    )
}
