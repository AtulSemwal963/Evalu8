"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Settings,
  Eye,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { QuestionPaperPreview } from "../../create-assessment/components/QuestionPaperPreview"
import { AssessmentProvider, useAssessmentDetails, useQuestions } from "../../create-assessment/store/assessment-store"

// Assessment Mode Content Component
function AssessmentModeContent({ assessment, assessmentQuestions, timeLeft, isStarted, isCompleted, handleStart, handleComplete, formatTime }: {
  assessment: any
  assessmentQuestions: any[]
  timeLeft: number
  isStarted: boolean
  isCompleted: boolean
  handleStart: () => void
  handleComplete: () => void
  formatTime: (seconds: number) => string
}) {
  return (
    <>
      {/* Header - No Sidebar */}
      <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex flex-1 items-center justify-between">
          <h1 className="text-lg font-semibold truncate">{assessment.title}</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className={`font-mono text-sm ${timeLeft < 300 ? 'text-red-600' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            
            <Badge variant="outline">
              {isStarted ? 'In Progress' : 'Not Started'}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6 max-w-6xl">
        {!isStarted ? (
          // Start Screen
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="p-8">
              <CardContent className="space-y-6 text-center">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{assessment.title}</h2>
                  <p className="text-muted-foreground">{assessment.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{assessment.questions?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Questions</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{assessment.duration} min</div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{assessment.passingScore}%</div>
                    <div className="text-sm text-muted-foreground">Passing Score</div>
                  </div>
                </div>

                {assessment.instructions && (
                  <div className="text-left p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold mb-2 text-blue-800">Instructions</h4>
                    <p className="text-blue-700">{assessment.instructions}</p>
                  </div>
                )}

                <Button 
                  onClick={handleStart}
                  size="lg"
                  className="w-full md:w-auto px-8"
                >
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : !isCompleted ? (
          // Question Paper View - Using existing component
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Timer Section */}
            <div className="sticky top-20 z-10 mb-6">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className={`text-lg font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`}>
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                    <Badge variant="outline" className="bg-white border-blue-300 text-blue-700">
                      Time Remaining
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Paper Component */}
            <QuestionPaperPreview />
            
            {/* Submit Button */}
            <div className="flex justify-center mt-8">
              <Button 
                onClick={handleComplete}
                size="lg"
                className="px-8"
              >
                Submit Assessment
              </Button>
            </div>
          </motion.div>
        ) : (
          // Completion Screen
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="p-8">
              <CardContent className="space-y-6 text-center">
                <div className="space-y-2">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-600" />
                  <h2 className="text-2xl font-bold">Assessment Completed!</h2>
                  <p className="text-muted-foreground">
                    You have successfully completed the assessment.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="font-semibold">Time Taken</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime((assessment.duration * 60) - timeLeft)}
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="font-semibold">Questions Completed</div>
                    <div className="text-sm text-muted-foreground">
                      {assessmentQuestions.length} / {assessmentQuestions.length}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/assessments">Back to Assessments</Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/assessment/${assessment.id}?mode=review`}>
                      Review Answers
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </>
  )
}

// Assessment Mode Wrapper Component - uses hooks within provider context
function AssessmentModeWrapper({ assessmentId, children }: {
  assessmentId: string
  children: React.ReactNode
}) {
  const [assessment, setAssessment] = useState<any>(null)
  const [assessmentQuestions, setAssessmentQuestions] = useState<any[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const assessmentDetails = useAssessmentDetails()
  const questions = useQuestions()

  // Fetch assessment data
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/api/assessment?id=${assessmentId}`)
        const data = await response.json()

        if (response.ok && data.assessment) {
          setAssessment(data.assessment)
          setTimeLeft(data.assessment.duration * 60) // Convert minutes to seconds
          
          // Map database questions to store format
          const mappedQuestions = data.assessment.questions.map((q: any) => ({
            id: q.id,
            type: q.type,
            stem: q.stem,
            timestamp: new Date().toISOString(),
            options: q.options || [],
            correctAnswers: q.correctAnswers || [],
            explanation: q.explanation || '',
            allowMultipleAnswers: q.allowMultipleAnswers || false,
            items: q.items || [],
            instructions: q.orderingInstructions || q.hotspotInstructions || '',
            zones: q.zones || [],
            imageUrl: q.imageUrl || '',
            correctOrder: q.correctOrder || [],
            bloomLevel: q.bloomLevel || 'understand',
            difficulty: q.difficulty || 'medium',
            distractorFeedback: q.distractorFeedback || {}
          }))
          
          setAssessmentQuestions(mappedQuestions)
        } else {
          console.error('Failed to fetch assessment:', data.error)
        }
      } catch (error) {
        console.error('Error fetching assessment:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssessment()
  }, [assessmentId])

  // Timer effect
  useEffect(() => {
    if (!isStarted || isCompleted || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          setIsCompleted(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isStarted, isCompleted, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsStarted(true)
  }

  const handleComplete = () => {
    setIsCompleted(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Assessment not found</h2>
          <p className="text-muted-foreground mb-4">The assessment you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/assessments">Back to Assessments</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {children({
        assessment,
        assessmentQuestions,
        timeLeft,
        isStarted,
        isCompleted,
        handleStart,
        handleComplete,
        formatTime
      })}
    </>
  )
}

export default function AssessmentMode() {
  const params = useParams()
  const assessmentId = params.id as string
  const mode = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('mode')

  return (
    <AssessmentProvider>
      <AssessmentModeWrapper assessmentId={assessmentId}>
        {({
          assessment,
          assessmentQuestions,
          timeLeft,
          isStarted,
          isCompleted,
          handleStart,
          handleComplete,
          formatTime
        }) => (
          <AssessmentModeContent
            assessment={assessment}
            assessmentQuestions={assessmentQuestions}
            timeLeft={timeLeft}
            isStarted={isStarted}
            isCompleted={isCompleted}
            handleStart={handleStart}
            handleComplete={handleComplete}
            formatTime={formatTime}
          />
        )}
      </AssessmentModeWrapper>
    </AssessmentProvider>
  )
}

function Target(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
