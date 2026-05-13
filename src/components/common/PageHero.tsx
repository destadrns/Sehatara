import { ArrowLeft } from 'lucide-react'
import type { FeatureConfig, PageId } from '../../types/sehatara'

type PageHeroProps = {
  feature: FeatureConfig
  onNavigate: (page: PageId) => void
}

function PageHero({ feature, onNavigate }: PageHeroProps) {
  const Icon = feature.icon

  return (
    <section className="feature-hero" data-accent={feature.accent}>
      <button className="text-button" onClick={() => onNavigate('home')} type="button">
        <ArrowLeft size={17} />
        Beranda
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
          <span className="ornament-note">Safe guidance</span>
        </div>
      </div>
    </section>
  )
}

export default PageHero
