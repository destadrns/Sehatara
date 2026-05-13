import { Brain, CheckCircle2, Heart, Pause, Play, RotateCcw, Trash2, Wind } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import FocusPanel from '../components/common/FocusPanel'
import PageHero from '../components/common/PageHero'
import { breathingSteps, groundingSteps } from '../data/mentalData'
import type { FeatureConfig, PageId } from '../types/sehatara'
import { createId } from '../utils/assistantResponses'
import { createIsoTimestamp, formatShortDateTime, isSameLocalDate } from '../utils/dateTime'
import {
  normalizeDateString,
  readStorageList,
  storageKeys,
  storageLimits,
  writeStorageValue,
} from '../utils/storage'

type MentalPageProps = {
  feature: FeatureConfig
  onNavigate: (page: PageId) => void
}

type CalmMode = 'breathing' | 'grounding'

type CalmSessionConfig = {
  id: CalmMode
  label: string
  eyebrow: string
  description: string
  durationSeconds: number
  steps: string[]
}

type CalmSessionRecord = {
  id: string
  mode: CalmMode
  label: string
  durationSeconds: number
  mood: number
  createdAt: string
}

const calmSessionOptions: CalmSessionConfig[] = [
  {
    id: 'breathing',
    label: 'Napas pelan',
    eyebrow: 'Latihan napas',
    description: 'Ikuti ritme napas pelan. Tidak perlu sempurna, cukup lebih teratur dari sebelumnya.',
    durationSeconds: 120,
    steps: breathingSteps,
  },
  {
    id: 'grounding',
    label: 'Grounding 5-4-3-2-1',
    eyebrow: 'Kembali ke sekitar',
    description: 'Pindahkan perhatian ke hal nyata di ruangan agar pikiran punya pijakan lagi.',
    durationSeconds: 150,
    steps: groundingSteps,
  },
]

function MentalPage({ feature, onNavigate }: MentalPageProps) {
  const [mood, setMood] = useState(3)
  const [activeMode, setActiveMode] = useState<CalmMode>('breathing')
  const [remainingSeconds, setRemainingSeconds] = useState(calmSessionOptions[0].durationSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionRecords, setSessionRecords] = useState<CalmSessionRecord[]>(readCalmSessionRecords)
  const activeSession = useMemo(
    () => calmSessionOptions.find((option) => option.id === activeMode) ?? calmSessionOptions[0],
    [activeMode],
  )
  const elapsedSeconds = activeSession.durationSeconds - remainingSeconds
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / activeSession.durationSeconds) * 100))
  const activeStep = getActiveCalmStep(activeSession, elapsedSeconds)
  const todaySessionCount = sessionRecords.filter((record) => isSameLocalDate(record.createdAt, new Date())).length
  const completedMinutes = Math.round(
    sessionRecords.reduce((total, record) => total + record.durationSeconds, 0) / 60,
  )
  const breathingCount = sessionRecords.filter((record) => record.mode === 'breathing').length
  const groundingCount = sessionRecords.filter((record) => record.mode === 'grounding').length

  useEffect(() => {
    writeStorageValue(storageKeys.calmSessionRecords, sessionRecords.slice(0, storageLimits.calmSessionRecords))
  }, [sessionRecords])

  useEffect(() => {
    if (!isRunning) {
      return undefined
    }

    if (remainingSeconds <= 0) {
      finishSession()
      return undefined
    }

    const timerId = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(current - 1, 0))
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [isRunning, remainingSeconds])

  function changeMode(mode: CalmMode) {
    if (mode === activeMode) {
      return
    }

    const nextSession = calmSessionOptions.find((option) => option.id === mode) ?? calmSessionOptions[0]
    setActiveMode(mode)
    setRemainingSeconds(nextSession.durationSeconds)
    setIsRunning(false)
  }

  function toggleSession() {
    if (remainingSeconds <= 0) {
      setRemainingSeconds(activeSession.durationSeconds)
    }

    setIsRunning((current) => !current)
  }

  function resetSession() {
    setIsRunning(false)
    setRemainingSeconds(activeSession.durationSeconds)
  }

  function finishSession() {
    const completedDuration = Math.max(15, activeSession.durationSeconds - remainingSeconds)
    const record: CalmSessionRecord = {
      id: createId(),
      mode: activeSession.id,
      label: activeSession.label,
      durationSeconds: completedDuration,
      mood,
      createdAt: createIsoTimestamp(),
    }

    setIsRunning(false)
    setRemainingSeconds(activeSession.durationSeconds)
    setSessionRecords((current) => [record, ...current].slice(0, storageLimits.calmSessionRecords))
  }

  function deleteSessionRecord(id: string) {
    setSessionRecords((current) => current.filter((record) => record.id !== id))
  }

  function clearSessionRecords() {
    setSessionRecords([])
  }

  return (
    <main className="feature-page mental-page" data-accent={feature.accent}>
      <PageHero feature={feature} onNavigate={onNavigate} />

      <section className="tool-layout">
        <div className="interactive-panel calm-panel">
          <div className="workspace-toolbar">
            <div>
              <span className="eyebrow">Latihan singkat</span>
              <h2>Ambil jeda terpandu</h2>
            </div>
            <span className="soft-status">{todaySessionCount} sesi hari ini</span>
          </div>

          <div className="calm-mode-grid" aria-label="Pilih latihan ruang tenang">
            {calmSessionOptions.map((option) => {
              const active = option.id === activeMode
              const Icon = option.id === 'breathing' ? Wind : Brain

              return (
                <button
                  aria-pressed={active}
                  className={active ? 'calm-mode-card active' : 'calm-mode-card'}
                  key={option.id}
                  onClick={() => changeMode(option.id)}
                  type="button"
                >
                  <Icon size={20} />
                  <span>
                    <strong>{option.label}</strong>
                    <small>{formatDuration(option.durationSeconds)}</small>
                  </span>
                </button>
              )
            })}
          </div>

          <section className="calm-session-card">
            <div className="calm-session-visual" aria-label={`Sisa waktu ${formatTimer(remainingSeconds)}`}>
              <span>{formatTimer(remainingSeconds)}</span>
              <small>{progressPercent}%</small>
            </div>
            <div className="calm-session-copy">
              <span className="eyebrow">{activeSession.eyebrow}</span>
              <h3>{activeStep}</h3>
              <p>{activeSession.description}</p>
              <div className="calm-progress-track">
                <span style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            <div className="calm-session-actions">
              <button className="primary-button" onClick={toggleSession} type="button">
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
                {isRunning ? 'Jeda' : 'Mulai'}
              </button>
              <button
                className="secondary-button"
                disabled={elapsedSeconds < 15}
                onClick={finishSession}
                type="button"
              >
                <CheckCircle2 size={16} />
                Selesai
              </button>
              <button className="text-button compact-button" onClick={resetSession} type="button">
                <RotateCcw size={14} />
                Reset
              </button>
            </div>
          </section>

          <section className="mood-scale">
            <div>
              <span className="eyebrow">Cek kondisi</span>
              <h3>Seberapa penuh pikiranmu sekarang?</h3>
            </div>
            <input
              aria-label="Skala kondisi mental"
              max="5"
              min="1"
              onChange={(event) => setMood(Number(event.target.value))}
              type="range"
              value={mood}
            />
            <span>{getMoodLabel(mood)}</span>
          </section>

          {sessionRecords.length > 0 && (
            <section className="calm-history-card">
              <div className="side-heading inline">
                <Heart size={19} />
                <div>
                  <span className="eyebrow">Riwayat singkat</span>
                  <h3>Sesi yang selesai</h3>
                </div>
              </div>
              <div className="calm-history-list">
                {sessionRecords.slice(0, 4).map((record) => (
                  <article className="calm-history-item" key={record.id}>
                    <div>
                      <strong>{record.label}</strong>
                      <span>
                        Sesi selesai - {formatDuration(record.durationSeconds)} - {getMoodLabel(record.mood)} -{' '}
                        {formatShortDateTime(record.createdAt)}
                      </span>
                    </div>
                    <button
                      aria-label={`Hapus riwayat ${record.label}`}
                      className="icon-action tiny-danger"
                      onClick={() => deleteSessionRecord(record.id)}
                      type="button"
                    >
                      <Trash2 size={14} />
                    </button>
                  </article>
                ))}
              </div>
              <button className="text-button compact-button" onClick={clearSessionRecords} type="button">
                Hapus riwayat
              </button>
            </section>
          )}
        </div>

        <aside className="workspace-side">
          <FocusPanel feature={feature} />
          <section className="side-panel">
            <span className="eyebrow">Progress</span>
            <h3 className="progress-title">{sessionRecords.length} sesi</h3>
            <p className="muted-copy">
              Total sekitar {completedMinutes} menit jeda. Napas pelan {breathingCount} kali,
              grounding {groundingCount} kali.
            </p>
          </section>
          <section className="side-panel">
            <div className="side-heading">
              <Heart size={19} />
              <div>
                <span className="eyebrow">Catatan aman</span>
                <h3>Kalau terasa krisis</h3>
              </div>
            </div>
            <p className="muted-copy">
              Jika muncul dorongan menyakiti diri sendiri atau orang lain, jangan hadapi
              sendiri. Hubungi layanan darurat setempat atau orang terpercaya sekarang.
            </p>
          </section>
        </aside>
      </section>
    </main>
  )
}

