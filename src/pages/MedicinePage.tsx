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
import { medicineChecklist, medicineTopics } from '../data/medicineData'
import type { FeatureConfig, PageId, SavedMedicineNote } from '../types/sehatara'

type MedicinePageProps = {
  feature: FeatureConfig
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

const MEDICINE_NOTE_PROGRESS_KEY = 'sehatara-medicine-note-progress'

function MedicinePage({
  feature,
  onClearMedicineNotes,
  onDeleteMedicineNote,
  onNavigate,
  savedNotes,
}: MedicinePageProps) {
  const [query, setQuery] = useState('')
  const [activeTopic, setActiveTopic] = useState(medicineTopics[0].id)
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
    () => (activeSavedNote ? getSavedNoteChecklist(activeSavedNote) : []),
    [activeSavedNote],
  )
  const activeSavedNoteProgress = activeSavedNote
    ? noteProgressById[activeSavedNote.id] ?? createEmptyMedicineNoteProgress()
    : createEmptyMedicineNoteProgress()
  const activeUnderstoodCount = activeSavedNoteChecklist.filter((item) =>
    activeSavedNoteProgress.understood.includes(item),
  ).length

  useEffect(() => {
    window.localStorage.setItem(MEDICINE_NOTE_PROGRESS_KEY, JSON.stringify(noteProgressById))
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
      checkedAt: progress.checkedAt ? undefined : new Date().toISOString(),
    }))
  }

  return (
    <main className="feature-page medicine-page" data-accent={feature.accent}>
      <PageHero feature={feature} onNavigate={onNavigate} />

      <section className="tool-layout">
        <div className="interactive-panel">
          <div className="workspace-toolbar">
            <div>
              <span className="eyebrow">Catatan obat</span>
              <h2>Catat dulu, baru tanyakan</h2>
            </div>
            <span className="soft-status">Info umum</span>
          </div>

          <div className="medicine-search">
            <Search size={20} />
            <input
              aria-label="Nama obat"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tulis nama obat atau kategori, misalnya obat flu..."
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
                    <span className="eyebrow">Dari fitur lain</span>
                    <h3>Catatan obat tersimpan</h3>
                  </div>
                </div>
                <div className="saved-panel-actions">
                  <span className="source-pill">{savedNotes.length} catatan</span>
                  <button
                    className="text-button compact-button"
                    onClick={() => {
                      setShowSavedNotes((current) => !current)
                      setConfirmClearNotes(false)
                    }}
                    type="button"
                  >
                    {showSavedNotes ? 'Tutup' : 'Lihat semua'}
                  </button>
                  <button
                    aria-label="Hapus semua catatan obat"
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
                    <span className="source-pill">Terbaru</span>
                    <span>{savedNotes.length} catatan tersimpan</span>
                  </span>
                  <strong>{latestSavedNote.title}</strong>
                  <small>{latestSavedNote.context}</small>
                </button>
              )}

              {confirmClearNotes && (
                <div className="history-confirm">
                  <span>Hapus semua catatan obat tersimpan?</span>
                  <button
                    className="primary-button danger-button compact-button"
                    onClick={handleClearMedicineNotes}
                    type="button"
                  >
                    Hapus
                  </button>
                  <button
                    className="text-button compact-button"
                    onClick={() => setConfirmClearNotes(false)}
                    type="button"
                  >
                    Batal
                  </button>
                </div>
              )}

              {showSavedNotes && (
                <div className="medicine-note-workspace">
                  <div className="medicine-note-list" aria-label="Daftar catatan obat tersimpan">
                    {savedNotes.map((note) => {
                      const checklist = getSavedNoteChecklist(note)
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
                            <span className="source-pill">{note.source}</span>
                            {progress.checkedAt && <span className="checked-stamp">Sudah dicek</span>}
                          </span>
                          <strong>{note.title}</strong>
                          <small>{understoodCount}/{checklist.length} dipahami</small>
                        </button>
                      )
                    })}
                  </div>

                  {activeSavedNote && (
                    <article className="medicine-note-detail readable-saved-card">
                      <div className="saved-card-header saved-card-header-row">
                        <div className="saved-card-title">
                          <span className="source-pill">{activeSavedNote.source}</span>
                          <strong>{activeSavedNote.title}</strong>
                        </div>
                        <button
                          aria-label={`Hapus catatan ${activeSavedNote.title}`}
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
                          {activeUnderstoodCount}/{activeSavedNoteChecklist.length} dipahami
                        </span>
                        <span>
                          <FileText size={15} />
                          {activeSavedNoteProgress.personalNote.trim() ? 'Ada catatan pribadi' : 'Belum ada catatan pribadi'}
                        </span>
                      </div>

                      <div className="saved-context-block">
                        <span>Konteks singkat</span>
                        <p>{activeSavedNote.context}</p>
                      </div>

                      <div className="saved-readable-section">
                        <span>Checklist pemahaman</span>
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
                        <span>Catatan pribadi sederhana</span>
                        <textarea
                          id={`personal-note-${activeSavedNote.id}`}
                          onChange={(event) => updatePersonalNote(activeSavedNote.id, event.target.value)}
                          placeholder="Contoh: tanyakan ke apoteker karena sedang minum obat lain..."
                          rows={3}
                          value={activeSavedNoteProgress.personalNote}
                        />
                        <small>Tersimpan otomatis di perangkat ini.</small>
                      </label>

                      <div className="medicine-note-actions">
                        <button
                          className={activeSavedNoteProgress.checkedAt ? 'secondary-button' : 'primary-button'}
                          onClick={() => toggleCheckedStatus(activeSavedNote.id)}
                          type="button"
                        >
                          <CheckCircle2 size={16} />
                          {activeSavedNoteProgress.checkedAt ? 'Batalkan sudah dicek' : 'Tandai sudah dicek'}
                        </button>
                        {activeSavedNoteProgress.checkedAt && (
                          <span className="checked-stamp">
                            Dicek {formatMedicineCheckedTime(activeSavedNoteProgress.checkedAt)}
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
              <h3>Pahami sebelum memilih</h3>
              <p>{topic.bestFor}</p>
            </div>

            <div className="topic-detail-grid">
              <article className="detail-note-card caution">
                <ShieldAlert size={19} />
                <div>
                  <span>Hati-hati bila</span>
                  <p>{topic.avoidWhen}</p>
                </div>
              </article>

              <article className="detail-note-card">
                <ClipboardCheck size={19} />
                <div>
                  <span>Checklist pribadi</span>
                  <strong>{topicProgress} selesai</strong>
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
                <span>Pertanyaan untuk apoteker</span>
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
              <span className="eyebrow">{query ? 'Catatan pencarian' : 'Pengingat aman'}</span>
              <strong>{query ? `Catatan untuk "${query}"` : 'Yang perlu dicek sebelum memilih'}</strong>
              {query ? (
                <p>
                  Pastikan kamu membaca label, aturan pakai, dan peringatan pada kemasan.
                  Untuk kondisi pribadi, tanyakan langsung ke apoteker atau dokter.
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
          <FocusPanel feature={feature} />
          <section className="side-panel">
            <div className="side-heading">
              <CheckCircle2 size={19} />
              <div>
                <span className="eyebrow">Checklist</span>
                <h3>Sebelum memakai obat</h3>
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
  const stored = window.localStorage.getItem(MEDICINE_NOTE_PROGRESS_KEY)

  if (!stored) {
    return {}
  }

  try {
    const parsed = JSON.parse(stored)

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }

    return Object.entries(parsed as Record<string, unknown>).reduce<Record<string, MedicineNoteProgress>>(
      (progressMap, [id, value]) => {
        const progress = normalizeMedicineNoteProgress(value)

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

function normalizeMedicineNoteProgress(value: unknown): MedicineNoteProgress | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const progress = value as Record<string, unknown>
  const understood = Array.isArray(progress.understood)
    ? progress.understood
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    : []
  const personalNote = typeof progress.personalNote === 'string' ? progress.personalNote : ''
  const checkedAt =
    typeof progress.checkedAt === 'string' && !Number.isNaN(new Date(progress.checkedAt).getTime())
      ? progress.checkedAt
      : undefined

  return {
    understood,
    personalNote,
    checkedAt,
  }
}

function getSavedNoteChecklist(note: SavedMedicineNote) {
  return [
    ...note.guidance,
    'Saya paham catatan ini bukan resep atau dosis personal.',
    'Saya tahu kapan perlu bertanya ke apoteker atau dokter.',
  ]
}

function formatMedicineCheckedTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'baru saja'
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default MedicinePage
