"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, Sparkles, FileText, BookOpen, Wand2, ArrowRight, X, FileCheck, Loader2 } from "lucide-react"
import { useAssessmentDetails, useAssessmentActions } from "../store/assessment-store"
import { toast } from "sonner"

export function AIAssistant() {
  const [context, setContext] = useState("")
  const [instructions, setInstructions] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const assessmentDetails = useAssessmentDetails()
  const { updateAssessmentDetails, addQuestion } = useAssessmentActions()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setSelectedFile(file)
      toast.success(`File "${file.name}" uploaded successfully`)
    } else if (file) {
      toast.error("Please upload a valid PDF file")
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleGenerateAssessment = async () => {
    if (!selectedFile && !context.trim()) {
      toast.error("Please provide either a PDF file or source text")
      return
    }

    if (!instructions.trim()) {
      toast.error("Please provide instructions for the AI")
      return
    }

    setIsGenerating(true)

    try {
      let endpoint = "/api/ai-helper"
      let body: any = { prompt: "" }

      if (selectedFile) {
        endpoint = "/api/parse-pdf"
        const formData = new FormData()
        formData.append("file", selectedFile)
        formData.append("instructions", instructions)

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (result.success && result.questions) {
          // Add each question to the store
          result.questions.forEach((q: any) => {
            addQuestion({
              ...q,
              id: q.id || Math.random().toString(36).substr(2, 9),
              timestamp: new Date().toISOString()
            })
          })

          toast.success(`Successfully generated ${result.questions.length} questions!`)
          // Reset form
          setSelectedFile(null)
          setContext("")
          setInstructions("")
        } else {
          toast.error(result.error || "Failed to generate questions")
        }
      } else {
        // Handle text-only generation (original logic)
        const prompt = `
          Source material: ${context}
          Requirements: ${instructions}
          
          Generate a valid JSON array of questions following the assessment schema (mcq, reordering, hotspot).
          RETURN ONLY THE JSON ARRAY.
        `

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        })

        const result = await response.json()

        if (result.success) {
          // AI results are often wrapped in markdown or just raw string
          const content = result.response
          const jsonMatch = content.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            const questions = JSON.parse(jsonMatch[0])
            questions.forEach((q: any) => {
              addQuestion({
                ...q,
                id: q.id || Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString()
              })
            })
            toast.success(`Generated ${questions.length} questions from text!`)
          } else {
            toast.error("AI returned unparseable content")
          }
        } else {
          toast.error(result.error || "AI generation failed")
        }
      }
    } catch (error) {
      console.error("AI Generation Error:", error)
      toast.error("An error occurred during generation")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Compact AI Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-4 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold leading-tight">AI Assessment Magic</h2>
            <p className="text-[10px] text-indigo-100 opacity-80">Generate questions instantly</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
      </div>

      <div className="space-y-4">
        {/* Source Material */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-600" />
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">1. Source Material</Label>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onClick={triggerFileUpload}
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-white hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group shadow-sm"
            >
              <Upload className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Tap to Upload PDF</p>
              <p className="text-[9px] text-slate-400 mt-1">Maximum size: 10MB</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="p-2 bg-emerald-500 text-white rounded-lg">
                <FileCheck className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-emerald-900 truncate uppercase">{selectedFile.name}</p>
                <p className="text-[8px] text-emerald-600 font-bold">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF READY</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                className="h-7 w-7 text-emerald-400 hover:text-rose-500 hover:bg-rose-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[8px] uppercase font-bold tracking-[0.2em] text-slate-300"><span className="bg-white px-3">or manual context</span></div>
          </div>

          <Textarea
            placeholder="Paste source content here..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            disabled={!!selectedFile}
            className={`min-h-[140px] text-xs resize-none transition-all ${selectedFile ? 'opacity-40 grayscale pointer-events-none' : 'focus-visible:ring-indigo-500 border-slate-200'}`}
          />
        </div>

        {/* Custom Instructions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">2. Requirements</Label>
          </div>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
            <Textarea
              id="aiInstructions"
              placeholder="e.g. Generate 5 MCQ and 2 Reordering questions for 10th grade Physics..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="relative min-h-[100px] text-xs resize-none border-slate-200 focus-visible:ring-indigo-500 font-medium bg-white rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="pt-2">
        <Button
          onClick={handleGenerateAssessment}
          disabled={isGenerating || (!selectedFile && !context.trim()) || !instructions.trim()}
          className={`
            w-full h-12 text-sm font-black rounded-xl shadow-xl transition-all active:scale-95
            ${isGenerating ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/20'}
          `}
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="uppercase tracking-widest text-[10px]">Processing Magic...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4" />
              <span className="uppercase tracking-widest text-[11px]">Cast AI Magic</span>
              <ArrowRight className="h-4 w-4 opacity-50 ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}
