"use client"

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'

// Assessment State Types
interface AssessmentDetails {
  id?: string // Database ID for updates
  title: string
  filename: string
  description: string
  status: 'draft' | 'published'
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
  | { type: 'RESET_ASSESSMENT' }
  | { type: 'INITIALIZE'; payload: AssessmentState }

// Initial State
const initialAssessmentDetails: AssessmentDetails = {
  title: "",
  filename: "Untitled Assessment",
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
      localStorage.removeItem('evalu8-assessment-cache')
      return initialState
    case 'INITIALIZE':
      return action.payload
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

  // Load from cache on mount
  useEffect(() => {
    const cache = localStorage.getItem('evalu8-assessment-cache')
    if (cache) {
      try {
        const parsedCache = JSON.parse(cache)
        dispatch({ type: 'INITIALIZE', payload: parsedCache })
      } catch (e) {
        console.error("Failed to parse assessment cache", e)
      }
    }
  }, [])

  // Sync to cache on any change
  useEffect(() => {
    if (state !== initialState) {
      localStorage.setItem('evalu8-assessment-cache', JSON.stringify(state))
    }
  }, [state])

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
