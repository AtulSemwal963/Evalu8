"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HelpCircle, Target, Settings, Brain } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAssessmentDetails, useAssessmentActions } from "../store/assessment-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const difficulties = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
]

const bloomLevels = [
  { value: "remember", label: "Remember" },
  { value: "understand", label: "Understand" },
  { value: "apply", label: "Apply" },
  { value: "analyze", label: "Analyze" },
  { value: "evaluate", label: "Evaluate" },
  { value: "create", label: "Create" },
]

export function AssessmentSetup() {
  const assessmentDetails = useAssessmentDetails()
  const { updateAssessmentDetails } = useAssessmentActions()

  return (
    <div className="space-y-6">
      {/* Assessment Mode */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assessment Mode</Label>
        <RadioGroup
          value={assessmentDetails.mode}
          onValueChange={(value) => updateAssessmentDetails({ mode: value })}
          className="grid grid-cols-2 gap-2"
        >
          <div
            className={`
              relative flex flex-col p-3 rounded-lg border cursor-pointer transition-all
              ${assessmentDetails.mode === "formative" ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600" : "border-slate-200 hover:border-slate-300 bg-white"}
            `}
            onClick={() => updateAssessmentDetails({ mode: "formative" })}
          >
            <RadioGroupItem value="formative" id="formative" className="sr-only" />
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-1 rounded-md ${assessmentDetails.mode === "formative" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                <Settings className="h-3.5 w-3.5" />
              </div>
              <Label htmlFor="formative" className="font-bold text-sm cursor-pointer">Formative</Label>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Real-time feedback & practice.
            </p>
          </div>

          <div
            className={`
              relative flex flex-col p-3 rounded-lg border cursor-pointer transition-all
              ${assessmentDetails.mode === "summative" ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600" : "border-slate-200 hover:border-slate-300 bg-white"}
            `}
            onClick={() => updateAssessmentDetails({ mode: "summative" })}
          >
            <RadioGroupItem value="summative" id="summative" className="sr-only" />
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-1 rounded-md ${assessmentDetails.mode === "summative" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                <Target className="h-3.5 w-3.5" />
              </div>
              <Label htmlFor="summative" className="font-bold text-sm cursor-pointer">Summative</Label>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Strict grading & final exams.
            </p>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="questionCount" className="text-sm font-semibold text-slate-700">Questions</Label>
          <Input
            id="questionCount"
            type="number"
            min="1"
            max="100"
            value={assessmentDetails.questionCount}
            onChange={(e) => updateAssessmentDetails({ questionCount: parseInt(e.target.value) || 1 })}
            className="h-10 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="timeLimit" className="text-sm font-semibold text-slate-700">Time Limit</Label>
          <div className="relative">
            <Input
              id="timeLimit"
              type="number"
              min="1"
              max="180"
              value={assessmentDetails.timeLimit}
              onChange={(e) => updateAssessmentDetails({ timeLimit: parseInt(e.target.value) || 1 })}
              className="h-10 text-sm pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">MIN</span>
          </div>
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label className="text-sm font-semibold text-slate-700">Difficulty Level</Label>
          <Select
            value={assessmentDetails.difficulty}
            onValueChange={(value) => updateAssessmentDetails({ difficulty: value })}
          >
            <SelectTrigger className="h-10 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {assessmentDetails.mode === "summative" && (
        <div className="pt-5 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-orange-500" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-orange-700">Learning Path</h4>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="learningObjective" className="text-sm font-semibold text-slate-700">Objective</Label>
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter text-rose-500 border-rose-100 bg-rose-50/50">Required</Badge>
              </div>
              <Textarea
                id="learningObjective"
                placeholder="Declare the specific learning outcome for this summative assessment..."
                value={assessmentDetails.learningObjective}
                onChange={(e) => updateAssessmentDetails({ learningObjective: e.target.value })}
                className={`min-h-[60px] text-sm transition-all ${!assessmentDetails.learningObjective ? 'border-rose-200 focus:ring-rose-500 bg-rose-50/20' : 'border-slate-200'}`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-700">Bloom's Level</Label>
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter text-rose-500 border-rose-100 bg-rose-50/50">Required</Badge>
              </div>
              <Select
                value={assessmentDetails.bloomLevel}
                onValueChange={(value) => updateAssessmentDetails({ bloomLevel: value })}
              >
                <SelectTrigger className={`h-10 text-sm transition-all ${!assessmentDetails.bloomLevel ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'}`}>
                  <SelectValue placeholder="Select cognitive depth..." />
                </SelectTrigger>
                <SelectContent>
                  {bloomLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
