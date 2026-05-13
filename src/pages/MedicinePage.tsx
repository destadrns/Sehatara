import {
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  History,
  MessageCircle,
  Pill,
  Search,
  ShieldAlert,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import FocusPanel from '../components/common/FocusPanel'
import PageHero from '../components/common/PageHero'
import { getMedicineData } from '../data/medicineData'
import { formatHandoffSource, getUiCopy } from '../i18n/uiCopy'
import type { FeatureConfig, LanguageMode, PageId, SavedMedicineNote } from '../types/sehatara'
import { createIsoTimestamp, formatShortDateTime } from '../utils/dateTime'
import {
  normalizeDateString,
  normalizeStringList,
  readStorageRecordMap,
  storageKeys,
  writeStorageValue,
} from '../utils/storage'

type MedicinePageProps = {
  feature: FeatureConfig
  language: LanguageMode
  onClearMedicineNotes: () => void
  onDeleteMedicineNote: (id: string) => void
  onNavigate: (page: PageId) => void
  savedNotes: SavedMedicineNote[]
}

type MedicineNoteProgress = {
  understood: string[]
  personalNote: string
  checkedAt?: string
}

function MedicinePage({
  feature,
  language,
  onClearMedicineNotes,
  onDeleteMedicineNote,
  onNavigate,
  savedNotes,
}: MedicinePageProps) {
  const copy = getUiCopy(language).medicine
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
    ? noteProgressById[activeSavedNote.id] ?? createEmptyMedicineNoteProgress()
    : createEmptyMedicineNoteProgress()
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

      return {
        ...current,
        [topic.id]: nextItems,
      }
    })
  }

  function handleClearMedicineNotes() {
    onClearMedicineNotes()
    setNoteProgressById({})
    setActiveSavedNoteId('')
    setConfirmClearNotes(false)
    setShowSavedNotes(false)
  }

  function openSavedNote(noteId: string) {
    setActiveSavedNoteId(noteId)
    setShowSavedNotes(true)
    setConfirmClearNotes(false)
  }

  function deleteSavedNote(noteId: string) {
    onDeleteMedicineNote(noteId)
    setNoteProgressById((current) => {
      const remaining = { ...current }
      delete remaining[noteId]
      return remaining
    })
  }

  function updateSavedNoteProgress(
    noteId: string,
    updater: (progress: MedicineNoteProgress) => MedicineNoteProgress,
  ) {
    setNoteProgressById((current) => ({
      ...current,
      [noteId]: updater(current[noteId] ?? createEmptyMedicineNoteProgress()),
    }))
  }

  function toggleUnderstoodItem(noteId: string, item: string) {
    updateSavedNoteProgress(noteId, (progress) => {
      const understood = progress.understood.includes(item)
        ? progress.understood.filter((checkedItem) => checkedItem !== item)
        : [...progress.understood, item]

      return {
        ...progress,
        understood,
      }
    })
  }

  function updatePersonalNote(noteId: string, personalNote: string) {
    updateSavedNoteProgress(noteId, (progress) => ({
      ...progress,
      personalNote,
    }))
  }

  function toggleCheckedStatus(noteId: string) {
    updateSavedNoteProgress(noteId, (progress) => ({
      ...progress,
      checkedAt: progress.checkedAt ? undefined : createIsoTimestamp(),
    }))
  }

  return (
    <main className="feature-page medicine-page" data-accent={feature.accent}>
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

          <div className="medicine-search">
            <Search size={20} />
            <input
              aria-label={copy.searchAria}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.searchPlaceholder}
              type="text"
              value={query}
            />
          </div>

          {savedNotes.length > 0 && (
            <section className="saved-note-panel compact-saved-panel">
              <div className="saved-panel-toolbar">
                <div className="side-heading inline">
                  <History size={19} />
                  <div>
                    <span className="eyebrow">{copy.fromOther}</span>
                    <h3>{copy.savedTitle}</h3>
                  </div>
                </div>
                <div className="saved-panel-actions">
                  <span className="source-pill">{savedNotes.length} {copy.noteCount}</span>
                  <button
                    className="text-button compact-button"
                    onClick={() => {
                      setShowSavedNotes((current) => !current)
                      setConfirmClearNotes(false)
                    }}
                    type="button"
                  >
                    {showSavedNotes ? copy.close : copy.seeAll}
                  </button>
                  <button
                    aria-label={copy.deleteAllLabel}
                    className="icon-action quiet-danger"
                    onClick={() => setConfirmClearNotes((current) => !current)}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {!showSavedNotes && latestSavedNote && (
                <button
                  className="saved-summary-card"
                  onClick={() => openSavedNote(latestSavedNote.id)}
                  type="button"
                >
                  <span className="saved-summary-meta">
                    <span className="source-pill">{copy.latest}</span>
                    <span>{savedNotes.length} {copy.savedCount}</span>
                  </span>
                  <strong>{latestSavedNote.title}</strong>
                  <small>{latestSavedNote.context}</small>
                </button>
              )}

              {confirmClearNotes && (
                <div className="history-confirm">
                  <span>{copy.confirmClear}</span>
                  <button
                    className="primary-button danger-button compact-button"
                    onClick={handleClearMedicineNotes}
                    type="button"
                  >
                    {copy.delete}
                  </button>
                  <button
                    className="text-button compact-button"
                    onClick={() => setConfirmClearNotes(false)}
                    type="button"
                  >
                    {copy.cancel}
                  </button>
                </div>
              )}

              {showSavedNotes && (
                <div className="medicine-note-workspace">
                  <div className="medicine-note-list" aria-label={copy.listAria}>
                    {savedNotes.map((note) => {
                      const checklist = getSavedNoteChecklist(note, language)
                      const progress = noteProgressById[note.id] ?? createEmptyMedicineNoteProgress()
                      const understoodCount = checklist.filter((item) => progress.understood.includes(item)).length
                      const active = activeSavedNote?.id === note.id

                      return (
                        <button
                          aria-pressed={active}
                          className={active ? 'medicine-note-select active' : 'medicine-note-select'}
                          key={note.id}
                          onClick={() => openSavedNote(note.id)}
                          type="button"
                        >
                          <span className="medicine-note-select-header">
                            <span className="source-pill">{formatHandoffSource(note.source, language)}</span>
                            {progress.checkedAt && <span className="checked-stamp">{copy.checked}</span>}
                          </span>
                          <strong>{note.title}</strong>
                          <small>{understoodCount}/{checklist.length} {copy.understood}</small>
                        </button>
                      )
                    })}
                  </div>

                  {activeSavedNote && (
                    <article className="medicine-note-detail readable-saved-card">
                      <div className="saved-card-header saved-card-header-row">
                        <div className="saved-card-title">
                          <span className="source-pill">{formatHandoffSource(activeSavedNote.source, language)}</span>
                          <strong>{activeSavedNote.title}</strong>
                        </div>
                        <button
                          aria-label={`${copy.deleteNoteLabel} ${activeSavedNote.title}`}
                          className="icon-action tiny-danger"
                          onClick={() => deleteSavedNote(activeSavedNote.id)}
                          type="button"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="medicine-note-progress-row">
                        <span>
                          <CheckCircle2 size={15} />
                          {activeUnderstoodCount}/{activeSavedNoteChecklist.length} {copy.progressUnderstood}
                        </span>
                        <span>
                          <FileText size={15} />
                          {activeSavedNoteProgress.personalNote.trim() ? copy.hasPersonalNote : copy.noPersonalNote}
                        </span>
                      </div>

                      <div className="saved-context-block">
                        <span>{copy.context}</span>
                        <p>{activeSavedNote.context}</p>
                      </div>

                      <div className="saved-readable-section">
                        <span>{copy.understanding}</span>
                        <div className="medicine-understanding-list">
                          {activeSavedNoteChecklist.map((item) => {
                            const checked = activeSavedNoteProgress.understood.includes(item)

                            return (
                              <button
                                aria-pressed={checked}
                                className={checked ? 'check-row active' : 'check-row'}
                                key={item}
                                onClick={() => toggleUnderstoodItem(activeSavedNote.id, item)}
                                type="button"
                              >
                                <span>{checked && <Check size={14} />}</span>
                                {item}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <label className="personal-note-field" htmlFor={`personal-note-${activeSavedNote.id}`}>
                        <span>{copy.personalNote}</span>
                        <textarea
                          id={`personal-note-${activeSavedNote.id}`}
                          onChange={(event) => updatePersonalNote(activeSavedNote.id, event.target.value)}
                          placeholder={copy.personalPlaceholder}
                          rows={3}
                          value={activeSavedNoteProgress.personalNote}
                        />
                        <small>{copy.autosave}</small>
                      </label>

                      <div className="medicine-note-actions">
                        <button
                          className={activeSavedNoteProgress.checkedAt ? 'secondary-button' : 'primary-button'}
                          onClick={() => toggleCheckedStatus(activeSavedNote.id)}
                          type="button"
                        >
                          <CheckCircle2 size={16} />
                          {activeSavedNoteProgress.checkedAt ? copy.unmarkChecked : copy.markChecked}
                        </button>
                        {activeSavedNoteProgress.checkedAt && (
                          <span className="checked-stamp">
                            {copy.checkedAt} {formatShortDateTime(activeSavedNoteProgress.checkedAt)}
                          </span>
                        )}
                      </div>

                      <p className="saved-safety-note">{activeSavedNote.safety}</p>
                    </article>
                  )}
                </div>
              )}
            </section>
          )}

          <div className="topic-grid">
            {medicineTopics.map((item) => (
              <button
                className={activeTopic === item.id ? 'topic-card active' : 'topic-card'}
                key={item.id}
                onClick={() => setActiveTopic(item.id)}
                type="button"
              >
                <span className="topic-card-heading">
                  <span className="topic-icon">
                    <Pill size={18} />
                  </span>
                  <strong>{item.label}</strong>
                </span>
                <span className="topic-note">{item.note}</span>
                <span className="topic-card-meta">
                  {item.checklist.length} hal dicek
                </span>
              </button>
            ))}
          </div>

          <section className="topic-detail-panel">
            <div className="topic-detail-heading">
              <span className="source-pill">{topic.label}</span>
              <h3>{copy.understandBefore}</h3>
              <p>{topic.bestFor}</p>
            </div>

            <div className="topic-detail-grid">
              <article className="detail-note-card caution">
                <ShieldAlert size={19} />
                <div>
                  <span>{copy.caution}</span>
                  <p>{topic.avoidWhen}</p>
                </div>
              </article>

              <article className="detail-note-card">
                <ClipboardCheck size={19} />
                <div>
                  <span>{copy.personalChecklist}</span>
                  <strong>{topicProgress} {copy.done}</strong>
                </div>
              </article>
            </div>

            <div className="interactive-check-list">
              {topic.checklist.map((item) => {
                const checked = checkedItems.includes(item)

                return (
                  <button
                    aria-pressed={checked}
                    className={checked ? 'check-row active' : 'check-row'}
                    key={item}
                    onClick={() => toggleTopicItem(item)}
                    type="button"
                  >
                    <span>{checked && <CheckCircle2 size={14} />}</span>
                    {item}
                  </button>
                )
              })}
            </div>

            <div className="question-panel">
              <MessageCircle size={19} />
              <div>
                <span>{copy.pharmacistQuestions}</span>
                <ul>
                  {topic.questions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="info-band">
            <ShieldAlert size={22} />
            <div>
              <span className="eyebrow">{query ? copy.searchNote : copy.safeReminder}</span>
              <strong>{query ? `${copy.noteFor} "${query}"` : copy.checkBefore}</strong>
              {query ? (
                <p>
                  {copy.queryGuidance}
                </p>
              ) : (
                <ul className="mini-guidance-list">
                  {topic.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <aside className="workspace-side">
          <FocusPanel feature={feature} language={language} />
          <section className="side-panel">
            <div className="side-heading">
              <CheckCircle2 size={19} />
              <div>
                <span className="eyebrow">{copy.checklistEyebrow}</span>
                <h3>{copy.checklistTitle}</h3>
              </div>
            </div>
            <ul className="check-list relaxed">
              {medicineChecklist.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={15} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </section>
    </main>
  )
}

function createEmptyMedicineNoteProgress(): MedicineNoteProgress {
  return {
    understood: [],
    personalNote: '',
  }
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

  return {
    understood,
    personalNote,
    checkedAt,
  }
}

function getSavedNoteChecklist(note: SavedMedicineNote, language: LanguageMode) {
  const copy = getUiCopy(language).medicine

  return [
    ...note.guidance,
    copy.understandNotDose,
    copy.askProfessional,
  ]
}

export default MedicinePage
