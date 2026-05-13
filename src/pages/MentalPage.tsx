import { Brain, Heart, Wind } from 'lucide-react'
import { useState } from 'react'
import FocusPanel from '../components/common/FocusPanel'
import PageHero from '../components/common/PageHero'
import { breathingSteps, groundingSteps } from '../data/mentalData'
import type { FeatureConfig, PageId } from '../types/sehatara'

type MentalPageProps = {
  feature: FeatureConfig
  onNavigate: (page: PageId) => void
}

function MentalPage({ feature, onNavigate }: MentalPageProps) {
  const [mood, setMood] = useState(3)
  const [activeStep, setActiveStep] = useState(0)

  function nextStep() {
    setActiveStep((current) => (current + 1) % groundingSteps.length)
  }

  return (
    <main className="feature-page mental-page" data-accent={feature.accent}>
      <PageHero feature={feature} onNavigate={onNavigate} />

      <section className="tool-layout">
        <div className="interactive-panel calm-panel">
          <div className="workspace-toolbar">
            <div>
              <span className="eyebrow">Latihan singkat</span>
              <h2>Ambil jeda 2 menit</h2>
            </div>
            <span className="soft-status">Self-care dasar</span>
          </div>

          <section className="breathing-card">
            <Wind size={28} />
            <div>
              <span className="eyebrow">Napas pelan</span>
              <h3>{breathingSteps[activeStep % breathingSteps.length]}</h3>
              <p>Ikuti ritme ini beberapa kali. Tidak perlu sempurna, cukup lebih pelan dari sebelumnya.</p>
            </div>
            <button className="secondary-button" onClick={nextStep} type="button">
              Langkah berikutnya
            </button>
          </section>

          <section className="mood-scale">
            <div>
              <span className="eyebrow">Cek kondisi</span>
              <h3>Seberapa penuh pikiranmu sekarang?</h3>
            </div>
            <input
              aria-label="Skala kondisi mental"
              max="5"
              min="1"
              onChange={(event) => setMood(Number(event.target.value))}
              type="range"
              value={mood}
            />
            <span>{getMoodLabel(mood)}</span>
          </section>

          <section className="grounding-card">
            <Brain size={22} />
            <div>
              <span className="eyebrow">Grounding 5-4-3-2-1</span>
              <h3>{groundingSteps[activeStep]}</h3>
              <p>Pilih satu hal nyata di sekitarmu. Biarkan perhatianmu kembali ke ruangan ini.</p>
            </div>
          </section>
        </div>

        <aside className="workspace-side">
          <FocusPanel feature={feature} />
          <section className="side-panel">
            <div className="side-heading">
              <Heart size={19} />
              <div>
                <span className="eyebrow">Catatan aman</span>
                <h3>Kalau terasa krisis</h3>
              </div>
            </div>
            <p className="muted-copy">
              Jika muncul dorongan menyakiti diri sendiri atau orang lain, jangan hadapi
              sendiri. Hubungi layanan darurat setempat atau orang terpercaya sekarang.
            </p>
          </section>
        </aside>
      </section>
    </main>
  )
}

function getMoodLabel(value: number) {
  if (value <= 2) {
    return 'Mulai lebih tenang'
  }

  if (value === 3) {
    return 'Masih cukup penuh'
  }

  return 'Butuh jeda lebih serius'
}

export default MentalPage
