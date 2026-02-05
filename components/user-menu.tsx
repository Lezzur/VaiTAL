'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'

export default function UserMenu() {
    const [email, setEmail] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setEmail(user.email ?? null)
            }
        }
        getUser()
    }, [supabase.auth])

    const handleLogout = async () => {
        setLoading(true)
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    if (!email) return null

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{email}</span>
            </div>
            <button
                onClick={handleLogout}
                disabled={loading}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
                title="Sign Out"
            >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
            </button>
        </div>
    )
}
