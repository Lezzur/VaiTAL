'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import { Mail, Lock, Loader2 } from 'lucide-react'

export default function AuthForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const supabase = createClient()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error
                alert('Check your email for the confirmation link!')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.refresh()
                router.push('/')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h1>
                <p className="text-sm text-gray-500">
                    Enter your credentials to access your Health Lens.
                </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="email"
                            placeholder="name@example.com"
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        isSignUp ? 'Sign Up' : 'Sign In'
                    )}
                </button>
            </form>

            <div className="text-center">
                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-gray-600 hover:text-blue-600 hover:underline transition-colors"
                >
                    {isSignUp
                        ? 'Already have an account? Sign in'
                        : "Don't have an account? Sign up"}
                </button>
            </div>
        </div>
    )
}
