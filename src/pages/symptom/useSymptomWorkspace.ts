import { useEffect, useMemo, useState } from 'react'
import { getSymptomOptions } from '../../data/symptomOptions'
import { getUiCopy } from '../../i18n/uiCopy'
import type {
  LanguageMode,
  SaveMedicineNoteInput,
  SaveSymptomRecordInput,
  SaveWellnessPlanInput,
  SymptomAiInput,
  SymptomAiResult,
} from '../../types/sehatara'
import { analyzeSymptom, getGeminiAnalysisErrorMessage } from '../../utils/geminiSymptomAnalysis'
import { readStorageValue, removeStorageValue, storageKeys, writeStorageValue } from '../../utils/storage'

type SymptomWorkspaceSnapshot = {
  symptomText: string
  duration: string
  areas: string[]
  intensity: number
  activeFlags: string[]
  hasResult: boolean
  analysisResult: SymptomAiResult | null
}

export function useSymptomWorkspace(language: LanguageMode) {
  const copy = getUiCopy(language).symptom
  const symptomOptions = useMemo(() => getSymptomOptions(language), [language])
  const { durationOptions, redFlags, symptomAreas } = symptomOptions
  const initialWorkspace = useMemo(() => readSymptomWorkspace(symptomOptions), [])
  const [symptomText, setSymptomText] = useState(initialWorkspace.symptomText)
  const [duration, setDuration] = useState(initialWorkspace.duration)
  const [areas, setAreas] = useState<string[]>(initialWorkspace.areas)
  const [intensity, setIntensity] = useState(initialWorkspace.intensity)
  const [activeFlags, setActiveFlags] = useState<string[]>(initialWorkspace.activeFlags)
  const [hasResult, setHasResult] = useState(initialWorkspace.hasResult)
  const [formError, setFormError] = useState('')
  const [analysisResult, setAnalysisResult] = useState<SymptomAiResult | null>(
    initialWorkspace.analysisResult,
  )
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const trimmedSymptomText = symptomText.trim()
  const areaLabel = useMemo(() => formatAreaList(areas, language), [areas, language])
  const symptomContext = useMemo(
    () => buildSymptomContext(symptomText, areas, duration, intensity, language, analysisResult?.summary),
    [analysisResult?.summary, areas, duration, intensity, language, symptomText],
  )
  const selectedFlags = useMemo(
    () => redFlags.filter((flag) => activeFlags.includes(flag.id)),
    [activeFlags, redFlags],
  )
  const selectedFlagLabels = useMemo(
    () => selectedFlags.map((flag) => flag.label),
    [selectedFlags],
  )
  const localUrgent = selectedFlags.length > 0 || intensity >= 8
  const isUrgent = localUrgent || analysisResult?.urgencyLevel === 'high'
  const hasChestArea = areas.includes('Dada') || areas.includes('Chest')
  const hasWorkspaceContent = Boolean(trimmedSymptomText || analysisResult || activeFlags.length > 0)

  const medicineHandoff = useMemo(
    () => (isUrgent ? null : createMedicineHandoff(areas, symptomContext, intensity, analysisResult, language)),
    [analysisResult, areas, intensity, isUrgent, language, symptomContext],
  )
  const wellnessHandoff = useMemo(
    () => createWellnessHandoff(areas, symptomContext, intensity, analysisResult, language),
    [analysisResult, areas, intensity, language, symptomContext],
  )

  useEffect(() => {
    const snapshot: SymptomWorkspaceSnapshot = {
      symptomText,
      duration,
      areas,
      intensity,
      activeFlags,
      hasResult,
      analysisResult,
    }

    writeStorageValue(storageKeys.symptomWorkspace, snapshot)
  }, [activeFlags, analysisResult, areas, duration, hasResult, intensity, symptomText])

  useEffect(() => {
    setDuration((current) => (durationOptions.includes(current) ? current : durationOptions[0]))
    setAreas((current) => {
      const validAreas = current.filter((item) => symptomAreas.includes(item))
      return validAreas.length > 0 ? validAreas : [symptomAreas[0]]
    })
  }, [durationOptions, symptomAreas])

  function resetAnalysis() {
    setAnalysisResult(null)
    setHasResult(false)
  }

  function toggleArea(item: string) {
    resetAnalysis()
    setAreas((current) => {
      if (current.includes(item)) {
        return current.length > 1 ? current.filter((areaItem) => areaItem !== item) : current
      }

      return [...current, item]
    })
  }

  function toggleFlag(flagId: string) {
    resetAnalysis()
    setActiveFlags((current) =>
      current.includes(flagId)
        ? current.filter((item) => item !== flagId)
        : [...current, flagId],
    )
  }

  function updateSymptomText(value: string) {
    setSymptomText(value)
    resetAnalysis()
    if (formError) {
      setFormError('')
    }
  }

  function updateDuration(value: string) {
    setDuration(value)
    resetAnalysis()
  }

  function updateIntensity(value: number) {
    setIntensity(value)
    resetAnalysis()
  }

  async function runAnalysis(
    onSaveRecord: (record: SaveSymptomRecordInput) => void,
  ) {
    if (trimmedSymptomText.length < 12) {
      setFormError(copy.minError)
      setHasResult(false)
      return
    }

    const input: SymptomAiInput = {
      symptomText: trimmedSymptomText,
      areas,
      duration,
      intensity,
      flags: selectedFlagLabels,
      language,
    }

    setIsAnalyzing(true)
    setFormError('')
    setAnalysisResult(null)
    setHasResult(false)

    try {
      const analysis = await analyzeSymptom(input)
      const urgentFromAnalysis = localUrgent || analysis.urgencyLevel === 'high'

      setAnalysisResult(analysis)
      onSaveRecord(createSymptomRecord(input, analysis, urgentFromAnalysis))
      setFormError('')
      setHasResult(true)
    } catch (error) {
      setFormError(getGeminiAnalysisErrorMessage(error, language))
      setAnalysisResult(null)
      setHasResult(false)
    } finally {
      setIsAnalyzing(false)
    }
  }

  function clearWorkspace() {
    setSymptomText('')
    setDuration(durationOptions[0])
    setAreas([symptomAreas[0]])
    setIntensity(4)
    setActiveFlags([])
    setAnalysisResult(null)
    setHasResult(false)
    setFormError('')
    removeStorageValue(storageKeys.symptomWorkspace)
  }

  return {
    symptomText,
    trimmedSymptomText,
    duration,
    areas,
    intensity,
    activeFlags,
    hasResult,
    formError,
    analysisResult,
    isAnalyzing,
    isUrgent,
    hasChestArea,
    hasWorkspaceContent,
    areaLabel,
    symptomContext,
    medicineHandoff,
    wellnessHandoff,
    symptomOptions,

    updateSymptomText,
    updateDuration,
    updateIntensity,
    toggleArea,
    toggleFlag,
    runAnalysis,
    clearWorkspace,
  }
}

