import { CalendarDays, Check, CheckCircle2, History, RotateCcw, Trash2 } from 'lucide-react'
import { formatHandoffSource, getUiCopy } from '../../i18n/uiCopy'
import type { LanguageMode, SavedWellnessPlan } from '../../types/sehatara'
import type { WellnessPlanProgress } from './usePreventiveWorkspace'

type PreventiveSavedPlansPanelProps = {
  language: LanguageMode
  savedPlans: SavedWellnessPlan[]
  weeklyRhythm: string[]
  showSavedPlans: boolean
  confirmClearPlans: boolean
  latestSavedPlan: SavedWellnessPlan | undefined
  activeSavedPlan: SavedWellnessPlan | undefined
  activeSavedPlanProgress: WellnessPlanProgress
  activePlanCompletedSteps: number
  activePlanCompletedDays: number
  planProgressById: Record<string, WellnessPlanProgress>
  onToggleShowPlans: () => void
  onToggleConfirmClear: () => void
  onCancelConfirmClear: () => void
  onOpenPlan: (planId: string) => void
  onDeletePlan: (planId: string) => void
  onClearAllPlans: () => void
  onToggleStep: (planId: string, step: string) => void
  onToggleDay: (planId: string, day: string) => void
  onResetProgress: (planId: string) => void
}

