import {
  AlertTriangle,
  ArrowRight,
  Check,
  ClipboardCheck,
  History,
  Leaf,
  Pill,
  RotateCcw,
  TimerReset,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import FocusPanel from '../components/common/FocusPanel'
import PageHero from '../components/common/PageHero'
import { getSymptomOptions } from '../data/symptomOptions'
import { getUiCopy } from '../i18n/uiCopy'
import type {
  FeatureConfig,
  LanguageMode,
  PageId,
  SaveMedicineNoteInput,
  SavedSymptomRecord,
  SaveSymptomRecordInput,
  SaveWellnessPlanInput,
  SymptomAiInput,
  SymptomAiResult,
} from '../types/sehatara'
import { analyzeSymptom, getGeminiAnalysisErrorMessage } from '../utils/geminiSymptomAnalysis'
import { getIntensityLabel } from '../utils/assistantResponses'
import { formatShortDateTime } from '../utils/dateTime'
import { readStorageValue, removeStorageValue, storageKeys, writeStorageValue } from '../utils/storage'

type SymptomPageProps = {
  feature: FeatureConfig
  language: LanguageMode
  onNavigate: (page: PageId) => void
  onClearSymptomRecords: () => void
  onDeleteSymptomRecord: (id: string) => void
  onSaveMedicineNote: (note: SaveMedicineNoteInput) => void
  onSaveSymptomRecord: (record: SaveSymptomRecordInput) => void
  onSaveWellnessPlan: (plan: SaveWellnessPlanInput) => void
  savedRecords: SavedSymptomRecord[]
}

type SymptomWorkspaceSnapshot = {
  symptomText: string
  duration: string
  areas: string[]
  intensity: number
  activeFlags: string[]
  hasResult: boolean
  analysisResult: SymptomAiResult | null
}

function SymptomPage({
  feature,
  language,
  onNavigate,
  onClearSymptomRecords,
  onDeleteSymptomRecord,
  onSaveMedicineNote,
  onSaveSymptomRecord,
  onSaveWellnessPlan,
  savedRecords,
}: SymptomPageProps) {
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
  const [showHistory, setShowHistory] = useState(true)
  const [confirmClearHistory, setConfirmClearHistory] = useState(false)

  const trimmedSymptomText = symptomText.trim()
  const areaLabel = useMemo(() => formatAreaList(areas, language), [areas, language])
  const symptomContext = useMemo(
    () => buildSymptomContext(symptomText, areas, duration, intensity, language, analysisResult?.summary),
    [analysisResult?.summary, areas, duration, intensity, language, symptomText],
  )
  const selectedFlags = useMemo(
    () => redFlags.filter((flag) => activeFlags.includes(flag.id)),
    [activeFlags],
  )
  const selectedFlagLabels = useMemo(
    () => selectedFlags.map((flag) => flag.label),
    [selectedFlags],
  )
  const localUrgent = selectedFlags.length > 0 || intensity >= 8
  const isUrgent = localUrgent || analysisResult?.urgencyLevel === 'high'
  const hasChestArea = areas.includes('Dada') || areas.includes('Chest')
  const resultTitle = getResultTitle(isUrgent, intensity, language)
  const recommendation = getRecommendation(isUrgent, intensity, language)
  const medicineHandoff = useMemo(
    () => (isUrgent ? null : createMedicineHandoff(areas, symptomContext, intensity, analysisResult, language)),
    [analysisResult, areas, intensity, isUrgent, language, symptomContext],
  )
  const wellnessHandoff = useMemo(
    () => createWellnessHandoff(areas, symptomContext, intensity, analysisResult, language),
    [analysisResult, areas, intensity, language, symptomContext],
  )
  const displayTitle = analysisResult?.title ?? resultTitle
  const displaySummary = analysisResult?.summary ?? trimmedSymptomText
  const displayRecommendation = analysisResult?.recommendation ?? recommendation
  const hasWorkspaceContent = Boolean(trimmedSymptomText || analysisResult || activeFlags.length > 0)

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

  async function createResult() {
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
      onSaveSymptomRecord(createSymptomRecord(input, analysis, urgentFromAnalysis))
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

  function resetAnalysis() {
    setAnalysisResult(null)
    setHasResult(false)
  }

  function clearCurrentWorkspace() {
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

  function clearAllHistory() {
    onClearSymptomRecords()
    setConfirmClearHistory(false)
  }

  function saveToMedicine() {
    if (!medicineHandoff) {
      return
    }

    onSaveMedicineNote(medicineHandoff)
    onNavigate('medicine')
  }

  function saveToWellnessPlan() {
    onSaveWellnessPlan(wellnessHandoff)
    onNavigate('preventive')
  }

  return (
    <main className="feature-page symptom-page" data-accent={feature.accent}>
      <PageHero feature={feature} language={language} onNavigate={onNavigate} />

      {isUrgent && (
        <section className="urgent-banner" role="alert">
          <AlertTriangle size={18} />
          <span>{copy.urgentBanner}</span>
        </section>
      )}

      <section className="tool-layout symptom-workspace-layout">
        <aside className="symptom-input-column">
          <div className="interactive-panel symptom-input-panel">
            <div className="workspace-toolbar">
              <div>
                <span className="eyebrow">{copy.storyEyebrow}</span>
                <h2>{copy.storyTitle}</h2>
              </div>
              <div className="toolbar-actions">
                <span className="soft-status">{copy.notDiagnosis}</span>
                {hasWorkspaceContent && (
                  <button
                    aria-label={copy.clearTitle}
                    className="icon-action quiet-danger"
                    onClick={clearCurrentWorkspace}
                    title={copy.clearTitle}
                    type="button"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="guided-form compact-guided-form">
              <label className="input-group" htmlFor="symptomText">
                <span>{copy.whatFeel}</span>
                <textarea
                  id="symptomText"
                  onChange={(event) => {
                    setSymptomText(event.target.value)
                    resetAnalysis()
                    if (formError) {
                      setFormError('')
                    }
                  }}
                  placeholder={copy.symptomPlaceholder}
                  rows={4}
                  value={symptomText}
                />
              </label>

              <section>
                <div className="field-heading-row">
                  <span className="field-caption">{copy.area}</span>
                  <span className="mini-pill">{areas.length} {copy.selected}</span>
                </div>
                <div className="option-grid compact">
                  {symptomAreas.map((item) => {
                    const active = areas.includes(item)

                    return (
                      <button
                        aria-pressed={active}
                        className={active ? 'option-chip active' : 'option-chip'}
                        key={item}
                        onClick={() => toggleArea(item)}
                        type="button"
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>
              </section>

              <section>
                <span className="field-caption">{copy.duration}</span>
                <div className="option-grid compact">
                  {durationOptions.map((item) => (
                    <button
                      className={duration === item ? 'option-chip active' : 'option-chip'}
                      key={item}
                      onClick={() => {
                        setDuration(item)
                        resetAnalysis()
                      }}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </section>

              <div className="range-field roomy">
                <div>
                  <span>{copy.intensity}</span>
                  <strong>{getIntensityLabel(intensity, language)}</strong>
                </div>
                <input
                  aria-label="Tingkat keluhan"
                  max="10"
                  min="1"
                  onChange={(event) => {
                    setIntensity(Number(event.target.value))
                    resetAnalysis()
                  }}
                  type="range"
                  value={intensity}
                />
              </div>

              <section>
                <div className="field-heading-row">
                  <span className="field-caption">{copy.priority}</span>
                  <span className="mini-pill quiet">{copy.optional}</span>
                </div>
                <div className="flag-grid">
                  {redFlags.map((flag) => {
                    const active = activeFlags.includes(flag.id)

                    return (
                      <button
                        className={active ? 'danger-chip active' : 'danger-chip'}
                        key={flag.id}
                        onClick={() => toggleFlag(flag.id)}
                        type="button"
                      >
                        <span>{active && <Check size={13} />}</span>
                        {flag.label}
                      </button>
                    )
                  })}
                </div>
              </section>

              {formError && <p className="form-alert">{formError}</p>}

              <button
                className="primary-button full-width"
                disabled={isAnalyzing}
                onClick={createResult}
                type="button"
              >
                {isAnalyzing ? copy.analyzing : copy.createSummary}
              </button>
            </div>
          </div>

        </aside>

        <section className="side-panel symptom-result-panel">
          <div className="result-toolbar">
            <div className="side-heading">
              <TimerReset size={19} />
              <div>
                <span className="eyebrow">{copy.resultEyebrow}</span>
                <h3>{copy.resultTitle}</h3>
              </div>
            </div>

            {hasWorkspaceContent && (
              <button className="secondary-button compact-button" onClick={clearCurrentWorkspace} type="button">
                <RotateCcw size={15} />
                {copy.newAnalysis}
              </button>
            )}
          </div>

          {savedRecords.length > 0 && (
            <section className="history-strip-panel">
              <div className="history-toolbar">
                <div className="side-heading">
                  <History size={19} />
                  <div>
                    <span className="eyebrow">{copy.historyEyebrow}</span>
                    <h3>{copy.historyTitle}</h3>
                  </div>
                </div>
                <div className="history-actions">
                  <button
                    className="text-button compact-button"
                    onClick={() => setShowHistory((current) => !current)}
                    type="button"
                  >
                    {showHistory ? copy.hide : copy.show}
                  </button>
                  <button
                    aria-label={copy.deleteAllHistory}
                    className="icon-action quiet-danger"
                    onClick={() => setConfirmClearHistory((current) => !current)}
                    title={copy.deleteAllHistory}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {confirmClearHistory && (
                <div className="history-confirm">
                  <span>{copy.confirmClear}</span>
                  <button className="text-button compact-button" onClick={() => setConfirmClearHistory(false)} type="button">
                    {copy.cancel}
                  </button>
                  <button className="primary-button compact-button danger-button" onClick={clearAllHistory} type="button">
                    {copy.delete}
                  </button>
                </div>
              )}

              {showHistory && (
                <div className="history-list compact-history-list">
                  {savedRecords.slice(0, 4).map((record) => (
                    <article className="history-item" key={record.id}>
                      <div>
                        <strong>{record.title}</strong>
                        <span>
                          {formatRecordAreas(record)} - {record.duration} - {record.intensity}/10
                        </span>
                      </div>
                      <div className="history-item-footer">
                        <small>{formatShortDateTime(record.createdAt, copy.recordTimeFallback)}</small>
                        <button
                          aria-label={`${copy.deleteRecordLabel} ${record.title}`}
                          className="icon-action tiny-danger"
                          onClick={() => onDeleteSymptomRecord(record.id)}
                          type="button"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {hasResult ? (
            <div className="result-card readable-result large-result-card">
              <ClipboardCheck size={22} />
              <div>
                <div className="result-heading-copy">
                  <span className="source-pill">Gemini API</span>
                  <strong>{displayTitle}</strong>
                </div>

                <p className="result-summary-text">{displaySummary}</p>

                <div className="result-meta-row">
                  <span>
                    <small>{copy.areaMeta}</small>
                    <b>{areaLabel}</b>
                  </span>
                  <span>
                    <small>{copy.durationMeta}</small>
                    <b>{duration}</b>
                  </span>
                  <span>
                    <small>{copy.intensityMeta}</small>
                    <b>
                      {intensity}/10, {getIntensityLabel(intensity, language).toLowerCase()}
                    </b>
                  </span>
                </div>

                <div className="result-recommendation">
                  <span>{copy.mainAdvice}</span>
                  <p>{displayRecommendation}</p>
                </div>

                {analysisResult && (
                  <p className="ai-source-note">
                    {copy.geminiSource}
                  </p>
                )}
                {analysisResult?.safetyMessage && (
                  <p className="ai-source-note">{analysisResult.safetyMessage}</p>
                )}

                {analysisResult && (
                  <div className="ai-detail-grid">
                    <section>
                      <span>{copy.careSteps}</span>
                      <ol>
                        {analysisResult.careSteps.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ol>
                    </section>

                    <section>
                      <span>{copy.trackNext}</span>
                      <ol>
                        {analysisResult.questionsToTrack.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ol>
                    </section>

                    <section>
                      <span>{copy.seekHelp}</span>
                      <ol>
                        {analysisResult.doctorVisitAdvice.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ol>
                    </section>
                  </div>
                )}

                {!isUrgent && (
                  <div className="handoff-grid">
                    {medicineHandoff ? (
                      <button className="handoff-card medicine" onClick={saveToMedicine} type="button">
                        <Pill size={19} />
                        <span>
                          <strong>{copy.saveMedicine}</strong>
                          <small>{copy.saveMedicineHint}</small>
                        </span>
                        <ArrowRight size={17} />
                      </button>
                    ) : (
                      <article className="handoff-card quiet">
                        <AlertTriangle size={19} />
                        <span>
                          <strong>{copy.medicineNotMain}</strong>
                          <small>
                            {hasChestArea
                              ? copy.chestMedicineHint
                              : copy.medicineQuietHint}
                          </small>
                        </span>
                      </article>
                    )}

                    <button className="handoff-card wellness" onClick={saveToWellnessPlan} type="button">
                      <Leaf size={19} />
                      <span>
                        <strong>{copy.savePlan}</strong>
                        <small>
                          {intensity <= 3
                            ? copy.savePlanLight
                            : copy.savePlanDefault}
                        </small>
                      </span>
                      <ArrowRight size={17} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-result-state">
              <ClipboardCheck size={26} />
              <div>
                <strong>{copy.emptyTitle}</strong>
                <p>{copy.emptyBody}</p>
              </div>
            </div>
          )}
        </section>

        <div className="symptom-focus-slot">
          <FocusPanel feature={feature} language={language} />
        </div>
      </section>
    </main>
  )
}

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

function getResultTitle(isUrgent: boolean, intensity: number, language: LanguageMode) {
  const copy = getUiCopy(language).symptom

  if (isUrgent) {
    return copy.urgentTitle
  }

  if (intensity <= 3) {
    return copy.lightTitle
  }

  return copy.watchTitle
}

function getRecommendation(isUrgent: boolean, intensity: number, language: LanguageMode) {
  const copy = getUiCopy(language).symptom

  if (isUrgent) {
    return copy.urgentRecommendation
  }

  if (intensity <= 3) {
    return copy.lightRecommendation
  }

  return copy.watchRecommendation
}

function formatAreaList(areas: string[], language: LanguageMode = 'id') {
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

function formatRecordAreas(record: SavedSymptomRecord) {
  const legacyRecord = record as SavedSymptomRecord & { area?: string }
  const recordAreas = Array.isArray(legacyRecord.areas) && legacyRecord.areas.length > 0
    ? legacyRecord.areas
    : legacyRecord.area
      ? [legacyRecord.area]
      : []

  return formatAreaList(recordAreas)
}

function createMedicineHandoff(
  areas: string[],
  context: string,
  intensity: number,
  analysis?: SymptomAiResult | null,
  language: LanguageMode = 'id',
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
  analysis?: SymptomAiResult | null,
  language: LanguageMode = 'id',
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

export default SymptomPage
