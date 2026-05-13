import { HeartPulse, Moon, RotateCcw, ShieldCheck, Sun } from 'lucide-react'
import { features } from '../../data/features'
import type { PageId, ThemeMode } from '../../types/sehatara'

type AppHeaderProps = {
  page: PageId
  theme: ThemeMode
  onNavigate: (page: PageId) => void
  onThemeToggle: () => void
}

function AppHeader({ page, theme, onNavigate, onThemeToggle }: AppHeaderProps) {
  return (
    <header className="app-header">
      <button className="brand-button" onClick={() => onNavigate('home')} type="button">
        <span className="brand-mark" aria-hidden="true">
          <HeartPulse size={23} strokeWidth={2.2} />
        </span>
        <span>
          <strong>Sehatara</strong>
          <small>Panduan kesehatan awal</small>
        </span>
      </button>

      <nav className="main-nav" aria-label="Navigasi utama Sehatara">
        <button
          className={page === 'home' ? 'nav-item active' : 'nav-item'}
          onClick={() => onNavigate('home')}
          type="button"
        >
          Mulai
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
          Edukasi aman
        </span>
        <button
          className="icon-action"
          onClick={onThemeToggle}
          title={theme === 'dark' ? 'Aktifkan tema terang' : 'Aktifkan tema gelap'}
          type="button"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="icon-action desktop-only"
          onClick={() => onNavigate('home')}
          title="Kembali ke beranda"
          type="button"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </header>
  )
}

export default AppHeader
