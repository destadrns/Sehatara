import { AlertTriangle, MessageCircle, Sparkles } from 'lucide-react'
import { getUiCopy } from '../../i18n/uiCopy'
import type { ChatMessage, LanguageMode } from '../../types/sehatara'

function AssistantMessageBubble({
  language,
  message,
}: {
  language: LanguageMode
  message: Extract<ChatMessage, { role: 'assistant' }>
}) {
  const copy = getUiCopy(language).common

  return (
    <article className="message assistant-message">
      <span className="assistant-avatar">
        <Sparkles size={17} />
      </span>
      <div className="assistant-bubble">
        <div className="bubble-title">
          <strong>{message.title}</strong>
          <span>{message.source === 'gemini' ? copy.geminiApi : copy.sehatara}</span>
        </div>
        <p>{message.body}</p>
        <ul>
          {message.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        {message.warning && (
          <div className="bubble-alert">
            <AlertTriangle size={15} />
            <span>{message.warning}</span>
          </div>
        )}
        {message.safetyMessage && (
          <div className="bubble-safety">
            <span>{message.safetyMessage}</span>
          </div>
        )}
        <div className="next-step">
          <MessageCircle size={15} />
          <span>{message.nextStep}</span>
        </div>
      </div>
    </article>
  )
}

export default AssistantMessageBubble
