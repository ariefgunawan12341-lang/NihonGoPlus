import { GraduationCap, Target, Users } from 'lucide-react'
import { useSocialLinks } from '../components/layout/Footer'

export default function About() {
  const socials = useSocialLinks()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-hanko mx-auto flex items-center justify-center text-white font-jp font-bold text-2xl mb-3">語</div>
        <h1 className="text-2xl font-bold">NihonGoPlus</h1>
        <p className="text-sm text-ink-soft mt-1">Arif Boncel Academy Japanese Learning</p>
      </div>

      <div className="card p-6">
        <h2 className="font-bold mb-2">Tentang Platform</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          NihonGoPlus adalah platform belajar bahasa Jepang lengkap — mulai dari Hiragana, Katakana, Kanji, Grammar, sampai
          persiapan JLPT N5–N1, materi SSW (Specified Skilled Worker), dan Kaigo Fukushishi untuk yang ingin bekerja di
          Jepang. Dilengkapi AI Sensei untuk latihan percakapan, sistem ujian dengan penilaian otomatis, dan Admin Panel
          penuh supaya materi bisa terus diperbarui tanpa perlu coding.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { icon: GraduationCap, label: 'Kurikulum Lengkap', desc: 'JLPT N5–N1, SSW, dan Kaigo Fukushishi' },
          { icon: Target, label: 'Fokus Praktis', desc: 'Latihan soal, simulasi wawancara, dan Kaiwa AI' },
          { icon: Users, label: 'Untuk Semua Level', desc: 'Dari pemula sampai persiapan kerja di Jepang' }
        ].map((f) => (
          <div key={f.label} className="card p-4 text-center">
            <f.icon className="mx-auto mb-2 text-blue-500" size={24} />
            <p className="text-sm font-semibold">{f.label}</p>
            <p className="text-xs text-ink-soft mt-1">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-bold mb-3">Pengajar</h2>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl shrink-0">
            AB
          </div>
          <div>
            <p className="font-semibold">Arif Boncel</p>
            <p className="text-xs text-ink-soft mb-2">Pendiri &amp; Pengajar Utama, Arif Boncel Academy</p>
            <p className="text-sm text-ink-soft">
              Berbagi pengalaman belajar dan bekerja di Jepang lewat konten edukasi bahasa dan budaya Jepang di berbagai
              platform sosial media, kini merangkumnya dalam NihonGoPlus sebagai platform belajar yang lebih terstruktur.
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6 text-center">
        <h2 className="font-bold mb-3">Ikuti Arif Boncel</h2>
        <div className="flex justify-center gap-3">
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-paper flex items-center justify-center text-ink-soft hover:text-blue-600 hover:bg-blue-50 transition">
              <s.icon size={20} />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
