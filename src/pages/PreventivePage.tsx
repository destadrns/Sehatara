import { CalendarDays, Check, ClipboardCheck, History, Leaf, RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
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
  const habit = habitFocusOptions.find((item) => item.id === activeHabit) ?? habitFocusOptions[0]
  const completedSteps = completedHabitSteps[habit.id] ?? []
  const latestSavedPlan = savedPlans[0]

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
    setConfirmClearPlans(false)
    setShowSavedPlans(false)
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
                  onClick={() => setShowSavedPlans(true)}
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
                <div className="saved-plan-list">
                  {savedPlans.map((plan) => (
                    <article className="saved-plan-card readable-saved-card" key={plan.id}>
                      <div className="saved-card-header saved-card-header-row">
                        <div className="saved-card-title">
                          <span className="source-pill">{plan.source}</span>
                          <strong>{plan.title}</strong>
                        </div>
                        <button
                          aria-label={`Hapus rencana ${plan.title}`}
                          className="icon-action tiny-danger"
                          onClick={() => onDeleteWellnessPlan(plan.id)}
                          type="button"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="saved-context-block">
                        <span>Konteks singkat</span>
                        <p>{plan.context}</p>
                      </div>

                      <div className="saved-readable-section">
                        <span>Rencana sederhana</span>
                        <ol className="readable-step-list">
                          {plan.steps.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </article>
                  ))}
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

export default PreventivePage
