import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Edit3, Play, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

interface OpenAssessmentModalProps {
  isOpen: boolean
  onClose: () => void
  assessmentId: string
  assessmentTitle: string
}

export function OpenAssessmentModal({
  isOpen,
  onClose,
  assessmentId,
  assessmentTitle
}: OpenAssessmentModalProps) {
  const router = useRouter()

  const handleOpenDesigner = async () => {
    try {
      // Fetch assessment data with questions
      const response = await fetch(`/api/assessment?id=${assessmentId}`)
      const data = await response.json()

      if (response.ok && data.assessment) {
        // Store assessment data in localStorage for the designer to pick up
        localStorage.setItem('evalu8-edit-assessment', JSON.stringify(data.assessment))
        
        // Navigate to designer mode
        const url = `/create-assessment?edit=${assessmentId}`
        window.open(url, '_blank')
      } else {
        console.error('Failed to fetch assessment data:', data.error)
      }
    } catch (error) {
      console.error('Error opening designer mode:', error)
    }
    onClose()
  }

  const handleOpenAssessment = () => {
    // Navigate to assessment mode (we'll create this route)
    const url = `/assessment/${assessmentId}?mode=view`
    window.open(url, '_blank')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Open Assessment</DialogTitle>
          <DialogDescription>
            Choose how you want to open "{assessmentTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Button
            onClick={handleOpenDesigner}
            className="w-full h-auto p-4 flex flex-col items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border-blue-200"
            variant="outline"
          >
            <div className="flex items-center gap-3">
              <Edit3 className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Designer Mode</div>
                <div className="text-sm opacity-75">Edit questions and settings</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={handleOpenAssessment}
            className="w-full h-auto p-4 flex flex-col items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 border-green-200"
            variant="outline"
          >
            <div className="flex items-center gap-3">
              <Play className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Assessment Mode</div>
                <div className="text-sm opacity-75">Take or preview assessment</div>
              </div>
            </div>
          </Button>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