// ─── Pure helpers ────────────────────────────────────────────────

export function formatAreaList(areas: string[], language: LanguageMode = 'id') {
  const cleanAreas = areas.map((item) => item.trim()).filter(Boolean)

  if (cleanAreas.length === 0) {
    return getUiCopy(language).symptom.noArea
  }

  if (cleanAreas.length === 1) {
    return cleanAreas[0]
  }

  if (cleanAreas.length === 2) {
    return language === 'en' ? `${cleanAreas[0]} and ${cleanAreas[1]}` : `${cleanAreas[0]} dan ${cleanAreas[1]}`
  }

  return language === 'en'
    ? `${cleanAreas.slice(0, -1).join(', ')}, and ${cleanAreas[cleanAreas.length - 1]}`
    : `${cleanAreas.slice(0, -1).join(', ')}, dan ${cleanAreas[cleanAreas.length - 1]}`
}

function buildSymptomContext(
  symptomText: string,
  areas: string[],
  duration: string,
  intensity: number,
  language: LanguageMode,
  summary?: string,
) {
  const copy = getUiCopy(language).symptom.handoff
  const detail = summary?.trim() || symptomText.trim() || copy.noDetail

  return `${detail} ${copy.area}: ${formatAreaList(areas, language)}. ${copy.duration}: ${duration}. ${copy.intensity}: ${intensity}/10.`
}

function createSymptomRecord(
  input: SymptomAiInput,
  analysis: SymptomAiResult,
  isUrgent: boolean,
): SaveSymptomRecordInput {
  return {
    title: analysis.title,
    summary: analysis.summary,
    symptomText: input.symptomText,
    areas: input.areas,
    duration: input.duration,
    intensity: input.intensity,
    flags: input.flags,
    urgency: isUrgent ? 'urgent' : 'watch',
    aiSource: analysis.source,
    recommendation: analysis.recommendation,
    medicineNote: analysis.medicineNote,
    recoveryPlan: analysis.recoveryPlan,
  }
}

