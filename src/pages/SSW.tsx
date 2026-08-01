import { useState } from 'react'
import clsx from 'clsx'
import { ContentList } from '../components/content/ContentList'
import { SSW_INDUSTRIES } from '../types/content'
import { useAuth } from '../contexts/AuthContext'

export default function SSW() {
  const { user } = useAuth()
  const [industry, setIndustry] = useState<string>(SSW_INDUSTRIES[0])

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">SSW — Specified Skilled Worker</h1>
      <p className="text-sm text-ink-soft mb-4">Industry-specific vocabulary for every SSW field.</p>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {SSW_INDUSTRIES.map((ind) => (
          <button
            key={ind}
            onClick={() => setIndustry(ind)}
            className={clsx(
              'px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition',
              industry === ind ? 'bg-blue-500 text-white' : 'bg-surface border border-line text-ink-soft'
            )}
          >
            {ind}
          </button>
        ))}
      </div>

      <ContentList
        kind="ssw"
        category={industry}
        showLevelPicker={false}
        emptyLabel={`No ${industry} vocabulary yet — add some from the Admin Panel.`}
        previewLimit={user?.isPremium ? undefined : 5}
      />
    </div>
  )
}
