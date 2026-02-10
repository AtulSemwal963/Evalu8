"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import {
  Bell,
  FileText,
  Grid,
  Home,
  Layers,
  Menu,
  PanelLeft,
  Plus,
  Search,
  Settings,
  Sparkles,
  Cloud,
  MessageSquare,
  Download,
  X,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Sample data for sidebar navigation
const sidebarItems = [
  {
    title: "Dashboard",
    icon: <Home />,
    url: "/",
  },
  {
    title: "Assessments",
    icon: <FileText />,
    url: "/assessments",
  },
]

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState(5)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userInitials, setUserInitials] = useState('JD')
  const pathname = usePathname()

  // Load user data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('evalu8_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        if (userData.name) {
          // Get first letter of first name and last name (if exists)
          const nameParts = userData.name.trim().split(' ')
          const initials = nameParts.length > 1
            ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
            : nameParts[0][0].toUpperCase()
          setUserInitials(initials)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  // Set loading to false after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 -z-10 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 30% 70%, rgba(233, 30, 99, 0.5) 0%, rgba(81, 45, 168, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 70% 30%, rgba(76, 175, 80, 0.5) 0%, rgba(32, 119, 188, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
          ],
        }}
        transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col border-r">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-10 items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="Evalu8 Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="font-semibold">Evalu8</h2>
                <p className="text-xs text-muted-foreground">Assessment Authoring</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search..." className="w-full rounded-2xl bg-muted pl-9 pr-4 py-2" />
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.url ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="outline" className="ml-auto rounded-full px-2 py-0.5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-64 transform border-r bg-background transition-transform duration-300 ease-in-out md:block",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-10 items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="Evalu8 Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="font-semibold">Evalu8</h2>
                <p className="text-xs text-muted-foreground">Assessment Authoring</p>
              </div>
            </div>
          </div>

          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search..." className="w-full rounded-2xl bg-muted pl-9 pr-4 py-2" />
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.url ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="outline" className="ml-auto rounded-full px-2 py-0.5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn("min-h-screen transition-all duration-300 ease-in-out", sidebarOpen ? "md:pl-64" : "md:pl-0")}>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <PanelLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-semibold">Evalu8 Dashboard</h1>
            <div className="flex items-center gap-3">

              <a
                href="/create-assessment"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Assessment
              </a>

              <Avatar className="h-9 w-9 border-2 border-primary">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {isLoading ? (
            <div className="container mx-auto p-6">
              <div className="space-y-4">
                <div className="h-8 w-full animate-pulse rounded-2xl bg-muted"></div>
                <div className="h-8 w-3/4 animate-pulse rounded-2xl bg-muted"></div>
                <div className="h-8 w-1/2 animate-pulse rounded-2xl bg-muted"></div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted"></div>
                  ))}
                </div>
                <div className="h-8 w-full animate-pulse rounded-2xl bg-muted"></div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  )
}
