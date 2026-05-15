import { useEffect, useMemo, useState } from 'react'
import { getMedicineData } from '../../data/medicineData'
import { getUiCopy } from '../../i18n/uiCopy'
import type { LanguageMode, SavedMedicineNote } from '../../types/sehatara'
import { createIsoTimestamp } from '../../utils/dateTime'
import {
  normalizeDateString,
  normalizeStringList,
  readStorageRecordMap,
  storageKeys,
  writeStorageValue,
} from '../../utils/storage'

export type MedicineNoteProgress = {
  understood: string[]
  personalNote: string
  checkedAt?: string
}

export function useMedicineWorkspace(language: LanguageMode, savedNotes: SavedMedicineNote[]) {
  const { medicineChecklist, medicineTopics } = getMedicineData(language)
  const [query, setQuery] = useState('')
  const [activeTopic, setActiveTopic] = useState<string>(medicineTopics[0].id)
  const [checkedTopicItems, setCheckedTopicItems] = useState<Record<string, string[]>>({})
  const [showSavedNotes, setShowSavedNotes] = useState(false)
  const [confirmClearNotes, setConfirmClearNotes] = useState(false)
  const [activeSavedNoteId, setActiveSavedNoteId] = useState(savedNotes[0]?.id ?? '')
  const [noteProgressById, setNoteProgressById] = useState<Record<string, MedicineNoteProgress>>(
    readMedicineNoteProgress,
  )

  const topic = medicineTopics.find((item) => item.id === activeTopic) ?? medicineTopics[0]
  const checkedItems = checkedTopicItems[topic.id] ?? []
  const topicProgress = `${checkedItems.length}/${topic.checklist.length}`
  const latestSavedNote = savedNotes[0]

  const activeSavedNote = useMemo(
    () => savedNotes.find((note) => note.id === activeSavedNoteId) ?? latestSavedNote,
    [activeSavedNoteId, latestSavedNote, savedNotes],
  )
  const activeSavedNoteChecklist = useMemo(
    () => (activeSavedNote ? getSavedNoteChecklist(activeSavedNote, language) : []),
    [activeSavedNote, language],
  )
  const activeSavedNoteProgress = activeSavedNote
    ? noteProgressById[activeSavedNote.id] ?? createEmptyProgress()
    : createEmptyProgress()
  const activeUnderstoodCount = activeSavedNoteChecklist.filter((item) =>
    activeSavedNoteProgress.understood.includes(item),
  ).length

  useEffect(() => {
    writeStorageValue(storageKeys.medicineNoteProgress, noteProgressById)
  }, [noteProgressById])

  useEffect(() => {
    const validIds = new Set(savedNotes.map((note) => note.id))

    setNoteProgressById((current) => {
      const nextEntries = Object.entries(current).filter(([id]) => validIds.has(id))

      if (nextEntries.length === Object.keys(current).length) {
        return current
      }

      return Object.fromEntries(nextEntries)
    })

    setActiveSavedNoteId((current) => (current && validIds.has(current) ? current : savedNotes[0]?.id ?? ''))

    if (savedNotes.length === 0) {
      setShowSavedNotes(false)
      setConfirmClearNotes(false)
    }
  }, [savedNotes])

  function toggleTopicItem(item: string) {
    setCheckedTopicItems((current) => {
      const topicItems = current[topic.id] ?? []
      const nextItems = topicItems.includes(item)
        ? topicItems.filter((checkedItem) => checkedItem !== item)
        : [...topicItems, item]

      return { ...current, [topic.id]: nextItems }
    })
  }

  function openSavedNote(noteId: string) {
    setActiveSavedNoteId(noteId)
    setShowSavedNotes(true)
    setConfirmClearNotes(false)
  }

  function toggleShowSavedNotes() {
    setShowSavedNotes((current) => !current)
    setConfirmClearNotes(false)
  }

  function toggleConfirmClear() {
    setConfirmClearNotes((current) => !current)
  }

  function cancelConfirmClear() {
    setConfirmClearNotes(false)
  }

  function deleteSavedNote(noteId: string, onDelete: (id: string) => void) {
    onDelete(noteId)
    setNoteProgressById((current) => {
      const remaining = { ...current }
      delete remaining[noteId]
      return remaining
    })
  }

  function clearAllNotes(onClear: () => void) {
    onClear()
    setNoteProgressById({})
    setActiveSavedNoteId('')
    setConfirmClearNotes(false)
    setShowSavedNotes(false)
  }

  function toggleUnderstoodItem(noteId: string, item: string) {
    updateProgress(noteId, (progress) => {
      const understood = progress.understood.includes(item)
        ? progress.understood.filter((checkedItem) => checkedItem !== item)
        : [...progress.understood, item]

      return { ...progress, understood }
    })
  }

  function updatePersonalNote(noteId: string, personalNote: string) {
    updateProgress(noteId, (progress) => ({ ...progress, personalNote }))
  }

  function toggleCheckedStatus(noteId: string) {
    updateProgress(noteId, (progress) => ({
      ...progress,
      checkedAt: progress.checkedAt ? undefined : createIsoTimestamp(),
    }))
  }

  function updateProgress(
    noteId: string,
    updater: (progress: MedicineNoteProgress) => MedicineNoteProgress,
  ) {
    setNoteProgressById((current) => ({
      ...current,
      [noteId]: updater(current[noteId] ?? createEmptyProgress()),
    }))
  }

  return {
    query,
    setQuery,
    activeTopic,
    setActiveTopic,
    topic,
    checkedItems,
    topicProgress,
    showSavedNotes,
    confirmClearNotes,
    latestSavedNote,
    activeSavedNote,
    activeSavedNoteChecklist,
    activeSavedNoteProgress,
    activeUnderstoodCount,
    noteProgressById,
    medicineChecklist,
    medicineTopics,

    toggleTopicItem,
    openSavedNote,
    toggleShowSavedNotes,
    toggleConfirmClear,
    cancelConfirmClear,
    deleteSavedNote,
    clearAllNotes,
    toggleUnderstoodItem,
    updatePersonalNote,
    toggleCheckedStatus,
  }
}

// ─── Pure helpers ────────────────────────────────────────────────

function createEmptyProgress(): MedicineNoteProgress {
  return { understood: [], personalNote: '' }
}

function readMedicineNoteProgress(): Record<string, MedicineNoteProgress> {
  return readStorageRecordMap(storageKeys.medicineNoteProgress, normalizeMedicineNoteProgress)
}

function normalizeMedicineNoteProgress(value: unknown): MedicineNoteProgress | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const progress = value as Record<string, unknown>
  const understood = normalizeStringList(progress.understood)
  const personalNote = typeof progress.personalNote === 'string' ? progress.personalNote : ''
  const checkedAt = normalizeDateString(progress.checkedAt)

  return { understood, personalNote, checkedAt }
}

export function getSavedNoteChecklist(note: SavedMedicineNote, language: LanguageMode) {
  const copy = getUiCopy(language).medicine

  return [
    ...note.guidance,
    copy.understandNotDose,
    copy.askProfessional,
  ]
}
