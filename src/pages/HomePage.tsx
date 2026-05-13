import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  ClipboardCheck,
  MessageCircle,
  ShieldCheck,
  TimerReset,
} from 'lucide-react'
import FeatureCard from '../components/cards/FeatureCard'
import { getUiCopy } from '../i18n/uiCopy'
import type { FeatureConfig, LanguageMode, PageId } from '../types/sehatara'

type HomePageProps = {
  features: FeatureConfig[]
  language: LanguageMode
  onNavigate: (page: PageId) => void
}

function HomePage({ features, language, onNavigate }: HomePageProps) {
  const copy = getUiCopy(language).home

  return (
    <main className="page-stack">
      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow">{copy.heroEyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
          <div className="hero-microcopy" aria-label={language === 'en' ? 'Sehatara character' : 'Karakter Sehatara'}>
            {copy.microcopy.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => onNavigate('symptom')} type="button">
              {copy.primaryAction}
              <ArrowRight size={18} />
            </button>
            <button className="secondary-button" onClick={() => onNavigate('medicine')} type="button">
              {copy.secondaryAction}
            </button>
          </div>
        </div>

        <div className="hero-visual" aria-label={copy.visualAria}>
          <div className="signal-card">
            <span className="signal-line" />
            <div>
              <strong>{copy.signalTitle}</strong>
              <small>{copy.signalText}</small>
            </div>
          </div>
          <div className="analysis-board">
            <span className="board-row long" />
            <span className="board-row mid" />
            <span className="board-row short" />
            <div className="board-pulse" />
          </div>
          <div className="answer-card">
            <BadgeCheck size={18} />
            <span>{copy.answerText}</span>
          </div>
        </div>
      </section>

      <section className="assurance-strip" aria-label={copy.assuranceAria}>
        {[ShieldCheck, ClipboardCheck, TimerReset].map((Icon, index) => (
          <div key={copy.assurances[index]}>
            <Icon size={20} />
            <span>{copy.assurances[index]}</span>
          </div>
        ))}
      </section>

      <section className="home-section">
        <div className="section-heading">
          <span className="eyebrow">{copy.featureEyebrow}</span>
          <h2>{copy.featureTitle}</h2>
          <p>{copy.featureBody}</p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <FeatureCard
              feature={feature}
              key={feature.id}
              onOpen={() => onNavigate(feature.id)}
            />
          ))}
        </div>
      </section>

      <section className="home-section split-section">
        <div className="content-panel">
          <div className="section-heading compact">
            <span className="eyebrow">{copy.processEyebrow}</span>
            <h2>{copy.processTitle}</h2>
          </div>
          <ol className="process-list">
            {[MessageCircle, BookOpenCheck, ShieldCheck].map((Icon, index) => (
              <li key={copy.process[index][0]}>
                <Icon size={18} />
                <div>
                  <strong>{copy.process[index][0]}</strong>
                  <span>{copy.process[index][1]}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="safety-panel">
          <AlertTriangle size={22} />
          <div>
            <span className="eyebrow">{copy.safetyEyebrow}</span>
            <h3>{copy.safetyTitle}</h3>
            <p>{copy.safetyBody}</p>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default HomePage
