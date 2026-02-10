"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Info, ArrowLeft, Save, Eye, Settings, Sparkles, PanelLeftClose, PanelLeftOpen, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Plus } from "lucide-react"

// Import components and provider
import { AssessmentProvider, useAssessmentDetails, useAssessmentActions, useLoadAssessmentById, useSaveAssessment } from "./store/assessment-store"
import { BasicDetails } from "./components/BasicDetails"
import { AssessmentType } from "./components/AssessmentType"
import { AssessmentSetup } from "./components/AssessmentSetup"
import { AdditionalSettings } from "./components/AdditionalSettings"
import { QuestionPaperPreview } from "./components/QuestionPaperPreview"
import { QuestionBuilder } from "./components/QuestionBuilderRefactored"
import { AIAssistant } from "./components/AIAssistant"

function CreateAssessmentContent() {
  const [activeTab, setActiveTab] = useState("general")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get('edit') || searchParams.get('id')
  const assessmentDetails = useAssessmentDetails()
  const { updateAssessmentDetails } = useAssessmentActions()
  const loadAssessmentById = useLoadAssessmentById()
  const { saveDraft, publish } = useSaveAssessment()

  const handleSaveDraft = async () => {
    if (isSavingDraft || isPublishing) return
    setIsSavingDraft(true)
    setSaveMessage(null)
    try {
      await saveDraft()
      setSaveMessage({ type: 'success', text: 'Draft saved' })
    } catch (e) {
      console.error(e)
      setSaveMessage({ type: 'error', text: 'Failed to save draft' })
    } finally {
      setIsSavingDraft(false)
      setTimeout(() => setSaveMessage(null), 2500)
    }
  }

  const handlePublish = async () => {
    if (isSavingDraft || isPublishing) return
    setIsPublishing(true)
    setSaveMessage(null)
    try {
      await publish()
      setSaveMessage({ type: 'success', text: 'Published' })
    } catch (e) {
      console.error(e)
      setSaveMessage({ type: 'error', text: 'Failed to publish' })
    } finally {
      setIsPublishing(false)
      setTimeout(() => setSaveMessage(null), 2500)
    }
  }

  useEffect(() => {
    if (!assessmentId) return
    loadAssessmentById(assessmentId).catch((e) => {
      console.error(e)
    })
  }, [assessmentId, loadAssessmentById])

  return (
    <div className="h-screen bg-slate-50 flex flex-col text-slate-900 overflow-hidden">

      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] shrink-0 font-google">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.history.back()}>
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 rotate-3 hover:rotate-0 transition-transform cursor-pointer group">
                <img src="/logo.png" alt="Evalu8 Logo" className="w-full h-full object-contain" />

            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tighter text-slate-900 leading-none">EVALU8</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Design Studio</span>
            </div>
          </div>

          <div className="h-8 w-[1.5px] bg-slate-100 mx-2 hidden md:block"></div>

          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Show Toolbar"
              >
                <PanelLeftOpen className="h-5 w-5" />
              </Button>
            )}

            <div className="relative group max-w-[300px]">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                <FileText className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={assessmentDetails.title || ""}
                placeholder="Untitled Assessment"
                onChange={(e) => updateAssessmentDetails({ title: e.target.value })}
                className="bg-transparent border-none text-sm font-bold text-slate-900 hover:bg-slate-100/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-100 rounded-md py-1.5 px-3 transition-all w-full placeholder:text-slate-300"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs font-bold text-slate-500 hover:text-indigo-600 px-3"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isPublishing}
          >
            {isSavingDraft ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Draft'
            )}
          </Button>

          <Button
            size="sm"
            className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 rounded-lg shadow-lg shadow-indigo-100 transition-all active:scale-95"
            onClick={handlePublish}
            disabled={isSavingDraft || isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish'
            )}
          </Button>

          {saveMessage && (
            <div className="hidden md:flex items-center gap-1.5 rounded-full border px-2.5 py-1 bg-white">
              {saveMessage.type === 'success' ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
              )}
              <span className={`text-[10px] font-bold uppercase ${saveMessage.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {saveMessage.text}
              </span>
            </div>
          )}

          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center cursor-pointer hover:border-indigo-300 transition-colors">
            <span className="text-[10px] font-bold text-slate-400">JD</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)] min-h-0">
        {/* Left Sidebar - Tools */}
        <motion.aside
          initial={{ width: 400, opacity: 1 }}
          animate={{
            width: sidebarOpen ? 400 : 0,
            opacity: sidebarOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-white border-r border-slate-200 flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-hidden h-full shrink-0 font-google"
        >
          <div className="h-14 border-b border-slate-50 flex items-center justify-between px-6 shrink-0 bg-white/80 backdrop-blur-sm sticky top-0 z-10 min-w-[400px]">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Builder Tools</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="h-8 w-8 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
              title="Hide Toolbar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0 min-w-[400px]">
            <div className="px-6 py-4 flex items-center justify-center shrink-0">
              <TabsList className="bg-slate-100/80 p-1 rounded-xl w-full">
                <TabsTrigger value="general" className="flex-1 rounded-lg text-xs font-bold py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all uppercase tracking-tighter">Setup</TabsTrigger>
                <TabsTrigger value="questions" className="flex-1 rounded-lg text-xs font-bold py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all uppercase tracking-tighter">Editor</TabsTrigger>
                <TabsTrigger value="ai" className="flex-1 rounded-lg text-xs font-bold py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all uppercase tracking-tighter flex items-center justify-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI MAGIC
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-thin scrollbar-thumb-slate-200">
              <TabsContent value="general" className="mt-0 outline-none">
                <div className="py-2 space-y-8">
                  <div className="space-y-1 mt-2">
                    <h2 className="text-sm font-bold text-slate-900">Assessment Settings</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold opacity-60">Global Configurations</p>
                  </div>
                  <BasicDetails />
                  <div className="space-y-6">
                    <AssessmentSetup />
                    <AssessmentType />
                    <AdditionalSettings />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="questions" className="mt-0 outline-none">
                <div className="py-2 mt-2">
                  <div className="space-y-1 mb-6">
                    <h2 className="text-sm font-bold text-slate-900">Question Builder</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold opacity-60">Add Manual Content</p>
                  </div>
                  <QuestionBuilder />
                </div>
              </TabsContent>
              <TabsContent value="ai" className="mt-0 outline-none">
                <div className="py-2 mt-2">
                  <AIAssistant />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </motion.aside>

        {/* Center Main - Document View */}
        <main className="flex-1 bg-slate-200/60 overflow-y-auto relative flex justify-center p-4 lg:p-12 scrollbar-thin scrollbar-thumb-slate-300">
          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-[850px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.1)] rounded-sm border border-slate-200 mx-auto my-0 p-12 sm:p-20 relative min-h-fit mb-12"
          >
            {/* Document Decorative Punch Holes */}
            <div className="absolute left-4 top-20 bottom-20 flex flex-col justify-between py-10 opacity-10 pointer-events-none">
              <div className="w-4 h-4 rounded-full bg-slate-900 shadow-inner"></div>
              <div className="w-4 h-4 rounded-full bg-slate-900 shadow-inner"></div>
              <div className="w-4 h-4 rounded-full bg-slate-900 shadow-inner"></div>
            </div>

            <QuestionPaperPreview />
          </motion.div>
        </main>
      </div>

    </div>
  )
}

export default function CreateAssessmentPage() {
  return (
    <AssessmentProvider>
      <CreateAssessmentContent />
    </AssessmentProvider>
  )
}
