import { Check, CheckCircle2, FileText, History, Trash2 } from 'lucide-react'
import { formatHandoffSource, getUiCopy } from '../../i18n/uiCopy'
import type { LanguageMode, SavedMedicineNote } from '../../types/sehatara'
import { formatShortDateTime } from '../../utils/dateTime'
import type { MedicineNoteProgress } from './useMedicineWorkspace'
import { getSavedNoteChecklist } from './useMedicineWorkspace'

type MedicineSavedNotesPanelProps = {
  language: LanguageMode
  savedNotes: SavedMedicineNote[]
  showSavedNotes: boolean
  confirmClearNotes: boolean
  latestSavedNote: SavedMedicineNote | undefined
  activeSavedNote: SavedMedicineNote | undefined
  activeSavedNoteChecklist: string[]
  activeSavedNoteProgress: MedicineNoteProgress
  activeUnderstoodCount: number
  noteProgressById: Record<string, MedicineNoteProgress>
  onToggleShowNotes: () => void
  onToggleConfirmClear: () => void
  onCancelConfirmClear: () => void
  onOpenNote: (noteId: string) => void
  onDeleteNote: (noteId: string) => void
  onClearAllNotes: () => void
  onToggleUnderstood: (noteId: string, item: string) => void
  onUpdatePersonalNote: (noteId: string, personalNote: string) => void
  onToggleCheckedStatus: (noteId: string) => void
}

function MedicineSavedNotesPanel({
  language,
  savedNotes,
  showSavedNotes,
  confirmClearNotes,
  latestSavedNote,
  activeSavedNote,
  activeSavedNoteChecklist,
  activeSavedNoteProgress,
  activeUnderstoodCount,
  noteProgressById,
  onToggleShowNotes,
  onToggleConfirmClear,
  onCancelConfirmClear,
  onOpenNote,
  onDeleteNote,
  onClearAllNotes,
  onToggleUnderstood,
  onUpdatePersonalNote,
  onToggleCheckedStatus,
}: MedicineSavedNotesPanelProps) {
  const copy = getUiCopy(language).medicine

  if (savedNotes.length === 0) {
    return null
  }

  return (
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
          <button className="text-button compact-button" onClick={onToggleShowNotes} type="button">
            {showSavedNotes ? copy.close : copy.seeAll}
          </button>
          <button
            aria-label={copy.deleteAllLabel}
            className="icon-action quiet-danger"
            onClick={onToggleConfirmClear}
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {!showSavedNotes && latestSavedNote && (
        <button
          className="saved-summary-card"
          onClick={() => onOpenNote(latestSavedNote.id)}
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
          <button className="primary-button danger-button compact-button" onClick={onClearAllNotes} type="button">
            {copy.delete}
          </button>
          <button className="text-button compact-button" onClick={onCancelConfirmClear} type="button">
            {copy.cancel}
          </button>
        </div>
      )}

      {showSavedNotes && (
        <div className="medicine-note-workspace">
          <div className="medicine-note-list" aria-label={copy.listAria}>
            {savedNotes.map((note) => {
              const checklist = getSavedNoteChecklist(note, language)
              const progress = noteProgressById[note.id] ?? { understood: [], personalNote: '' }
              const understoodCount = checklist.filter((item) => progress.understood.includes(item)).length
              const active = activeSavedNote?.id === note.id

              return (
                <button
                  aria-pressed={active}
                  className={active ? 'medicine-note-select active' : 'medicine-note-select'}
                  key={note.id}
                  onClick={() => onOpenNote(note.id)}
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
                  onClick={() => onDeleteNote(activeSavedNote.id)}
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
                        onClick={() => onToggleUnderstood(activeSavedNote.id, item)}
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
                  onChange={(event) => onUpdatePersonalNote(activeSavedNote.id, event.target.value)}
                  placeholder={copy.personalPlaceholder}
                  rows={3}
                  value={activeSavedNoteProgress.personalNote}
                />
                <small>{copy.autosave}</small>
              </label>

              <div className="medicine-note-actions">
                <button
                  className={activeSavedNoteProgress.checkedAt ? 'secondary-button' : 'primary-button'}
                  onClick={() => onToggleCheckedStatus(activeSavedNote.id)}
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
  )
}

export default MedicineSavedNotesPanel
