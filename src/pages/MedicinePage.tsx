import {
  CheckCircle2,
  ClipboardCheck,
  History,
  MessageCircle,
  Pill,
  Search,
  ShieldAlert,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
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
  const topic = medicineTopics.find((item) => item.id === activeTopic) ?? medicineTopics[0]
  const checkedItems = checkedTopicItems[topic.id] ?? []
  const topicProgress = `${checkedItems.length}/${topic.checklist.length}`
  const latestSavedNote = savedNotes[0]

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
    setConfirmClearNotes(false)
    setShowSavedNotes(false)
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
                  onClick={() => setShowSavedNotes(true)}
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
                <div className="saved-note-list">
                  {savedNotes.map((note) => (
                    <article className="saved-note-card readable-saved-card" key={note.id}>
                      <div className="saved-card-header saved-card-header-row">
                        <div className="saved-card-title">
                          <span className="source-pill">{note.source}</span>
                          <strong>{note.title}</strong>
                        </div>
                        <button
                          aria-label={`Hapus catatan ${note.title}`}
                          className="icon-action tiny-danger"
                          onClick={() => onDeleteMedicineNote(note.id)}
                          type="button"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="saved-context-block">
                        <span>Konteks singkat</span>
                        <p>{note.context}</p>
                      </div>

                      <div className="saved-readable-section">
                        <span>Yang perlu dipahami</span>
                        <ul className="readable-check-list">
                          {note.guidance.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <p className="saved-safety-note">{note.safety}</p>
                    </article>
                  ))}
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

export default MedicinePage
