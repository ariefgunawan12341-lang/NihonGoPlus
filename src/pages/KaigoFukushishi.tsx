import { useState } from 'react'
import clsx from 'clsx'
import { ContentList } from '../components/content/ContentList'
import { KAIGO_TOPICS } from '../types/content'
import { useAuth } from '../contexts/AuthContext'

export default function KaigoFukushishi() {
  const { user } = useAuth()
  const [topic, setTopic] = useState<string>(KAIGO_TOPICS[0])

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Kaigo Fukushishi</h1>
      <p className="text-sm text-ink-soft mb-4">Certified Care Worker exam preparation — vocabulary, medical terms, ethics &amp; law.</p>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {KAIGO_TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            className={clsx(
              'px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition',
              topic === t ? 'bg-blue-500 text-white' : 'bg-surface border border-line text-ink-soft'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <ContentList
        kind="kaigo"
        category={topic}
        showLevelPicker={false}
        emptyLabel={`No ${topic} content yet — add some from the Admin Panel.`}
        previewLimit={user?.isPremium ? undefined : 5}
      />
    </div>
  )
}
