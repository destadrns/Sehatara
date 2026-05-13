import { useEffect, useMemo, useState } from 'react'
import AppHeader from '../components/layout/AppHeader'
import { features, getFeatures } from '../data/features'
import ChatPage from '../pages/ChatPage'
import HomePage from '../pages/HomePage'
import MedicinePage from '../pages/MedicinePage'
import MentalPage from '../pages/MentalPage'
import PreventivePage from '../pages/PreventivePage'
import SymptomPage from '../pages/SymptomPage'
import type {
  LanguageMode,
  PageId,
  SaveMedicineNoteInput,
  SaveSymptomRecordInput,
  SavedMedicineNote,
  SavedSymptomRecord,
  SavedWellnessPlan,
  SaveWellnessPlanInput,
  ThemeMode,
} from '../types/sehatara'
import { createId } from '../utils/assistantResponses'
import { createIsoTimestamp } from '../utils/dateTime'
import {
  readStorageList,
  readStorageText,
  storageKeys,
  storageLimits,
  writeStorageText,
  writeStorageValue,
} from '../utils/storage'

function App() {
  const [page, setPage] = useState<PageId>(getInitialPage)
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)
  const [language, setLanguage] = useState<LanguageMode>(getInitialLanguage)
  const [symptomRecords, setSymptomRecords] = useState<SavedSymptomRecord[]>(() =>
    readStorageList<SavedSymptomRecord>(storageKeys.symptomRecords),
  )
  const [medicineNotes, setMedicineNotes] = useState<SavedMedicineNote[]>(() =>
    readStorageList<SavedMedicineNote>(storageKeys.medicineNotes),
  )
  const [wellnessPlans, setWellnessPlans] = useState<SavedWellnessPlan[]>(() =>
    readStorageList<SavedWellnessPlan>(storageKeys.wellnessPlans),
  )

  const localizedFeatures = useMemo(() => getFeatures(language), [language])
  const selectedFeature = useMemo(
    () => localizedFeatures.find((feature) => feature.id === page),
    [localizedFeatures, page],
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    writeStorageText(storageKeys.theme, theme)
  }, [theme])

  useEffect(() => {
    writeStorageText(storageKeys.language, language)
  }, [language])

  useEffect(() => {
    writeStorageValue(storageKeys.medicineNotes, medicineNotes)
  }, [medicineNotes])

  useEffect(() => {
    writeStorageValue(storageKeys.symptomRecords, symptomRecords)
  }, [symptomRecords])

  useEffect(() => {
    writeStorageValue(storageKeys.wellnessPlans, wellnessPlans)
  }, [wellnessPlans])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  useEffect(() => {
    function syncPageFromUrl() {
      setPage(getInitialPage())
    }

    window.addEventListener('popstate', syncPageFromUrl)
    return () => window.removeEventListener('popstate', syncPageFromUrl)
  }, [])

  function navigate(nextPage: PageId) {
    setPage(nextPage)
    const hash = nextPage === 'home' ? '' : `#${nextPage}`
    window.history.pushState(null, '', `${window.location.pathname}${window.location.search}${hash}`)
  }

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  function toggleLanguage() {
    setLanguage((current) => (current === 'id' ? 'en' : 'id'))
  }

  function saveMedicineNote(note: SaveMedicineNoteInput) {
    setMedicineNotes((current) => [
      { ...note, id: createId(), createdAt: createIsoTimestamp() },
      ...current,
    ].slice(0, storageLimits.medicineNotes))
  }

  function deleteMedicineNote(id: string) {
    setMedicineNotes((current) => current.filter((note) => note.id !== id))
  }

  function clearMedicineNotes() {
    setMedicineNotes([])
  }

  function saveSymptomRecord(record: SaveSymptomRecordInput) {
    setSymptomRecords((current) => [
      { ...record, id: createId(), createdAt: createIsoTimestamp() },
      ...current,
    ].slice(0, storageLimits.symptomRecords))
  }

  function deleteSymptomRecord(id: string) {
    setSymptomRecords((current) => current.filter((record) => record.id !== id))
  }

  function clearSymptomRecords() {
    setSymptomRecords([])
  }

  function saveWellnessPlan(plan: SaveWellnessPlanInput) {
    setWellnessPlans((current) => [
      { ...plan, id: createId(), createdAt: createIsoTimestamp() },
      ...current,
    ].slice(0, storageLimits.wellnessPlans))
  }

  function deleteWellnessPlan(id: string) {
    setWellnessPlans((current) => current.filter((plan) => plan.id !== id))
  }

  function clearWellnessPlans() {
    setWellnessPlans([])
  }

  return (
    <div className="app-shell">
      <AppHeader
        features={localizedFeatures}
        language={language}
        onLanguageToggle={toggleLanguage}
        onNavigate={navigate}
        onThemeToggle={toggleTheme}
        page={page}
        theme={theme}
      />

      {renderPage({
        page,
        selectedFeature,
        features: localizedFeatures,
        language,
        symptomRecords,
        medicineNotes,
        wellnessPlans,
        actions: {
          navigate,
          saveSymptomRecord,
          deleteSymptomRecord,
          clearSymptomRecords,
          saveMedicineNote,
          deleteMedicineNote,
          clearMedicineNotes,
          saveWellnessPlan,
          deleteWellnessPlan,
          clearWellnessPlans,
        },
      })}
    </div>
  )
}

