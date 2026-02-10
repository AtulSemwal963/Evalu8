"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { useAssessmentDetails, useAssessmentActions } from "../store/assessment-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sliders } from "lucide-react"

export function AdditionalSettings() {
  const assessmentDetails = useAssessmentDetails()
  const { updateAssessmentDetails } = useAssessmentActions()

  return (
    <div className="space-y-4">
      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Additional Rules</Label>

      <div className="space-y-2">
        {[
          { id: "showTimer", label: "Show Timer", desc: "Countdown clock", checked: true },
          { id: "allowNavigation", label: "Allow Navigation", desc: "Skip & return", checked: true },
          { id: "showResults", label: "Show Results", desc: "Post-test scorecard", checked: true },
          {
            id: "allowRetakes",
            label: "Allow Retakes",
            desc: "Multiple attempts",
            checked: assessmentDetails.allowRetakes,
            onCheckedChange: (checked: boolean) => updateAssessmentDetails({ allowRetakes: checked })
          },
          {
            id: "showFeedback",
            label: "Show Feedback",
            desc: "Detailed explanations",
            checked: assessmentDetails.showFeedback,
            onCheckedChange: (checked: boolean) => updateAssessmentDetails({ showFeedback: checked })
          },
        ].map((setting) => (
          <div key={setting.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-white hover:border-slate-200 transition-colors">
            <div className="space-y-0.5">
              <Label htmlFor={setting.id} className="text-sm font-bold text-slate-700 leading-none">{setting.label}</Label>
              <p className="text-[10px] text-slate-400 font-medium">{setting.desc}</p>
            </div>
            <Switch
              id={setting.id}
              checked={setting.checked}
              onCheckedChange={setting.onCheckedChange}
              className="scale-75 origin-right"
            />
          </div>
        ))}

        {assessmentDetails.allowRetakes && (
          <div className="flex items-center justify-between p-3 border border-indigo-100 rounded-lg bg-indigo-50/30">
            <Label htmlFor="maxRetakes" className="text-xs font-bold text-indigo-900">Max Retakes</Label>
            <Input
              id="maxRetakes"
              type="number"
              min="1"
              max="10"
              value={assessmentDetails.maxRetakes}
              onChange={(e) => updateAssessmentDetails({ maxRetakes: parseInt(e.target.value) || 1 })}
              className="w-16 h-8 text-xs text-center border-indigo-200"
            />
          </div>
        )}

        {assessmentDetails.mode === "formative" && (
          <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-white hover:border-slate-200 transition-colors">
            <div className="space-y-0.5">
              <Label htmlFor="randomizeQuestions" className="text-sm font-bold text-slate-700">Randomize</Label>
              <p className="text-[10px] text-slate-400 font-medium">Shuffle order</p>
            </div>
            <Switch
              id="randomizeQuestions"
              checked={assessmentDetails.randomizeQuestions}
              onCheckedChange={(checked) => updateAssessmentDetails({ randomizeQuestions: checked })}
              className="scale-75 origin-right"
            />
          </div>
        )}

        <div className="p-4 border border-slate-100 rounded-lg bg-white mt-2">
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="passingScore" className="text-xs font-bold text-slate-700 uppercase tracking-widest">Passing Score</Label>
            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {assessmentDetails.passingScore}%
            </span>
          </div>
          <Slider
            id="passingScore"
            min={0}
            max={100}
            step={5}
            value={[assessmentDetails.passingScore]}
            onValueChange={(value) => updateAssessmentDetails({ passingScore: value[0] })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
