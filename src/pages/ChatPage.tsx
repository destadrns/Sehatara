import { ArrowRight, ArrowUp, Bot, Leaf, Pill, RotateCcw, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import AssistantMessageBubble from '../components/common/AssistantMessageBubble'
import FocusPanel from '../components/common/FocusPanel'
import PageHero from '../components/common/PageHero'
import { chatStarterPrompts } from '../data/chatData'
import type {
  ChatMessage,
  FeatureConfig,
  PageId,
  SaveMedicineNoteInput,
  SaveWellnessPlanInput,
} from '../types/sehatara'
import { createId } from '../utils/assistantResponses'

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
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isThinking])

  function submitChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedDraft = draft.trim()

    if (!trimmedDraft || isThinking) {
      return
    }

    setMessages((current) => [
      ...current,
      { id: createId(), role: 'user', body: trimmedDraft },
    ])
    setDraft('')
    setIsThinking(true)

    window.setTimeout(() => {
      setMessages((current) => [...current, createChatResponse(trimmedDraft)])
      setIsThinking(false)
    }, 520)
  }

  function resetChat() {
    setMessages([createIntroMessage()])
    setDraft('')
  }

  function saveChatMedicineNote() {
    if (!lastUserMessage || lastUserMessage.role !== 'user') {
      return
    }

    onSaveMedicineNote(createChatMedicineHandoff(lastUserMessage.body))
    onNavigate('medicine')
  }

  function saveChatWellnessPlan() {
    if (!lastUserMessage || lastUserMessage.role !== 'user') {
      return
    }

    onSaveWellnessPlan(createChatWellnessHandoff(lastUserMessage.body))
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
              <button key={prompt} onClick={() => setDraft(prompt)} type="button">
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
            />
            <div className="composer-actions">
              <span>Ruang ini untuk edukasi awal, bukan diagnosis atau resep.</span>
              <button disabled={!draft.trim() || isThinking} type="submit">
                Kirim
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

            {lastUserMessage && lastUserMessage.role === 'user' && (
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

function createChatResponse(input: string): ChatMessage {
  const compactInput = input.length > 110 ? `${input.slice(0, 110).trim()}...` : input

  return {
    id: createId(),
    role: 'assistant',
    title: 'Saya bantu rapikan dulu',
    body:
      'Saya belum bisa memastikan diagnosis, tapi saya bisa membantu menjelaskan informasi awal dan hal yang sebaiknya kamu perhatikan.',
    points: [
      `Pertanyaanmu: "${compactInput}".`,
      'Kalau ini terkait gejala, catat durasi, lokasi keluhan, tingkat rasa tidak nyaman, dan pemicunya.',
      'Jika keluhan berat, memburuk cepat, atau muncul tanda bahaya, prioritaskan tenaga medis.',
    ],
    nextStep: 'Kalau mau, tambahkan durasi, usia umum, dan kondisi yang menyertai tanpa data identitas pribadi.',
  }
}

function createChatMedicineHandoff(input: string): SaveMedicineNoteInput {
  return {
    source: 'Tanya AI',
    title: 'Catatan obat dari pertanyaan chat',
    context: input,
    guidance: [
      'Gunakan halaman ini untuk memahami kategori obat dan hal yang perlu dicek, bukan meminta resep.',
      'Baca label obat, peringatan, interaksi, dan tanggal kedaluwarsa sebelum memakai obat bebas.',
      'Jika sedang hamil, punya penyakit bawaan, alergi, atau memakai obat lain, tanyakan ke apoteker/dokter.',
    ],
    safety:
      'Sehatara tidak memberi dosis personal, merek wajib, atau keputusan mengganti obat dokter.',
  }
}

function createChatWellnessHandoff(input: string): SaveWellnessPlanInput {
  return {
    source: 'Tanya AI',
    title: 'Rencana sehat dari pertanyaan chat',
    context: input,
    steps: [
      'Pilih satu langkah kecil yang bisa dilakukan hari ini, bukan banyak target sekaligus.',
      'Catat perubahan yang terasa setelah dilakukan selama 1-3 hari.',
      'Jika keluhan memburuk atau terasa tidak wajar, prioritaskan konsultasi dengan tenaga kesehatan.',
    ],
  }
}

export default ChatPage
