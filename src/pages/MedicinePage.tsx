import {
  CheckCircle2,
  ClipboardCheck,
  MessageCircle,
  Pill,
  Search,
  ShieldAlert,
} from 'lucide-react'
import FocusPanel from '../components/common/FocusPanel'
import PageHero from '../components/common/PageHero'
import { getUiCopy } from '../i18n/uiCopy'
import type { FeatureConfig, LanguageMode, PageId, SavedMedicineNote } from '../types/sehatara'
import MedicineSavedNotesPanel from './medicine/MedicineSavedNotesPanel'
import { useMedicineWorkspace } from './medicine/useMedicineWorkspace'

type MedicinePageProps = {
  feature: FeatureConfig
  language: LanguageMode
  onClearMedicineNotes: () => void
  onDeleteMedicineNote: (id: string) => void
  onNavigate: (page: PageId) => void
  savedNotes: SavedMedicineNote[]
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
  const workspace = useMedicineWorkspace(language, savedNotes)

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
              onChange={(event) => workspace.setQuery(event.target.value)}
              placeholder={copy.searchPlaceholder}
              type="text"
              value={workspace.query}
            />
          </div>

          <MedicineSavedNotesPanel
            language={language}
            savedNotes={savedNotes}
            showSavedNotes={workspace.showSavedNotes}
            confirmClearNotes={workspace.confirmClearNotes}
            latestSavedNote={workspace.latestSavedNote}
            activeSavedNote={workspace.activeSavedNote}
            activeSavedNoteChecklist={workspace.activeSavedNoteChecklist}
            activeSavedNoteProgress={workspace.activeSavedNoteProgress}
            activeUnderstoodCount={workspace.activeUnderstoodCount}
            noteProgressById={workspace.noteProgressById}
            onToggleShowNotes={workspace.toggleShowSavedNotes}
            onToggleConfirmClear={workspace.toggleConfirmClear}
            onCancelConfirmClear={workspace.cancelConfirmClear}
            onOpenNote={workspace.openSavedNote}
            onDeleteNote={(id) => workspace.deleteSavedNote(id, onDeleteMedicineNote)}
            onClearAllNotes={() => workspace.clearAllNotes(onClearMedicineNotes)}
            onToggleUnderstood={workspace.toggleUnderstoodItem}
            onUpdatePersonalNote={workspace.updatePersonalNote}
            onToggleCheckedStatus={workspace.toggleCheckedStatus}
          />

          <div className="topic-grid">
            {workspace.medicineTopics.map((item) => (
              <button
                className={workspace.activeTopic === item.id ? 'topic-card active' : 'topic-card'}
                key={item.id}
                onClick={() => workspace.setActiveTopic(item.id)}
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
              <span className="source-pill">{workspace.topic.label}</span>
              <h3>{copy.understandBefore}</h3>
              <p>{workspace.topic.bestFor}</p>
            </div>

            <div className="topic-detail-grid">
              <article className="detail-note-card caution">
                <ShieldAlert size={19} />
                <div>
                  <span>{copy.caution}</span>
                  <p>{workspace.topic.avoidWhen}</p>
                </div>
              </article>

              <article className="detail-note-card">
                <ClipboardCheck size={19} />
                <div>
                  <span>{copy.personalChecklist}</span>
                  <strong>{workspace.topicProgress} {copy.done}</strong>
                </div>
              </article>
            </div>

            <div className="interactive-check-list">
              {workspace.topic.checklist.map((item) => {
                const checked = workspace.checkedItems.includes(item)

                return (
                  <button
                    aria-pressed={checked}
                    className={checked ? 'check-row active' : 'check-row'}
                    key={item}
                    onClick={() => workspace.toggleTopicItem(item)}
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
                  {workspace.topic.questions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="info-band">
            <ShieldAlert size={22} />
            <div>
              <span className="eyebrow">{workspace.query ? copy.searchNote : copy.safeReminder}</span>
              <strong>{workspace.query ? `${copy.noteFor} "${workspace.query}"` : copy.checkBefore}</strong>
              {workspace.query ? (
                <p>{copy.queryGuidance}</p>
              ) : (
                <ul className="mini-guidance-list">
                  {workspace.topic.checklist.map((item) => (
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
              {workspace.medicineChecklist.map((item) => (
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
