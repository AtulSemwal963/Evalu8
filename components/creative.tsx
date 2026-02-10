"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Award,
  Bell,
  BookOpen,
  Bookmark,
  Brush,
  Camera,
  ChevronDown,
  Cloud,
  Code,
  Crown,
  Download,
  FileText,
  Grid,
  Heart,
  Home,
  ImageIcon,
  Layers,
  LayoutGrid,
  Lightbulb,
  Menu,
  MessageSquare,
  Palette,
  PanelLeft,
  Play,
  Plus,
  Search,
  Settings,
  Share2,
  Sparkles,
  Star,
  Trash,
  TrendingUp,
  Users,
  Video,
  Wand2,
  Clock,
  Eye,
  Archive,
  ArrowUpDown,
  MoreHorizontal,
  Type,
  CuboidIcon,
  X,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AssessmentSkeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Sample data for question types
const questionTypes = [
  {
    name: "Multiple Choice",
    icon: <Grid className="text-blue-500" />,
    description: "Standard question stem and distractor list",
    category: "Assessment",
    recent: true,
    new: false,
  },
  {
    name: "Ordering",
    icon: <ArrowUpDown className="text-green-500" />,
    description: "List of items with reordering logic",
    category: "Assessment",
    recent: true,
    new: false,
  },
  {
    name: "Hotspot",
    icon: <ImageIcon className="text-purple-500" />,
    description: "Click image to define correct coordinate zones",
    category: "Assessment",
    recent: true,
    new: false,
  },
]

// Sample data for recent assessments
const recentAssessments = [
  {
    name: "Linear Programming Quiz",
    type: "Multiple Choice",
    modified: "2 hours ago",
    icon: <Grid className="text-blue-500" />,
    questions: 10,
    difficulty: "Medium",
  },
  {
    name: "Biology Lab Assessment",
    type: "Hotspot",
    modified: "Yesterday",
    icon: <ImageIcon className="text-purple-500" />,
    questions: 5,
    difficulty: "Hard",
  },
  {
    name: "History Timeline Test",
    type: "Ordering",
    modified: "3 days ago",
    icon: <ArrowUpDown className="text-green-500" />,
    questions: 8,
    difficulty: "Easy",
  },
]

// Sample data for assessment projects
const assessmentProjects = [
  {
    name: "Mathematics Final Exam",
    description: "Comprehensive math assessment covering algebra and calculus",
    progress: 75,
    dueDate: "June 15, 2025",
    questions: 50,
    type: "Mixed",
  },
  {
    name: "Science Lab Practical",
    description: "Hands-on assessment with hotspot questions",
    progress: 60,
    dueDate: "July 30, 2025",
    questions: 25,
    type: "Hotspot",
  },
  {
    name: "History Unit Test",
    description: "Timeline-based ordering assessment",
    progress: 90,
    dueDate: "May 25, 2025",
    questions: 30,
    type: "Ordering",
  },
]

// Sample data for assessment templates
const assessmentTemplates = [
  {
    title: "MCQ Template",
    description: "Standard multiple choice question template",
    type: "Multiple Choice",
    difficulty: "Medium",
    questions: 10,
  },
  {
    title: "Ordering Assessment",
    description: "Timeline and sequence ordering template",
    type: "Ordering",
    difficulty: "Easy",
    questions: 8,
  },
  {
    title: "Interactive Hotspot",
    description: "Image-based hotspot assessment template",
    type: "Hotspot",
    difficulty: "Hard",
    questions: 5,
  },
  {
    title: "Mixed Assessment",
    description: "Combination of all question types",
    type: "Mixed",
    difficulty: "Medium",
    questions: 15,
  },
]

// Sample data for community posts
const communityPosts = [
  {
    title: "AI-Generated Math Questions",
    author: "Dr. Sarah Chen",
    likes: 342,
    comments: 28,
    image: "/placeholder.svg?height=300&width=400",
    time: "2 days ago",
  },
  {
    title: "Interactive Science Hotspots",
    author: "Prof. Michael Rodriguez",
    likes: 518,
    comments: 47,
    image: "/placeholder.svg?height=300&width=400",
    time: "1 week ago",
  },
  {
    title: "Timeline Assessment Design",
    author: "James Wilson",
    likes: 276,
    comments: 32,
    image: "/placeholder.svg?height=300&width=400",
    time: "3 days ago",
  },
  {
    title: "Formative vs Summative",
    author: "Emma Thompson",
    likes: 189,
    comments: 15,
    image: "/placeholder.svg?height=300&width=400",
    time: "5 days ago",
  },
]

