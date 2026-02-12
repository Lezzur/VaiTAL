
'use client'

import { useChat } from '@ai-sdk/react'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, User, ChevronDown, Stethoscope } from 'lucide-react'
import { clsx } from 'clsx'

export default function HealthAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const { messages, sendMessage, status } = useChat()
    const [input, setInput] = useState('')
    const isLoading = status === 'submitted' || status === 'streaming'
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        // Create a new message object
        const newMessage: any = { role: 'user', content: input }
        await sendMessage(newMessage)
        setInput('')
    }

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all z-50 flex items-center gap-2",
                    isOpen ? "bg-red-500 hover:bg-red-600 rotate-90" : "bg-blue-600 hover:bg-blue-700 hover:scale-110"
                )}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <>
                        <Stethoscope className="w-6 h-6 text-white" />
                    </>
                )}
            </button>

            {/* Chat Window */}
            <div
                className={clsx(
                    "fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 z-50 flex flex-col",
                    isOpen ? "opacity-100 translate-y-0 h-[600px]" : "opacity-0 translate-y-10 pointer-events-none h-0"
                )}
            >
                {/* Header */}
                <div className="bg-blue-600 p-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full">
                            <Stethoscope className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Medical Assistant</h3>
                            <p className="text-xs text-blue-100 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                Online
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
                        <ChevronDown className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 mt-8 text-sm space-y-2">
                            <Stethoscope className="w-12 h-12 mx-auto text-gray-300" />
                            <p>Hello! I'm your AI Medical Assistant.</p>
                            <p>I have access to your uploaded results.</p>
                            <p>Ask me anything about your health.</p>
                        </div>
                    )}

                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={clsx(
                                "flex gap-3 max-w-[85%]",
                                m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                            )}
                        >
                            <div
                                className={clsx(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs",
                                    m.role === 'user' ? "bg-gray-200 text-gray-700" : "bg-blue-100 text-blue-700"
                                )}
                            >
                                {m.role === 'user' ? <User className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
                            </div>

                            <div
                                className={clsx(
                                    "p-3 rounded-2xl text-sm shadow-sm",
                                    m.role === 'user'
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                                )}
                            >
                                {(m as any).content}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3 max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <Stethoscope className="w-4 h-4 text-blue-700" />
                            </div>
                            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
                    <div className="relative">
                        <input
                            className="w-full pl-4 pr-12 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Ask about your results..."
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center mt-2">
                        AI can make mistakes. Consult a doctor for medical advice.
                    </p>
                </form>
            </div>
        </>
    )
}
