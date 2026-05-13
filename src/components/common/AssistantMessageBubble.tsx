import { AlertTriangle, MessageCircle, Sparkles } from 'lucide-react'
import type { ChatMessage } from '../../types/sehatara'

function AssistantMessageBubble({ message }: { message: Extract<ChatMessage, { role: 'assistant' }> }) {
  return (
    <article className="message assistant-message">
      <span className="assistant-avatar">
        <Sparkles size={17} />
      </span>
      <div className="assistant-bubble">
        <div className="bubble-title">
          <strong>{message.title}</strong>
          <span>Sehatara</span>
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
        <div className="next-step">
          <MessageCircle size={15} />
          <span>{message.nextStep}</span>
        </div>
      </div>
    </article>
  )
}

export default AssistantMessageBubble