// Sample data for sidebar navigation
const sidebarItems = [
  {
    title: "Dashboard",
    icon: <Home />,
    isActive: true,
    url: "/",
  },
  {
    title: "Assessments",
    icon: <FileText />,
    url: "/assessments",
  },
]

export function Evalu8Dashboard() {
  const [progress, setProgress] = useState(0)
  const [notifications, setNotifications] = useState(5)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userInitials, setUserInitials] = useState('JD')
  const [assessments, setAssessments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  // Fetch assessments from API
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const savedUser = localStorage.getItem('evalu8_user')
        if (!savedUser) {
          setIsLoading(false)
          return
        }

        const userData = JSON.parse(savedUser)

        // Get user ID
        const userResponse = await fetch(`/api/user?email=${encodeURIComponent(userData.email)}`)
        const userDataFromDb = await userResponse.json()

        if (!userDataFromDb.id) {
          setIsLoading(false)
          return
        }

        // Fetch assessments
        const response = await fetch(`/api/assessment?userId=${userDataFromDb.id}`)
        const data = await response.json()

        if (response.ok && data.assessments) {
          setAssessments(data.assessments)
        }
      } catch (error) {
        console.error('Error fetching assessments:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssessments()
  }, [])

  // Simulate progress loading
  useEffect(() => {
    const timer = setTimeout(() => setProgress(100), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Helper function to get icon based on type
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mcq':
        return <Grid className="text-blue-500" />
      case 'reordering':
        return <ArrowUpDown className="text-green-500" />
      case 'hotspot':
        return <ImageIcon className="text-purple-500" />
      default:
        return <Grid className="text-blue-500" />
    }
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} mins ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

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
                    item.isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
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
                    item.isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
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

        <main className="flex-1 p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <section>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-white"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-4">
                      <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">Premium</Badge>
                      <h2 className="text-3xl font-bold">Welcome to Evalu8 Assessment Authoring</h2>
                      <p className="max-w-[600px] text-white/80">
                        Create comprehensive assessments with our advanced question types and AI-powered tools.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <a
                          href="/create-assessment"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-2xl bg-white text-indigo-700 hover:bg-white/90 h-10 px-6 text-sm font-bold transition-all active:scale-95 shadow-sm"
                        >
                          Create Assessment
                        </a>
                      </div>
                    </div>
                    <div className="hidden lg:block">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 50, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="relative h-40 w-40"
                      >
                        <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md" />
                        <div className="absolute inset-4 rounded-full bg-white/20" />
                        <div className="absolute inset-8 rounded-full bg-white/30" />
                        <div className="absolute inset-12 rounded-full bg-white/40" />
                        <div className="absolute inset-16 rounded-full bg-white/50" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </section>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mt-9">
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Recent Assessments</h2>
                    <Button variant="ghost" className="rounded-2xl" asChild>
                      <Link href="/assessments">View All</Link>
                    </Button>
                  </div>
                  <div className="rounded-3xl border">
                    {isLoading ? (
                      <div className="grid grid-cols-1 divide-y">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <AssessmentSkeleton key={index} />
                        ))}
                      </div>
                    ) : assessments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No assessments yet</h3>
                        <p className="text-muted-foreground mb-4">Create your first assessment to get started</p>
                        <Button asChild className="rounded-2xl">
                          <a href="/create-assessment" target="_blank" rel="noopener noreferrer">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Assessment
                          </a>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 divide-y">
                        {assessments.slice(0, 4).map((assessment: any) => (
                          <motion.div
                            key={assessment.id}
                            whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                            className="flex items-center justify-between p-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
                                {getTypeIcon(assessment.type)}
                              </div>
                              <div>
                                <p className="font-medium">{assessment.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {assessment.type} • {formatDate(assessment.updatedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="rounded-xl">
                                {assessment.questionCount} questions
                              </Badge>
                              <Badge variant="outline" className="rounded-xl">
                                {assessment.difficulty}
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
