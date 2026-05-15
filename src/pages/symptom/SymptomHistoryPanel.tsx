import { History, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { getUiCopy } from '../../i18n/uiCopy'
import type { LanguageMode, SavedSymptomRecord } from '../../types/sehatara'
import { formatShortDateTime } from '../../utils/dateTime'
import { formatAreaList } from './useSymptomWorkspace'

type SymptomHistoryPanelProps = {
  language: LanguageMode
  savedRecords: SavedSymptomRecord[]
  onDeleteRecord: (id: string) => void
  onClearRecords: () => void
}

function SymptomHistoryPanel({
  language,
  savedRecords,
  onDeleteRecord,
  onClearRecords,
}: SymptomHistoryPanelProps) {
  const copy = getUiCopy(language).symptom
  const [showHistory, setShowHistory] = useState(true)
  const [confirmClear, setConfirmClear] = useState(false)

  function clearAllHistory() {
    onClearRecords()
    setConfirmClear(false)
  }

  if (savedRecords.length === 0) {
    return null
  }

  return (
    <section className="history-strip-panel">
      <div className="history-toolbar">
        <div className="side-heading">
          <History size={19} />
          <div>
            <span className="eyebrow">{copy.historyEyebrow}</span>
            <h3>{copy.historyTitle}</h3>
          </div>
        </div>
        <div className="history-actions">
          <button
            className="text-button compact-button"
            onClick={() => setShowHistory((current) => !current)}
            type="button"
          >
            {showHistory ? copy.hide : copy.show}
          </button>
          <button
            aria-label={copy.deleteAllHistory}
            className="icon-action quiet-danger"
            onClick={() => setConfirmClear((current) => !current)}
            title={copy.deleteAllHistory}
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {confirmClear && (
        <div className="history-confirm">
          <span>{copy.confirmClear}</span>
          <button className="text-button compact-button" onClick={() => setConfirmClear(false)} type="button">
            {copy.cancel}
          </button>
          <button className="primary-button compact-button danger-button" onClick={clearAllHistory} type="button">
            {copy.delete}
          </button>
        </div>
      )}

      {showHistory && (
        <div className="history-list compact-history-list">
          {savedRecords.slice(0, 4).map((record) => (
            <article className="history-item" key={record.id}>
              <div>
                <strong>{record.title}</strong>
                <span>
                  {formatRecordAreas(record)} - {record.duration} - {record.intensity}/10
                </span>
              </div>
              <div className="history-item-footer">
                <small>{formatShortDateTime(record.createdAt, copy.recordTimeFallback)}</small>
                <button
                  aria-label={`${copy.deleteRecordLabel} ${record.title}`}
                  className="icon-action tiny-danger"
                  onClick={() => onDeleteRecord(record.id)}
                  type="button"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function formatRecordAreas(record: SavedSymptomRecord) {
  const legacyRecord = record as SavedSymptomRecord & { area?: string }
  const recordAreas = Array.isArray(legacyRecord.areas) && legacyRecord.areas.length > 0
    ? legacyRecord.areas
    : legacyRecord.area
      ? [legacyRecord.area]
      : []

  return formatAreaList(recordAreas)
}

export default SymptomHistoryPanel
