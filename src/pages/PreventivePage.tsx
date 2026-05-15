import { CalendarDays, Check, ClipboardCheck, Leaf, RotateCcw } from 'lucide-react'
import FocusPanel from '../components/common/FocusPanel'
import PageHero from '../components/common/PageHero'
import { getUiCopy } from '../i18n/uiCopy'
import type { FeatureConfig, LanguageMode, PageId, SavedWellnessPlan } from '../types/sehatara'
import PreventiveSavedPlansPanel from './preventive/PreventiveSavedPlansPanel'
import { usePreventiveWorkspace } from './preventive/usePreventiveWorkspace'

type PreventivePageProps = {
  feature: FeatureConfig
  language: LanguageMode
  onClearWellnessPlans: () => void
  onDeleteWellnessPlan: (id: string) => void
  onNavigate: (page: PageId) => void
  savedPlans: SavedWellnessPlan[]
}

function PreventivePage({
  feature,
  language,
  onClearWellnessPlans,
  onDeleteWellnessPlan,
  onNavigate,
  savedPlans,
}: PreventivePageProps) {
  const copy = getUiCopy(language).preventive
  const workspace = usePreventiveWorkspace(language, savedPlans)

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
            {workspace.habitFocusOptions.map((item) => (
              <button
                className={workspace.activeHabit === item.id ? 'habit-card active' : 'habit-card'}
                key={item.id}
                onClick={() => workspace.setActiveHabit(item.id)}
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
              <span className="source-pill">{workspace.habit.label}</span>
              <h3>{copy.habitHeading}</h3>
              <p>{workspace.habit.benefit}</p>
            </div>

            <div className="habit-target-card">
              <ClipboardCheck size={19} />
              <div>
                <span>{copy.target}</span>
                <p>{workspace.habit.target}</p>
              </div>
            </div>

            <div className="interactive-check-list">
              {workspace.habit.plan.map((step) => {
                const checked = workspace.completedSteps.includes(step)

                return (
                  <button
                    aria-pressed={checked}
                    className={checked ? 'check-row active' : 'check-row'}
                    key={step}
                    onClick={() => workspace.toggleHabitStep(step)}
                    type="button"
                  >
                    <span>{checked && <Check size={14} />}</span>
                    {step}
                  </button>
                )
              })}
            </div>

            <div className="habit-checkin-row">
              <p>{workspace.habit.checkIn}</p>
              {workspace.completedSteps.length > 0 && (
                <button className="text-button compact-button" onClick={workspace.resetHabitProgress} type="button">
                  <RotateCcw size={14} />
                  {copy.reset}
                </button>
              )}
            </div>
          </section>

          <PreventiveSavedPlansPanel
            language={language}
            savedPlans={savedPlans}
            weeklyRhythm={workspace.weeklyRhythm}
            showSavedPlans={workspace.showSavedPlans}
            confirmClearPlans={workspace.confirmClearPlans}
            latestSavedPlan={workspace.latestSavedPlan}
            activeSavedPlan={workspace.activeSavedPlan}
            activeSavedPlanProgress={workspace.activeSavedPlanProgress}
            activePlanCompletedSteps={workspace.activePlanCompletedSteps}
            activePlanCompletedDays={workspace.activePlanCompletedDays}
            planProgressById={workspace.planProgressById}
            onToggleShowPlans={workspace.toggleShowSavedPlans}
            onToggleConfirmClear={workspace.toggleConfirmClear}
            onCancelConfirmClear={workspace.cancelConfirmClear}
            onOpenPlan={workspace.openSavedPlan}
            onDeletePlan={(id) => workspace.deleteSavedPlan(id, onDeleteWellnessPlan)}
            onClearAllPlans={() => workspace.clearAllPlans(onClearWellnessPlans)}
            onToggleStep={workspace.toggleSavedPlanStep}
            onToggleDay={workspace.toggleSavedPlanDay}
            onResetProgress={workspace.resetSavedPlanProgress}
          />

          <section className="plan-card">
            <div>
              <span className="eyebrow">{copy.smallPlan}</span>
              <h3>{workspace.habit.label}</h3>
            </div>
            <ol className="readable-step-list">
              {workspace.habit.plan.map((item) => (
                <li className={workspace.completedSteps.includes(item) ? 'completed-step' : undefined} key={item}>
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
              {workspace.weeklyRhythm.map((day) => {
                const active = workspace.checkedDays.includes(day)

                return (
                  <button
                    className={active ? 'day-chip active' : 'day-chip'}
                    key={day}
                    onClick={() => workspace.toggleDay(day)}
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
            <h3 className="progress-title">{workspace.checkedDays.length}/7 {copy.dayProgressSuffix}</h3>
            <p className="muted-copy">
              {workspace.completedSteps.length}/{workspace.habit.plan.length} {workspace.habit.label.toLowerCase()} {copy.progressCopy}
            </p>
          </section>
        </aside>
      </section>
    </main>
  )
}

export default PreventivePage
