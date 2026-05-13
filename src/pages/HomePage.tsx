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
import { features } from '../data/features'
import type { PageId } from '../types/sehatara'

type HomePageProps = {
  onNavigate: (page: PageId) => void
}

function HomePage({ onNavigate }: HomePageProps) {
  return (
    <main className="page-stack">
      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow">Teman baca informasi kesehatan awal</span>
          <h1>Tulis ceritamu. Sehatara bantu rapikan.</h1>
          <p>
            Sehatara membantu kamu memahami gejala, obat, kebiasaan sehat, dan kondisi
            mental ringan dengan bahasa yang lebih dekat. Tetap edukatif, tetap hati-hati,
            dan tidak menggantikan dokter.
          </p>
          <div className="hero-microcopy" aria-label="Karakter Sehatara">
            <span>Bahasa sehari-hari</span>
            <span>Jawaban ringkas</span>
            <span>Ada batas aman</span>
          </div>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => onNavigate('symptom')} type="button">
              Ceritakan gejala
              <ArrowRight size={18} />
            </button>
            <button className="secondary-button" onClick={() => onNavigate('medicine')} type="button">
              Buka catatan obat
            </button>
          </div>
        </div>

        <div className="hero-visual" aria-label="Ringkasan cara kerja Sehatara">
          <div className="signal-card">
            <span className="signal-line" />
            <div>
              <strong>Kamu cerita</strong>
              <small>Tulis gejala, obat, rutinitas, atau rasa cemas dengan kalimatmu sendiri.</small>
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
            <span>Sehatara bantu merapikan jawaban dan menunjukkan kapan perlu bantuan profesional.</span>
          </div>
        </div>
      </section>

      <section className="assurance-strip" aria-label="Batas utama Sehatara">
        <div>
          <ShieldCheck size={20} />
          <span>Bukan diagnosis final</span>
        </div>
        <div>
          <ClipboardCheck size={20} />
          <span>Jawaban dibuat terstruktur</span>
        </div>
        <div>
          <TimerReset size={20} />
          <span>Bisa dicoba tanpa login</span>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <span className="eyebrow">Fitur utama</span>
          <h2>Mau mulai dari mana?</h2>
          <p>
            Pilih satu ruang dulu. Setiap fitur dibuat punya alur sendiri, jadi kamu tidak
            perlu merasa sedang membuka terlalu banyak hal sekaligus.
          </p>
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
            <span className="eyebrow">Cara kerja</span>
            <h2>Alurnya dibuat seperti ngobrol, tapi tetap punya batas.</h2>
          </div>
          <ol className="process-list">
            <li>
              <MessageCircle size={18} />
              <div>
                <strong>Ceritakan kebutuhan</strong>
                <span>Tulis dengan bahasa natural. Tidak harus langsung rapi.</span>
              </div>
            </li>
            <li>
              <BookOpenCheck size={18} />
              <div>
                <strong>Baca penjelasan awal</strong>
                <span>Sehatara merangkum inti cerita dan memberi arahan umum.</span>
              </div>
            </li>
            <li>
              <ShieldCheck size={18} />
              <div>
                <strong>Perhatikan batas medis</strong>
                <span>Kalau ada tanda bahaya, arahnya dibuat jelas dan tidak ditunda.</span>
              </div>
            </li>
          </ol>
        </div>

        <aside className="safety-panel">
          <AlertTriangle size={22} />
          <div>
            <span className="eyebrow">Prioritas keamanan</span>
            <h3>Untuk kondisi darurat, jangan menunggu jawaban aplikasi.</h3>
            <p>
              Nyeri dada berat, sesak berat, pingsan, gejala stroke, perdarahan berat,
              atau dorongan menyakiti diri harus diarahkan ke bantuan medis darurat.
            </p>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default HomePage
