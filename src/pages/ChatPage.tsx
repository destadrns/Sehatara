import { ArrowRight, ArrowUp, Bot, Leaf, Pill, RotateCcw, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import AssistantMessageBubble from '../components/common/AssistantMessageBubble'
import FocusPanel from '../components/common/FocusPanel'
import PageHero from '../components/common/PageHero'
import { chatStarterPrompts } from '../data/chatData'
import type {
  AssistantMessage,
  ChatAiResult,
  ChatHistoryItem,
  ChatMessage,
  FeatureConfig,
  PageId,
  SaveMedicineNoteInput,
  SaveWellnessPlanInput,
} from '../types/sehatara'
import { createId } from '../utils/assistantResponses'
import { askGeminiChat, getGeminiChatErrorMessage } from '../utils/geminiChat'

type ChatPageProps = {
  feature: FeatureConfig
  onNavigate: (page: PageId) => void
  onSaveMedicineNote: (note: SaveMedicineNoteInput) => void
  onSaveWellnessPlan: (plan: SaveWellnessPlanInput) => void
}

function ChatPage({
  feature,
  onNavigate,
  onSaveMedicineNote,
  onSaveWellnessPlan,
}: ChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createIntroMessage()])
  const [draft, setDraft] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [chatError, setChatError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const lastGeminiMessage = [...messages].reverse().find(isGeminiAssistantMessage)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isThinking])

  async function submitChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedDraft = draft.trim()

    if (!trimmedDraft || isThinking) {
      return
    }

    const userMessage: ChatMessage = { id: createId(), role: 'user', body: trimmedDraft }
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setDraft('')
    setChatError('')
    setIsThinking(true)

    try {
      const result = await askGeminiChat({
        message: trimmedDraft,
        history: buildChatHistory(nextMessages),
      })

      setMessages((current) => [...current, createGeminiChatMessage(trimmedDraft, result)])
    } catch (error) {
      const message = getGeminiChatErrorMessage(error)
      setChatError(message)
      setMessages((current) => [...current, createChatErrorMessage(message)])
    } finally {
      setIsThinking(false)
    }
  }

  function resetChat() {
    setMessages([createIntroMessage()])
    setDraft('')
    setChatError('')
  }

  function saveChatMedicineNote() {
    if (!lastGeminiMessage) {
      return
    }

    onSaveMedicineNote(createChatMedicineHandoff(lastGeminiMessage))
    onNavigate('medicine')
  }

  function saveChatWellnessPlan() {
    if (!lastGeminiMessage) {
      return
    }

    onSaveWellnessPlan(createChatWellnessHandoff(lastGeminiMessage))
    onNavigate('preventive')
  }

  return (
    <main className="feature-page chat-page" data-accent={feature.accent}>
      <PageHero feature={feature} onNavigate={onNavigate} />

      <section className="feature-workspace chat-workspace">
        <div className="workspace-main">
          <div className="workspace-toolbar">
            <div>
              <span className="eyebrow">Ruang chat khusus</span>
              <h2>Tanya Sehatara</h2>
            </div>
            <button className="icon-action" onClick={resetChat} title="Reset chat" type="button">
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="starter-row" aria-label="Contoh pertanyaan chat">
            {chatStarterPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setDraft(prompt)
                  setChatError('')
                }}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="conversation-panel">
            {messages.map((message) =>
              message.role === 'user' ? (
                <article className="message user-message" key={message.id}>
                  <p>{message.body}</p>
                </article>
              ) : (
                <AssistantMessageBubble key={message.id} message={message} />
              ),
            )}

            {isThinking && (
              <article className="message assistant-message thinking">
                <span className="assistant-avatar">
                  <Sparkles size={17} />
                </span>
                <div className="assistant-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </article>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="feature-composer" onSubmit={submitChat}>
            <label htmlFor="chatInput">Tulis pertanyaanmu</label>
            <textarea
              id="chatInput"
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Contoh: Apa yang perlu saya siapkan sebelum konsultasi ke dokter?"
              rows={4}
              value={draft}
              disabled={isThinking}
            />
            {chatError && <p className="form-alert">{chatError}</p>}
            <div className="composer-actions">
              <span>Jawaban diambil dari Gemini API untuk edukasi awal, bukan diagnosis atau resep.</span>
              <button disabled={!draft.trim() || isThinking} type="submit">
                {isThinking ? 'Meminta Gemini...' : 'Kirim'}
                <ArrowUp size={17} />
              </button>
            </div>
          </form>
        </div>

        <aside className="workspace-side">
          <FocusPanel feature={feature} />
          <section className="side-panel">
            <div className="side-heading">
              <Bot size={19} />
              <div>
                <span className="eyebrow">Kapan pakai chat?</span>
                <h3>Saat pertanyaanmu campuran</h3>
              </div>
            </div>
            <p className="muted-copy">
              Gunakan chat untuk pertanyaan umum. Untuk gejala, obat, kebiasaan sehat,
              atau latihan tenang, halaman khusus biasanya lebih enak dipakai.
            </p>

            {lastGeminiMessage && !isThinking && (
              <div className="chat-handoff">
                <span className="eyebrow">Bawa ke fitur lain</span>
                <button className="handoff-mini medicine" onClick={saveChatMedicineNote} type="button">
                  <Pill size={17} />
                  <span>Simpan catatan obat</span>
                  <ArrowRight size={15} />
                </button>
                <button className="handoff-mini wellness" onClick={saveChatWellnessPlan} type="button">
                  <Leaf size={17} />
                  <span>Simpan rencana sehat</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </section>
        </aside>
      </section>
    </main>
  )
}

function createIntroMessage(): ChatMessage {
  return {
    id: createId(),
    role: 'assistant',
    title: 'Halo, saya Sehatara',
    body:
      'Ruang ini khusus untuk tanya bebas. Saya akan menjaga jawaban tetap edukatif, sederhana, dan tidak menggantikan tenaga medis.',
    points: [
      'Tulis pertanyaan dengan bahasa biasa.',
      'Jangan masukkan data pribadi sensitif.',
      'Untuk tanda bahaya, cari bantuan medis langsung.',
    ],
    nextStep: 'Pilih contoh pertanyaan atau tulis pertanyaanmu sendiri.',
  }
}

function createGeminiChatMessage(input: string, result: ChatAiResult): AssistantMessage {
  return {
    id: createId(),
    role: 'assistant',
    title: result.title,
    body: result.body,
    points: result.points,
    warning: result.warning,
    nextStep: result.nextStep,
    source: result.source,
    relatedUserInput: input,
    handoffSummary: result.handoffSummary,
    medicineNote: result.medicineNote,
    recoveryPlan: result.recoveryPlan,
    safetyMessage: result.safetyMessage,
  }
}

function createChatErrorMessage(errorMessage: string): AssistantMessage {
  return {
    id: createId(),
    role: 'assistant',
    title: 'Gemini belum bisa menjawab',
    body: errorMessage,
    points: [
      'Tidak ada jawaban AI yang dibuat untuk pertanyaan ini.',
      'Pastikan API key, koneksi internet, dan server lokal masih aktif.',
      'Kirim ulang pertanyaan setelah konfigurasi siap.',
    ],
    warning: 'Fitur Tanya AI membutuhkan respons Gemini agar hasilnya valid.',
    nextStep: 'Coba kirim ulang setelah server dan Gemini API aktif.',
  }
}

function buildChatHistory(messages: ChatMessage[]): ChatHistoryItem[] {
  return messages.slice(-8).map((message) => {
    if (message.role === 'user') {
      return {
        role: 'user',
        text: message.body,
      }
    }

    return {
      role: 'assistant',
      text: `${message.title}. ${message.body} ${message.points.join(' ')}`,
    }
  })
}

function isGeminiAssistantMessage(message: ChatMessage): message is AssistantMessage {
  return message.role === 'assistant' && message.source === 'gemini'
}

function getHandoffContext(message: AssistantMessage) {
  return (
    message.handoffSummary ||
    `${message.relatedUserInput ?? 'Pertanyaan chat'} ${message.body}`.trim()
  )
}

function createChatMedicineHandoff(message: AssistantMessage): SaveMedicineNoteInput {
  return {
    source: 'Tanya AI',
    title: `Catatan obat dari ${message.title}`,
    context: getHandoffContext(message),
    guidance:
      message.medicineNote && message.medicineNote.length > 0
        ? message.medicineNote
        : message.points,
    safety:
      message.safetyMessage ||
      message.warning ||
      'Sehatara tidak memberi dosis personal, merek wajib, atau keputusan mengganti obat dokter.',
  }
}

function createChatWellnessHandoff(message: AssistantMessage): SaveWellnessPlanInput {
  return {
    source: 'Tanya AI',
    title: `Rencana sehat dari ${message.title}`,
    context: getHandoffContext(message),
    steps:
      message.recoveryPlan && message.recoveryPlan.length > 0
        ? message.recoveryPlan
        : [message.nextStep, ...message.points.slice(0, 2)],
  }
}

export default ChatPage
