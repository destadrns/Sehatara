import { Check, ClipboardList } from 'lucide-react'
import { getUiCopy } from '../../i18n/uiCopy'
import type { FeatureConfig, LanguageMode } from '../../types/sehatara'

function FocusPanel({ feature, language }: { feature: FeatureConfig; language: LanguageMode }) {
  const copy = getUiCopy(language).common

  return (
    <section className="side-panel focus-panel">
      <div className="side-heading">
        <ClipboardList size={19} />
        <div>
          <span className="eyebrow">{copy.focus}</span>
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
