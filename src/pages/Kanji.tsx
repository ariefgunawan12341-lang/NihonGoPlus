import { ContentList } from '../components/content/ContentList'

export default function Kanji() {
  return (
    <div className="space-y-1">
      <h1 className="text-xl font-bold">Kanji</h1>
      <p className="text-sm text-ink-soft mb-4">Browse kanji by JLPT level, with readings and example sentences.</p>
      <ContentList kind="kanji" emptyLabel="No kanji added for this level yet — add some from the Admin Panel." />
    </div>
  )
}
