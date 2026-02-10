"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Grid, ArrowUpDown, ImageIcon, FileText, Layers } from "lucide-react"
import { useAssessmentDetails, useAssessmentActions } from "../store/assessment-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const questionTypes = [
  { id: "mcq", name: "Multiple Choice", icon: <Grid className="h-6 w-6" />, desc: "Standard multiple choice questions" },
  { id: "ordering", name: "Ordering", icon: <ArrowUpDown className="h-6 w-6" />, desc: "Arrange items in correct sequence" },
  { id: "hotspot", name: "Hotspot", icon: <ImageIcon className="h-6 w-6" />, desc: "Identify areas on an image" },
  { id: "mix", name: "Mixed Mode", icon: <Layers className="h-6 w-6" />, desc: "Combination of all question types" },
]

export function AssessmentType() {
  const assessmentDetails = useAssessmentDetails()
  const { updateAssessmentDetails } = useAssessmentActions()

  return (
    <div className="space-y-3">
      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assessment Type</Label>
      <RadioGroup
        value={assessmentDetails.type}
        onValueChange={(value) => updateAssessmentDetails({ type: value })}
      >
        <div className="grid grid-cols-2 gap-3">
          {questionTypes.map((type) => (
            <div key={type.id}>
              <RadioGroupItem value={type.id} id={type.id} className="peer sr-only" />
              <Label
                htmlFor={type.id}
                className={`
                  flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all
                  hover:bg-slate-50 hover:border-indigo-300
                  peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50/50 
                  peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-indigo-600
                  h-full text-center space-y-1.5
                `}
              >
                <div className={`p-2 rounded-lg ${assessmentDetails.type === type.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {/* Handle icon resizing */}
                  {type.id === "mcq" && <Grid className="h-4 w-4" />}
                  {type.id === "ordering" && <ArrowUpDown className="h-4 w-4" />}
                  {type.id === "hotspot" && <ImageIcon className="h-4 w-4" />}
                  {type.id === "mix" && <Layers className="h-4 w-4" />}
                </div>
                <span className="font-bold text-[11px] text-slate-900 leading-tight">{type.name}</span>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}
