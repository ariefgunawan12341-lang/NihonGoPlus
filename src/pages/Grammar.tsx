import { ContentList } from '../components/content/ContentList'

export default function Grammar() {
  return (
    <div className="space-y-1">
      <h1 className="text-xl font-bold">Bunpou — Grammar</h1>
      <p className="text-sm text-ink-soft mb-4">Grammar patterns by JLPT level, with usage examples.</p>
      <ContentList kind="grammar" emptyLabel="No grammar points added for this level yet — add some from the Admin Panel." />
    </div>
  )
}