function getActiveCalmStep(session: CalmSessionConfig, elapsedSeconds: number) {
  if (session.id === 'breathing') {
    return session.steps[Math.floor(elapsedSeconds / 8) % session.steps.length]
  }

  const stepDuration = session.durationSeconds / session.steps.length
  const stepIndex = Math.min(session.steps.length - 1, Math.floor(elapsedSeconds / stepDuration))
  return session.steps[stepIndex]
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60))
  return `${minutes} menit`
}

function readCalmSessionRecords(): CalmSessionRecord[] {
  return readStorageList(
    storageKeys.calmSessionRecords,
    normalizeCalmSessionRecord,
    storageLimits.calmSessionRecords,
  )
}

function normalizeCalmSessionRecord(value: unknown): CalmSessionRecord | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Partial<CalmSessionRecord>
  const mode = record.mode === 'breathing' || record.mode === 'grounding' ? record.mode : null
  const createdAt = normalizeDateString(record.createdAt)

  if (!mode || !createdAt) {
    return null
  }

  return {
    id: typeof record.id === 'string' && record.id ? record.id : createId(),
    mode,
    label: typeof record.label === 'string' && record.label ? record.label : getModeLabel(mode),
    durationSeconds:
      typeof record.durationSeconds === 'number' && record.durationSeconds > 0
        ? record.durationSeconds
        : 60,
    mood: typeof record.mood === 'number' && record.mood >= 1 && record.mood <= 5 ? record.mood : 3,
    createdAt,
  }
}

function getModeLabel(mode: CalmMode) {
  return mode === 'breathing' ? 'Napas pelan' : 'Grounding 5-4-3-2-1'
}

function getMoodLabel(value: number) {
  if (value <= 2) {
    return 'Mulai lebih tenang'
  }

  if (value === 3) {
    return 'Masih cukup penuh'
  }

  return 'Butuh jeda lebih serius'
}

export default MentalPage
