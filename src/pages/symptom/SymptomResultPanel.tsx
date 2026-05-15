import { AlertTriangle, ArrowRight, ClipboardCheck, Leaf, Pill, RotateCcw, TimerReset } from 'lucide-react'
import { getUiCopy } from '../../i18n/uiCopy'
import type { LanguageMode, SaveMedicineNoteInput, SymptomAiResult } from '../../types/sehatara'
import { getIntensityLabel } from '../../utils/assistantResponses'

type SymptomResultPanelProps = {
  language: LanguageMode
  hasResult: boolean
  hasWorkspaceContent: boolean
  isUrgent: boolean
  hasChestArea: boolean
  intensity: number
  duration: string
  areaLabel: string
  analysisResult: SymptomAiResult | null
  medicineHandoff: SaveMedicineNoteInput | null
  onClearWorkspace: () => void
  onSaveToMedicine: () => void
  onSaveToWellnessPlan: () => void
}

function SymptomResultPanel({
  language,
  hasResult,
  hasWorkspaceContent,
  isUrgent,
  hasChestArea,
  intensity,
  duration,
  areaLabel,
  analysisResult,
  medicineHandoff,
  onClearWorkspace,
  onSaveToMedicine,
  onSaveToWellnessPlan,
}: SymptomResultPanelProps) {
  const copy = getUiCopy(language).symptom
  const displayTitle = analysisResult?.title ?? getResultTitle(isUrgent, intensity, language)
  const displaySummary = analysisResult?.summary ?? ''
  const displayRecommendation = analysisResult?.recommendation ?? getRecommendation(isUrgent, intensity, language)

  return (
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
          <button className="secondary-button compact-button" onClick={onClearWorkspace} type="button">
            <RotateCcw size={15} />
            {copy.newAnalysis}
          </button>
        )}
      </div>

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
                  <button className="handoff-card medicine" onClick={onSaveToMedicine} type="button">
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

                <button className="handoff-card wellness" onClick={onSaveToWellnessPlan} type="button">
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
  )
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

export default SymptomResultPanel
