"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Clock, FileText, Circle, GripVertical, Target, Book } from "lucide-react"
import { useAssessmentDetails, useQuestions } from "../store/assessment-store"

const questionTypes = [
  { id: "mcq", name: "Multiple Choice" },
  { id: "ordering", name: "Ordering" },
  { id: "hotspot", name: "Hotspot" },
  { id: "mix", name: "Mix" },
]

import { useState, useEffect } from "react"
import { CheckCircle2, XCircle, AlertCircle, ArrowUp, ArrowDown, Sparkles } from "lucide-react"
import { Reorder, motion } from "framer-motion"

export function QuestionPaperPreview() {
  const assessmentDetails = useAssessmentDetails()
  const savedQuestions = useQuestions()

  // State for user answers and submission status
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({})
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({})
  const [results, setResults] = useState<Record<string, boolean>>({})

  // Hotspot Drawing states
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingStartPos, setDrawingStartPos] = useState<{ x: number, y: number } | null>(null)
  const [tempDrawingQuestionId, setTempDrawingQuestionId] = useState<string | null>(null)

  // Initialize ordering items state separately for movement
  const [orderingStates, setOrderingStates] = useState<Record<string, any[]>>({})

  useEffect(() => {
    const initialOrdering: Record<string, any[]> = {}
    savedQuestions.forEach(q => {
      if (q.type === 'reordering') {
        initialOrdering[q.id] = [...q.items]
      }
    })
    setOrderingStates(initialOrdering)
  }, [savedQuestions])

  const getQuestionTypeName = () => {
    const type = questionTypes.find(t => t.id === assessmentDetails.type)
    return type?.name || "Assessment Type"
  }

  const handleMCQSelect = (questionId: string, optionIndex: number) => {
    if (submittedQuestions[questionId]) return
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
  }

  const handleHotspotMouseDown = (questionId: string, e: React.MouseEvent) => {
    if (submittedQuestions[questionId]) return

    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setDrawingStartPos({ x, y })
    setIsDrawing(true)
    setTempDrawingQuestionId(questionId)
  }

  const handleHotspotMouseMove = (questionId: string, e: React.MouseEvent) => {
    if (!isDrawing || tempDrawingQuestionId !== questionId || !drawingStartPos) return

    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const currentX = ((e.clientX - rect.left) / rect.width) * 100
    const currentY = ((e.clientY - rect.top) / rect.height) * 100

    const width = Math.abs(currentX - drawingStartPos.x)
    const height = Math.abs(currentY - drawingStartPos.y)
    const x = Math.min(drawingStartPos.x, currentX)
    const y = Math.min(drawingStartPos.y, currentY)

    setUserAnswers(prev => ({
      ...prev,
      [questionId]: {
        x,
        y,
        percentWidth: width,
        percentHeight: height
      }
    }))
  }

  const handleHotspotMouseUp = () => {
    setIsDrawing(false)
    setDrawingStartPos(null)
    setTempDrawingQuestionId(null)
  }

  const handleReorder = (questionId: string, newOrder: any[]) => {
    if (submittedQuestions[questionId]) return
    setOrderingStates(prev => ({ ...prev, [questionId]: newOrder }))
  }

  const handleSubmit = (question: any) => {
    const questionId = question.id
    let isCorrect = false

    if (question.type === 'mcq') {
      const selectedIndex = userAnswers[questionId]
      const selectedOption = question.options[selectedIndex]

      // Map letter answers (a,b,c,d) to indices for comparison
      const letterToIndex: Record<string, number> = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 }

      isCorrect = question.correctAnswers?.some((ans: any) => {
        // If it's a letter (from AI response), compare against selected index
        if (typeof ans === 'string' && letterToIndex[ans.toLowerCase()] !== undefined) {
          return letterToIndex[ans.toLowerCase()] === selectedIndex
        }
        // Fallback for direct text or index matching
        return ans === selectedOption || String(ans) === String(selectedIndex)
      })
    } else if (question.type === 'reordering') {
      const currentOrder = orderingStates[questionId].map((i: any) => i.text.trim().toLowerCase())
      const correctOrder = (question.correctOrder || (question.items as any[]).map(i => i.text)).map((t: string) => t.trim().toLowerCase())
      isCorrect = JSON.stringify(currentOrder) === JSON.stringify(correctOrder)
    } else if (question.type === 'hotspot') {
      const userSelection = userAnswers[questionId]
      if (!userSelection) {
        isCorrect = false
      } else {
        // Simple percentage-based intersection
        isCorrect = question.zones?.some((zone: any) => {
          if (!zone.isCorrect) return false

          // Calculate intersection of two boxes in % coordinate space
          const overlapX = Math.max(0, Math.min(userSelection.x + userSelection.percentWidth, zone.x + zone.width) - Math.max(userSelection.x, zone.x))
          const overlapY = Math.max(0, Math.min(userSelection.y + userSelection.percentHeight, zone.y + zone.height) - Math.max(userSelection.y, zone.y))

          return (overlapX * overlapY) > 0
        })
      }
    }

    setResults(prev => ({ ...prev, [questionId]: isCorrect }))
    setSubmittedQuestions(prev => ({ ...prev, [questionId]: true }))
  }

  const renderQuestion = (question: any, index: number) => {
    const isSubmitted = submittedQuestions[question.id]
    const isCorrect = results[question.id]
    const showExplanation = isSubmitted && assessmentDetails.showFeedback

    switch (question.type) {
      case "mcq":
        return (
          <div key={question.id} className="mb-12 font-serif group">
            <div className="flex items-start gap-4 mb-4">
              <span className="font-black text-xl min-w-[36px] text-slate-400 group-hover:text-indigo-600 transition-colors">
                {String(index + 1).padStart(2, '0')}.
              </span>
              <div className="flex-1">
                <p className="text-xl leading-relaxed font-medium text-slate-800">{question.stem}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 ml-12 cursor-pointer">
              {question.options.map((option: string, optIndex: number) => {
                const isSelected = userAnswers[question.id] === optIndex
                const isCorrectOption = isSubmitted && (question.correctAnswers?.includes(option) || question.correctAnswers?.includes(String(optIndex)))

                return (
                  <div
                    key={optIndex}
                    onClick={() => handleMCQSelect(question.id, optIndex)}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200
                      ${isSelected ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-100 bg-slate-50/30 hover:border-slate-200'}
                      ${isSubmitted && isSelected && !isCorrect ? 'border-rose-500 bg-rose-50' : ''}
                      ${isSubmitted && isCorrectOption ? 'border-emerald-500 bg-emerald-50' : ''}
                    `}
                  >
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center font-sans text-[10px] font-black
                      ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 text-slate-400'}
                      ${isSubmitted && isCorrectOption ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                      ${isSubmitted && isSelected && !isCorrect ? 'bg-rose-500 border-rose-500 text-white' : ''}
                    `}>
                      {String.fromCharCode(65 + optIndex)}
                    </div>
                    <span className={`text-[17px] ${isSelected ? 'font-bold text-indigo-900' : 'text-slate-600'}`}>{option}</span>
                    {isSubmitted && isCorrectOption && <CheckCircle2 className="h-5 w-5 text-emerald-500 ml-auto" />}
                    {isSubmitted && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-rose-500 ml-auto" />}
                  </div>
                )
              })}
            </div>

            {!isSubmitted && (
              <div className="ml-12 mt-6">
                <Button
                  onClick={() => handleSubmit(question)}
                  disabled={userAnswers[question.id] === undefined}
                  className="bg-slate-900 hover:bg-indigo-600 text-white font-bold px-8 rounded-full h-10 transition-all shadow-md active:scale-95"
                >
                  Confirm Answer
                </Button>
              </div>
            )}

            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`ml-12 mt-6 p-6 rounded-2xl border ${isCorrect ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-rose-600" />}
                  <span className={`text-xs font-black uppercase tracking-widest ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isCorrect ? 'Excellent Work!' : 'Not Quite Right'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  <span className="font-bold not-italic">Explanation:</span> {question.explanation || "No additional feedback provided for this question."}
                </p>
              </motion.div>
            )}
          </div>
        )

      case "reordering":
        const currentItems = orderingStates[question.id] || question.items
        return (
          <div key={question.id} className="mb-12 font-serif group">
            <div className="flex items-start gap-4 mb-4">
              <span className="font-black text-xl min-w-[36px] text-slate-400">
                {String(index + 1).padStart(2, '0')}.
              </span>
              <div className="flex-1">
                <p className="text-xl leading-relaxed font-medium text-slate-800 italic">{question.instructions}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Drag to reorder items</p>
              </div>
            </div>

            <Reorder.Group
              axis="y"
              values={currentItems}
              onReorder={(newOrder) => handleReorder(question.id, newOrder)}
              className="space-y-3 ml-12"
            >
              {currentItems.map((item: any) => (
                <Reorder.Item
                  key={item.id}
                  value={item}
                  className={`
                    p-4 bg-white border-2 border-slate-100 rounded-xl flex items-center gap-4 cursor-grab active:cursor-grabbing
                    ${isSubmitted ? 'pointer-events-none opacity-80' : 'hover:border-indigo-200 hover:shadow-sm'}
                  `}
                >
                  <GripVertical className="h-5 w-5 text-slate-300" />
                  <span className="text-lg text-slate-700">{item.text}</span>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            {!isSubmitted && (
              <div className="ml-12 mt-6">
                <Button
                  onClick={() => handleSubmit(question)}
                  className="bg-slate-900 hover:bg-indigo-600 text-white font-bold px-8 rounded-full h-10 transition-all shadow-md"
                >
                  Submit Order
                </Button>
              </div>
            )}

            {showExplanation && (
              <div className={`ml-12 mt-6 p-6 rounded-2xl border ${isCorrect ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-black uppercase tracking-widest ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                    Order Verification
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">{question.explanation}</p>
              </div>
            )}
          </div>
        )

      case "hotspot":
        const userSelection = userAnswers[question.id]
        return (
          <div key={question.id} className="mb-12 font-serif group">
            <div className="flex items-start gap-4 mb-4">
              <span className="font-black text-xl min-w-[36px] text-slate-400">
                {String(index + 1).padStart(2, '0')}.
              </span>
              <div className="flex-1">
                <p className="text-xl leading-relaxed font-medium text-slate-800">{question.instructions}</p>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic opacity-70">
                  {isSubmitted ? "Selection Evaluated" : "Click and drag to identify the target area"}
                </span>
              </div>
            </div>

            <div
              className={`
                ml-12 relative border-4 rounded-3xl overflow-hidden bg-slate-50 transition-all duration-500 select-none
                ${isSubmitted ? (isCorrect ? 'border-emerald-100 shadow-xl shadow-emerald-500/10' : 'border-rose-100 shadow-xl shadow-rose-500/10') : 'border-slate-100 hover:border-indigo-100 cursor-crosshair'}
              `}
              onMouseDown={(e) => handleHotspotMouseDown(question.id, e)}
              onMouseMove={(e) => handleHotspotMouseMove(question.id, e)}
              onMouseUp={handleHotspotMouseUp}
              onMouseLeave={handleHotspotMouseUp}
            >
              {question.imageUrl ? (
                <div className="relative aspect-video">
                  <img src={question.imageUrl} alt="Hotspot" className="w-full h-full object-cover pointer-events-none" />

                  {/* User Selection Box */}
                  {userSelection && (
                    <div
                      className={`
                        absolute border-2 transition-all duration-300 z-30
                        ${isSubmitted
                          ? (isCorrect ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-rose-500/20 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-shake')
                          : 'bg-indigo-600/20 border-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                        }
                      `}
                      style={{
                        left: `${userSelection.x}%`,
                        top: `${userSelection.y}%`,
                        width: `${userSelection.percentWidth}%`,
                        height: `${userSelection.percentHeight}%`
                      }}
                    >
                      <div className="absolute -top-3 -right-3 flex gap-1">
                        {!isSubmitted && (
                          <div className="bg-indigo-600 text-white rounded-full p-1 shadow-lg">
                            <Target className="h-4 w-4" />
                          </div>
                        )}
                        {isSubmitted && isCorrect && (
                          <div className="bg-emerald-500 text-white rounded-full p-1 shadow-lg">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        )}
                        {isSubmitted && !isCorrect && (
                          <div className="bg-rose-500 text-white rounded-full p-1 shadow-lg">
                            <XCircle className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Show Correct Zones only after submission - HIGH VISIBILITY */}
                  {isSubmitted && question.zones?.map((zone: any) => {
                    if (!zone.isCorrect) return null

                    return (
                      <div
                        key={zone.id}
                        className="absolute border-[3px] border-emerald-500 bg-emerald-500/10 rounded-xl z-20 pointer-events-none border-dashed animate-pulse ring-4 ring-emerald-500/20"
                        style={{
                          left: `${zone.x}%`,
                          top: `${zone.y}%`,
                          width: `${zone.width}%`,
                          height: `${zone.height}%`
                        }}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="bg-emerald-500 text-white rounded-full p-1 shadow-lg">
                            <CheckCircle2 className="h-3 w-3" />
                          </div>
                          <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full mt-1 uppercase tracking-tighter shadow-sm">Target Area</span>
                        </div>
                      </div>
                    )
                  })}

                  {isDrawing && tempDrawingQuestionId === question.id && (
                    <div className="absolute inset-0 bg-indigo-600/5 pointer-events-none" />
                  )}
                </div>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center p-12 text-center text-slate-300">
                  <Target className="h-16 w-16 mb-4 opacity-10" />
                  <p className="text-sm font-bold uppercase tracking-widest opacity-30">Image Not Available</p>
                </div>
              )}
            </div>

            {!isSubmitted && (
              <div className="ml-12 mt-6">
                <Button
                  onClick={() => handleSubmit(question)}
                  disabled={!userSelection || userSelection.percentWidth < 1}
                  className="bg-slate-900 hover:bg-indigo-600 text-white font-bold px-10 rounded-full h-12 transition-all shadow-xl active:scale-95"
                >
                  Confirm Highlight
                </Button>
              </div>
            )}

            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`ml-12 mt-6 p-6 rounded-2xl border ${isCorrect ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-rose-600" />}
                  <span className={`text-xs font-black uppercase tracking-widest ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isCorrect ? 'Precision Identification!' : 'Target Missed'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  <span className="font-bold not-italic">Feedback:</span> {question.explanation || (isCorrect ? "Perfect accuracy! You identified the target correctly." : "You missed the target zone. The correct area has been revealed in green.")}
                </p>
              </motion.div>
            )}
          </div>
        )

      default:
        return null
    }
  }


  return (
    <div className="space-y-8 print:p-0">
      {/* Question Paper Header */}
      <div className="text-center font-serif space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold uppercase tracking-tight">
            {assessmentDetails.title || "ASSESSMENT TITLE"}
          </h1>
          <div className="flex flex-col gap-0.5 items-center">
            <div className="w-full h-[2px] bg-slate-900"></div>
            <div className="w-full h-[0.5px] bg-slate-400 opacity-50"></div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm font-bold px-4 py-3 border-y-[1.5px] border-slate-900 mt-4 bg-slate-50/30">
          <div className="flex flex-col items-start gap-1">
            <span className="flex items-center gap-2 text-slate-700">
              <Clock className="h-3.5 w-3.5 text-indigo-600" />
              TIME: <span className="text-slate-900">{assessmentDetails.duration || "45"} MINS</span>
            </span>
            <span className="flex items-center gap-2 uppercase text-slate-700">
              <Book className="h-3.5 w-3.5 text-indigo-600" />
              SUBJECT: <span className="text-slate-900">{assessmentDetails.subject || "GENERAL"}</span>
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="uppercase text-slate-700">TYPE: <span className="text-slate-900">{getQuestionTypeName()}</span></span>
            <span className="text-slate-700">ITEMS: <span className="text-slate-900">{savedQuestions.length}</span></span>
          </div>
        </div>

        {/* Student Bio Section */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-left py-6 px-4 font-sans text-xs tracking-wide">
          <div className="flex items-end gap-2 group">
            <span className="whitespace-nowrap font-black text-slate-400">STUDENT NAME:</span>
            <div className="flex-1 border-b border-slate-200 h-5 group-hover:border-indigo-200 transition-colors"></div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-end gap-2 group">
              <span className="whitespace-nowrap font-black text-slate-400">ROLL NO:</span>
              <div className="flex-1 border-b border-slate-200 h-5 group-hover:border-indigo-200 transition-colors"></div>
            </div>
            <div className="flex items-end gap-2 group">
              <span className="whitespace-nowrap font-black text-slate-400">DATE:</span>
              <div className="flex-1 border-b border-slate-200 h-5 group-hover:border-indigo-200 transition-colors"></div>
            </div>
          </div>
        </div>

        {assessmentDetails.instructions && (
          <div className="text-left py-6 px-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 mx-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-indigo-600" />
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-500">General Instructions</h3>
            </div>
            <p className="text-base leading-relaxed italic text-slate-600 font-serif">
              "{assessmentDetails.instructions}"
            </p>
          </div>
        )}
      </div>

      {/* Questions Section */}
      <div className="px-4 py-6 border-t-4 border-double border-slate-900">
        {savedQuestions.length === 0 ? (
          <div className="text-center py-20 text-slate-300 font-serif italic">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-2xl">Start adding questions to see the preview...</p>
          </div>
        ) : (
          savedQuestions.map((question, index) => renderQuestion(question, index))
        )}
      </div>

      {/* Footer / End of Paper */}
      {savedQuestions.length > 0 && (
        <div className="text-center py-12 font-serif">
          <div className="inline-block py-1 px-8 border-y border-slate-900 font-bold uppercase tracking-[0.2em]">
            End of Examination
          </div>
        </div>
      )}
    </div>
  )
}
