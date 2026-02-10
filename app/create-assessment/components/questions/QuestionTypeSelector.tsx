"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Grid, ArrowUpDown, ImageIcon, CheckCircle, ListOrdered, MousePointer2 } from "lucide-react"

interface QuestionType {
  id: string
  name: string
  icon: React.ReactNode
  description: string
}

interface QuestionTypeSelectorProps {
  currentType: string
  onTypeChange: (type: string) => void
}

const questionTypes: QuestionType[] = [
  {
    id: "mcq",
    name: "Multiple Choice",
    icon: <CheckCircle className="h-4 w-4" />,
    description: "Standard question with one or more correct options"
  },
  {
    id: "reordering",
    name: "Reordering",
    icon: <ListOrdered className="h-4 w-4" />,
    description: "Items to be arranged in a specific sequence"
  },
  {
    id: "hotspot",
    name: "Hotspot",
    icon: <MousePointer2 className="h-4 w-4" />,
    description: "Interactive image with clickable target zones"
  }
]

export function QuestionTypeSelector({ currentType, onTypeChange }: QuestionTypeSelectorProps) {

  return (
    <div className="bg-muted/30 p-1 rounded-lg border flex items-center gap-1 overflow-x-auto">
      {questionTypes.map((type) => {
        const isSelected = currentType === type.id
        return (
          <button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
              ${isSelected
                ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
              }
            `}
            title={type.description}
          >
            {type.icon}
            {type.name}
          </button>
        )
      })}
    </div>
  )
}
