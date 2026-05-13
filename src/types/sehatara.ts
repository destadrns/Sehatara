import type { LucideIcon } from 'lucide-react'

export type FeatureId = 'symptom' | 'medicine' | 'preventive' | 'mental' | 'chat'

export type PageId = 'home' | FeatureId

export type ThemeMode = 'light' | 'dark'

export type LanguageMode = 'id' | 'en'

export type FeatureConfig = {
  id: FeatureId
  label: string
  navLabel: string
  eyebrow: string
  title: string
  homeTitle: string
  description: string
  longDescription: string
  accent: 'sage' | 'teal' | 'amber' | 'violet' | 'clay'
  icon: LucideIcon
  highlights: string[]
  panelTitle: string
  panelItems: string[]
}

export type AssistantMessage = {
  id: string
  role: 'assistant'
  title: string
  body: string
  points: string[]
  warning?: string
  nextStep: string
  source?: AiResultSource
  relatedUserInput?: string
  handoffSummary?: string
  medicineNote?: string[]
  recoveryPlan?: string[]
  safetyMessage?: string
}

export type UserMessage = {
  id: string
  role: 'user'
  body: string
}

export type ChatMessage = AssistantMessage | UserMessage

export type HandoffSource = 'Gejala' | 'Tanya AI'

export type AiResultSource = 'gemini'

export type SymptomUrgency = 'watch' | 'urgent'

export type SymptomAiInput = {
  symptomText: string
  areas: string[]
  duration: string
  intensity: number
  flags: string[]
  language?: LanguageMode
}

export type SymptomAiResult = {
  source: AiResultSource
  title: string
  summary: string
  urgencyLevel: 'low' | 'medium' | 'high'
  redFlags: string[]
  recommendation: string
  careSteps: string[]
  questionsToTrack: string[]
  doctorVisitAdvice: string[]
  medicineNote: string[]
  recoveryPlan: string[]
  safetyMessage: string
}

export type ChatHistoryItem = {
  role: 'user' | 'assistant'
  text: string
}

export type ChatAiInput = {
  message: string
  history: ChatHistoryItem[]
  language?: LanguageMode
}

export type ChatAiResult = {
  source: AiResultSource
  title: string
  body: string
  points: string[]
  warning?: string
  nextStep: string
  medicineNote: string[]
  recoveryPlan: string[]
  handoffSummary: string
  safetyMessage: string
}

export type SavedMedicineNote = {
  id: string
  source: HandoffSource
  title: string
  context: string
  guidance: string[]
  safety: string
  createdAt: string
}

export type SavedWellnessPlan = {
  id: string
  source: HandoffSource
  title: string
  context: string
  steps: string[]
  createdAt: string
}

export type SavedSymptomRecord = {
  id: string
  title: string
  summary: string
  symptomText: string
  areas: string[]
  duration: string
  intensity: number
  flags: string[]
  urgency: SymptomUrgency
  aiSource: AiResultSource
  recommendation: string
  medicineNote: string[]
  recoveryPlan: string[]
  createdAt: string
}

export type SaveMedicineNoteInput = Omit<SavedMedicineNote, 'id' | 'createdAt'>

export type SaveWellnessPlanInput = Omit<SavedWellnessPlan, 'id' | 'createdAt'>

export type SaveSymptomRecordInput = Omit<SavedSymptomRecord, 'id' | 'createdAt'>

export type RedFlag = {
  id: string
  label: string
}
