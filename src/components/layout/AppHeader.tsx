import { HeartPulse, Languages, Moon, RotateCcw, ShieldCheck, Sun } from 'lucide-react'
import { getUiCopy } from '../../i18n/uiCopy'
import type { FeatureConfig, LanguageMode, PageId, ThemeMode } from '../../types/sehatara'

type AppHeaderProps = {
  features: FeatureConfig[]
  language: LanguageMode
  page: PageId
  theme: ThemeMode
  onLanguageToggle: () => void
  onNavigate: (page: PageId) => void
  onThemeToggle: () => void
}

function AppHeader({
  features,
  language,
  page,
  theme,
  onLanguageToggle,
  onNavigate,
  onThemeToggle,
}: AppHeaderProps) {
  const copy = getUiCopy(language).header

  return (
    <header className="app-header">
      <button className="brand-button" onClick={() => onNavigate('home')} type="button">
        <span className="brand-mark" aria-hidden="true">
          <HeartPulse size={23} strokeWidth={2.2} />
        </span>
        <span>
          <strong>Sehatara</strong>
          <small>{copy.tagline}</small>
        </span>
      </button>

      <nav className="main-nav" aria-label={copy.navAria}>
        <button
          className={page === 'home' ? 'nav-item active' : 'nav-item'}
          onClick={() => onNavigate('home')}
          type="button"
        >
          {copy.home}
        </button>
        {features.map((feature) => (
          <button
            className={page === feature.id ? 'nav-item active' : 'nav-item'}
            key={feature.id}
            onClick={() => onNavigate(feature.id)}
            type="button"
          >
            {feature.navLabel}
          </button>
        ))}
      </nav>

      <div className="header-actions">
        <span className="safe-label">
          <ShieldCheck size={16} />
          {copy.safe}
        </span>
        <button
          className="language-toggle"
          onClick={onLanguageToggle}
          title={copy.languageTitle}
          type="button"
        >
          <Languages size={16} />
          <span>{copy.languageShort}</span>
        </button>
        <button
          className="icon-action"
          onClick={onThemeToggle}
          title={theme === 'dark' ? copy.lightTitle : copy.darkTitle}
          type="button"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="icon-action desktop-only"
          onClick={() => onNavigate('home')}
          title={copy.homeTitle}
          type="button"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </header>
  )
}

export default AppHeader