function createMedicineHandoff(
  areas: string[],
  context: string,
  intensity: number,
  analysis: SymptomAiResult | null,
  language: LanguageMode,
): SaveMedicineNoteInput | null {
  if (areas.includes('Dada') || areas.includes('Chest')) {
    return null
  }

  const copy = getUiCopy(language).symptom.handoff
  const areaLabel = formatAreaList(areas, language).toLowerCase()
  const guidance =
    analysis?.medicineNote && analysis.medicineNote.length > 0
      ? analysis.medicineNote
      : [
          copy.medicineFallback[0],
          copy.medicineFallback[1],
          intensity >= 6
            ? copy.medicineFallbackHigh
            : copy.medicineFallback[2],
        ]

  return {
    source: 'Gejala',
    title: `${copy.medicineTitlePrefix} ${areaLabel}`,
    context,
    guidance,
    safety:
      analysis?.safetyMessage ||
      copy.medicineSafety,
  }
}

function createWellnessHandoff(
  areas: string[],
  context: string,
  intensity: number,
  analysis: SymptomAiResult | null,
  language: LanguageMode,
): SaveWellnessPlanInput {
  const copy = getUiCopy(language).symptom.handoff
  const firstStep =
    intensity <= 3
      ? copy.firstStepLight
      : copy.firstStepDefault
  const steps =
    analysis?.recoveryPlan && analysis.recoveryPlan.length > 0
      ? analysis.recoveryPlan
      : [
          firstStep,
          copy.recoveryFallback[0],
          copy.recoveryFallback[1],
        ]

  return {
    source: 'Gejala',
    title: `${copy.planTitlePrefix} ${formatAreaList(areas, language).toLowerCase()}`,
    context,
    steps,
  }
}

// ─── localStorage restore ────────────────────────────────────────

function readSymptomWorkspace(options: ReturnType<typeof getSymptomOptions>): SymptomWorkspaceSnapshot {
  const { durationOptions, symptomAreas } = options
  const fallback: SymptomWorkspaceSnapshot = {
    symptomText: '',
    duration: durationOptions[0],
    areas: [symptomAreas[0]],
    intensity: 4,
    activeFlags: [],
    hasResult: false,
    analysisResult: null,
  }

  return readStorageValue(storageKeys.symptomWorkspace, fallback, (value) =>
    normalizeSymptomWorkspace(value, fallback, options),
  )
}

function normalizeSymptomWorkspace(
  value: unknown,
  fallback: SymptomWorkspaceSnapshot,
  options: ReturnType<typeof getSymptomOptions>,
): SymptomWorkspaceSnapshot | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const { durationOptions, redFlags, symptomAreas } = options
  const parsed = value as Partial<SymptomWorkspaceSnapshot>
  const storedAreas = Array.isArray(parsed.areas)
    ? parsed.areas.filter((item): item is string => symptomAreas.includes(item))
    : []
  const storedFlags = Array.isArray(parsed.activeFlags)
    ? parsed.activeFlags.filter((item): item is string =>
        redFlags.some((flag) => flag.id === item),
      )
    : []
  const storedAnalysis = isSymptomAiResult(parsed.analysisResult)
    ? parsed.analysisResult
    : null

  return {
    symptomText: typeof parsed.symptomText === 'string' ? parsed.symptomText : fallback.symptomText,
    duration:
      typeof parsed.duration === 'string' && durationOptions.includes(parsed.duration)
        ? parsed.duration
        : fallback.duration,
    areas: storedAreas.length > 0 ? storedAreas : fallback.areas,
    intensity:
      typeof parsed.intensity === 'number' && parsed.intensity >= 1 && parsed.intensity <= 10
        ? parsed.intensity
        : fallback.intensity,
    activeFlags: storedFlags,
    hasResult: Boolean(parsed.hasResult && storedAnalysis),
    analysisResult: storedAnalysis,
  }
}

function isSymptomAiResult(value: unknown): value is SymptomAiResult {
  if (!value || typeof value !== 'object') {
    return false
  }

  const result = value as Partial<SymptomAiResult>
  const validUrgency =
    result.urgencyLevel === 'low' || result.urgencyLevel === 'medium' || result.urgencyLevel === 'high'

  return Boolean(
    result.source === 'gemini' &&
      typeof result.title === 'string' &&
      typeof result.summary === 'string' &&
      validUrgency &&
      isStringList(result.redFlags) &&
      typeof result.recommendation === 'string' &&
      isStringList(result.careSteps) &&
      isStringList(result.questionsToTrack) &&
      isStringList(result.doctorVisitAdvice) &&
      isStringList(result.medicineNote) &&
      isStringList(result.recoveryPlan) &&
      typeof result.safetyMessage === 'string',
  )
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}
