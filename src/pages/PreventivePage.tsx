import { CalendarDays, Check, CheckCircle2, ClipboardCheck, History, Leaf, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import FocusPanel from '../components/common/FocusPanel'
import PageHero from '../components/common/PageHero'
import { getPreventiveData } from '../data/preventiveData'
import { formatHandoffSource, getUiCopy } from '../i18n/uiCopy'
import type { FeatureConfig, LanguageMode, PageId, SavedWellnessPlan } from '../types/sehatara'
import {
  normalizeStringList,
  readStorageRecordMap,
  storageKeys,
  writeStorageValue,
} from '../utils/storage'

type PreventivePageProps = {
  feature: FeatureConfig
  language: LanguageMode
  onClearWellnessPlans: () => void
  onDeleteWellnessPlan: (id: string) => void
  onNavigate: (page: PageId) => void
  savedPlans: SavedWellnessPlan[]
}

type WellnessPlanProgress = {
  completedSteps: string[]
  completedDays: string[]
}

const validWeekDays = new Set([
  ...getPreventiveData('id').weeklyRhythm,
  ...getPreventiveData('en').weeklyRhythm,
])

function PreventivePage({
  feature,
  language,
  onClearWellnessPlans,
  onDeleteWellnessPlan,
  onNavigate,
  savedPlans,
}: PreventivePageProps) {
  const copy = getUiCopy(language).preventive
  const { habitFocusOptions, weeklyRhythm } = getPreventiveData(language)
  const [activeHabit, setActiveHabit] = useState<string>(habitFocusOptions[0].id)
  const [checkedDays, setCheckedDays] = useState<string[]>(['Sen'])
  const [completedHabitSteps, setCompletedHabitSteps] = useState<Record<string, string[]>>({})
  const [showSavedPlans, setShowSavedPlans] = useState(false)
  const [confirmClearPlans, setConfirmClearPlans] = useState(false)
  const [activeSavedPlanId, setActiveSavedPlanId] = useState(savedPlans[0]?.id ?? '')
  const [planProgressById, setPlanProgressById] = useState<Record<string, WellnessPlanProgress>>(
    readWellnessPlanProgress,
  )
  const habit = habitFocusOptions.find((item) => item.id === activeHabit) ?? habitFocusOptions[0]
  const completedSteps = completedHabitSteps[habit.id] ?? []
  const latestSavedPlan = savedPlans[0]
  const activeSavedPlan = useMemo(
    () => savedPlans.find((plan) => plan.id === activeSavedPlanId) ?? latestSavedPlan,
    [activeSavedPlanId, latestSavedPlan, savedPlans],
  )
  const activeSavedPlanProgress = activeSavedPlan
    ? planProgressById[activeSavedPlan.id] ?? createEmptyWellnessPlanProgress()
    : createEmptyWellnessPlanProgress()
  const activePlanCompletedSteps = activeSavedPlan
    ? activeSavedPlan.steps.filter((step) => activeSavedPlanProgress.completedSteps.includes(step)).length
    : 0
  const activePlanCompletedDays = weeklyRhythm.filter((day) =>
    activeSavedPlanProgress.completedDays.includes(day),
  ).length

  useEffect(() => {
    writeStorageValue(storageKeys.wellnessPlanProgress, planProgressById)
  }, [planProgressById])

  useEffect(() => {
    const validIds = new Set(savedPlans.map((plan) => plan.id))

    setPlanProgressById((current) => {
      const nextEntries = Object.entries(current).filter(([id]) => validIds.has(id))

      if (nextEntries.length === Object.keys(current).length) {
        return current
      }

      return Object.fromEntries(nextEntries)
    })

    setActiveSavedPlanId((current) => (current && validIds.has(current) ? current : savedPlans[0]?.id ?? ''))

    if (savedPlans.length === 0) {
      setShowSavedPlans(false)
      setConfirmClearPlans(false)
    }
  }, [savedPlans])

  useEffect(() => {
    setCheckedDays((current) => {
      const validDays = current.filter((day) => weeklyRhythm.includes(day))
      return validDays.length > 0 ? validDays : [weeklyRhythm[0]]
    })
  }, [weeklyRhythm])

  function toggleDay(day: string) {
    setCheckedDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
    )
  }

  function toggleHabitStep(step: string) {
    setCompletedHabitSteps((current) => {
      const habitSteps = current[habit.id] ?? []
      const nextSteps = habitSteps.includes(step)
        ? habitSteps.filter((item) => item !== step)
        : [...habitSteps, step]

      return {
        ...current,
        [habit.id]: nextSteps,
      }
    })
  }

  function resetHabitProgress() {
    setCompletedHabitSteps((current) => ({
      ...current,
      [habit.id]: [],
    }))
  }

  function handleClearWellnessPlans() {
    onClearWellnessPlans()
    setPlanProgressById({})
    setActiveSavedPlanId('')
    setConfirmClearPlans(false)
    setShowSavedPlans(false)
  }

  function openSavedPlan(planId: string) {
    setActiveSavedPlanId(planId)
    setShowSavedPlans(true)
    setConfirmClearPlans(false)
  }

  function deleteSavedPlan(planId: string) {
    onDeleteWellnessPlan(planId)
    setPlanProgressById((current) => {
      const remaining = { ...current }
      delete remaining[planId]
      return remaining
    })
  }

  function updateSavedPlanProgress(
    planId: string,
    updater: (progress: WellnessPlanProgress) => WellnessPlanProgress,
  ) {
    setPlanProgressById((current) => ({
      ...current,
      [planId]: updater(current[planId] ?? createEmptyWellnessPlanProgress()),
    }))
  }

  function toggleSavedPlanStep(planId: string, step: string) {
    updateSavedPlanProgress(planId, (progress) => {
      const completedSteps = progress.completedSteps.includes(step)
        ? progress.completedSteps.filter((item) => item !== step)
        : [...progress.completedSteps, step]

      return {
        ...progress,
        completedSteps,
      }
    })
  }

  function toggleSavedPlanDay(planId: string, day: string) {
    updateSavedPlanProgress(planId, (progress) => {
      const completedDays = progress.completedDays.includes(day)
        ? progress.completedDays.filter((item) => item !== day)
        : [...progress.completedDays, day]

      return {
        ...progress,
        completedDays,
      }
    })
  }

  function resetSavedPlanProgress(planId: string) {
    setPlanProgressById((current) => ({
      ...current,
      [planId]: createEmptyWellnessPlanProgress(),
    }))
  }

  return (
    <main className="feature-page preventive-page" data-accent={feature.accent}>
      <PageHero feature={feature} language={language} onNavigate={onNavigate} />

      <section className="tool-layout">
        <div className="interactive-panel">
          <div className="workspace-toolbar">
            <div>
              <span className="eyebrow">{copy.workspaceEyebrow}</span>
              <h2>{copy.workspaceTitle}</h2>
            </div>
            <span className="soft-status">{copy.status}</span>
          </div>

          <div className="habit-grid">
            {habitFocusOptions.map((item) => (
              <button
                className={activeHabit === item.id ? 'habit-card active' : 'habit-card'}
                key={item.id}
                onClick={() => setActiveHabit(item.id)}
                type="button"
              >
                <Leaf size={20} />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.target}</small>
                </span>
              </button>
            ))}
          </div>

          <section className="habit-detail-panel">
            <div className="habit-detail-heading">
              <span className="source-pill">{habit.label}</span>
              <h3>{copy.habitHeading}</h3>
              <p>{habit.benefit}</p>
            </div>

            <div className="habit-target-card">
              <ClipboardCheck size={19} />
              <div>
                <span>{copy.target}</span>
                <p>{habit.target}</p>
              </div>
            </div>

            <div className="interactive-check-list">
              {habit.plan.map((step) => {
                const checked = completedSteps.includes(step)

                return (
                  <button
                    aria-pressed={checked}
                    className={checked ? 'check-row active' : 'check-row'}
                    key={step}
                    onClick={() => toggleHabitStep(step)}
                    type="button"
                  >
                    <span>{checked && <Check size={14} />}</span>
                    {step}
                  </button>
                )
              })}
            </div>

            <div className="habit-checkin-row">
              <p>{habit.checkIn}</p>
              {completedSteps.length > 0 && (
                <button className="text-button compact-button" onClick={resetHabitProgress} type="button">
                  <RotateCcw size={14} />
                  {copy.reset}
                </button>
              )}
            </div>
          </section>

          {savedPlans.length > 0 && (
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
                  <button
                    className="text-button compact-button"
                    onClick={() => {
                      setShowSavedPlans((current) => !current)
                      setConfirmClearPlans(false)
                    }}
                    type="button"
                  >
                    {showSavedPlans ? copy.close : copy.seeAll}
                  </button>
                  <button
                    aria-label={copy.deleteAllLabel}
                    className="icon-action quiet-danger"
                    onClick={() => setConfirmClearPlans((current) => !current)}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {!showSavedPlans && latestSavedPlan && (
                <button
                  className="saved-summary-card wellness-summary-card"
                  onClick={() => openSavedPlan(latestSavedPlan.id)}
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
                  <button
                    className="primary-button danger-button compact-button"
                    onClick={handleClearWellnessPlans}
                    type="button"
                  >
                    {copy.delete}
                  </button>
                  <button
                    className="text-button compact-button"
                    onClick={() => setConfirmClearPlans(false)}
                    type="button"
                  >
                    {copy.cancel}
                  </button>
                </div>
              )}

              {showSavedPlans && (
                <div className="wellness-plan-workspace">
                  <div className="wellness-plan-list" aria-label={copy.listAria}>
                    {savedPlans.map((plan) => {
                      const progress = planProgressById[plan.id] ?? createEmptyWellnessPlanProgress()
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
                          onClick={() => openSavedPlan(plan.id)}
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
                          onClick={() => deleteSavedPlan(activeSavedPlan.id)}
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
                                onClick={() => toggleSavedPlanStep(activeSavedPlan.id, step)}
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
                                onClick={() => toggleSavedPlanDay(activeSavedPlan.id, day)}
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
                          onClick={() => resetSavedPlanProgress(activeSavedPlan.id)}
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
          )}

          <section className="plan-card">
            <div>
              <span className="eyebrow">{copy.smallPlan}</span>
              <h3>{habit.label}</h3>
            </div>
            <ol className="readable-step-list">
              {habit.plan.map((item) => (
                <li className={completedSteps.includes(item) ? 'completed-step' : undefined} key={item}>
                  {item}
                </li>
              ))}
            </ol>
          </section>

          <section className="week-tracker">
            <div className="side-heading inline">
              <CalendarDays size={19} />
              <div>
                <span className="eyebrow">{copy.tracker}</span>
                <h3>{copy.trackerTitle}</h3>
              </div>
            </div>
            <div className="day-grid">
              {weeklyRhythm.map((day) => {
                const active = checkedDays.includes(day)

                return (
                  <button
                    className={active ? 'day-chip active' : 'day-chip'}
                    key={day}
                    onClick={() => toggleDay(day)}
                    type="button"
                  >
                    {active && <Check size={14} />}
                    {day}
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        <aside className="workspace-side">
          <FocusPanel feature={feature} language={language} />
          <section className="side-panel">
            <span className="eyebrow">{copy.progressEyebrow}</span>
            <h3 className="progress-title">{checkedDays.length}/7 {copy.dayProgressSuffix}</h3>
            <p className="muted-copy">
              {completedSteps.length}/{habit.plan.length} {habit.label.toLowerCase()} {copy.progressCopy}
            </p>
          </section>
        </aside>
      </section>
    </main>
  )
}

function createEmptyWellnessPlanProgress(): WellnessPlanProgress {
  return {
    completedSteps: [],
    completedDays: [],
  }
}

function readWellnessPlanProgress(): Record<string, WellnessPlanProgress> {
  return readStorageRecordMap(storageKeys.wellnessPlanProgress, normalizeWellnessPlanProgress)
}

function normalizeWellnessPlanProgress(value: unknown): WellnessPlanProgress | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const progress = value as Record<string, unknown>

  return {
    completedSteps: normalizeStringList(progress.completedSteps),
    completedDays: normalizeStringList(progress.completedDays).filter((day) => validWeekDays.has(day)),
  }
}

export default PreventivePage
