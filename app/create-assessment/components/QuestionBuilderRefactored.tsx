"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Save, Plus, ArrowRight } from "lucide-react"
import { useAssessmentActions, useQuestions, useDraftQuestion, useAssessmentDetails } from "../store/assessment-store"
import { QuestionTypeSelector } from "./questions/QuestionTypeSelector"
import { MCQQuestion } from "./questions/MCQQuestion"
import { ReorderingQuestion } from "./questions/ReorderingQuestion"
import { HotspotQuestion } from "./questions/HotspotQuestion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function QuestionBuilder() {
  const { addQuestion, updateDraft } = useAssessmentActions()
  const savedQuestions = useQuestions()
  const draft = useDraftQuestion()
  const assessmentDetails = useAssessmentDetails()

  const handleSaveQuestion = () => {
    const newQuestion: any = {
      id: Date.now().toString(),
      type: draft.type,
      stem: draft.stem,
      timestamp: new Date().toISOString(),
      explanation: draft.explanation,
      instructions: draft.instructions,
      correctOrder: draft.correctOrder,
      bloomLevel: draft.bloomLevel || assessmentDetails.bloomLevel,
      difficulty: draft.difficulty || assessmentDetails.difficulty,
      distractorFeedback: draft.distractorFeedback
    }

    switch (draft.type) {
      case "mcq":
        newQuestion.options = draft.options
        newQuestion.correctAnswers = draft.correctAnswers
        newQuestion.allowMultipleAnswers = draft.allowMultipleAnswers
        break

      case "reordering":
        newQuestion.items = draft.items
        break

      case "hotspot":
        newQuestion.zones = draft.zones
        newQuestion.imageUrl = draft.imageUrl
        break
    }

    addQuestion(newQuestion)
    resetForm()
  }

  const resetForm = () => {
    updateDraft({
      stem: "",
      options: ["", "", "", ""],
      correctAnswers: [],
      explanation: "",
      allowMultipleAnswers: false,
      items: [
        { id: 1, text: "" },
        { id: 2, text: "" },
        { id: 3, text: "" },
        { id: 4, text: "" }
      ],
      zones: [],
      imageUrl: "",
      instructions: "",
      correctOrder: [],
      bloomLevel: assessmentDetails.bloomLevel || "understand",
      difficulty: assessmentDetails.difficulty || "medium",
      distractorFeedback: {}
    })
  }

  const handleQuestionTypeChange = (newType: string) => {
    updateDraft({ type: newType })
    // We don't necessarily want to reset the entire form when changing type if the user might want to switch back
    // but the original logic did it. I'll stick to original logic for now or just update type.
    // original: resetForm() 
  }

  const setQuestionStem = (val: string) => updateDraft({ stem: val })
  const setAnswerOptions = (val: string[]) => updateDraft({ options: val })
  const setCorrectAnswers = (val: string[]) => updateDraft({ correctAnswers: val })
  const setExplanation = (val: string) => updateDraft({ explanation: val })
  const setAllowMultipleAnswers = (val: boolean) => updateDraft({ allowMultipleAnswers: val })

  const setOrderingInstructions = (val: string) => updateDraft({ instructions: val })
  const setOrderingItems = (val: any[]) => updateDraft({ items: val })
  const setOrderingExplanation = (val: string) => updateDraft({ explanation: val })

  const setHotspotImageUrl = (val: string) => updateDraft({ imageUrl: val })
  const setHotspotImageAlt = (val: string) => updateDraft({ stem: val }) // reusing stem for alt/desc
  const setHotspotInstructions = (val: string) => updateDraft({ instructions: val })
  const setHotspotZones = (val: any[]) => updateDraft({ zones: val })

  return (
    <div className="space-y-6 pb-10">

      {/* Header / Type Selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="px-2 py-0 h-5 text-[10px] font-bold text-slate-400 border-slate-200">
            {savedQuestions.length} SAVED
          </Badge>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={handleSaveQuestion}
              className="h-8 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold px-3 shadow-md"
            >
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Save Question
            </Button>
          </div>
        </div>

        <QuestionTypeSelector
          currentType={draft.type || "mcq"}
          onTypeChange={handleQuestionTypeChange}
        />
      </div>

      {/* Editor Area */}
      <div className="space-y-4">
        {/* Question Type Specific Builder */}
        {draft.type === "mcq" && (
          <MCQQuestion
            questionStem={draft.stem || ""}
            setQuestionStem={setQuestionStem}
            answerOptions={draft.options || ["", "", "", ""]}
            setAnswerOptions={setAnswerOptions}
            correctAnswers={draft.correctAnswers || []}
            setCorrectAnswers={setCorrectAnswers}
            explanation={draft.explanation || ""}
            setExplanation={setExplanation}
            allowMultipleAnswers={draft.allowMultipleAnswers || false}
            setAllowMultipleAnswers={setAllowMultipleAnswers}
            distractorFeedback={draft.distractorFeedback || {}}
            setDistractorFeedback={(val) => updateDraft({ distractorFeedback: val })}
            mode={assessmentDetails.mode}
            bloomLevel={draft.bloomLevel || assessmentDetails.bloomLevel || "understand"}
            setBloomLevel={(val) => updateDraft({ bloomLevel: val })}
            subject={assessmentDetails.subject || "General"}
            difficulty={draft.difficulty || assessmentDetails.difficulty || "medium"}
            setDifficulty={(val) => updateDraft({ difficulty: val })}
          />
        )}

        {draft.type === "reordering" && (
          <ReorderingQuestion
            instructions={draft.instructions || ""}
            setInstructions={setOrderingInstructions}
            items={draft.items || []}
            setItems={setOrderingItems}
            explanation={draft.explanation || ""}
            setExplanation={setOrderingExplanation}
            correctOrder={draft.correctOrder || []}
            setCorrectOrder={(val: string[]) => updateDraft({ correctOrder: val })}
            subject={"General"}
            difficulty={"medium"}
          />
        )}

        {draft.type === "hotspot" && (
          <HotspotQuestion
            imageUrl={draft.imageUrl || ""}
            setImageUrl={setHotspotImageUrl}
            imageAlt={draft.stem || ""}
            setImageAlt={setHotspotImageAlt}
            instructions={draft.instructions || ""}
            setInstructions={setHotspotInstructions}
            zones={draft.zones || []}
            setZones={setHotspotZones}
            subject={"General"}
            difficulty={"medium"}
          />
        )}
      </div>

      <div className="pt-4 flex justify-center">
        <Button variant="link" size="sm" onClick={resetForm} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors no-underline">
          Discard Draft
        </Button>
      </div>
    </div>
  )
}
