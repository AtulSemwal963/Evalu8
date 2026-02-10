"use client"

import { useState, useEffect } from "react"
import SidebarLayout from "@/components/sidebar-layout"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AssessmentListSkeleton } from "@/components/ui/skeleton"
import { OpenAssessmentModal } from "@/components/open-assessment-modal"
import {
  FileText, Clock, Eye, Trash, Plus, Search, Filter,
  ChevronDown, CheckCircle, ListOrdered, MousePointer2,
  Info, Activity, Target, ShieldCheck
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function AssessmentsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [assessments, setAssessments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedAssessment, setSelectedAssessment] = useState<{id: string, title: string} | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

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

  // Helper function to get icon based on type
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mcq':
        return <CheckCircle className="text-blue-500" />
      case 'reordering':
        return <ListOrdered className="text-emerald-500" />
      case 'hotspot':
        return <MousePointer2 className="text-purple-500" />
      default:
        return <CheckCircle className="text-blue-500" />
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

  // Helper function to get question type stats
  const getQuestionStats = (questions: any[]) => {
    const stats = { mcq: 0, reordering: 0, hotspot: 0 }
    questions.forEach(q => {
      if (q.type === 'mcq') stats.mcq++
      else if (q.type === 'reordering') stats.reordering++
      else if (q.type === 'hotspot') stats.hotspot++
    })
    return stats
  }

  // Filter assessments based on search and status
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          assessment.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || 
                          (filterStatus === "published" && assessment.status === "published") ||
                          (filterStatus === "draft" && assessment.status === "draft")
    return matchesSearch && matchesFilter
  })

  const handleOpenAssessment = (assessmentId: string, assessmentTitle: string) => {
    setSelectedAssessment({ id: assessmentId, title: assessmentTitle })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAssessment(null)
  }

  return (
    <>
    <SidebarLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 tracking-tight text-slate-900">Assessments</h1>
              <p className="text-muted-foreground text-sm font-medium">Manage and organize your question papers with expanded insights.</p>
            </div>
            <a
              href="/create-assessment"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl shadow-lg shadow-indigo-100 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 h-10 text-sm transition-all active:scale-95"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Assessment
            </a>
          </div>
        </motion.div>

        {/* Filters Header */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            variant={filterStatus === "all" ? "outline" : "ghost"} 
            className="rounded-xl h-9 text-xs font-bold border-slate-200"
            onClick={() => setFilterStatus("all")}
          >
            <FileText className="mr-2 h-3.5 w-3.5 text-indigo-600" />
            All
          </Button>
          <Button 
            variant={filterStatus === "published" ? "outline" : "ghost"} 
            className="rounded-xl h-9 text-xs font-bold text-slate-500"
            onClick={() => setFilterStatus("published")}
          >
            <Eye className="mr-2 h-3.5 w-3.5" />
            Published
          </Button>
          <Button 
            variant={filterStatus === "draft" ? "outline" : "ghost"} 
            className="rounded-xl h-9 text-xs font-bold text-slate-500"
            onClick={() => setFilterStatus("draft")}
          >
            <Clock className="mr-2 h-3.5 w-3.5" />
            Drafts
          </Button>
          <div className="flex-1"></div>
          <div className="relative w-full md:w-auto mt-2 md:mt-0">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Filter by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl pl-9 pr-4 py-2 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 md:w-[240px] transition-all"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="rounded-[24px] border-slate-200 shadow-sm">
            <div className="bg-slate-50/50 p-4 hidden md:grid md:grid-cols-12 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
              <div className="col-span-6">Assessment Details</div>
              <div className="col-span-2 text-center">Duration</div>
              <div className="col-span-2 text-center">Volume</div>
              <div className="col-span-2 text-right pr-4">Timeline</div>
            </div>
            <div className="divide-y divide-slate-100">
              {isLoading ? (
                <AssessmentListSkeleton count={5} />
              ) : filteredAssessments.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchTerm || filterStatus !== "all" ? "No matching assessments" : "No assessments yet"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm || filterStatus !== "all" 
                      ? "Try adjusting your filters or search terms"
                      : "Create your first assessment to get started"
                    }
                  </p>
                  {!searchTerm && filterStatus === "all" && (
                    <Button asChild className="rounded-xl">
                      <a href="/create-assessment" target="_blank" rel="noopener noreferrer">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Assessment
                      </a>
                    </Button>
                  )}
                </div>
              ) : (
                filteredAssessments.map((assessment, index) => {
                  const isExpanded = expandedId === assessment.id
                  const stats = getQuestionStats(assessment.questions || [])
                  return (
                    <div key={assessment.id} className="relative transition-colors hover:bg-slate-50/30">
                      <div className="p-4 md:grid md:grid-cols-12 items-center flex flex-col md:flex-row gap-3 md:gap-0">
                        <div className="col-span-6 flex items-center gap-4 w-full md:w-auto">
                          <div className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-300 shadow-sm",
                            isExpanded ? "bg-indigo-600 text-white" : "bg-white border border-slate-100 text-slate-400"
                          )}>
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p onClick={() => toggleExpand(assessment.id)} className="font-bold text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors truncate">{assessment.title}</p>
                            <p className="text-[11px] text-slate-400 font-medium truncate">
                              {assessment.description?.split(' ').slice(0, 5).join(' ')}...
                            </p>
                          </div>
                        </div>
                        <div className="col-span-2 text-center">
                          <Badge variant="secondary" className="rounded-lg bg-indigo-50 text-indigo-700 border-indigo-100/50 hover:bg-indigo-100 text-[10px] font-black uppercase px-2">
                            {assessment.duration} mins
                          </Badge>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="text-xs font-bold text-slate-600">{assessment.questionCount} Questions</span>
                        </div>
                        <div className="col-span-2 flex items-center justify-end w-full md:w-auto pr-2 gap-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{formatDate(assessment.updatedAt)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleExpand(assessment.id)}
                            className={cn(
                              "h-9 w-9 rounded-xl transition-all duration-300",
                              isExpanded ? "bg-indigo-50 text-indigo-600 rotate-180" : "text-slate-300 hover:text-indigo-600 hover:bg-indigo-50"
                            )}
                          >
                            <ChevronDown className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden bg-slate-50/80 border-t border-slate-100"
                          >
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                              {/* Detailed Description & Instructions */}
                              <div className="col-span-1 md:col-span-2 space-y-6">
                                <div className="space-y-2">
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Info className="h-3 w-3 text-indigo-500" />
                                    Full Description
                                  </h4>
                                  <p className="text-xs leading-relaxed text-slate-600 font-medium">
                                    {assessment.description || 'No description provided'}
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Target className="h-3 w-3 text-indigo-500" />
                                    Standard Instructions
                                  </h4>
                                  <p className="text-xs leading-relaxed text-slate-600 italic">
                                    "{assessment.instructions || 'No instructions provided'}"
                                  </p>
                                </div>
                              </div>

                              {/* Question Distribution & Metadata */}
                              <div className="space-y-6">
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Composition</h4>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3.5 w-3.5 text-blue-500" />
                                        <span className="text-[11px] font-bold text-slate-700">MCQ</span>
                                      </div>
                                      <Badge variant="outline" className="rounded-md h-5 px-1.5 min-w-[24px] justify-center">{stats.mcq}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <ListOrdered className="h-3.5 w-3.5 text-emerald-500" />
                                        <span className="text-[11px] font-bold text-slate-700">Reordering</span>
                                      </div>
                                      <Badge variant="outline" className="rounded-md h-5 px-1.5 min-w-[24px] justify-center">{stats.reordering}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <MousePointer2 className="h-3.5 w-3.5 text-purple-500" />
                                        <span className="text-[11px] font-bold text-slate-700">Hotspot</span>
                                      </div>
                                      <Badge variant="outline" className="rounded-md h-5 px-1.5 min-w-[24px] justify-center">{stats.hotspot}</Badge>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-1 group">
                                    <Activity className="h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Mode</span>
                                    <span className="text-[10px] font-bold text-slate-900">{assessment.mode?.toUpperCase() || 'FORMATIVE'}</span>
                                  </div>
                                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-1 group">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Pass Line</span>
                                    <span className="text-[10px] font-bold text-slate-900">{assessment.passingScore}%</span>
                                  </div>
                                </div>

                                <Button className="w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold h-10 text-xs shadow-md" onClick={() => handleOpenAssessment(assessment.id, assessment.title)}>
                                  Open Assessment
                                  <ArrowRight className="ml-2 h-3.5 w-3.5 opacity-50" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </SidebarLayout>
    
    {selectedAssessment && (
      <OpenAssessmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        assessmentId={selectedAssessment.id}
        assessmentTitle={selectedAssessment.title}
      />
    )}
  </>
  )
}

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
