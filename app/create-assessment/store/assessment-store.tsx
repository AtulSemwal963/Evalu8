"use client"

import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react'

// Assessment State Types
interface AssessmentDetails {
  id?: string
  title: string
  filename?: string
  description: string
  status?: string
  subject: string
  duration: number
  instructions: string
  type: string
  mode: string
  questionCount: number
  timeLimit: number
  difficulty: string
  learningObjective: string
  bloomLevel: string
  passingScore: number
  allowRetakes: boolean
  maxRetakes: number
  showFeedback: boolean
  randomizeQuestions: boolean
}

interface Question {
  id: string
  type: string
  stem: string
  timestamp: string
  options?: string[]
  correctAnswers?: string[]
  explanation?: string
  allowMultipleAnswers?: boolean
  items?: Array<{ id: number; text: string }>
  instructions?: string
  zones?: Array<{ id: string; x: number; y: number; width: number; height: number; isCorrect?: boolean }>
  imageUrl?: string
  correctOrder?: string[]
  bloomLevel?: string
  difficulty?: string
  distractorFeedback?: Record<string, string> // Map of option index/key to feedback
}

interface AssessmentState {
  assessmentDetails: AssessmentDetails
  questions: Question[]
  draftQuestion: Partial<Question>
}

type AssessmentAction =
  | { type: 'UPDATE_DETAILS'; payload: Partial<AssessmentDetails> }
  | { type: 'ADD_QUESTION'; payload: Question }
  | { type: 'UPDATE_QUESTION'; payload: { id: string; question: Partial<Question> } }
  | { type: 'REMOVE_QUESTION'; payload: string }
  | { type: 'UPDATE_DRAFT'; payload: Partial<Question> }
  | { type: 'HYDRATE_ASSESSMENT'; payload: { assessmentDetails: Partial<AssessmentDetails>; questions: Question[] } }
  | { type: 'RESET_ASSESSMENT' }

// Initial State
const initialAssessmentDetails: AssessmentDetails = {
  id: undefined,
  title: "",
  filename: "",
  description: "",
  status: "draft",
  subject: "",
  duration: 45,
  instructions: "",
  type: "mcq",
  mode: "formative",
  questionCount: 10,
  timeLimit: 45,
  difficulty: "medium",
  learningObjective: "",
  bloomLevel: "",
  passingScore: 70,
  allowRetakes: false,
  maxRetakes: 3,
  showFeedback: true,
  randomizeQuestions: false,
}

const initialState: AssessmentState = {
  assessmentDetails: initialAssessmentDetails,
  questions: [],
  draftQuestion: {
    type: "mcq",
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
    bloomLevel: "understand",
    difficulty: "medium",
    distractorFeedback: {}
  }
}

// Reducer
function assessmentReducer(state: AssessmentState, action: AssessmentAction): AssessmentState {
  switch (action.type) {
    case 'UPDATE_DETAILS':
      return {
        ...state,
        assessmentDetails: {
          ...state.assessmentDetails,
          ...action.payload
        }
      }
    case 'HYDRATE_ASSESSMENT':
      return {
        ...state,
        assessmentDetails: {
          ...state.assessmentDetails,
          ...action.payload.assessmentDetails
        },
        questions: action.payload.questions
      }
    case 'ADD_QUESTION':
      return {
        ...state,
        questions: [...state.questions, action.payload]
      }
    case 'UPDATE_QUESTION':
      return {
        ...state,
        questions: state.questions.map(q =>
          q.id === action.payload.id
            ? { ...q, ...action.payload.question }
            : q
        )
      }
    case 'REMOVE_QUESTION':
      return {
        ...state,
        questions: state.questions.filter(q => q.id !== action.payload)
      }
    case 'UPDATE_DRAFT':
      return {
        ...state,
        draftQuestion: {
          ...state.draftQuestion,
          ...action.payload
        }
      }
    case 'RESET_ASSESSMENT':
      return initialState
    default:
      return state
  }
}

// Context
const AssessmentContext = createContext<{
  state: AssessmentState
  dispatch: React.Dispatch<AssessmentAction>
} | null>(null)

// Provider
export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(assessmentReducer, initialState)

  return (
    <AssessmentContext.Provider value={{ state, dispatch }}>
      {children}
    </AssessmentContext.Provider>
  )
}

// Hooks
export function useAssessmentState() {
  const context = useContext(AssessmentContext)
  if (!context) {
    throw new Error('useAssessmentState must be used within AssessmentProvider')
  }
  return context
}

export function useAssessmentDetails() {
  const context = useContext(AssessmentContext)
  if (!context) {
    throw new Error('useAssessmentDetails must be used within AssessmentProvider')
  }
  return context.state.assessmentDetails
}

export function useQuestions() {
  const context = useContext(AssessmentContext)
  if (!context) {
    throw new Error('useQuestions must be used within AssessmentProvider')
  }
  return context.state.questions
}

