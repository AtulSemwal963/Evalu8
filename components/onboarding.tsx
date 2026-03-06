"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Sparkles, ArrowRight, Camera } from 'lucide-react'
import { FcGoogle } from "react-icons/fc"
import { FaMicrosoft } from "react-icons/fa"

interface OnboardingProps {
    onComplete: (userData: { name: string; email: string; profilePicture?: string | null }) => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [name, setName] = useState('')
    const [profilePicture, setProfilePicture] = useState<string | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const [isVerifying, setIsVerifying] = useState(false)
    const [verificationCode, setVerificationCode] = useState('')
    const [loginMethod, setLoginMethod] = useState('email')
    const [authToken, setAuthToken] = useState<string | null>(null)

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const tempUrl = URL.createObjectURL(file);
            setProfilePicture(tempUrl);
        }
    }

    const [step, setStep] = useState(0)
    const [selections, setSelections] = useState({
        role: "",
        contentSource: "",
        environments: [] as string[],
        depth: [] as string[],
        formats: [] as string[]
    })

    const handleNext = () => setStep(prev => prev + 1)
    const handleBack = () => setStep(prev => prev - 1)

    const toggleSelection = (key: keyof typeof selections, value: string, isMulti: boolean = false) => {
        setSelections(prev => {
            if (!isMulti) return { ...prev, [key]: value }
            const current = (prev[key] as string[])
            const next = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value]
            return { ...prev, [key]: next }
        })
    }

    React.useEffect(() => {
        let isCancelled = false;

        const loadGoogleScript = () => {
            if (isCancelled) return;
            const existingScript = document.querySelector(`script[src="https://accounts.google.com/gsi/client"]`);
            if (!existingScript) {
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.defer = true;
                document.body.appendChild(script);
            }
        };

        loadGoogleScript();

        return () => {
            isCancelled = true;
        };
    }, []);

    const handleGoogleClick = () => {
        const google = (window as any).google;
        if (google) {
            // This triggers the classic "center screen popup window" for Google OAuth
            // instead of the top-right One Tap banner. This is perfectly suited for custom buttons.
            const client = google.accounts.oauth2.initTokenClient({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
                scope: 'email profile',
                callback: async (tokenResponse: any) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        try {
                            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                            });
                            const payload = await res.json();

                            setEmail(payload.email);
                            setLoginMethod('google');
                            setAuthToken(tokenResponse.access_token);
                            setName(payload.given_name || payload.name || payload.email.split('@')[0]);
                            if (payload.picture) setProfilePicture(payload.picture);

                            toast.success(`Welcome back, ${payload.given_name || payload.name}!`);

                            // Check if this user is already onboarded in our DB
                            try {
                                const userRes = await fetch(`/api/user?email=${encodeURIComponent(payload.email)}`);
                                if (userRes.ok) {
                                    const dbUser = await userRes.json();
                                    if (dbUser.role && dbUser.role !== 'user') {
                                        onComplete({
                                            name: dbUser.name || payload.name,
                                            email: payload.email,
                                            profilePicture: dbUser.profilePicture || payload.picture
                                        });
                                        return;
                                    }
                                }
                            } catch (err) {
                                console.error("Error checking user onboarding status", err);
                            }

                            handleNext(); // Immediately advance to carousel for new users
                        } catch (err) {
                            console.error("Failed to fetch user info", err);
                            toast.error("Google login failed to retrieve user data.");
                        }
                    } else {
                        toast.error("Google login was cancelled or failed.");
                    }
                },
            });
            client.requestAccessToken();
        } else {
            toast.error("Google login is currently unavailable.");
        }
    };

    const questions = [
        {
            id: 'role',
            title: "What describes your role best?",
            options: ["School Teacher", "University Professor", "Subject Matter Expert (SME)", "Corporate Trainer", "Assessment Expert", "Student"],
            multi: false
        },
        {
            id: 'contentSource',
            title: "How would you like to add content to your bank?",
            options: [
                "I have existing tests (Word, PDF, or QTI) to upload",
                "I want to generate questions from my own text or topics",
                "I want to build questions manually from scratch"
            ],
            multi: false
        },
        {
            id: 'environments',
            title: "What is the primary environment for your assessments?",
            options: [
                "Certifications, standardized tests, or high-stakes exams.",
                "Practice tests, observations, or check-ins."
            ],
            multi: true
        },
        {
            id: 'depth',
            title: "What is the required depth of knowledge for your learners?",
            options: [
                "Focus on recall, facts, and basic application.",
                "Focus on analysis, evaluation, and creating in new contexts."
            ],
            multi: true
        },
        {
            id: 'formats',
            title: "Which interaction formats are essential for your assessments?",
            options: [
                "Mostly objective questions (MCQ, Multi-select, True/False)",
                "Subjective responses (Essays, Short Answers, Paragraphs).",
                "Interactive types (Hotspot, Ordering, Matching, Drag & Drop)."
            ],
            multi: true
        }
    ]

    const graphics = [
        "/onboardingGraphics/1.png",
        "/onboardingGraphics/2.png",
        "/onboardingGraphics/Kaleidoscope.png",
        "/onboardingGraphics/Sunny room.png",
        "/onboardingGraphics/Vibrant Illusion.png",
        "/onboardingGraphics/Vivid Mirage.png"
    ]

    // Old general submit function removed in favor of these specific handlers:
    const handleSignIn = async () => {
        if (!email.trim() || !email.includes('@')) {
            toast.error('Please enter a valid email')
            return
        }
        if (!password) {
            toast.error('Please enter your password')
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/auth/sign-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            toast.success(data.message)
            setName(data.user.name || email.split('@')[0])
            if (data.user.profilePicture) setProfilePicture(data.user.profilePicture)

            // If they already have a specific role, they've finished onboarding before.
            // Skip the carousel and go straight to dashboard.
            if (data.user.role && data.user.role !== 'user') {
                onComplete({
                    name: data.user.name || email.split('@')[0],
                    email,
                    profilePicture: data.user.profilePicture
                });
            } else {
                handleNext()
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSignUp = async () => {
        if (!email.trim() || !email.includes('@')) {
            toast.error('Please enter a valid email')
            return
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/auth/sign-up', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            toast.success(data.message)
            setIsVerifying(true)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleVerify = async () => {
        if (verificationCode.length !== 6) {
            toast.error('Please enter the 6 digit code')
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: verificationCode }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            toast.success(data.message)
            setName(data.user.name || email.split('@')[0])
            setIsVerifying(false)
            handleNext()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col md:flex-row overflow-hidden font-outfit">
            {/* Left Side: Auth & Questions */}
            <div className="flex-1 flex flex-col relative bg-slate-50/50">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-30 pointer-events-none" />

                {/* Top Left Branding */}
                <div className="absolute top-6 left-6 md:top-8 md:left-12 flex items-center gap-2 z-20">
                    <img src="/logo.png" alt="Evalu8 Logo" className="w-8 h-8 object-contain" />
                    <span className="text-xl font-bold font-outfit tracking-tight text-slate-900">Evalu8</span>
                </div>

                <div className="relative flex-1 flex flex-col justify-start p-6 md:p-12 max-w-xl mx-auto w-full pt-20 md:pt-24">
                    <AnimatePresence mode="wait">
                        {step === 0 ? (
                            <motion.div
                                key={isVerifying ? "verify" : "auth"}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-5"
                            >
                                {!isVerifying ? (
                                    <>
                                        <div className="space-y-2">
                                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Welcome</h1>
                                            <div className="h-1.5 w-10 bg-primary rounded-full" />
                                        </div>
                                        <p className="text-slate-500 text-sm md:text-base">Please choose your sign in method to continue.</p>

                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-3">
                                                <Input
                                                    type="email"
                                                    placeholder="Email Address"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="h-11 px-4 rounded-xl border-slate-200 bg-white/80 focus:ring-primary focus:border-primary shadow-sm"
                                                />
                                                <Input
                                                    type="password"
                                                    placeholder="Password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="h-11 px-4 rounded-xl border-slate-200 bg-white/80 focus:ring-primary focus:border-primary shadow-sm"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2 pt-1">
                                                <Button disabled={isSubmitting} onClick={handleSignIn} className="h-11 rounded-xl text-base font-medium shadow-md hover:shadow-lg transition-all duration-300 bg-[#0B2545] hover:bg-[#133A66] text-white">
                                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                                                </Button>
                                                <Button disabled={isSubmitting} onClick={handleSignUp} variant="outline" className="h-11 rounded-xl text-base font-medium border-slate-200 bg-white hover:bg-slate-100 transition-all duration-300">
                                                    Sign Up
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="relative py-3">
                                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                                            <div className="relative flex justify-center text-xs uppercase tracking-widest">
                                                <span className="px-4 bg-slate-50 text-slate-400 font-bold">or login with</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <Button onClick={handleGoogleClick} variant="outline" className="h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm font-semibold">
                                                <FcGoogle className="w-5 h-5" /> Google
                                            </Button>
                                            <Button onClick={handleNext} variant="outline" className="h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm font-semibold">
                                                <FaMicrosoft className="w-4 h-4 text-[#00a1f1]" /> Microsoft
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <button onClick={() => setIsVerifying(false)} className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors group">
                                                    <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">Back</span>
                                                </button>
                                                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Verify</span>
                                            </div>
                                            <div className="space-y-2">
                                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Check your email</h1>
                                                <p className="text-slate-500 text-sm md:text-base">We've sent a 6-digit code to <strong>{email}</strong>.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-2">
                                            <Input
                                                type="text"
                                                maxLength={6}
                                                placeholder="Enter 6-digit code"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                                className="h-14 px-4 text-center tracking-widest text-2xl font-bold rounded-xl border-slate-200 bg-white/80 focus:ring-primary focus:border-primary shadow-sm"
                                            />
                                            <Button disabled={isSubmitting} onClick={handleVerify} className="w-full h-11 rounded-xl text-base font-medium shadow-md hover:shadow-lg transition-all duration-300 bg-[#0B2545] hover:bg-[#133A66] text-white">
                                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Code"}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        ) : step === 1 ? (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors group">
                                            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Back</span>
                                        </button>
                                        <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Profile</span>
                                    </div>
                                    <div className="space-y-2 text-center md:text-left">
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Set up your profile</h2>
                                        <p className="text-slate-500 text-sm">Add a photo and confirm your name so we know how to address you.</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-6 pt-4">
                                    <div
                                        className="relative w-28 h-28 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer group shadow-md"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {profilePicture ? (
                                            <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-4xl font-bold text-slate-400">
                                                {name ? name.charAt(0).toUpperCase() : '?'}
                                            </span>
                                        )}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-8 h-8 text-white mb-1" />
                                            <span className="text-[10px] text-white font-semibold">Upload</span>
                                        </div>
                                    </div>
                                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />

                                    <div className="w-full space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 ml-1">Your Name</label>
                                        <Input value={name} onChange={e => setName(e.target.value)} className="h-12 px-4 rounded-xl border-slate-200 bg-white/80 focus:ring-primary focus:border-primary shadow-sm" />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <Button onClick={handleNext} disabled={!name.trim()} className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-[#0B2545]/20 hover:shadow-[#0B2545]/30 active:scale-[0.98] transition-all bg-[#0B2545] hover:bg-[#133A66] text-white disabled:bg-[#0B2545]/50 disabled:shadow-none">Continue</Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={`question-${step}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-5"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors group">
                                            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Back</span>
                                        </button>
                                        <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Question {step - 1} / 5</span>
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                                        {questions[step - 2].title}
                                    </h2>
                                </div>

                                <div className="grid gap-3">
                                    {questions[step - 2].options.map((option) => {
                                        const qKey = questions[step - 2].id as keyof typeof selections;
                                        const isSelected = questions[step - 2].multi
                                            ? (selections[qKey] as string[]).includes(option)
                                            : selections[qKey] === option;

                                        return (
                                            <button
                                                key={option}
                                                onClick={() => toggleSelection(qKey, option, questions[step - 2].multi)}
                                                className={`p-4 rounded-2xl text-left border-2 transition-all duration-300 flex items-center justify-between group ${isSelected
                                                    ? 'border-primary bg-primary/5 text-slate-900 shadow-sm shadow-primary/10'
                                                    : 'border-slate-100 bg-white/50 text-slate-600 hover:border-slate-300 hover:bg-white'
                                                    }`}
                                            >
                                                <span className="text-sm font-semibold">{option}</span>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-primary bg-primary scale-110 shadow-lg shadow-primary/20' : 'border-slate-200 group-hover:border-slate-300'
                                                    }`}>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="pt-4">
                                    <Button
                                        onClick={step === 6 ? async () => {
                                            setIsSubmitting(true);
                                            try {
                                                const mapRole = (r: string) => {
                                                    const roleMappings: Record<string, string> = {
                                                        "School Teacher": "schoolTeacher",
                                                        "University Professor": "uniProfessor",
                                                        "Subject Matter Expert (SME)": "sme",
                                                        "Corporate Trainer": "corpTrainer",
                                                        "Assessment Expert": "assessmentExpert",
                                                        "Student": "student"
                                                    };
                                                    return roleMappings[r] || "user";
                                                };

                                                const finalRole = mapRole(selections.role);
                                                const jsonResponses: Record<string, any> = {};

                                                // Create mapped JSON where the question string is the key, and user choice is value
                                                questions.forEach(q => {
                                                    if (q.id !== 'role') {
                                                        jsonResponses[q.title] = selections[q.id as keyof typeof selections];
                                                    }
                                                });

                                                const finalResponse = await fetch('/api/auth/finalize-onboarding', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        email,
                                                        name,
                                                        profilePicture,
                                                        role: finalRole,
                                                        onboardingResponses: jsonResponses,
                                                        loginMethod,
                                                        authToken
                                                    }),
                                                });
                                                if (!finalResponse.ok) throw new Error("Failed to finalize data");

                                                onComplete({ name, email, profilePicture });
                                            } catch (err: any) {
                                                toast.error(err.message || "Failed to finalize account");
                                            } finally {
                                                setIsSubmitting(false);
                                            }
                                        } : handleNext}
                                        disabled={isSubmitting || (questions[step - 2].multi ? (selections[questions[step - 2].id as keyof typeof selections] as string[]).length === 0 : !selections[questions[step - 2].id as keyof typeof selections])}
                                        className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-[#0B2545]/20 hover:shadow-[#0B2545]/30 active:scale-[0.98] transition-all bg-[#0B2545] hover:bg-[#133A66] text-white disabled:bg-[#0B2545]/50 disabled:shadow-none cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting && step === 6 && <Loader2 className="w-5 h-5 animate-spin" />}
                                        {step === 6 ? "Finish Setup" : "Continue"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Footer Info */}
                    {step === 0 && (
                        <div className="mt-auto pt-8 border-t border-slate-100">
                            <p className="text-slate-400 text-xs leading-relaxed text-center sm:text-left font-medium">
                                By continuing, you agree to our <span className="text-slate-600 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-slate-600 hover:underline cursor-pointer">Privacy Policy</span>.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Dynamic Visual */}
            <div className="hidden md:flex flex-1 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-slate-900/50 z-10" />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        className="absolute inset-0"
                    >
                        <img
                            src={graphics[step] || graphics[0]}
                            alt="Onboarding Visual"
                            className="w-full h-full object-cover opacity-60"
                        />
                    </motion.div>
                </AnimatePresence>

                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />
            </div>
        </div>
    )
}
