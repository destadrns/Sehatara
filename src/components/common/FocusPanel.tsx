import { Check, ClipboardList } from 'lucide-react'
import type { FeatureConfig } from '../../types/sehatara'

function FocusPanel({ feature }: { feature: FeatureConfig }) {
  return (
    <section className="side-panel focus-panel">
      <div className="side-heading">
        <ClipboardList size={19} />
        <div>
          <span className="eyebrow">Fokus</span>
          <h3>{feature.panelTitle}</h3>
        </div>
      </div>
      <ul className="check-list">
        {feature.panelItems.map((item) => (
          <li key={item}>
            <Check size={15} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default FocusPanel
