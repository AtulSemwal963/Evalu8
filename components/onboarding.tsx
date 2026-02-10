"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react'

interface OnboardingProps {
    onComplete: (userData: { name: string; email: string }) => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(0)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleNext = () => {
        if (step === 1 && !name.trim()) {
            toast.error('Please enter your name')
            return
        }
        if (step === 2 && (!email.trim() || !email.includes('@'))) {
            toast.error('Please enter a valid email')
            return
        }

        if (step < 2) {
            setStep(step + 1)
        } else {
            handleSubmit()
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            })

            const data = await response.json()

            if (!response.ok) {
                const errorMsg = data.details || data.error || 'Failed to save user'
                console.error('API Error:', data)
                throw new Error(errorMsg)
            }

            const userData = { name, email }
            localStorage.setItem('evalu8_user', JSON.stringify(userData))
            toast.success('Welcome to Evalu8!')
            onComplete(userData)
        } catch (error) {
            console.error('Onboarding error:', error)
            const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    const steps = [
        {
            title: "Welcome to Evalu8",
            description: "The modern assessment design studio. Let's get you started.",
            content: (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-4 overflow-hidden">
                        <img src="/logo.png" alt="Evalu8 Logo" className="w-12 h-12 object-contain" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-center font-outfit">
                        Evalu8
                    </h1>
                    <p className="text-slate-500 text-lg text-center max-w-sm">
                        Experience the future of assessment creation with AI-powered tools and elegant design.
                    </p>
                </motion.div>
            )
        },
        {
            title: "What's your name?",
            description: "We'd love to know who we're working with.",
            content: (
                <div className="w-full max-w-md space-y-4">
                    <Input
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-14 text-lg px-6 rounded-2xl border-slate-200 focus:ring-primary focus:border-primary shadow-sm"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    />
                </div>
            )
        },
        {
            title: "And your email?",
            description: "To keep your work synced and secure.",
            content: (
                <div className="w-full max-w-md space-y-4">
                    <Input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-14 text-lg px-6 rounded-2xl border-slate-200 focus:ring-primary focus:border-primary shadow-sm"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    />
                </div>
            )
        }
    ]

    return (
        <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center p-6 sm:p-12 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

            <div className="relative w-full max-w-2xl flex flex-col items-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        className="w-full flex flex-col items-center text-center space-y-8"
                    >
                        {step > 0 && (
                            <div className="space-y-2 mb-4">
                                <h2 className="text-3xl md:text-4xl font-bold font-outfit text-slate-800">
                                    {steps[step].title}
                                </h2>
                                <p className="text-slate-500 text-lg">
                                    {steps[step].description}
                                </p>
                            </div>
                        )}

                        {steps[step].content}

                        <div className="pt-8">
                            <Button
                                onClick={handleNext}
                                disabled={isSubmitting}
                                size="lg"
                                className="h-14 px-10 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 group"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Completing...
                                    </>
                                ) : (
                                    <>
                                        {step === 0 ? "Let's Begin" : step === 2 ? "Get Started" : "Continue"}
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Progress indicators */}
                <div className="mt-12 flex gap-2">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-primary' : i < step ? 'w-4 bg-primary/40' : 'w-4 bg-slate-200'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
