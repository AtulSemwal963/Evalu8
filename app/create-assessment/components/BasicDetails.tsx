"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAssessmentDetails, useAssessmentActions } from "../store/assessment-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Book, Clock, FileText, GraduationCap } from "lucide-react"
import { useState } from "react"

const subjects = [
  "Mathematics", "Science", "English", "History", "Geography",
  "Computer Science", "Physics", "Chemistry", "Biology", "Other"
]

export function BasicDetails() {
  const assessmentDetails = useAssessmentDetails()
  const { updateAssessmentDetails } = useAssessmentActions()

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="assessmentTitle" className="text-sm font-semibold text-slate-700">Assessment Title</Label>
        <Input
          id="assessmentTitle"
          placeholder="e.g., Mid-Term Biology Exam"
          value={assessmentDetails.title}
          onChange={(e) => updateAssessmentDetails({ title: e.target.value })}
          className="text-base h-10 border-slate-200 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="assessmentDescription" className="text-sm font-semibold text-slate-700">Description</Label>
        <Textarea
          id="assessmentDescription"
          placeholder="Brief overview..."
          value={assessmentDetails.description}
          onChange={(e) => updateAssessmentDetails({ description: e.target.value })}
          className="min-h-[70px] text-sm resize-none border-slate-200 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="subject" className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Book className="h-3 w-3" />
            Subject
          </Label>
          <Select
            value={assessmentDetails.subject || undefined}
            onValueChange={(value) => {
              if (value !== assessmentDetails.subject) {
                updateAssessmentDetails({ subject: value })
              }
            }}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select subject..." />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subj) => (
                <SelectItem key={subj} value={subj}>
                  {subj}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="duration" className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Mins
          </Label>
          <Input
            id="duration"
            type="number"
            min="1"
            max="180"
            value={assessmentDetails.duration}
            onChange={(e) => updateAssessmentDetails({ duration: parseInt(e.target.value) || 1 })}
            className="h-9 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="instructions" className="text-sm font-semibold text-slate-700">Instructions</Label>
        <Textarea
          id="instructions"
          placeholder="Instructions for students..."
          value={assessmentDetails.instructions}
          onChange={(e) => updateAssessmentDetails({ instructions: e.target.value })}
          className="min-h-[80px] text-sm border-slate-200 focus:ring-indigo-500"
        />
      </div>
    </div>
  )
}
