import { useEffect, useMemo, useState } from 'react'
import { getPreventiveData } from '../../data/preventiveData'
import type { LanguageMode, SavedWellnessPlan } from '../../types/sehatara'
import {
  normalizeStringList,
  readStorageRecordMap,
  storageKeys,
  writeStorageValue,
} from '../../utils/storage'

export type WellnessPlanProgress = {
  completedSteps: string[]
  completedDays: string[]
}

const validWeekDays = new Set([
  ...getPreventiveData('id').weeklyRhythm,
  ...getPreventiveData('en').weeklyRhythm,
])

export function usePreventiveWorkspace(language: LanguageMode, savedPlans: SavedWellnessPlan[]) {
  const { habitFocusOptions, weeklyRhythm } = getPreventiveData(language)
  const [activeHabit, setActiveHabit] = useState<string>(habitFocusOptions[0].id)
  const [checkedDays, setCheckedDays] = useState<string[]>([weeklyRhythm[0]])
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
    ? planProgressById[activeSavedPlan.id] ?? createEmptyProgress()
    : createEmptyProgress()
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

      return { ...current, [habit.id]: nextSteps }
    })
  }

  function resetHabitProgress() {
    setCompletedHabitSteps((current) => ({ ...current, [habit.id]: [] }))
  }

  function openSavedPlan(planId: string) {
    setActiveSavedPlanId(planId)
    setShowSavedPlans(true)
    setConfirmClearPlans(false)
  }

  function toggleShowSavedPlans() {
    setShowSavedPlans((current) => !current)
    setConfirmClearPlans(false)
  }

  function toggleConfirmClear() {
    setConfirmClearPlans((current) => !current)
  }

  function cancelConfirmClear() {
    setConfirmClearPlans(false)
  }

  function deleteSavedPlan(planId: string, onDelete: (id: string) => void) {
    onDelete(planId)
    setPlanProgressById((current) => {
      const remaining = { ...current }
      delete remaining[planId]
      return remaining
    })
  }

  function clearAllPlans(onClear: () => void) {
    onClear()
    setPlanProgressById({})
    setActiveSavedPlanId('')
    setConfirmClearPlans(false)
    setShowSavedPlans(false)
  }

  function toggleSavedPlanStep(planId: string, step: string) {
    updateProgress(planId, (progress) => {
      const steps = progress.completedSteps.includes(step)
        ? progress.completedSteps.filter((item) => item !== step)
        : [...progress.completedSteps, step]

      return { ...progress, completedSteps: steps }
    })
  }

  function toggleSavedPlanDay(planId: string, day: string) {
    updateProgress(planId, (progress) => {
      const days = progress.completedDays.includes(day)
        ? progress.completedDays.filter((item) => item !== day)
        : [...progress.completedDays, day]

      return { ...progress, completedDays: days }
    })
  }

  function resetSavedPlanProgress(planId: string) {
    setPlanProgressById((current) => ({ ...current, [planId]: createEmptyProgress() }))
  }

  function updateProgress(
    planId: string,
    updater: (progress: WellnessPlanProgress) => WellnessPlanProgress,
  ) {
    setPlanProgressById((current) => ({
      ...current,
      [planId]: updater(current[planId] ?? createEmptyProgress()),
    }))
  }

  return {
    activeHabit,
    setActiveHabit,
    habit,
    completedSteps,
    checkedDays,
    showSavedPlans,
    confirmClearPlans,
    latestSavedPlan,
    activeSavedPlan,
    activeSavedPlanProgress,
    activePlanCompletedSteps,
    activePlanCompletedDays,
    planProgressById,
    habitFocusOptions,
    weeklyRhythm,

    toggleDay,
    toggleHabitStep,
    resetHabitProgress,
    openSavedPlan,
    toggleShowSavedPlans,
    toggleConfirmClear,
    cancelConfirmClear,
    deleteSavedPlan,
    clearAllPlans,
    toggleSavedPlanStep,
    toggleSavedPlanDay,
    resetSavedPlanProgress,
  }
}

// ─── Pure helpers ────────────────────────────────────────────────

function createEmptyProgress(): WellnessPlanProgress {
  return { completedSteps: [], completedDays: [] }
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