export function useAssessmentActions() {
  const context = useContext(AssessmentContext)
  if (!context) {
    throw new Error('useAssessmentActions must be used within AssessmentProvider')
  }
  const { dispatch } = context
  return {
    updateAssessmentDetails: (details: Partial<AssessmentDetails>) =>
      dispatch({ type: 'UPDATE_DETAILS', payload: details }),
    hydrateAssessment: (payload: { assessmentDetails: Partial<AssessmentDetails>; questions: Question[] }) =>
      dispatch({ type: 'HYDRATE_ASSESSMENT', payload }),
    addQuestion: (question: Question) =>
      dispatch({ type: 'ADD_QUESTION', payload: question }),
    updateQuestion: (id: string, question: Partial<Question>) =>
      dispatch({ type: 'UPDATE_QUESTION', payload: { id, question } }),
    removeQuestion: (id: string) =>
      dispatch({ type: 'REMOVE_QUESTION', payload: id }),
    updateDraft: (draft: Partial<Question>) =>
      dispatch({ type: 'UPDATE_DRAFT', payload: draft }),
    resetAssessment: () =>
      dispatch({ type: 'RESET_ASSESSMENT' }),
  }
}

export function useLoadAssessmentById() {
  const context = useContext(AssessmentContext)
  if (!context) {
    throw new Error('useLoadAssessmentById must be used within AssessmentProvider')
  }

  const { dispatch } = context

  return useCallback(async (assessmentId: string) => {
    const response = await fetch(`/api/assessment?id=${assessmentId}`)
    const data = await response.json()

    if (!response.ok) {
      const message = data?.error || 'Failed to fetch assessment'
      throw new Error(message)
    }

    const assessment = data?.assessment
    if (!assessment) {
      throw new Error('Assessment not found')
    }

    const mappedQuestions: Question[] = (assessment.questions || []).map((q: any) => ({
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

    dispatch({
      type: 'HYDRATE_ASSESSMENT',
      payload: {
        assessmentDetails: {
          id: assessment.id,
          title: assessment.title || '',
          filename: assessment.filename || '',
          description: assessment.description || '',
          status: assessment.status || 'draft',
          subject: assessment.subject || '',
          duration: assessment.duration || 45,
          instructions: assessment.instructions || '',
          type: assessment.type || 'mcq',
          mode: assessment.mode || 'formative',
          questionCount: assessment.questionCount ?? mappedQuestions.length,
          timeLimit: assessment.duration || 45,
          difficulty: assessment.difficulty || 'medium',
          learningObjective: assessment.learningObjective || '',
          bloomLevel: assessment.bloomLevel || '',
          passingScore: assessment.passingScore ?? 70,
          allowRetakes: assessment.allowRetakes ?? false,
          maxRetakes: assessment.maxRetries ?? 3,
          showFeedback: assessment.showFeedback ?? true,
          randomizeQuestions: assessment.randomizeQuestions ?? false,
        },
        questions: mappedQuestions
      }
    })

    return assessment
  }, [dispatch])
}

export function useSaveAssessment() {
  const context = useContext(AssessmentContext)
  if (!context) {
    throw new Error('useSaveAssessment must be used within AssessmentProvider')
  }

  const { state, dispatch } = context

  const resolveUserId = useCallback(async () => {
    const savedUser = localStorage.getItem('evalu8_user')
    if (!savedUser) throw new Error('User not found in localStorage')
    const userData = JSON.parse(savedUser)
    if (!userData?.email) throw new Error('User email not found')

    const userResponse = await fetch(`/api/user?email=${encodeURIComponent(userData.email)}`)
    const userFromDb = await userResponse.json()
    if (!userResponse.ok || !userFromDb?.id) {
      throw new Error(userFromDb?.error || 'Failed to resolve user id')
    }
    return userFromDb.id as string
  }, [])

  const saveWithStatus = useCallback(async (status: 'draft' | 'published') => {
    const userId = await resolveUserId()

    const payloadAssessmentDetails = {
      ...state.assessmentDetails,
      status,
    }

    const response = await fetch('/api/assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessmentDetails: payloadAssessmentDetails,
        questions: state.questions,
        userId
      })
    })

    const data = await response.json()
    if (!response.ok || !data?.success) {
      throw new Error(data?.error || 'Failed to save assessment')
    }

    if (data?.assessmentId) {
      dispatch({ type: 'UPDATE_DETAILS', payload: { id: data.assessmentId, status } })
    } else {
      dispatch({ type: 'UPDATE_DETAILS', payload: { status } })
    }

    return data.assessmentId as string
  }, [dispatch, resolveUserId, state.assessmentDetails, state.questions])

  const saveDraft = useCallback(() => saveWithStatus('draft'), [saveWithStatus])
  const publish = useCallback(() => saveWithStatus('published'), [saveWithStatus])

  return { saveDraft, publish }
}

export function useDraftQuestion() {
  const context = useContext(AssessmentContext)
  if (!context) {
    throw new Error('useDraftQuestion must be used within AssessmentProvider')
  }
  return context.state.draftQuestion || {
    type: "mcq",
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
    bloomLevel: "understand",
    difficulty: "medium",
    distractorFeedback: {}
  }
}
