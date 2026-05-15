import { Check, RotateCcw } from 'lucide-react'
import type { getSymptomOptions } from '../../data/symptomOptions'
import { getUiCopy } from '../../i18n/uiCopy'
import type { LanguageMode } from '../../types/sehatara'
import { getIntensityLabel } from '../../utils/assistantResponses'

type SymptomInputFormProps = {
  language: LanguageMode
  symptomText: string
  areas: string[]
  duration: string
  intensity: number
  activeFlags: string[]
  formError: string
  isAnalyzing: boolean
  hasWorkspaceContent: boolean
  symptomOptions: ReturnType<typeof getSymptomOptions>
  onSymptomTextChange: (value: string) => void
  onAreaToggle: (area: string) => void
  onDurationChange: (duration: string) => void
  onIntensityChange: (intensity: number) => void
  onFlagToggle: (flagId: string) => void
  onAnalyze: () => void
  onClear: () => void
}

function SymptomInputForm({
  language,
  symptomText,
  areas,
  duration,
  intensity,
  activeFlags,
  formError,
  isAnalyzing,
  hasWorkspaceContent,
  symptomOptions,
  onSymptomTextChange,
  onAreaToggle,
  onDurationChange,
  onIntensityChange,
  onFlagToggle,
  onAnalyze,
  onClear,
}: SymptomInputFormProps) {
  const copy = getUiCopy(language).symptom
  const { durationOptions, redFlags, symptomAreas } = symptomOptions

  return (
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
                onClick={onClear}
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
              onChange={(event) => onSymptomTextChange(event.target.value)}
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
                    onClick={() => onAreaToggle(item)}
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
                  onClick={() => onDurationChange(item)}
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
              aria-label={copy.intensity}
              max="10"
              min="1"
              onChange={(event) => onIntensityChange(Number(event.target.value))}
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
                    onClick={() => onFlagToggle(flag.id)}
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
            onClick={onAnalyze}
            type="button"
          >
            {isAnalyzing ? copy.analyzing : copy.createSummary}
          </button>
        </div>
      </div>
    </aside>
  )
}

export default SymptomInputForm