type PageActions = {
  navigate: (page: PageId) => void
  saveSymptomRecord: (record: SaveSymptomRecordInput) => void
  deleteSymptomRecord: (id: string) => void
  clearSymptomRecords: () => void
  saveMedicineNote: (note: SaveMedicineNoteInput) => void
  deleteMedicineNote: (id: string) => void
  clearMedicineNotes: () => void
  saveWellnessPlan: (plan: SaveWellnessPlanInput) => void
  deleteWellnessPlan: (id: string) => void
  clearWellnessPlans: () => void
}

type RenderPageParams = {
  page: PageId
  selectedFeature: (typeof features)[number] | undefined
  features: typeof features
  language: LanguageMode
  symptomRecords: SavedSymptomRecord[]
  medicineNotes: SavedMedicineNote[]
  wellnessPlans: SavedWellnessPlan[]
  actions: PageActions
}

function renderPage({
  page,
  selectedFeature,
  features,
  language,
  symptomRecords,
  medicineNotes,
  wellnessPlans,
  actions,
}: RenderPageParams) {
  if (!selectedFeature || page === 'home') {
    return <HomePage features={features} language={language} onNavigate={actions.navigate} />
  }

  if (page === 'symptom') {
    return (
      <SymptomPage
        feature={selectedFeature}
        language={language}
        onNavigate={actions.navigate}
        onClearSymptomRecords={actions.clearSymptomRecords}
        onDeleteSymptomRecord={actions.deleteSymptomRecord}
        onSaveMedicineNote={actions.saveMedicineNote}
        onSaveSymptomRecord={actions.saveSymptomRecord}
        onSaveWellnessPlan={actions.saveWellnessPlan}
        savedRecords={symptomRecords}
      />
    )
  }

  if (page === 'medicine') {
    return (
      <MedicinePage
        feature={selectedFeature}
        language={language}
        onClearMedicineNotes={actions.clearMedicineNotes}
        onDeleteMedicineNote={actions.deleteMedicineNote}
        onNavigate={actions.navigate}
        savedNotes={medicineNotes}
      />
    )
  }

  if (page === 'preventive') {
    return (
      <PreventivePage
        feature={selectedFeature}
        language={language}
        onClearWellnessPlans={actions.clearWellnessPlans}
        onDeleteWellnessPlan={actions.deleteWellnessPlan}
        onNavigate={actions.navigate}
        savedPlans={wellnessPlans}
      />
    )
  }

  if (page === 'mental') {
    return <MentalPage feature={selectedFeature} language={language} onNavigate={actions.navigate} />
  }

  return (
    <ChatPage
      feature={selectedFeature}
      language={language}
      onNavigate={actions.navigate}
      onSaveMedicineNote={actions.saveMedicineNote}
      onSaveWellnessPlan={actions.saveWellnessPlan}
    />
  )
}

function getInitialPage(): PageId {
  const hash = window.location.hash.replace('#', '')
  const matchedFeature = features.find((feature) => feature.id === hash)

  return matchedFeature?.id ?? 'home'
}

function getInitialTheme(): ThemeMode {
  const savedTheme = readStorageText(storageKeys.theme)

  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme
  }

  return 'light'
}

function getInitialLanguage(): LanguageMode {
  const savedLanguage = readStorageText(storageKeys.language)

  if (savedLanguage === 'id' || savedLanguage === 'en') {
    return savedLanguage
  }

  return 'id'
}

export default App
