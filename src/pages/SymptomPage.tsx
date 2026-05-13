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
import { durationOptions, redFlags, symptomAreas } from '../data/symptomOptions'
import type {
  FeatureConfig,
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

type SymptomPageProps = {
  feature: FeatureConfig
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

const SYMPTOM_WORKSPACE_KEY = 'sehatara-symptom-workspace'

function SymptomPage({
  feature,
  onNavigate,
  onClearSymptomRecords,
  onDeleteSymptomRecord,
  onSaveMedicineNote,
  onSaveSymptomRecord,
  onSaveWellnessPlan,
  savedRecords,
}: SymptomPageProps) {
  const initialWorkspace = useMemo(() => readSymptomWorkspace(), [])
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
  const areaLabel = useMemo(() => formatAreaList(areas), [areas])
  const symptomContext = useMemo(
    () => buildSymptomContext(symptomText, areas, duration, intensity, analysisResult?.summary),
    [analysisResult?.summary, areas, duration, intensity, symptomText],
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
  const hasChestArea = areas.includes('Dada')
  const resultTitle = getResultTitle(isUrgent, intensity)
  const recommendation = getRecommendation(isUrgent, intensity)
  const medicineHandoff = useMemo(
    () => (isUrgent ? null : createMedicineHandoff(areas, symptomContext, intensity, analysisResult)),
    [analysisResult, areas, intensity, isUrgent, symptomContext],
  )
  const wellnessHandoff = useMemo(
    () => createWellnessHandoff(areas, symptomContext, intensity, analysisResult),
    [analysisResult, areas, intensity, symptomContext],
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

    window.localStorage.setItem(SYMPTOM_WORKSPACE_KEY, JSON.stringify(snapshot))
  }, [activeFlags, analysisResult, areas, duration, hasResult, intensity, symptomText])

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
      setFormError('Tulis keluhan sedikit lebih jelas dulu, minimal sekitar satu kalimat pendek.')
      setHasResult(false)
      return
    }

    const input: SymptomAiInput = {
      symptomText: trimmedSymptomText,
      areas,
      duration,
      intensity,
      flags: selectedFlagLabels,
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
      setFormError(getGeminiAnalysisErrorMessage(error))
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
    window.localStorage.removeItem(SYMPTOM_WORKSPACE_KEY)
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
      <PageHero feature={feature} onNavigate={onNavigate} />

      {isUrgent && (
        <section className="urgent-banner" role="alert">
          <AlertTriangle size={18} />
          <span>
            Ada kondisi prioritas yang perlu diperhatikan. Jika keluhan berat, memburuk cepat, atau
            terasa darurat, prioritaskan bantuan medis langsung.
          </span>
        </section>
      )}

      <section className="tool-layout symptom-workspace-layout">
        <aside className="symptom-input-column">
          <div className="interactive-panel symptom-input-panel">
            <div className="workspace-toolbar">
              <div>
                <span className="eyebrow">Cerita gejala</span>
                <h2>Detail singkat</h2>
              </div>
              <div className="toolbar-actions">
                <span className="soft-status">Bukan diagnosis</span>
                {hasWorkspaceContent && (
                  <button
                    aria-label="Bersihkan form dan hasil"
                    className="icon-action quiet-danger"
                    onClick={clearCurrentWorkspace}
                    title="Bersihkan form dan hasil"
                    type="button"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="guided-form compact-guided-form">
              <label className="input-group" htmlFor="symptomText">
                <span>Apa yang kamu rasakan?</span>
                <textarea
                  id="symptomText"
                  onChange={(event) => {
                    setSymptomText(event.target.value)
                    resetAnalysis()
                    if (formError) {
                      setFormError('')
                    }
                  }}
                  placeholder="Contoh: demam sejak kemarin, kepala berat, badan lemas..."
                  rows={4}
                  value={symptomText}
                />
              </label>

              <section>
                <div className="field-heading-row">
                  <span className="field-caption">Area keluhan</span>
                  <span className="mini-pill">{areas.length} dipilih</span>
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
                <span className="field-caption">Durasi</span>
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
                  <span>Tingkat keluhan</span>
                  <strong>{getIntensityLabel(intensity)}</strong>
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
                  <span className="field-caption">Kondisi prioritas</span>
                  <span className="mini-pill quiet">Opsional</span>
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
                {isAnalyzing ? 'Menganalisis dengan Gemini...' : 'Buat rangkuman awal'}
              </button>
            </div>
          </div>

        </aside>

        <section className="side-panel symptom-result-panel">
          <div className="result-toolbar">
            <div className="side-heading">
              <TimerReset size={19} />
              <div>
                <span className="eyebrow">Hasil cepat</span>
                <h3>Rangkuman awal</h3>
              </div>
            </div>

            {hasWorkspaceContent && (
              <button className="secondary-button compact-button" onClick={clearCurrentWorkspace} type="button">
                <RotateCcw size={15} />
                Analisis baru
              </button>
            )}
          </div>

          {savedRecords.length > 0 && (
            <section className="history-strip-panel">
              <div className="history-toolbar">
                <div className="side-heading">
                  <History size={19} />
                  <div>
                    <span className="eyebrow">Riwayat lokal</span>
                    <h3>Rangkuman terakhir</h3>
                  </div>
                </div>
                <div className="history-actions">
                  <button
                    className="text-button compact-button"
                    onClick={() => setShowHistory((current) => !current)}
                    type="button"
                  >
                    {showHistory ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                  <button
                    aria-label="Hapus semua riwayat gejala"
                    className="icon-action quiet-danger"
                    onClick={() => setConfirmClearHistory((current) => !current)}
                    title="Hapus semua riwayat gejala"
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {confirmClearHistory && (
                <div className="history-confirm">
                  <span>Hapus semua riwayat gejala?</span>
                  <button className="text-button compact-button" onClick={() => setConfirmClearHistory(false)} type="button">
                    Batal
                  </button>
                  <button className="primary-button compact-button danger-button" onClick={clearAllHistory} type="button">
                    Hapus
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
                        <small>{formatRecordTime(record.createdAt)}</small>
                        <button
                          aria-label={`Hapus riwayat ${record.title}`}
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
                    <small>Area</small>
                    <b>{areaLabel}</b>
                  </span>
                  <span>
                    <small>Durasi</small>
                    <b>{duration}</b>
                  </span>
                  <span>
                    <small>Intensitas</small>
                    <b>
                      {intensity}/10, {getIntensityLabel(intensity).toLowerCase()}
                    </b>
                  </span>
                </div>

                <div className="result-recommendation">
                  <span>Arahan utama</span>
                  <p>{displayRecommendation}</p>
                </div>

                {analysisResult && (
                  <p className="ai-source-note">
                    Dianalisis dengan Gemini API.
                  </p>
                )}
                {analysisResult?.safetyMessage && (
                  <p className="ai-source-note">{analysisResult.safetyMessage}</p>
                )}

                {analysisResult && (
                  <div className="ai-detail-grid">
                    <section>
                      <span>Langkah 24 jam</span>
                      <ol>
                        {analysisResult.careSteps.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ol>
                    </section>

                    <section>
                      <span>Pantau berikutnya</span>
                      <ol>
                        {analysisResult.questionsToTrack.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ol>
                    </section>

                    <section>
                      <span>Kapan cari bantuan</span>
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
                          <strong>Simpan ke Catatan Obat</strong>
                          <small>Buat catatan obat umum yang aman untuk dipelajari.</small>
                        </span>
                        <ArrowRight size={17} />
                      </button>
                    ) : (
                      <article className="handoff-card quiet">
                        <AlertTriangle size={19} />
                        <span>
                          <strong>Obat bukan langkah utama</strong>
                          <small>
                            {hasChestArea
                              ? 'Karena ada keluhan dada, lebih aman fokus pada pemantauan dan konsultasi bila berlanjut.'
                              : 'Untuk kondisi ini, ikuti arahan Gemini dan pantau perubahan keluhan terlebih dahulu.'}
                          </small>
                        </span>
                      </article>
                    )}

                    <button className="handoff-card wellness" onClick={saveToWellnessPlan} type="button">
                      <Leaf size={19} />
                      <span>
                        <strong>Simpan ke Rencana Pulih</strong>
                        <small>
                          {intensity <= 3
                            ? 'Cocok kalau keluhan ringan dan lebih perlu dipantau.'
                            : 'Tambahkan langkah kecil sambil memantau perubahan.'}
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
                <strong>Hasil analisis akan muncul di sini</strong>
                <p>
                  Isi detail singkat di panel kiri. Setelah dianalisis Gemini, area ini akan
                  menyimpan rangkuman terakhir meski kamu pindah ke fitur lain.
                </p>
              </div>
            </div>
          )}
        </section>

        <div className="symptom-focus-slot">
          <FocusPanel feature={feature} />
        </div>
      </section>
    </main>
  )
}

function readSymptomWorkspace(): SymptomWorkspaceSnapshot {
  const fallback: SymptomWorkspaceSnapshot = {
    symptomText: '',
    duration: durationOptions[0],
    areas: [symptomAreas[0]],
    intensity: 4,
    activeFlags: [],
    hasResult: false,
    analysisResult: null,
  }
  const stored = window.localStorage.getItem(SYMPTOM_WORKSPACE_KEY)

  if (!stored) {
    return fallback
  }

  try {
    const parsed = JSON.parse(stored) as Partial<SymptomWorkspaceSnapshot>
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
  } catch {
    return fallback
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
  summary?: string,
) {
  const detail = summary?.trim() || symptomText.trim() || 'Detail gejala belum ditulis.'
  return `${detail} Area: ${formatAreaList(areas)}. Durasi: ${duration}. Tingkat keluhan: ${intensity}/10.`
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

function getResultTitle(isUrgent: boolean, intensity: number) {
  if (isUrgent) {
    return 'Perlu perhatian lebih'
  }

  if (intensity <= 3) {
    return 'Keluhan ringan, tetap pantau'
  }

  return 'Masih bisa dipantau dengan hati-hati'
}

function getRecommendation(isUrgent: boolean, intensity: number) {
  if (isUrgent) {
    return 'Karena ada kondisi prioritas atau keluhan tinggi, sebaiknya cari bantuan medis lebih cepat.'
  }

  if (intensity <= 3) {
    return 'Pantau perubahan keluhan, jaga istirahat, dan catat bila ada gejala baru.'
  }

  return 'Pantau perubahan keluhan dan cari bantuan medis jika memburuk, berlangsung lama, atau muncul kondisi prioritas.'
}

function formatAreaList(areas: string[]) {
  const cleanAreas = areas.map((item) => item.trim()).filter(Boolean)

  if (cleanAreas.length === 0) {
    return 'Area belum dipilih'
  }

  if (cleanAreas.length === 1) {
    return cleanAreas[0]
  }

  if (cleanAreas.length === 2) {
    return `${cleanAreas[0]} dan ${cleanAreas[1]}`
  }

  return `${cleanAreas.slice(0, -1).join(', ')}, dan ${cleanAreas[cleanAreas.length - 1]}`
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

function formatRecordTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Baru disimpan'
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function createMedicineHandoff(
  areas: string[],
  context: string,
  intensity: number,
  analysis?: SymptomAiResult | null,
): SaveMedicineNoteInput | null {
  if (areas.includes('Dada')) {
    return null
  }

  const areaLabel = formatAreaList(areas).toLowerCase()
  const guidance =
    analysis?.medicineNote && analysis.medicineNote.length > 0
      ? analysis.medicineNote
      : [
          'Pelajari kategori obat bebas yang sesuai keluhan, bukan langsung memilih merek tertentu.',
          'Cek label: aturan pakai, peringatan, kontraindikasi, interaksi, dan kedaluwarsa.',
          intensity >= 6
            ? 'Karena keluhan cukup terasa, siapkan pertanyaan untuk apoteker atau dokter sebelum memakai obat.'
            : 'Kalau keluhan ringan, pertimbangkan dulu pemantauan dan perawatan mandiri sederhana.',
        ]

  return {
    source: 'Gejala',
    title: `Catatan obat umum untuk keluhan ${areaLabel}`,
    context,
    guidance,
    safety:
      analysis?.safetyMessage ||
      'Sehatara tidak memberi dosis personal, resep, atau instruksi mengganti obat dokter.',
  }
}

function createWellnessHandoff(
  areas: string[],
  context: string,
  intensity: number,
  analysis?: SymptomAiResult | null,
): SaveWellnessPlanInput {
  const firstStep =
    intensity <= 3
      ? 'Pantau keluhan hari ini dan catat apakah membaik, menetap, atau bertambah.'
      : 'Kurangi aktivitas berat sementara dan pantau apakah keluhan memburuk.'
  const steps =
    analysis?.recoveryPlan && analysis.recoveryPlan.length > 0
      ? analysis.recoveryPlan
      : [
          firstStep,
          'Cukupi minum, makan ringan bila memungkinkan, dan istirahat secukupnya.',
          'Cari bantuan medis bila muncul kondisi prioritas, keluhan makin berat, atau berlangsung lama.',
        ]

  return {
    source: 'Gejala',
    title: `Rencana ringan untuk keluhan ${formatAreaList(areas).toLowerCase()}`,
    context,
    steps,
  }
}

export default SymptomPage
