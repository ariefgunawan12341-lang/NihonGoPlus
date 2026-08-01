import { Coffee, Star, Github } from 'lucide-react'

export default function Support() {
  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="card p-8 text-center">
        <Coffee className="mx-auto mb-2 text-hanko" size={32} />
        <h1 className="text-xl font-bold">Support the developer</h1>
        <p className="text-sm text-ink-soft mt-1">
          NihonGoPlus is built and maintained independently. If it's helping your Japanese study, here's how you
          can help back.
        </p>
      </div>

      <div className="card divide-y divide-line">
        <a href="#" className="p-4 flex items-center gap-3 hover:bg-paper transition">
          <Star size={18} className="text-blue-500" />
          <div>
            <p className="text-sm font-semibold">Rate the app</p>
            <p className="text-xs text-ink-soft">Leave a review on the app store</p>
          </div>
        </a>
        <a href="#" className="p-4 flex items-center gap-3 hover:bg-paper transition">
          <Coffee size={18} className="text-hanko" />
          <div>
            <p className="text-sm font-semibold">Buy me a coffee</p>
            <p className="text-xs text-ink-soft">One-time support, no account needed</p>
          </div>
        </a>
        <a href="#" className="p-4 flex items-center gap-3 hover:bg-paper transition">
          <Github size={18} className="text-ink" />
          <div>
            <p className="text-sm font-semibold">Star on GitHub</p>
            <p className="text-xs text-ink-soft">Follow development and report issues</p>
          </div>
        </a>
      </div>
      <p className="text-xs text-ink-soft text-center">Replace the placeholder links above with your real store/donation/GitHub URLs.</p>
    </div>
  )
}
