import { ArrowRight } from 'lucide-react'
import type { FeatureConfig } from '../../types/sehatara'

type FeatureCardProps = {
  feature: FeatureConfig
  onOpen: () => void
}

function FeatureCard({ feature, onOpen }: FeatureCardProps) {
  const Icon = feature.icon

  return (
    <button className="feature-card" data-accent={feature.accent} onClick={onOpen} type="button">
      <span className="feature-card-top">
        <span className="feature-card-icon">
          <Icon size={22} />
        </span>
        <span className="feature-card-action" aria-hidden="true">
          <ArrowRight size={18} />
        </span>
      </span>

      <span className="feature-card-copy">
        <span className="eyebrow">{feature.eyebrow}</span>
        <strong>{feature.homeTitle}</strong>
        <span>{feature.description}</span>
      </span>

      <span className="feature-card-footer">
        {feature.highlights.slice(0, 2).map((highlight) => (
          <span key={highlight}>{highlight}</span>
        ))}
      </span>
    </button>
  )
}

export default FeatureCard
