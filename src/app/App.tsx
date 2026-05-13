import { useEffect, useMemo, useState } from 'react'
import AppHeader from '../components/layout/AppHeader'
import { features } from '../data/features'
import ChatPage from '../pages/ChatPage'
import HomePage from '../pages/HomePage'
import MedicinePage from '../pages/MedicinePage'
import MentalPage from '../pages/MentalPage'
import PreventivePage from '../pages/PreventivePage'
import SymptomPage from '../pages/SymptomPage'
import type {
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

const SYMPTOM_STORAGE_KEY = 'sehatara-symptom-records'
const MEDICINE_STORAGE_KEY = 'sehatara-medicine-notes'
const WELLNESS_STORAGE_KEY = 'sehatara-wellness-plans'

function App() {
  const [page, setPage] = useState<PageId>(getInitialPage)
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)
  const [symptomRecords, setSymptomRecords] = useState<SavedSymptomRecord[]>(() =>
    readStoredItems<SavedSymptomRecord>(SYMPTOM_STORAGE_KEY),
  )
  const [medicineNotes, setMedicineNotes] = useState<SavedMedicineNote[]>(() =>
    readStoredItems<SavedMedicineNote>(MEDICINE_STORAGE_KEY),
  )
  const [wellnessPlans, setWellnessPlans] = useState<SavedWellnessPlan[]>(() =>
    readStoredItems<SavedWellnessPlan>(WELLNESS_STORAGE_KEY),
  )

  const selectedFeature = useMemo(
    () => features.find((feature) => feature.id === page),
    [page],
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('sehatara-theme', theme)
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem(MEDICINE_STORAGE_KEY, JSON.stringify(medicineNotes))
  }, [medicineNotes])

  useEffect(() => {
    window.localStorage.setItem(SYMPTOM_STORAGE_KEY, JSON.stringify(symptomRecords))
  }, [symptomRecords])

  useEffect(() => {
    window.localStorage.setItem(WELLNESS_STORAGE_KEY, JSON.stringify(wellnessPlans))
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

  function saveMedicineNote(note: SaveMedicineNoteInput) {
    setMedicineNotes((current) => [
      { ...note, id: createId(), createdAt: new Date().toISOString() },
      ...current,
    ].slice(0, 6))
  }

  function deleteMedicineNote(id: string) {
    setMedicineNotes((current) => current.filter((note) => note.id !== id))
  }

  function clearMedicineNotes() {
    setMedicineNotes([])
  }

  function saveSymptomRecord(record: SaveSymptomRecordInput) {
    setSymptomRecords((current) => [
      { ...record, id: createId(), createdAt: new Date().toISOString() },
      ...current,
    ].slice(0, 8))
  }

  function deleteSymptomRecord(id: string) {
    setSymptomRecords((current) => current.filter((record) => record.id !== id))
  }

  function clearSymptomRecords() {
    setSymptomRecords([])
  }

  function saveWellnessPlan(plan: SaveWellnessPlanInput) {
    setWellnessPlans((current) => [
      { ...plan, id: createId(), createdAt: new Date().toISOString() },
      ...current,
    ].slice(0, 6))
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
        onNavigate={navigate}
        onThemeToggle={toggleTheme}
        page={page}
        theme={theme}
      />

      {renderPage(
        page,
        selectedFeature,
        navigate,
        symptomRecords,
        medicineNotes,
        wellnessPlans,
        saveSymptomRecord,
        deleteSymptomRecord,
        clearSymptomRecords,
        saveMedicineNote,
        deleteMedicineNote,
        clearMedicineNotes,
        saveWellnessPlan,
        deleteWellnessPlan,
        clearWellnessPlans,
      )}
    </div>
  )
}

function renderPage(
  page: PageId,
  selectedFeature: (typeof features)[number] | undefined,
  navigate: (page: PageId) => void,
  symptomRecords: SavedSymptomRecord[],
  medicineNotes: SavedMedicineNote[],
  wellnessPlans: SavedWellnessPlan[],
  saveSymptomRecord: (record: SaveSymptomRecordInput) => void,
  deleteSymptomRecord: (id: string) => void,
  clearSymptomRecords: () => void,
  saveMedicineNote: (note: SaveMedicineNoteInput) => void,
  deleteMedicineNote: (id: string) => void,
  clearMedicineNotes: () => void,
  saveWellnessPlan: (plan: SaveWellnessPlanInput) => void,
  deleteWellnessPlan: (id: string) => void,
  clearWellnessPlans: () => void,
) {
  if (!selectedFeature || page === 'home') {
    return <HomePage onNavigate={navigate} />
  }

  if (page === 'symptom') {
    return (
      <SymptomPage
        feature={selectedFeature}
        onNavigate={navigate}
        onClearSymptomRecords={clearSymptomRecords}
        onDeleteSymptomRecord={deleteSymptomRecord}
        onSaveMedicineNote={saveMedicineNote}
        onSaveSymptomRecord={saveSymptomRecord}
        onSaveWellnessPlan={saveWellnessPlan}
        savedRecords={symptomRecords}
      />
    )
  }

  if (page === 'medicine') {
    return (
      <MedicinePage
        feature={selectedFeature}
        onClearMedicineNotes={clearMedicineNotes}
        onDeleteMedicineNote={deleteMedicineNote}
        onNavigate={navigate}
        savedNotes={medicineNotes}
      />
    )
  }

  if (page === 'preventive') {
    return (
      <PreventivePage
        feature={selectedFeature}
        onClearWellnessPlans={clearWellnessPlans}
        onDeleteWellnessPlan={deleteWellnessPlan}
        onNavigate={navigate}
        savedPlans={wellnessPlans}
      />
    )
  }

  if (page === 'mental') {
    return <MentalPage feature={selectedFeature} onNavigate={navigate} />
  }

  return (
    <ChatPage
      feature={selectedFeature}
      onNavigate={navigate}
      onSaveMedicineNote={saveMedicineNote}
      onSaveWellnessPlan={saveWellnessPlan}
    />
  )
}

function getInitialPage(): PageId {
  const hash = window.location.hash.replace('#', '')
  const matchedFeature = features.find((feature) => feature.id === hash)

  return matchedFeature?.id ?? 'home'
}

function getInitialTheme(): ThemeMode {
  const savedTheme = window.localStorage.getItem('sehatara-theme')

  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme
  }

  return 'light'
}

function readStoredItems<T>(key: string): T[] {
  const stored = window.localStorage.getItem(key)

  if (!stored) {
    return []
  }

  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default App
