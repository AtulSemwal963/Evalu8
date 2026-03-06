"use client"

import { useState, useEffect } from "react"
import { Evalu8Dashboard } from "@/components/creative"
import { Onboarding } from "@/components/onboarding"

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("evalu8_user")
    if (!savedUser) {
      setShowOnboarding(true)
    } else {
      setShowOnboarding(false)
    }
  }, [])

  const handleOnboardingComplete = (userData: { name: string; email: string; profilePicture?: string | null }) => {
    localStorage.setItem("evalu8_user", JSON.stringify(userData))
    setShowOnboarding(false)
  }

  if (showOnboarding === null) return null // Prevent flash of content

  return (
    <main className="overflow-hidden">
      {showOnboarding ? (
        <Onboarding onComplete={handleOnboardingComplete} />
      ) : (
        <Evalu8Dashboard />
      )}
    </main>
  )
}