function PreventiveSavedPlansPanel({
  language,
  savedPlans,
  weeklyRhythm,
  showSavedPlans,
  confirmClearPlans,
  latestSavedPlan,
  activeSavedPlan,
  activeSavedPlanProgress,
  activePlanCompletedSteps,
  activePlanCompletedDays,
  planProgressById,
  onToggleShowPlans,
  onToggleConfirmClear,
  onCancelConfirmClear,
  onOpenPlan,
  onDeletePlan,
  onClearAllPlans,
  onToggleStep,
  onToggleDay,
  onResetProgress,
}: PreventiveSavedPlansPanelProps) {
  const copy = getUiCopy(language).preventive

  if (savedPlans.length === 0) {
    return null
  }

  return (
    <section className="saved-plan-panel compact-saved-panel">
      <div className="saved-panel-toolbar">
        <div className="side-heading inline">
          <History size={19} />
          <div>
            <span className="eyebrow">{copy.savedEyebrow}</span>
            <h3>{copy.savedTitle}</h3>
          </div>
        </div>
        <div className="saved-panel-actions">
          <span className="source-pill">{savedPlans.length} {copy.planCount}</span>
          <button className="text-button compact-button" onClick={onToggleShowPlans} type="button">
            {showSavedPlans ? copy.close : copy.seeAll}
          </button>
          <button
            aria-label={copy.deleteAllLabel}
            className="icon-action quiet-danger"
            onClick={onToggleConfirmClear}
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {!showSavedPlans && latestSavedPlan && (
        <button
          className="saved-summary-card wellness-summary-card"
          onClick={() => onOpenPlan(latestSavedPlan.id)}
          type="button"
        >
          <span className="saved-summary-meta">
            <span className="source-pill">{copy.latest}</span>
            <span>{savedPlans.length} {copy.savedCount}</span>
          </span>
          <strong>{latestSavedPlan.title}</strong>
          <small>{latestSavedPlan.context}</small>
        </button>
      )}

      {confirmClearPlans && (
        <div className="history-confirm">
          <span>{copy.confirmClear}</span>
          <button className="primary-button danger-button compact-button" onClick={onClearAllPlans} type="button">
            {copy.delete}
          </button>
          <button className="text-button compact-button" onClick={onCancelConfirmClear} type="button">
            {copy.cancel}
          </button>
        </div>
      )}

      {showSavedPlans && (
        <div className="wellness-plan-workspace">
          <div className="wellness-plan-list" aria-label={copy.listAria}>
            {savedPlans.map((plan) => {
              const progress = planProgressById[plan.id] ?? { completedSteps: [], completedDays: [] }
              const completedStepCount = plan.steps.filter((step) =>
                progress.completedSteps.includes(step),
              ).length
              const completedDayCount = weeklyRhythm.filter((day) =>
                progress.completedDays.includes(day),
              ).length
              const active = activeSavedPlan?.id === plan.id

              return (
                <button
                  aria-pressed={active}
                  className={active ? 'wellness-plan-select active' : 'wellness-plan-select'}
                  key={plan.id}
                  onClick={() => onOpenPlan(plan.id)}
                  type="button"
                >
                  <span className="wellness-plan-select-header">
                    <span className="source-pill">{formatHandoffSource(plan.source, language)}</span>
                    {completedDayCount >= 7 && <span className="wellness-stamp">{copy.completedWeek}</span>}
                  </span>
                  <strong>{plan.title}</strong>
                  <small>{completedStepCount}/{plan.steps.length} {copy.step}, {completedDayCount}/7 {copy.day}</small>
                </button>
              )
            })}
          </div>

          {activeSavedPlan && (
            <article className="wellness-plan-detail readable-saved-card">
              <div className="saved-card-header saved-card-header-row">
                <div className="saved-card-title">
                  <span className="source-pill">{formatHandoffSource(activeSavedPlan.source, language)}</span>
                  <strong>{activeSavedPlan.title}</strong>
                </div>
                <button
                  aria-label={`${copy.deletePlanLabel} ${activeSavedPlan.title}`}
                  className="icon-action tiny-danger"
                  onClick={() => onDeletePlan(activeSavedPlan.id)}
                  type="button"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="wellness-plan-progress-row">
                <span>
                  <CheckCircle2 size={15} />
                  {activePlanCompletedSteps}/{activeSavedPlan.steps.length} {copy.step}
                </span>
                <span>
                  <CalendarDays size={15} />
                  {activePlanCompletedDays}/7 {copy.day}
                </span>
              </div>

              <div className="saved-context-block">
                <span>{copy.context}</span>
                <p>{activeSavedPlan.context}</p>
              </div>

              <div className="saved-readable-section">
                <span>{copy.checklist}</span>
                <div className="wellness-step-list">
                  {activeSavedPlan.steps.map((step) => {
                    const checked = activeSavedPlanProgress.completedSteps.includes(step)

                    return (
                      <button
                        aria-pressed={checked}
                        className={checked ? 'check-row active' : 'check-row'}
                        key={step}
                        onClick={() => onToggleStep(activeSavedPlan.id, step)}
                        type="button"
                      >
                        <span>{checked && <Check size={14} />}</span>
                        {step}
                      </button>
                    )
                  })}
                </div>
              </div>

              <section className="wellness-day-section">
                <div>
                  <span>{copy.progressTitle}</span>
                  <p>{copy.progressBody}</p>
                </div>
                <div className="day-grid wellness-day-grid">
                  {weeklyRhythm.map((day) => {
                    const active = activeSavedPlanProgress.completedDays.includes(day)

                    return (
                      <button
                        aria-pressed={active}
                        className={active ? 'day-chip active' : 'day-chip'}
                        key={day}
                        onClick={() => onToggleDay(activeSavedPlan.id, day)}
                        type="button"
                      >
                        {active && <Check size={14} />}
                        {day}
                      </button>
                    )
                  })}
                </div>
              </section>

              <div className="wellness-plan-actions">
                <button
                  className="secondary-button"
                  onClick={() => onResetProgress(activeSavedPlan.id)}
                  type="button"
                >
                  <RotateCcw size={16} />
                  {copy.resetProgress}
                </button>
                {activePlanCompletedDays >= 7 && (
                  <span className="wellness-stamp">{copy.finishedPlan}</span>
                )}
              </div>
            </article>
          )}
        </div>
      )}
    </section>
  )
}

export default PreventiveSavedPlansPanel
