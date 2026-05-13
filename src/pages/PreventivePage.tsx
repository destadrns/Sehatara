import { CalendarDays, Check, CheckCircle2, ClipboardCheck, History, Leaf, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import FocusPanel from '../components/common/FocusPanel'
import PageHero from '../components/common/PageHero'
import { habitFocusOptions, weeklyRhythm } from '../data/preventiveData'
import type { FeatureConfig, PageId, SavedWellnessPlan } from '../types/sehatara'

type PreventivePageProps = {
  feature: FeatureConfig
  onClearWellnessPlans: () => void
  onDeleteWellnessPlan: (id: string) => void
  onNavigate: (page: PageId) => void
  savedPlans: SavedWellnessPlan[]
}

type WellnessPlanProgress = {
  completedSteps: string[]
  completedDays: string[]
}

const WELLNESS_PLAN_PROGRESS_KEY = 'sehatara-wellness-plan-progress'

function PreventivePage({
  feature,
  onClearWellnessPlans,
  onDeleteWellnessPlan,
  onNavigate,
  savedPlans,
}: PreventivePageProps) {
  const [activeHabit, setActiveHabit] = useState(habitFocusOptions[0].id)
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
    window.localStorage.setItem(WELLNESS_PLAN_PROGRESS_KEY, JSON.stringify(planProgressById))
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
      <PageHero feature={feature} onNavigate={onNavigate} />

      <section className="tool-layout">
        <div className="interactive-panel">
          <div className="workspace-toolbar">
            <div>
              <span className="eyebrow">Rencana pulih</span>
              <h2>Pilih langkah kecil minggu ini</h2>
            </div>
            <span className="soft-status">7 hari</span>
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
              <h3>Mulai dari langkah yang ringan</h3>
              <p>{habit.benefit}</p>
            </div>

            <div className="habit-target-card">
              <ClipboardCheck size={19} />
              <div>
                <span>Target realistis</span>
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
                  Reset
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
                    <span className="eyebrow">Masuk dari gejala/chat</span>
                    <h3>Rencana tersimpan</h3>
                  </div>
                </div>
                <div className="saved-panel-actions">
                  <span className="source-pill">{savedPlans.length} rencana</span>
                  <button
                    className="text-button compact-button"
                    onClick={() => {
                      setShowSavedPlans((current) => !current)
                      setConfirmClearPlans(false)
                    }}
                    type="button"
                  >
                    {showSavedPlans ? 'Tutup' : 'Lihat semua'}
                  </button>
                  <button
                    aria-label="Hapus semua rencana pulih"
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
                    <span className="source-pill">Terbaru</span>
                    <span>{savedPlans.length} rencana tersimpan</span>
                  </span>
                  <strong>{latestSavedPlan.title}</strong>
                  <small>{latestSavedPlan.context}</small>
                </button>
              )}

              {confirmClearPlans && (
                <div className="history-confirm">
                  <span>Hapus semua rencana pulih tersimpan?</span>
                  <button
                    className="primary-button danger-button compact-button"
                    onClick={handleClearWellnessPlans}
                    type="button"
                  >
                    Hapus
                  </button>
                  <button
                    className="text-button compact-button"
                    onClick={() => setConfirmClearPlans(false)}
                    type="button"
                  >
                    Batal
                  </button>
                </div>
              )}

              {showSavedPlans && (
                <div className="wellness-plan-workspace">
                  <div className="wellness-plan-list" aria-label="Daftar rencana pulih tersimpan">
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
                            <span className="source-pill">{plan.source}</span>
                            {completedDayCount >= 7 && <span className="wellness-stamp">7 hari lengkap</span>}
                          </span>
                          <strong>{plan.title}</strong>
                          <small>{completedStepCount}/{plan.steps.length} langkah, {completedDayCount}/7 hari</small>
                        </button>
                      )
                    })}
                  </div>

                  {activeSavedPlan && (
                    <article className="wellness-plan-detail readable-saved-card">
                      <div className="saved-card-header saved-card-header-row">
                        <div className="saved-card-title">
                          <span className="source-pill">{activeSavedPlan.source}</span>
                          <strong>{activeSavedPlan.title}</strong>
                        </div>
                        <button
                          aria-label={`Hapus rencana ${activeSavedPlan.title}`}
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
                          {activePlanCompletedSteps}/{activeSavedPlan.steps.length} langkah
                        </span>
                        <span>
                          <CalendarDays size={15} />
                          {activePlanCompletedDays}/7 hari
                        </span>
                      </div>

                      <div className="saved-context-block">
                        <span>Konteks singkat</span>
                        <p>{activeSavedPlan.context}</p>
                      </div>

                      <div className="saved-readable-section">
                        <span>Checklist langkah</span>
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
                          <span>Progress 7 hari</span>
                          <p>Tandai hari ketika kamu berhasil menjalankan minimal satu langkah.</p>
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
                          Reset progress
                        </button>
                        {activePlanCompletedDays >= 7 && (
                          <span className="wellness-stamp">Rencana 7 hari selesai</span>
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
              <span className="eyebrow">Rencana kecil</span>
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
                <span className="eyebrow">Tracker</span>
                <h3>Tandai hari yang berhasil</h3>
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
          <FocusPanel feature={feature} />
          <section className="side-panel">
            <span className="eyebrow">Progress</span>
            <h3 className="progress-title">{checkedDays.length}/7 hari</h3>
            <p className="muted-copy">
              {completedSteps.length}/{habit.plan.length} langkah {habit.label.toLowerCase()} sudah ditandai.
              Targetnya bukan sempurna, tapi cukup konsisten untuk mulai terasa.
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
  const stored = window.localStorage.getItem(WELLNESS_PLAN_PROGRESS_KEY)

  if (!stored) {
    return {}
  }

  try {
    const parsed = JSON.parse(stored)

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }

    return Object.entries(parsed as Record<string, unknown>).reduce<Record<string, WellnessPlanProgress>>(
      (progressMap, [id, value]) => {
        const progress = normalizeWellnessPlanProgress(value)

        if (progress) {
          progressMap[id] = progress
        }

        return progressMap
      },
      {},
    )
  } catch {
    return {}
  }
}

function normalizeWellnessPlanProgress(value: unknown): WellnessPlanProgress | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const progress = value as Record<string, unknown>

  return {
    completedSteps: normalizeStringList(progress.completedSteps),
    completedDays: normalizeStringList(progress.completedDays).filter((day) => weeklyRhythm.includes(day)),
  }
}

function normalizeStringList(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    : []
}

export default PreventivePage
