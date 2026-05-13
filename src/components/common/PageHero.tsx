import { ArrowLeft } from 'lucide-react'
import { getUiCopy } from '../../i18n/uiCopy'
import type { FeatureConfig, LanguageMode, PageId } from '../../types/sehatara'

type PageHeroProps = {
  feature: FeatureConfig
  language: LanguageMode
  onNavigate: (page: PageId) => void
}

function PageHero({ feature, language, onNavigate }: PageHeroProps) {
  const Icon = feature.icon
  const copy = getUiCopy(language).common

  return (
    <section className="feature-hero" data-accent={feature.accent}>
      <button className="text-button" onClick={() => onNavigate('home')} type="button">
        <ArrowLeft size={17} />
        {copy.home}
      </button>

      <div className="feature-hero-grid">
        <div className="feature-hero-copy">
          <span className="feature-icon-large">
            <Icon size={28} />
          </span>
          <span className="eyebrow">{feature.eyebrow}</span>
          <h1>{feature.title}</h1>
          <p>{feature.longDescription}</p>
          <div className="feature-highlight-row">
            {feature.highlights.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="feature-ornament" aria-hidden="true">
          <span className="ornament-track" />
          <span className="ornament-step one" />
          <span className="ornament-step two" />
          <span className="ornament-step three" />
          <span className="ornament-note">{copy.safeGuidance}</span>
        </div>
      </div>
    </section>
  )
}

export default PageHero
