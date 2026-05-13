import { ArrowRight, ArrowUp, Bot, Leaf, Pill, RotateCcw, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import AssistantMessageBubble from '../components/common/AssistantMessageBubble'
import FocusPanel from '../components/common/FocusPanel'
import PageHero from '../components/common/PageHero'
import { getChatStarterPrompts } from '../data/chatData'
import { getUiCopy } from '../i18n/uiCopy'
import type {
  AssistantMessage,
  ChatAiResult,
  ChatHistoryItem,
  ChatMessage,
  FeatureConfig,
  LanguageMode,
  PageId,
  SaveMedicineNoteInput,
  SaveWellnessPlanInput,
} from '../types/sehatara'
import { createId } from '../utils/assistantResponses'
import { askGeminiChat, getGeminiChatErrorMessage } from '../utils/geminiChat'
import {
  normalizeOptionalStringList,
  normalizeStringList,
  normalizeText,
  readStorageValue,
  storageKeys,
  writeStorageValue,
} from '../utils/storage'

type ChatPageProps = {
  feature: FeatureConfig
  language: LanguageMode
  onNavigate: (page: PageId) => void
  onSaveMedicineNote: (note: SaveMedicineNoteInput) => void
  onSaveWellnessPlan: (plan: SaveWellnessPlanInput) => void
}

function ChatPage({
  feature,
  language,
  onNavigate,
  onSaveMedicineNote,
  onSaveWellnessPlan,
}: ChatPageProps) {
  const copy = getUiCopy(language).chat
  const starterPrompts = getChatStarterPrompts(language)
  const [messages, setMessages] = useState<ChatMessage[]>(() => readStoredChatMessages(language))
  const [draft, setDraft] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [chatError, setChatError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const lastGeminiMessage = [...messages].reverse().find(isGeminiAssistantMessage)
  const hasActiveSession = messages.some((message) => message.role === 'user' || message.source === 'gemini')

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isThinking])

  useEffect(() => {
    writeStorageValue(storageKeys.chatSession, messages)
  }, [messages])

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
        history: buildChatHistory(messages),
        language,
      })

      setMessages((current) => [...current, createGeminiChatMessage(trimmedDraft, result)])
    } catch (error) {
      const message = getGeminiChatErrorMessage(error, language)
      setChatError(message)
      setMessages((current) => [...current, createChatErrorMessage(message, language)])
    } finally {
      setIsThinking(false)
    }
  }

  function startNewChat() {
    setMessages([createIntroMessage(language)])
    setDraft('')
    setChatError('')
  }

  function saveChatMedicineNote() {
    if (!lastGeminiMessage) {
      return
    }

    onSaveMedicineNote(createChatMedicineHandoff(lastGeminiMessage, language))
    onNavigate('medicine')
  }

  function saveChatWellnessPlan() {
    if (!lastGeminiMessage) {
      return
    }

    onSaveWellnessPlan(createChatWellnessHandoff(lastGeminiMessage, language))
    onNavigate('preventive')
  }

  return (
    <main className="feature-page chat-page" data-accent={feature.accent}>
      <PageHero feature={feature} language={language} onNavigate={onNavigate} />

      <section className="feature-workspace chat-workspace">
        <div className="workspace-main">
          <div className="workspace-toolbar">
            <div>
              <span className="eyebrow">{copy.workspaceEyebrow}</span>
              <h2>{copy.workspaceTitle}</h2>
            </div>
            <div className="chat-toolbar-actions">
              {hasActiveSession && <span className="soft-status">{copy.savedSession}</span>}
              <button
                className="text-button compact-button"
                disabled={isThinking}
                onClick={startNewChat}
                type="button"
              >
                <RotateCcw size={15} />
                {copy.newChat}
              </button>
            </div>
          </div>

          <div className="starter-row" aria-label={copy.starterAria}>
            {starterPrompts.map((prompt) => (
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
                <AssistantMessageBubble key={message.id} language={language} message={message} />
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
            <label htmlFor="chatInput">{copy.inputLabel}</label>
            <textarea
              id="chatInput"
              onChange={(event) => setDraft(event.target.value)}
              placeholder={copy.placeholder}
              rows={4}
              value={draft}
              disabled={isThinking}
            />
            {chatError && <p className="form-alert">{chatError}</p>}
            <div className="composer-actions">
              <span>{copy.disclaimer}</span>
              <button disabled={!draft.trim() || isThinking} type="submit">
                {isThinking ? copy.thinking : copy.send}
                <ArrowUp size={17} />
              </button>
            </div>
          </form>
        </div>

        <aside className="workspace-side">
          <FocusPanel feature={feature} language={language} />
          <section className="side-panel">
            <div className="side-heading">
              <Bot size={19} />
              <div>
                <span className="eyebrow">{copy.usageEyebrow}</span>
                <h3>{copy.usageTitle}</h3>
              </div>
            </div>
            <p className="muted-copy">{copy.usageBody}</p>

            {lastGeminiMessage && !isThinking && (
              <div className="chat-handoff">
                <span className="eyebrow">{copy.handoffEyebrow}</span>
                <button className="handoff-mini medicine" onClick={saveChatMedicineNote} type="button">
                  <Pill size={17} />
                  <span>{copy.saveMedicine}</span>
                  <ArrowRight size={15} />
                </button>
                <button className="handoff-mini wellness" onClick={saveChatWellnessPlan} type="button">
                  <Leaf size={17} />
                  <span>{copy.savePlan}</span>
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

function createIntroMessage(language: LanguageMode): ChatMessage {
  const copy = getUiCopy(language).chat

  return {
    id: createId(),
    role: 'assistant',
    title: copy.introTitle,
    body: copy.introBody,
    points: [...copy.introPoints],
    nextStep: copy.introNext,
  }
}

function readStoredChatMessages(language: LanguageMode): ChatMessage[] {
  const restoredMessages = readStorageValue<ChatMessage[]>(storageKeys.chatSession, [], (value) => {
    if (!Array.isArray(value)) {
      return null
    }

    return value
      .map((item): ChatMessage | null => normalizeStoredChatMessage(item))
      .filter((item): item is ChatMessage => Boolean(item))
  })

  return restoredMessages.length > 0 ? restoredMessages : [createIntroMessage(language)]
}

function normalizeStoredChatMessage(value: unknown): ChatMessage | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const message = value as Record<string, unknown>
  const id = typeof message.id === 'string' && message.id ? message.id : createId()

  if (message.role === 'user') {
    const body = normalizeText(message.body)

    return body
      ? {
          id,
          role: 'user',
          body,
        }
      : null
  }

  if (message.role !== 'assistant') {
    return null
  }

  const points = normalizeStringList(message.points)
  const title = normalizeText(message.title)
  const body = normalizeText(message.body)
  const nextStep = normalizeText(message.nextStep)

  if (!title || !body || points.length === 0 || !nextStep) {
    return null
  }

  return {
    id,
    role: 'assistant',
    title,
    body,
    points,
    warning: normalizeText(message.warning),
    nextStep,
    source: message.source === 'gemini' ? 'gemini' : undefined,
    relatedUserInput: normalizeText(message.relatedUserInput),
    handoffSummary: normalizeText(message.handoffSummary),
    medicineNote: normalizeOptionalStringList(message.medicineNote),
    recoveryPlan: normalizeOptionalStringList(message.recoveryPlan),
    safetyMessage: normalizeText(message.safetyMessage),
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

function createChatErrorMessage(errorMessage: string, language: LanguageMode): AssistantMessage {
  const copy = getUiCopy(language).chat

  return {
    id: createId(),
    role: 'assistant',
    title: copy.errorTitle,
    body: errorMessage,
    points: [...copy.errorPoints],
    warning: copy.errorWarning,
    nextStep: copy.errorNext,
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

function getHandoffContext(message: AssistantMessage, language: LanguageMode) {
  const copy = getUiCopy(language).chat

  return (
    message.handoffSummary ||
    `${message.relatedUserInput ?? copy.fallbackContext} ${message.body}`.trim()
  )
}

function createChatMedicineHandoff(
  message: AssistantMessage,
  language: LanguageMode,
): SaveMedicineNoteInput {
  const copy = getUiCopy(language).chat

  return {
    source: 'Tanya AI',
    title: `${copy.medicineTitlePrefix} ${message.title}`,
    context: getHandoffContext(message, language),
    guidance:
      message.medicineNote && message.medicineNote.length > 0
        ? message.medicineNote
        : message.points,
    safety:
      message.safetyMessage ||
      message.warning ||
      copy.medicineSafety,
  }
}

function createChatWellnessHandoff(
  message: AssistantMessage,
  language: LanguageMode,
): SaveWellnessPlanInput {
  const copy = getUiCopy(language).chat

  return {
    source: 'Tanya AI',
    title: `${copy.planTitlePrefix} ${message.title}`,
    context: getHandoffContext(message, language),
    steps:
      message.recoveryPlan && message.recoveryPlan.length > 0
        ? message.recoveryPlan
        : [message.nextStep, ...message.points.slice(0, 2)],
  }
}

export default ChatPage
